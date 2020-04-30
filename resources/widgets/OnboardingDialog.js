'use strict';

/* eslint-disable */

/**
 * Process dialog that displays on personal uploads tab on first view.
 *
 * @constructor
 * @param {Object} [config]
 */
function OnboardingDialog( config ) {
	this.config = config || {};
	OnboardingDialog.parent.call( this, config );

	this.$element.addClass( 'wbmad-onboarding-dialog' );
	this.size = 'large';
	this.connect( this, { close: 'onClose' } );
}
OO.inheritClass( OnboardingDialog, OO.ui.ProcessDialog );

/**
 * @inheritdoc
 * @property name
 */
OnboardingDialog.static.name = 'OnboardingDialog';

/**
 * @inheritdoc
 * @property actions
 */
OnboardingDialog.static.actions = [
	{
		action: 'close',
		label: mw.message( 'machinevision-onboarding-dialog-close-label' ).parse(),
		flags: [ 'safe', 'close' ]
	}
];

/**
 * Store user preference to permanently dismiss this dialog, then close it.
 */
OnboardingDialog.prototype.onClose = function () {
	// Only authenticated users can see this tool so we can forego checking
	// isAnon().
	new mw.Api().saveOption( this.config.onboardingPrefKey, 1 );
	mw.user.options.set( this.config.onboardingPrefKey, 1 );
	this.close();
};

/**
 * @inheritdoc
 */
OnboardingDialog.prototype.getActionProcess = function ( action ) {
	var dialog = this;
	if ( action === 'close' ) {
		// Run the onClose method so we can store user preference.
		return new OO.ui.Process( function () {
			dialog.onClose();
		}, this );
	}

	// Fallback to parent handler.
	return OnboardingDialog.parent.prototype.getActionProcess.call( this, action );
};

/**
 * @inheritdoc
 * TODO: Space between paragraphs in text
 */
OnboardingDialog.prototype.initialize = function () {
	OnboardingDialog.parent.prototype.initialize.call( this );

	// Add content to the dialog.
	this.content = new OO.ui.PanelLayout( { padded: true, expanded: false } );
	this.content.$element.append(
		'<div class="wbmad-user-message-icon"></div>' +
		'<p class="wbmad-user-message-heading">' +
		mw.message( 'machinevision-onboarding-dialog-heading' ).parse() +
		'</p>' +
		'<div class="wbmad-user-message-text">' +
		mw.message( 'machinevision-onboarding-dialog-text' ).parse() +
		'</div>'
	);

	this.$body.append( this.content.$element );
};

module.exports = OnboardingDialog;
