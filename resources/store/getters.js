'use strict';

/* eslint-disable no-implicit-globals */
var userGroups = mw.config.get( 'wgUserGroups' ) || [];

module.exports = {
	/**
	 * @param {Object} state
	 * @return {Array} tabs Tab names
	 */
	tabs: function ( state ) {
		return Object.keys( state.images );
	},

	/**
	 * @param {Object} state
	 * @return {Object} image
	 */
	currentImage: function ( state ) {
		return state.images[ state.currentTab ][ 0 ];
	},

	/**
	 * @param {Object} state
	 * @param {Object} getters
	 * @return {string|null} title
	 */
	currentImageTitle: function ( state, getters ) {
		if ( getters.currentImage ) {
			return getters.currentImage.title.split( ':' ).pop();
		} else {
			return null;
		}
	},

	/**
	 * @param {Object} state
	 * @param {Object} getters
	 * @return {string|null} title
	 */
	currentImageMediaInfoId: function ( state, getters ) {
		var pageId;

		if ( getters.currentImage ) {
			pageId = getters.currentImage.pageid;
			return 'M' + pageId;
		} else {
			return null;
		}
	},

	/**
	 * @param {Object} state
	 * @param {Object} getters
	 * @return {Array} suggestions
	 */
	currentImageSuggestions: function ( state, getters ) {
		if ( getters.currentImage ) {
			// Filter out suggestions with no label.
			return getters.currentImage.suggestions.filter( function ( suggestion ) {
				return suggestion.text;
			} );
		} else {
			return [];
		}
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
};
