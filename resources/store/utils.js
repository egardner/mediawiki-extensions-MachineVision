'use strict';

/* eslint-disable no-implicit-globals */
var MvImage = require( '../models/Image.js' ),
	MvSuggestion = require( '../models/Suggestion.js' );

/**
 * Helper function to normalize the data we get upfront and the data we get
 * from future API requests
 *
 * @param {Array} data
 * @return {ImageData[]}
 */
module.exports.processInitialData = function processInitialData( data ) {
	return data.map( function ( item ) {
		var height = item.height,
			width = item.width;

		// Find thumbheight for images wider than 800px.
		if ( width > 800 ) {
			height = height * 800 / width;
		}

		return new MvImage(
			item.title,
			item.pageid,
			item.description_url,
			item.thumb_url,
			height,
			item.suggested_labels.map( function ( labelData ) {
				return new MvSuggestion( labelData.label, labelData.wikidata_id );
			} )
		);
	} );
};

/**
 * Helper function to ensure the user doesn't try to access an invalid tab.
 *
 * @param {Object} state
 * @param {string} tab
 */
module.exports.ensureTabExists = function ensureTabExists( state, tab ) {
	var tabs = Object.keys( state.images );

	if ( tabs.indexOf( tab ) === -1 ) {
		throw new Error( 'invalid tab' );
	}
};
