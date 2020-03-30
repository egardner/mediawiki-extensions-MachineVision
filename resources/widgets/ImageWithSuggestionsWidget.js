/* eslint camelcase: 0 */
'use strict';

var TemplateRenderingDOMLessGroupWidget = require( './../base/TemplateRenderingDOMLessGroupWidget.js' ),
	SuggestionWidget = require( './SuggestionWidget.js' ),
	ConfirmTagsDialog = require( './ConfirmTagsDialog.js' ),
	datamodel = require( 'wikibase.datamodel' ),
	serialization = require( 'wikibase.serialization' ),
	mvConfig = require( 'ext.MachineVision.config' );

/**
 * A card within the cardstack on the Suggested Tags page. Each card contains
 * an image and a group of SuggestionWidgets.
 *
 * @param {Object} config
 * @param {string} queryType
 * @cfg {string} descriptionurl Filepage URL
 * @cfg {Array} suggestions Image tag suggestions
 * @cfg {string} thumburl Image thumbnail URL
 * @cfg {string} thumbheight Image thumbnail height
 * @cfg {string} title Image title
 */
function ImageWithSuggestionsWidget( config, queryType ) {
	var $image;

	this.config = config || {};
	ImageWithSuggestionsWidget.parent.call( this, $.extend( {}, config ) );
	this.$element.addClass( 'wbmad-image-with-suggestions wbmad-hide-outline' );

	this.suggestions = this.config.suggestions;
	this.suggestionWidgets = this.getSuggestionWidgets();
	this.confirmedCount = 0;
	this.imageTitle = this.config.title.split( ':' ).pop();
	this.filePageUrl = this.config.descriptionurl;
	this.tab = queryType === 'user' ? 'personal' : 'popular';
	this.mediaInfoId = 'M' + this.config.pageid;
	this.guidGenerator = new wikibase.utilities.ClaimGuidGenerator( this.mediaInfoId );
	this.imageLoaded = false;

	this.titleLabel = new OO.ui.LabelWidget( {
		label: $( '<a>' )
			.attr( 'href', this.filePageUrl )
			.attr( 'target', '_blank' )
			.text( this.imageTitle ),
		classes: [ 'wbmad-suggestion-group__title-label' ]
	} );

	this.skipButton = new OO.ui.ButtonWidget( {
		classes: [ 'wbmad-action-buttons__skip' ],
		title: mw.message( 'machinevision-skip-title', this.imageTitle ).parse(),
		label: mw.message( 'machinevision-skip' ).parse(),
		framed: false
	} ).on( 'click', this.onSkip, [ true ], this );

	this.publishButton = new OO.ui.ButtonWidget( {
		classes: [ 'wbmad-action-buttons__publish' ],
		title: mw.message( 'machinevision-publish-title' ).parse(),
		label: mw.message( 'machinevision-publish' ).parse(),
		disabled: true,
		flags: [
			'primary',
			'progressive'
		]
	} ).on( 'click', this.onPublish, [], this );

	this.api = wikibase.api.getLocationAgnosticMwApi(
		mw.config.get( 'wbmiRepoApiUrl', mw.config.get( 'wbRepoApiUrl' ) )
	);

	this.connect( this, {
		confirm: 'onFinalConfirm',
		toggleSuggestion: 'onToggleSuggestion'
	} );
	this.$element.on( 'keydown', this.onKeydown.bind( this ) );

	this.render();

	// Set image height to avoid scroll issue when image is loaded.
	$image = this.$element.find( 'img' );
	if ( $image.length > 0 ) {
		$image[ 0 ].style.height = this.config.thumbheight + 'px';
	}
}
OO.inheritClass( ImageWithSuggestionsWidget, TemplateRenderingDOMLessGroupWidget );

ImageWithSuggestionsWidget.prototype.render = function () {
	this.renderTemplate( 'widgets/ImageWithSuggestionsWidget.mustache+dom', {
		skipButton: this.skipButton,
		imageTagTitle: this.imageTitle,
		titleLabel: this.titleLabel,
		suggestions: this.suggestionWidgets,
		imageLoaded: this.imageLoaded,
		thumburl: this.config.thumburl,
		filePageUrl: this.filePageUrl,
		publishButton: this.publishButton,
		showSpinner: this.showSpinner,
		spinnerClass: ( this.showSpinner ) ? 'wbmad-spinner-active' : ''
	} );
};

/**
 * Create an array of suggestion widgets based on suggestion data.
 * @return {Array}
 */
ImageWithSuggestionsWidget.prototype.getSuggestionWidgets = function () {
	var self = this,
		validSuggestions = this.suggestions.filter( function ( suggestion ) {
			return !!suggestion.text;
		} );

	return validSuggestions.map( function ( data ) {
		return new SuggestionWidget( { suggestionData: data } )
			.connect( self, { toggleSuggestion: 'onToggleSuggestion' } );
	} );
};

/**
 * Actually load the image.
 */
ImageWithSuggestionsWidget.prototype.loadImage = function () {
	var $image = this.$element.find( '.wbmad-lazy' );

	if ( $image.length > 0 ) {
		$image[ 0 ].src = $image[ 0 ].dataset.src;
		$image.removeClass( 'wbmad-lazy' );
		this.imageLoaded = true;
	}
};

/**
 * When a suggestion is toggled, see if buttons should be disabled.
 *
 * This widget has a property keeping track of how many suggestions are
 * currently confirmed. When this value is 0, the publish button should be
 * disabled.
 *
 * @param {bool} confirmed Whether or not the suggestion is confirmed
 */
ImageWithSuggestionsWidget.prototype.onToggleSuggestion = function ( confirmed ) {
	var addend = ( confirmed ) ? 1 : -1,
		hasConfirmed;

	// If the suggestion is confirmed, add 1 to count. If not, that means it
	// has been un-confirmed, so subtract 1.
	this.confirmedCount = this.confirmedCount + addend;
	hasConfirmed = this.confirmedCount > 0;

	this.publishButton.setDisabled( !hasConfirmed );
};

/**
 * Show a dialog prmopting user to confirm tags before publishing.
 */
ImageWithSuggestionsWidget.prototype.onPublish = function () {
	var self = this,
		confirmedSuggestions = this.suggestionWidgets.filter( function ( widget ) {
			return widget.confirmed;
		} ),
		tagsList = confirmedSuggestions.map( function ( widget ) {
			return widget.suggestionData.text;
		} ).join( ', ' ),
		confirmTagsDialog,
		windowManager;

	this.logEvent( {
		action: 'publish',
		approved_count: this.confirmedCount
	} );

	confirmTagsDialog = new ConfirmTagsDialog( {
		tagsList: tagsList,
		imgUrl: this.config.thumburl,
		imgTitle: this.imageTitle
	} )
		.connect( self, { confirm: 'onFinalConfirm' } );

	windowManager = new OO.ui.WindowManager();
	$( document.body ).append( windowManager.$element );

	windowManager.addWindows( [ confirmTagsDialog ] );
	windowManager.openWindow( confirmTagsDialog );
};

/**
 * Publish new tags and move to the next image.
 * @return {jQuery.Promise}
 */
ImageWithSuggestionsWidget.prototype.onFinalConfirm = function () {
	var self = this,
		depictsPropertyId = mvConfig.depictsPropertyId,
		reviewBatch = this.suggestionWidgets.map( function ( widget ) {
			return {
				label: widget.suggestionData.wikidataId,
				review: widget.confirmed ? 'accept' : 'reject'
			};
		} ),
		depictsStatements = this.suggestionWidgets.filter( function ( widget ) {
			return widget.confirmed;
		} ).map( function ( widget ) {
			return new datamodel.Statement(
				new datamodel.Claim(
					new datamodel.PropertyValueSnak(
						depictsPropertyId,
						new datamodel.EntityId( widget.suggestionData.wikidataId )
					),
					null, // qualifiers
					self.guidGenerator.newGuid()
				)
			);
		} ),
		serializer = new serialization.StatementSerializer(),
		promise;

	this.messages = [];
	this.showSpinner = true;
	this.publishButton.setDisabled( true );
	this.skipButton.setDisabled( true );
	this.render();

	this.logEvent( {
		action: 'confirm',
		approved_count: this.confirmedCount
	} );

	promise = this.api.postWithToken( 'csrf', {
		action: 'reviewimagelabels',
		filename: this.imageTitle,
		batch: JSON.stringify( reviewBatch )
	} );

	// Send wbsetclaim calls one at a time to prevent edit conflicts
	depictsStatements.forEach( function ( statement ) {
		promise = promise.then( function () {
			return self.api.postWithToken( 'csrf', {
				action: 'wbsetclaim',
				claim: JSON.stringify( serializer.serialize( statement ) ),
				tags: 'computer-aided-tagging'
			} );
		} );
	} );

	return $.when( promise )
		// eslint-disable-next-line no-unused-vars
		.done( function ( result ) {
			// Show success message.
			self.emit( 'tagsPublished' );
		} )
		// eslint-disable-next-line no-unused-vars
		.fail( function ( errorCode, error ) {
			self.emit( 'publishError' );
		} )
		.always( function () {
			// Move to next image.
			self.onSkip( false );
		} );
};

/**
 * Remove this image. As a result, the next image will display (via CSS).
 * @param {boolean} userExplicitlySkipped set to true if this is called when the user clicks 'skip'
 * @fires itemRemoved
 */
ImageWithSuggestionsWidget.prototype.onSkip = function ( userExplicitlySkipped ) {
	this.$element.remove();

	// Emit an event so parent element can see if we need to fetch more images.
	this.emit( 'itemRemoved' );

	if ( userExplicitlySkipped ) {
		this.logEvent( { action: 'skip' } );
	}
};

/**
 * Remove class when tab key is pressed to ensure user sees focus outline.
 * @param {Object} e
 */
ImageWithSuggestionsWidget.prototype.onKeydown = function ( e ) {
	if ( e.key === 'Tab' ) {
		this.$element.removeClass( 'wbmad-hide-outline' );
	}
};

/**
 * Log a user interaction event.
 * @param {!Object} eventData
 * @return {jQuery.Promise} jQuery Promise object for the logging call.
 */
ImageWithSuggestionsWidget.prototype.logEvent = function ( eventData ) {
	var event = eventData;
	event.image_title = this.imageTitle;
	event.suggestions_count = this.suggestions.length;
	event.is_mobile = mw.config.get( 'skin' ) === 'minerva';
	event.tab = this.tab;
	event.user_id = mw.user.getId();
	return mw.eventLog.logEvent( 'SuggestedTagsAction', event );
};

module.exports = ImageWithSuggestionsWidget;
