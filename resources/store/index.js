'use strict';

/* eslint-disable no-implicit-globals */
var Vue = require( 'vue' ),
	Vuex = require( 'vuex' ),
	state = require( './state.js' ),
	getters = require( './getters.js' ),
	mutations = require( './mutations.js' ),
	actions = require( './actions.js' );

Vue.use( Vuex );

<<<<<<< HEAD
// Set up API client
api = wikibase.api.getLocationAgnosticMwApi(
	mw.config.get( 'wbmiRepoApiUrl', mw.config.get( 'wbRepoApiUrl' ) )
);

/**
 * @type {Array}
 */
userGroups = mw.config.get( 'wgUserGroups' ) || [];

/**
 * @type {Array} pre-populated collection of images from PHP
 */
initialData = mw.config.get( 'wgMVSuggestedTagsInitialData' ) || [];

/**
 * Helper function to normalize the data we get upfront and the data we get
 * from future API requests
 *
 * @param {Array} data
 * @return {ImageData[]}
 */
function processInitialData( data ) {
	return data.map( function ( item ) {
		var height = item.height,
			width = item.width;

		// Find thumbheight for images wider than 800px.
		if ( width > 800 ) {
			height = height * 800 / width;
		}

		return new ImageData(
			item.title,
			item.pageid,
			item.description_url,
			item.thumb_url,
			height,
			item.suggested_labels.map( function ( labelData ) {
				return new SuggestionData( labelData.label, labelData.wikidata_id );
			} )
		);
	} );
}

/**
 * Helper function to ensure the user doesn't try to access an invalid tab.
 *
 * @param {Object} state
 * @param {string} tabName
 */
function ensureTabExists( state, tabName ) {
	var tabs = Object.keys( state.images );

	if ( tabs.indexOf( tabName ) === -1 ) {
		throw new Error( 'invalid tab' );
	}
}

=======
>>>>>>> Split up store into separate files for state, mutations, actions, etc.
/**
 * Vuex Store: shared application state lives here
 */
module.exports = new Vuex.Store( {
<<<<<<< HEAD
	state: {
		currentTab: 'popular',

		images: {
			popular: processInitialData( initialData ),
			user: []
		},

		pending: {
			popular: false,
			user: false
		},

		publishStatus: null,

		userStats: {}

	},
=======
	state: state,
>>>>>>> Split up store into separate files for state, mutations, actions, etc.

	/**
	 * Getters are like computed properties for Vuex state
	 */
	getters: getters,

	/**
	 * State can only be modified by mutations, which must be synchronous.
	 * Each mutation is called with the state as its first argument; additional
	 * arguments are allowed.
	 */
<<<<<<< HEAD
	mutations: {
		/**
		 * Set the current tab; name must be one of the predefined items in state.tabs.
		 *
		 * @param {Object} state
		 * @param {string} tabName
		 */
		setTab: function ( state, tabName ) {
			ensureTabExists( state, tabName );
			state.currentTab = tabName;
		},

		/**
		 * Sets the pending state
		 *
		 * @param {Object} state
		 * @param {Object} payload
		 * @param {bool} payload.pending
		 * @param {string} [payload.queue]
		 */
		setPending: function ( state, payload ) {
			if ( payload.queue ) {
				ensureTabExists( state, payload.queue );
				state.pending[ payload.queue ] = !!payload.pending;
			} else {
				state.pending[ state.currentTab ] = !!payload.pending;
			}

		},

		/**
		 * Add an image object to the queue.
		 *
		 * @param {Object} state
		 * @param {Object} payload
		 * @param {Object} payload.image
		 * @param {string} [payload.queue] Target queue to add image to; defaults to current
		 */
		addImage: function ( state, payload ) {
			if ( payload.queue ) {
				ensureTabExists( state, payload.queue );
				state.images[ payload.queue ].push( payload.image );
			} else {
				state.images[ state.currentTab ].push( payload.image );
			}

		},

		/**
		 * Remove the first image from the queue.
		 *
		 * @param {Object} state
		 */
		removeImage: function ( state ) {
			state.images[ state.currentTab ].shift();
		},

		/**
		 * Clear all images in the queue and set pending back to true
		 *
		 * @param {Object} state
		 */
		clearImages: function ( state ) {
			state.images[ state.currentTab ] = [];
			state.pending = true;
		},

		setUserStats: function ( state, payload ) {
			state.userStats = payload;
		},

		/**
		 * Toggle the confirmation state of a single suggestion of an image
		 *
		 * @param {Object} state
		 * @param {integer} index
		 */
		toggleSuggestion: function ( state, index ) {
			var currentImage = state.images[ state.currentTab ][ 0 ],
				selected = currentImage.suggestions[ index ];

			selected.confirmed = !selected.confirmed;
		},

		/**
		 * Set the publish status (to success, error, or null).
		 *
		 * @param {Object} state
		 * @param {string|null} publishStatus
		 */
		setPublishStatus: function ( state, publishStatus ) {
			state.publishStatus = publishStatus;
		}
	},
=======
	mutations: mutations,
>>>>>>> Split up store into separate files for state, mutations, actions, etc.

	/**
	 * Actions are functions that may be dispatched by components or inside of
	 * other actions. They are called with a context argument and an optional
	 * payload argument. Actions may be asynchronous but do not have to be.
	 */
<<<<<<< HEAD
	actions: {
		/**
		 * @param {Object} context
		 * @param {string} tabName
		 */
		updateCurrentTab: function ( context, tabName ) {
			context.commit( 'setTab', tabName );
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
			var queue = options.queue || context.state.currentTab,
				query = {
					action: 'query',
					format: 'json',
					formatversion: 2,
					generator: 'unreviewedimagelabels',
					guillimit: 10,
					prop: 'imageinfo|imagelabels',
					iiprop: 'url',
					iiurlwidth: 800,
					ilstate: 'unreviewed',
					meta: 'unreviewedimagecount',
					uselang: mw.config.get( 'wgUserLanguage' )
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

				// Return ImageData objects for each item in the API response
				images = validItems.map( function ( item ) {
					return new ImageData(
						item.title,
						item.pageid,
						item.imageinfo[ 0 ].descriptionurl,
						item.imageinfo[ 0 ].thumburl,
						item.imageinfo[ 0 ].thumbheight,
						item.imagelabels.map( function ( labelData ) {
							return new SuggestionData( labelData.label, labelData.wikidata_id );
						} )
					);
				} );

				// Commit the ImageData objects to the state in the appropriate queue
				images.map( function ( image ) {
					context.commit( 'addImage', {
						image: image,
						queue: queue
					} );
				} );

				// Save user data.
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
		 * @TODO implement this
		 *
		 * Discard the current image without publishing suggestions.
		 * Should also request more image data if necessary.
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
	}
=======
	actions: actions
>>>>>>> Split up store into separate files for state, mutations, actions, etc.
} );
