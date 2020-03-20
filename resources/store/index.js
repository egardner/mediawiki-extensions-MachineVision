'use strict';

var Vue = require( 'vue' ),
	Vuex = require( 'ext.MachineVision.vuex' ),
	ImageData = require( '../models/ImageData.js' ),
	SuggestionData = require( '../models/SuggestionData.js' ),
	api,
	initialData,
	userGroups,
	TABS;

Vue.use( Vuex );

TABS = {
	USER: 'user',
	POPULAR: 'popular'
};

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

module.exports = new Vuex.Store( {
	state: {
		currentTab: TABS.POPULAR,
		/**
		 * key names here must correspond to the values in TABS
		 */
		images: {
			user: [],
			popular: []
		},

		user: {
			isAuthenticated: !!mw.config.get( 'wgUserName' ),
			isAutoConfirmed: userGroups.indexOf( 'autoconfirmed' ) !== -1
		}
	},

	getters: {
		/**
		 * @param {Object} state
		 * @return {Object|null} image object, or null if no images remain in the queue
		 */
		currentImage: function ( state ) {
			if ( state.images[ state.currentTab ].length > 0 ) {
				return state.images[ state.currentTab ][ 0 ];
			} else {
				return null;
			}
		},

		/**
		 * @param {Object} _state
		 * @param {Object} getters
		 * @return {Array|null} array of suggested labels, or null if no images remain in the queue
		 */
		currentSuggestions: function ( _state, getters ) {
			if ( getters.currentImage ) {
				return getters.currentImage.suggested_labels;
			} else {
				return null;
			}
		},

		/**
		 * @param {Object} state
		 * @return {bool}
		 */
		showTabs: function ( state ) {
			return state.user.isAuthenticated && state.user.isAutoConfirmed;
		}
	},

	mutations: {
		/**
		 * Set the current tab; name must be one of the keys in the TABS object.
		 *
		 * @param {Object} state
		 * @param {string} tab
		 */
		setTab: function ( state, tab ) {
			if ( !( tab in TABS ) ) {
				throw new Error( 'Invalid Tab name' );
			}

			state.currentTab = TABS[ tab ];
		},

		/**
		 * Add an image object to the appropriate queue. If no queue is specified,
		 * default to the queue corresponding to the current tab.
		 *
		 * @param {Object} state
		 * @param {Object} payload
		 * @param {Object} payload.image
		 * @param {string} [payload.queue]
		 */
		addImage: function ( state, payload ) {
			if ( payload.queue ) {
				state.images[ payload.queue ].push( payload.image );
			} else {
				state.images[ state.currentTab ].push( payload.image );
			}
		},

		/**
		 * Remove the first image from the appropriate queue. If no queue is specified,
		 * default to the queue corresponding to the current tab.
		 *
		 * @param {Object} state
		 * @param {Object} [payload]
		 * @param {string} [payload.queue]
		 */
		removeImage: function ( state, payload ) {
			if ( payload && payload.queue ) {
				state.images[ payload.queue ].shift();
			} else {
				state.images[ state.currentTab ].shift();
			}
		}
	},

	actions: {
		/**
		 * @param {Object} context
		 * @param {string} tab
		 */
		updateCurrentTab: function ( context, tab ) {
			context.commit( 'setTab', tab );
		},

		/**
		 * @TODO implement this
		 *
		 * Request images for review in the appropriate queue from the API.
		 * Options should include: queue (default to popular?)
		 * as well as any API request options (number of images to retrieve, etc)
		 *
		 * This action should return a promise so we can chain it. Let's use
		 * real promises here if possible.
		 *
		 * @param {Object} context
		 * @return {$.Deferred} Promise
		 */
		getImages: function ( context ) {
			var query = {
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

			if ( context.state.currentTab === TABS.USER ) {
				query.guiluploader = mw.user.getId();
				query.ilstate = 'unreviewed|withheld';
			}

			// Request images from the API
			return api.get( query ).then( function ( res ) {
				// @TODO is it really necessary to check for all of this?
				var responseIsValid = res.query && res.query.pages && Array.isArray( res.query.pages ),
					validItems,
					images;

				// Ensure only images with the data we need get passed along
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
						queue: context.state.currentTab
					} );
				} );
			
			} ).catch( function ( error ) {
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
		 * @param {Object} payload
		 */
		publishTags: function ( context, payload ) {
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
		}
	}
} );
