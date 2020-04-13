<template>
	<div
		class="wbmad-image-with-suggestions"
		v-bind:class="{ 'mw-hide-outline': hideOutline }"
		v-on:keydown.tab="hideOutline = false"
	>
		<div class="wbmad-image-with-suggestions__container">
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
					<suggestion v-for="( suggestion, index ) in suggestions"
						v-bind:key="index"
						v-bind:text="suggestion.text"
						v-bind:confirmed="suggestion.confirmed"
						v-on:click="toggleConfirmed( suggestion )"
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
	Button = require( './base/Button.vue' ),
	Suggestion = require( './base/Suggestion.vue' );

// Note: we need deep copy functionality here so that we can mutate the state of
// the suggestions without changing the values held by the parent through
// reference. Typically a library like lodash would be used for this. OOJS
// "copy" function doesn't seem to do the trick here unfortunately.
// This can be removed or moved to a "utils" file eventually.
function deepCopy( inObject ) {
	var outObject,
		value,
		key;

	if ( typeof inObject !== 'object' || inObject === null ) {
		return inObject; // Return the value if inObject is not an object
	}

	// Create an array or object to hold the values
	outObject = Array.isArray( inObject ) ? [] : {};

	for ( key in inObject ) {
		value = inObject[ key ];

		// Recursively (deep) copy for nested objects, including arrays
		outObject[ key ] = deepCopy( value );
	}

	return outObject;
}

// @vue/component
module.exports = {
	name: 'ImageCard',

	components: {
		'mw-button': Button,
		suggestion: Suggestion
	},

	props: {
		image: {
			type: Object,
			required: true
		}
	},

	data: function () {
		return {
			hideOutline: true,
			suggestions: []
		};
	},

	computed: {
		/**
		 * @return {string}
		 */
		title: function () {
			return this.image.title;
		},

		/**
		 * @return {string}
		 */
		thumbUrl: function () {
			return this.image.thumburl;
		},

		/**
		 * @return {string}
		 */
		descriptionUrl: function () {
			return this.image.descriptionurl;
		},

		publishDisabled: function () {
			return this.confirmedSuggestions.length < 1;
		},

		/**
		 * @return {Array} Array of suggestion objects
		 */
		confirmedSuggestions: function () {
			return this.suggestions.filter( function ( suggestion ) {
				return suggestion.confirmed;
			} );
		}
	},

	methods: $.extend( {}, mapActions( [
		'publishTags',
		'skipImage'
	] ), {

		/**
		 * Create a true copy of valid suggestions for local use. We need a
		 * deep copy because we don't want to inadvertently manipulate the
		 * parent state by changing "confirmed" status.
		 */
		cloneSuggestions: function () {
			var validSuggestions = this.image.suggestions.filter( function ( suggestion ) {
				return suggestion.text;
			} );

			this.suggestions = deepCopy( validSuggestions );
		},
		/**
		 * Mutate the suggestion state in-place
		 *
		 * @param {Object} suggestion
		 */
		toggleConfirmed: function ( suggestion ) {
			suggestion.confirmed = !suggestion.confirmed;
		},

		/**
		 * @TODO implement me
		 */
		onPublish: function () {
			this.publishTags();
		},

		/**
		 * @TODO implement me
		 */
		onSkip: function () {
			this.skipImage();
		}
	} ),

	watch: {
		/**
		 * Watch the image props. If props change because the queue has shifted,
		 * force-reset the suggestions state to the suggestions associated with
		 * the new image.
		 */
		image: function () {
			this.cloneSuggestions();
		}
	},

	created: function () {
		this.cloneSuggestions();
	}
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
