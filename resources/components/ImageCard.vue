<template>
	<div class="wbmad-image-with-suggestions">
		<wbmad-spinner v-if="publishPending" />
		<div class="wbmad-image-with-suggestions__container"
			v-bind:class="containerClasses">
			<div class="wbmad-image-with-suggestions__image">
				<div class="wbmad-image-with-suggestions__image-wrapper">
					<a v-bind:href="descriptionUrl" target="_blank">
						<img v-bind:src="thumbUrl" alt="">
					</a>
				</div>
			</div>

			<div class="wbmad-image-with-suggestions__content">
				<label class="wbmad-image-with-suggestions__title-label">
					<a v-bind:href="descriptionUrl" target="_blank">
						{{ title }}
					</a>
				</label>

				<div v-if="hasCategories" class="wbmad-category-list">
					<span
						v-i18n-html:machinevision-categories-label
						class="wbmad-category-list__label" />
					<span
						v-for="( category, index ) in categories"
						v-bind:key="category + index"
						class="wbmad-category-list__item"
					>{{ category }}</span>
				</div>

				<div class="wbmad-image-with-suggestions__tags">
					<suggestion v-for="( suggestion, index ) in currentImageSuggestions"
						v-bind:key="index"
						v-bind:text="suggestion.text"
						v-bind:confirmed="suggestion.confirmed"
						v-on:click="toggleTagConfirmation( suggestion )"
					/>

					<!-- Add custom tag button -->
					<mw-button
						icon="add"
						class="wbmad-custom-tag-button"
						v-bind:title="$i18n( 'machinevision-add-custom-tag-title' ).parse()"
						v-on:click="launchCustomTagDialog()"
					>
						{{ $i18n( 'machinevision-add-custom-tag' ).parse() }}
					</mw-button>
				</div>

				<div class="wbmad-action-buttons">
					<mw-button
						class="wbmad-action-buttons__publish"
						v-bind:primary="true"
						v-bind:progressive="true"
						v-bind:disabled="publishDisabled"
						v-bind:title="$i18n( 'machinevision-publish-title' )"
						v-on:click="onPublish"
					>
						<span v-i18n-html:machinevision-publish />
					</mw-button>
					<mw-button
						class="wbmad-action-buttons__skip"
						v-bind:frameless="true"
						v-bind:disabled="skipDisabled"
						v-bind:title="$i18n( 'machinevision-skip-title', title ).parse()"
						v-on:click="onSkip"
					>
						<span v-i18n-html:machinevision-skip />
					</mw-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
var mapActions = require( 'vuex' ).mapActions,
	mapGetters = require( 'vuex' ).mapGetters,
	mapState = require( 'vuex' ).mapState,
	Spinner = require( './Spinner.vue' ),
	Button = require( './base/Button.vue' ),
	Suggestion = require( './base/Suggestion.vue' ),
	ConfirmTagsDialog = require( '../widgets/ConfirmTagsDialog.js' ),
	AddCustomTagDialog = require( '../widgets/AddCustomTagDialog.js' );

// @vue/component
module.exports = {
	name: 'ImageCard',

	components: {
		'mw-button': Button,
		'wbmad-spinner': Spinner,
		suggestion: Suggestion
	},

	computed: $.extend( {}, mapGetters( [
		'currentImage',
		'currentImageSuggestions'
	] ), mapState( [
		'publishPending'
	] ), {
		/**
		 * @return {string}
		 */
		title: function () {
			// Remove "File:" from the image title.
			return this.currentImage.title.split( ':' ).pop();
		},

		/**
		 * @return {string}
		 */
		thumbUrl: function () {
			return this.currentImage.thumburl;
		},

		/**
		 * @return {string}
		 */
		descriptionUrl: function () {
			return this.currentImage.descriptionurl;
		},

		/**
		 * @return {boolean}
		 */
		hasCategories: function () {
			return this.categories.length > 0;
		},

		/**
		 * @return {Array}
		 */
		categories: function () {
			return this.currentImage.categories;
		},

		/**
		 * Whether or not the publish button should be disabled.
		 * @return {boolean}
		 */
		publishDisabled: function () {
			return this.confirmedSuggestions.length < 1 || this.publishPending;
		},

		/**
		 * Whether or not to disable the skip button.
		 * @return {boolean}
		 */
		skipDisabled: function () {
			return this.publishPending;
		},

		/**
		 * @return {Array} Array of suggestion objects
		 */
		confirmedSuggestions: function () {
			return this.currentImageSuggestions.filter( function ( suggestion ) {
				return suggestion.confirmed;
			} );
		},

		/**
		 * @return {Object}
		 */
		containerClasses: function () {
			return {
				'wbmad-spinner-active': this.publishPending
			};
		}
	} ),

	methods: $.extend( {}, mapActions( [
		'publishTags',
		'skipImage',
		'toggleTagConfirmation',
		'addCustomTag'
	] ), {
		/**
		 * Launch the confirmation modal (OOUI modal). If confirmed, dispatches
		 * the publishTags action; Vuex handles the rest (all the necessary
		 * data is already in the store)
		 */
		onPublish: function () {
			this.confirmTagsDialog = new ConfirmTagsDialog( {
				tagsList: this.confirmedSuggestions.map( function ( tag ) {
					return tag.text;
				} ).join( ', ' ),
				imgUrl: this.thumbUrl,
				imgTitle: this.imgTitle
			} ).connect( this, { confirm: 'onFinalConfirm' } );

			this.$logEvent( {
				action: 'publish',
				// eslint-disable-next-line camelcase
				approved_count: this.confirmedSuggestions.length
			} );

			this.windowManager.addWindows( [ this.confirmTagsDialog ] );
			this.windowManager.openWindow( this.confirmTagsDialog );
		},

		/**
		 * Log an event and dispatch publishTags action.
		 */
		onFinalConfirm: function () {
			this.$logEvent( {
				action: 'confirm',
				// eslint-disable-next-line camelcase
				approved_count: this.confirmedSuggestions.length
			} );
			this.publishTags();
		},

		/**
		 * Skip the image (remove it from the Vuex queue).
		 */
		onSkip: function () {
			this.$logEvent( { action: 'skip' } );
			this.skipImage();
		},

		/**
		 * Launch the "add custom tag" dialog (OOUI modal)
		 */
		launchCustomTagDialog: function () {
			this.windowManager.openWindow( this.addCustomTagDialog );
		}
	} ),

	/**
	 * We are still relying on OOUI for modals, so we need to set up the
	 * WindowManager and dialog widgets when the component mounts.
	 * Once MediaWiki exposes an appropriate DOM element for vue-based modals
	 * to target, we can rewrite this functionality in Vue. This is an
	 * exception to the general rule of "don't manipulate the DOM directly from
	 * Vue".
	 */
	mounted: function () {
		this.windowManager = new OO.ui.WindowManager();
		this.addCustomTagDialog = new AddCustomTagDialog().connect( this, {
			addCustomTag: 'addCustomTag'
		} );

		$( document.body ).append( this.windowManager.$element );
		this.windowManager.addWindows( [ this.addCustomTagDialog ] );
	}
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../style-variables.less';

.wbmad-image-with-suggestions {
	position: relative;

	&__container {
		.box-shadow(0 1px 4px rgba( 0, 0, 0, 0.25 ));
		border-radius: @outer-border-radius;

		&.wbmad-spinner-active {
			opacity: 0.5;
		}
	}

	&__image {
		.flex-display();
		background-color: @base80;
		border-radius: @outer-border-radius @outer-border-radius 0 0;
		justify-content: center;
		// Ensure image doesn't overflow border radius.
		overflow: hidden;

		.wbmad-image-with-suggestions__image-wrapper {
			max-width: 100%;

			@media screen and ( min-width: @width-breakpoint-tablet ) {
				max-width: 800px;
			}
		}

		img {
			display: block;
			height: auto;
			max-height: 786px;
			max-width: 100%;
			width: auto;

			@media screen and ( min-width: @width-breakpoint-tablet ) {
				max-height: 600px;
			}
		}
	}

	&__content {
		padding: 24px;
	}

	&__title-label {
		display: block;
		font-size: 1.125em;
		font-weight: bold;

		a {
			color: @base10;
		}
	}

	&__tags {
		.flex-display();
		.flex-wrap( wrap );
		margin: 18px 0;
	}

	.wbmad-spinner {
		background-color: rgba( 255, 255, 255, 0.5 );
		border-radius: @outer-border-radius;
		height: 100%;
		padding: 0;
		position: absolute;
		top: 0;
		width: 100%;
		z-index: 1;
	}
}

.wbmad-category-list {
	.fade-in( 0.2s );
	margin: 4px 0 0;

	span {
		color: @base20;
		font-size: 0.928em;
	}
}

.wbmad-category-list__label {
	margin: 0 0.4em 0 0;
}

// This isn't _exactly_ ideal, and spacing this pipe-deliminated list would be
// more exact if we used flexbox. However, we need the text to wrap like a
// paragraph, so we'll get as close as we can with a border-right and some magic
// numbers. We'll at least explicitly set the word-spacing to normal to maximize
// the chance that the spacing looks even.
.wbmad-category-list__item {
	border-right: solid 1px @base20;
	margin: 0 0.4em 0 0;
	padding-right: 0.4em;
	word-spacing: normal;

	&:last-child {
		border-right: 0;
		margin: 0;
		padding: 0;
	}
}

.wbmad-action-buttons {
	.flex-display();
	font-size: 1.15em;
	font-weight: 600;

	&__publish {
		border-radius: 4px;
		overflow: hidden;
		margin-right: 12px;
		padding-left: 16px;
		padding-right: 16px;
	}

	&__skip {
		margin-left: auto;
	}
}

.wbmad-custom-tag-button.mw-button {
	border-radius: 18px;
	color: @color-base;
	line-height: 1.6;
	margin: 0 4px 4px 0;
	padding: 4px 1.25em 4px 30/14em;
	white-space: nowrap;

	&:hover,
	&:focus {
		color: @color-base--emphasized;
	}

	&:focus {
		border-color: @color-primary--active;
		box-shadow: inset 0 0 0 1px @color-primary--active;
		outline: 0;
	}

	.mw-icon {
		width: 1em;
	}
}
</style>
