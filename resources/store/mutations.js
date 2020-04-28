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
		state.pending[ state.currentTab ] = true;
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
	 * Set the publish status (to success, error, pending or null).
	 *
	 * @param {Object} state
	 * @param {string|null} publishStatus
	 */
	setPublishStatus: function ( state, publishStatus ) {
		state.publishStatus = publishStatus;
	},

	setUserStats: function ( state, payload ) {
		state.userStats = payload;
	}
};
