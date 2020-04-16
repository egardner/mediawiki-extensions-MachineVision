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

				<!-- TODO: categories. -->

				<div class="wbmad-image-with-suggestions__tags">
					<suggestion v-for="( suggestion, index ) in currentImageSuggestions"
						v-bind:key="index"
						v-bind:text="suggestion.text"
						v-bind:confirmed="suggestion.confirmed"
						v-on:click="toggleTagConfirmation( suggestion )"
					/>
				</div>
				<!-- TODO: Add custom tag button. -->

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
						v-bind:framed="false"
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
	Suggestion = require( './base/Suggestion.vue' );

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
		'publishStatus'
	] ), {
		/**
		 * @return {string}
		 */
		title: function () {
			return this.currentImage.title;
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
		 * @return {boolean}
		 */
		publishPending: function () {
			return this.publishStatus === 'pending';
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
		'toggleTagConfirmation'
	] ), {
		/**
		 * Publish the confirmed tags as depicts statements. All relevant state
		 * lives in Vuex, so all we need to do is trigger things here.
		 */
		onPublish: function () {
			this.publishTags();
		},

		/**
		 * Skip the image (remove it from the Vuex queue).
		 */
		onSkip: function () {
			this.skipImage();
		}
	} )
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../style-variables.less';

.wbmad-image-with-suggestions {
	.fade-in( 0.5s );
	display: none;
	position: relative;

	&:first-child {
		display: block;
	}

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

			&.wbmad-lazy {
				background-color: @base80;
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
		height: 100%;
		padding: 0;
		position: absolute;
		top: 0;
		width: 100%;
		z-index: 1;
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
</style>
