'use strict';

/* eslint-disable no-implicit-globals */
var ensureTabExists = require( './utils.js' ).ensureTabExists;

module.exports = {
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
	 * Sets the fetch pending state
	 *
	 * @param {Object} state
	 * @param {Object} payload
	 * @param {bool} payload.pending
	 * @param {string} [payload.queue]
	 */
	setFetchPending: function ( state, payload ) {
		if ( payload.queue ) {
			ensureTabExists( state, payload.queue );
			state.fetchPending[ payload.queue ] = !!payload.pending;
		} else {
			state.fetchPending[ state.currentTab ] = !!payload.pending;
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
	 * @param {Object} state
	 * @param {Object} suggestion
	 */
	addSuggestionToCurrentImage: function ( state, suggestion ) {
		state.images[ state.currentTab ][ 0 ].suggestions.push( suggestion );
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
		state.fetchPending[ state.currentTab ] = true;
	},

	/**
	 * Toggle the confirmation state of a single suggestion of an image
	 *
	 * @param {Object} state
	 * @param {Object} suggestion
	 * @param {string} suggestion.wikidataId
	 */
	toggleSuggestion: function ( state, suggestion ) {
		var currentImage = state.images[ state.currentTab ][ 0 ],
			// eslint-disable-next-line no-restricted-syntax
			selected = currentImage.suggestions.find( function ( s ) {
				return s.wikidataId === suggestion.wikidataId;
			} );

		selected.confirmed = !selected.confirmed;
	},

	/**
	 * Set publish pending status.
	 *
	 * @param {Object} state
	 * @param {boolean} publishPendingStatus
	 */
	setPublishPending: function ( state, publishPendingStatus ) {
		state.publishPending = publishPendingStatus;
	},

	setUserStats: function ( state, payload ) {
		state.userStats = payload;
	},

	/**
	 * Set the initial count of user's unreviewed images
	 *
	 * @param {Object} state
	 * @param {number} count
	 */
	setUnreviewedCount: function ( state, count ) {
		state.unreviewedCount = count;
	},

	/**
	 * @param {Object} state
	 */
	decrementUnreviewedCount: function ( state ) {
		state.unreviewedCount--;
	},

	/**
	 * Add a new toast notification to the store.
	 *
	 * @param {Object} state
	 * @param {Object} toastData
	 * @param {string} toastData.key Unique key for the toast component
	 * @param {string} toastData.messageKey The i18n message key to display
	 * @param {string} toastData.type The message type (success, error, etc.)
	 * @param {number} toastData.duration Display duration in seconds
	 */
	setToastNotification: function ( state, toastData ) {
		state.toastNotifications = state.toastNotifications.concat( [ toastData ] );
	},

	/**
	 * Remove a toast notification from the store.
	 *
	 * @param {Object} state
	 * @param {string} toastKey Unique key of the toast to be hidden
	 */
	removeToastNotification: function ( state, toastKey ) {
		state.toastNotifications = state.toastNotifications.filter( function ( toast ) {
			return toast.key !== toastKey;
		} );
	},

	/**
	 * Add a CardStack message to the store.
	 *
	 * @param {Object} state
	 * @param {Object} messageData
	 * @param {string} messageData.messageKey The i18n message key to display
	 * @param {string} messageData.type The message type (success, error, etc.)
	 */
	setCardStackMessage: function ( state, messageData ) {
		state.cardStackMessage = messageData;
	},

	/**
	 * Remove CardStack message from the store.
	 *
	 * @param {Object} state
	 */
	removeCardStackMessage: function ( state ) {
		state.cardStackMessage = null;
	}
};
