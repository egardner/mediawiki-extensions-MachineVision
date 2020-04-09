'use strict';

/* eslint-disable no-implicit-globals */
var Vue = require( 'vue' ),
	Vuex = require( 'vuex' ),
	// eslint-disable-next-line no-redeclare
	ImageData = require( '../models/ImageData.js' ),
	SuggestionData = require( '../models/SuggestionData.js' ),
	api,
	initialData,
	userGroups;

Vue.use( Vuex );

// Set up API client
api = new mw.Api();

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
 * @param {string} tab
 */
function ensureTabExists( state, tab ) {
	var tabs = Object.keys( state.images );

	if ( tabs.indexOf( tab ) === -1 ) {
		throw new Error( 'invalid tab' );
	}
}

/**
 * Vuex Store: shared application state lives here
 */
module.exports = new Vuex.Store( {
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

		publishState: null

	},

	/**
	 * Getters are like computed properties for Vuex state
	 */
	getters: {
		/**
		 * @param {Object} state
		 * @return {Array} tabs
		 */
		tabs: function ( state ) {
			return Object.keys( state.images );
		},

		/**
		 * Whether or not the user is logged in. Derived from non-Vuex global
		 * state.
		 *
		 * @return {bool}
		 */
		isAuthenticated: function () {
			return !!mw.config.get( 'wgUserName' );
		},

		/**
		 * Whether or not the user is autoconfirmed. Derived from non-Vuex
		 * global state.
		 *
		 * @return {bool}
		 */
		isAutoconfirmed: function () {
			return userGroups.indexOf( 'autoconfirmed' ) !== -1;
		}
	},

	/**
	 * State can only be modified by mutations, which must be synchronous.
	 * Each mutation is called with the state as its first argument; additional
	 * arguments are allowed.
	 */
	mutations: {
		/**
		 * Set the current tab; name must be one of the predefined items in state.tabs.
		 *
		 * @param {Object} state
		 * @param {string} tab
		 */
		setTab: function ( state, tab ) {
			ensureTabExists( state, tab );
			state.currentTab = tab;
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

		setPublishState: function ( state, publishState ) {
			state.publishState = publishState;
		}
	},

	/**
	 * Actions are functions that may be dispatched by components or inside of
	 * other actions. They are called with a context argument and an optional
	 * payload argument. Actions may be asynchronous but do not have to be.
	 */
	actions: {
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

				context.commit( 'setPending', {
					queue: queue,
					pending: false
				} );
			} ).catch( function ( /* error */ ) {
				// @TODO error handling logic
			} );
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
			// TODO: Handle publish.

			context.dispatch( 'skipImage' );

			// Clear out any existing publish notifications.
			context.dispatch( 'updatePublishState', null );
			context.dispatch( 'updatePublishState', 'success' );

			// TODO: handle error.
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
		 * Set the publish state to show or clear notifications.
		 *
		 * @param {Object} context
		 * @param {string} publishState
		 */
		updatePublishState: function ( context, publishState ) {
			context.commit( 'setPublishState', publishState );
		}
	}
} );
