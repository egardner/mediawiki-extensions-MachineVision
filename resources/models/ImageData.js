'use strict';

module.exports = function ImageData(
	title,
	pageid,
	descriptionurl,
	thumburl,
	thumbheight,
	suggestions
) {
	this.title = title;
	this.pageid = pageid;
	this.descriptionurl = descriptionurl;
	this.thumburl = thumburl;
	this.thumbheight = thumbheight;
	this.suggestions = suggestions;
};
