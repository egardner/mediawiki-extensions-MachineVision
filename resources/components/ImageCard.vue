<template>
	<div
		class="wbmad-image-with-suggestions"
		v-bind:class="{ 'mw-hide-outline': hideOutline }"
		v-on:keydown.tab="hideOutline = false"
	>
		<div class="wbmad-image-with-suggestions-image">
			<div class="wbmad-image-with-suggestions-image-wrapper">
				<a v-bind:href="descriptionUrl" target="_blank">
					<img v-bind:src="thumbUrl" alt="">
				</a>
			</div>
		</div>

		<div class="wbmad-image-with-suggestions-tags">
			<div class="wbmad-suggestion-group">
				<suggestion v-for="( suggestion, index ) in suggestions"
					v-bind:key="index"
					v-bind:text="suggestion.text"
					v-bind:confirmed="suggestion.confirmed"
					v-on:click="toggleConfirmed( suggestion )"
				>
					{{ suggestion.text }}
				</suggestion>
			</div>

			<div class="wbmad-action-buttons">
				<base-button
					class="wbmad-action-buttons__publish"
					v-bind:primary="true"
					v-bind:progressive="true"
					v-bind:title="$i18n( 'machinevision-publish-title' )"
					v-on:click="onPublish"
				>
					<span v-i18n-html:machinevision-publish />
				</base-button>
				<base-button
					class="wbmad-action-buttons__skip"
					v-bind:framed="false"
					v-bind:title="$i18n( 'machinevision-skip-title', title ).parse()"
					v-on:click="onSkip"
				>
					<span v-i18n-html:machinevision-skip />
				</base-button>
			</div>
		</div>
	</div>
</template>

<script>
var Button = require( './base/Button.vue' ),
	Suggestion = require( './base/Suggestion.vue' );

module.exports = {
	name: 'ImageCard',

	components: {
		'base-button': Button,
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
			// copy suggestions from props into state so we can modify their
			// "confirmed" properties in place
			suggestions: this.image.suggestions,
			hideOutline: true
		};
	},

	computed: {
		title: function () {
			return this.image.title;
		},

		thumbUrl: function () {
			return this.image.thumburl;
		},

		descriptionUrl: function () {
			return this.image.descriptionurl;
		},

		confirmedSuggestions: function () {
			return this.suggestions.filter( function ( suggestion ) {
				return suggestion.confirmed;
			} );
		}
	},

	methods: {
		toggleConfirmed: function ( suggestion ) {
			suggestion.confirmed = !suggestion.confirmed;
		},
		onPublish: function () {
			console.log( 'On publish' );
		},
		onSkip: function () {
			console.log( 'On skip' );
		}
	}
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../style-variables.less';

.wbmad-suggestion-group {
	.flex-display();
	.flex-wrap( wrap );
}
</style>
