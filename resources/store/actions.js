'use strict';

/* eslint-disable no-implicit-globals */
var MvImage = require( '../models/Image.js' ),
	MvSuggestion = require( '../models/Suggestion.js' ),
	api = wikibase.api.getLocationAgnosticMwApi(
		mw.config.get( 'wbmiRepoApiUrl', mw.config.get( 'wbRepoApiUrl' ) )
	),
	datamodel = require( 'wikibase.datamodel' ),
	serialization = require( 'wikibase.serialization' ),
	mvConfig = require( 'ext.MachineVision.config' ),
	ensureTabExists = require( './utils.js' ).ensureTabExists,
	getCategories = require( './utils.js' ).getCategories;

module.exports = {
	/**
	 * @param {Object} context
	 * @param {string} tab
	 */
	updateCurrentTab: function ( context, tab ) {
		context.commit( 'setTab', tab );
	},

	/**
	 * @TODO add support for API request options (number of images to
	 * fetch, etc.)
	 *
	 * Request images for review in the appropriate queue from the API.
	 * This action should return a promise so we can chain it.
	 *
	 * @param {Object} context
	 * @param {Object} options
	 * @param {string} [options.queue]
	 * @return {$.Deferred} Promise
	 */
	getImages: function ( context, options ) {
		var queue = options && options.queue ? options.queue : context.state.currentTab,
			query = {
				action: 'query',
				format: 'json',
				formatversion: 2,
				generator: 'unreviewedimagelabels',
				guillimit: 10,
				prop: 'imageinfo|imagelabels|categories',
				iiprop: 'url',
				iiurlwidth: 800,
				ilstate: 'unreviewed',
				meta: 'unreviewedimagecount',
				uselang: mw.config.get( 'wgUserLanguage' ),
				cllimit: 500,
				clshow: '!hidden'
			};

		ensureTabExists( context.state, queue );

		if ( queue === 'user' ) {
			query.guiluploader = mw.user.getId();
			query.ilstate = 'unreviewed|withheld';
		}

		context.commit( 'setPending', {
			queue: queue,
			pending: true
		} );

		// Request images from the API
		return api.get( query ).then( function ( res ) {
			// @TODO is it really necessary to check for all of this?
			var responseIsValid,
				validItems = [],
				images = [];

			// Ensure only images with the data we need get passed along
			responseIsValid = res.query && res.query.pages && Array.isArray( res.query.pages );
			if ( responseIsValid ) {
				validItems = res.query.pages.filter( function ( item ) {
					return item.imageinfo && item.imagelabels && item.imagelabels.length;
				} );
			}

			// Return Image objects for each item in the API response
			images = validItems.map( function ( item ) {
				return new MvImage(
					item.title,
					item.pageid,
					item.imageinfo[ 0 ].descriptionurl,
					item.imageinfo[ 0 ].thumburl,
					item.imageinfo[ 0 ].thumbheight,
					item.imagelabels.map( function ( labelData ) {
						return new MvSuggestion( labelData.label, labelData.wikidata_id );
					} ),
					getCategories( item )
				);
			} );

			// Commit the MvImage objects to the state in the appropriate queue
			images.map( function ( image ) {
				context.commit( 'addImage', {
					image: image,
					queue: queue
				} );
			} );

			context.commit( 'setUserStats', res.query.unreviewedimagecount.user );

			context.commit( 'setPending', {
				queue: queue,
				pending: false
			} );
		} ).catch( function ( /* error */ ) {
			// @TODO error handling logic
		} );
	},

	/**
	 * Find a given tag among the current image suggestions and commit the
	 * toggleSuggestion mutation to flip its state. Do nothing if tag is
	 * not found.
	 *
	 * @param {Object} context
	 * @param {Object} tag
	 */
	toggleTagConfirmation: function ( context, tag ) {
		var tagIndex = context.getters.currentImageSuggestions.indexOf( tag );

		if ( tagIndex >= 0 ) {
			context.commit( 'toggleSuggestion', tagIndex );
		}
	},

	/**
	 * @TODO implement this
	 *
	 * submits user selections for current image to API and commits the
	 * mutations for removing image from queue; can also dispatch getImages if
	 * we are running low on data
	 *
	 * @param {Object} context
	 */
	publishTags: function ( context ) {
		var tags = context.getters.currentImageSuggestions,
			reviewBatch = tags.map( function ( tag ) {
				return {
					label: tag.wikidataId,
					review: tag.confirmed ? 'accept' : 'reject'
				};
			} ),
			confirmedTags = tags.filter( function ( tag ) {
				return tag.confirmed;
			} ),
			setClaims = context.dispatch( 'setDepictsStatements', confirmedTags ),
			reviewImageLabels = api.postWithToken( 'csrf', {
				action: 'reviewimagelabels',
				filename: context.getters.currentImageTitle,
				batch: JSON.stringify( reviewBatch )
			} );

		context.dispatch( 'updatePublishStatus', 'pending' );

		// TODO: this is where we should request more images if we are
		// running low in a given queue

		// TODO: this is where we should be logging some data

		// Set claims, review labels, update publish status, and skip to next image
		$.when( setClaims, reviewImageLabels ).done( function () {
			context.dispatch( 'updatePublishStatus', 'success' );
		} ).fail( function () {
			context.dispatch( 'updatePublishStatus', 'error' );
		} ).always( function () {
			context.dispatch( 'skipImage' );
		} );
	},

	/**
	 * Set a depicts statement on the current image for each confirmed tag
	 *
	 * @param {Object} context
	 * @param {Array} confirmedTags
	 * @return {$.Deferred} jQuery Promise
	 */
	setDepictsStatements: function ( context, confirmedTags ) {
		var depictsPropertyId = mvConfig.depictsPropertyId,
			guidGenerator = new wikibase.utilities.ClaimGuidGenerator(
				context.getters.currentImageMediaInfoId
			),
			serializer = new serialization.StatementSerializer(),
			promise = $.Deferred().resolve().promise(),
			statements;

		// Create a depicts statement for the current image from each confirmed tag
		// Note: for local testing, you can hard-code tag.wikidataId to
		// something like 'Q1'
		statements = confirmedTags.map( function ( tag ) {
			return new datamodel.Statement(
				new datamodel.Claim(
					new datamodel.PropertyValueSnak(
						depictsPropertyId,
						new datamodel.EntityId( tag.wikidataId )
					),
					null, // qualifiers
					guidGenerator.newGuid()
				)
			);
		} );

		// send wbsetclaim calls one at a time to prevent edit conflicts
		statements.forEach( function ( statement ) {
			promise = promise.then( function () {
				return api.postWithToken( 'csrf', {
					action: 'wbsetclaim',
					claim: JSON.stringify( serializer.serialize( statement ) ),
					tags: 'computer-aided-tagging'
				} );
			} );
		} );

		return promise;
	},

	/**
	 * Discard the current image without publishing suggestions.
	 * TODO: Should also request more image data if necessary.
	 *
	 * @param {Object} context
	 */
	skipImage: function ( context ) {
		context.commit( 'removeImage' );

	},

	/**
	 * Set the publish status to show or clear notifications.
	 *
	 * @param {Object} context
	 * @param {string} publishStatus
	 */
	updatePublishStatus: function ( context, publishStatus ) {
		context.commit( 'setPublishStatus', publishStatus );
	}
};
