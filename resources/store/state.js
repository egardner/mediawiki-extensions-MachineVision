'use strict';

/* eslint-disable no-implicit-globals */
var processInitialData = require( './utils.js' ).processInitialData,
	initialData = mw.config.get( 'wgMVSuggestedTagsInitialData' ) || [];

module.exports = {
	currentTab: 'popular',

	images: {
		popular: processInitialData( initialData ),
		user: []
	},

	pending: {
		popular: false,
		user: false
	},

	publishStatus: null
};
