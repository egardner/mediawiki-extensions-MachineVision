'use strict';

module.exports = function WikibaseMachineAssistedDepictsSuggestionData( text, wikidataId ) {
	this.text = text;
	this.wikidataId = wikidataId;
	this.confirmed = false;
};
