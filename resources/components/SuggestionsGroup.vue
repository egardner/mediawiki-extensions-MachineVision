<template>
	<div
		class="wbmad-suggestions-group"
		v-bind:class="builtInClasses"
	>
		<suggestion v-for="( suggestion, index ) in currentImageSuggestions"
			v-bind:key="index"
			v-bind:text="suggestion.text"
			v-bind:confirmed="suggestion.confirmed"
			v-on:click="toggleTagConfirmation( suggestion )"
		>
			<template v-if="tagDetailsExpanded">
				<label class="wbmad-suggestion__label">
					<span class="wbmad-suggestion__label__text">
						{{ suggestion.text }}
					</span>
					<template v-if="suggestion.alias">
						<span class="wbmad-suggestion__label__separator">–</span>
						<span class="wbmad-suggestion__label__alias">
							{{ suggestion.alias }}
						</span>
					</template>
				</label>
				<p v-if="suggestion.description" class="wbmad-suggestion__description">
					{{ suggestion.description }}
				</p>
			</template>

			<template v-else>
				<label class="wbmad-suggestion__label">{{ suggestion.text }}</label>
			</template>
		</suggestion>
	</div>
	<!-- TODO: Add custom tag button. -->
</template>

<script>
var mapActions = require( 'vuex' ).mapActions,
	mapGetters = require( 'vuex' ).mapGetters,
	mapState = require( 'vuex' ).mapState,
	Suggestion = require( './base/Suggestion.vue' );

// @vue/component
module.exports = {
	name: 'ImageCard',

	components: {
		suggestion: Suggestion
	},

	computed: $.extend( {}, mapState( [
		'tagDetailsExpanded'
	] ), mapGetters( [
		'currentImageSuggestions'
	] ), {
		/**
		 * Conditional classes.
		 * @return {Object}
		 */
		builtInClasses: function () {
			return {
				'wbmad-suggestions-group--expanded': this.tagDetailsExpanded
			};
		}
	} ),

	methods: $.extend( {}, mapActions( [
		'toggleTagConfirmation'
	] ) )
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../style-variables.less';

.wbmad-suggestions-group {
	.flex-display();
	.flex-wrap( wrap );
	margin: 18px 0;

	p {
		margin: 0;
	}

	// Suggestion styles when "detailed tags" toggle is on.
	&.wbmad-suggestions-group--expanded {
		justify-content: space-between;

		.mw-suggestion {
			.flex( 0, 0, 100% );
			// We want long descriptions to wrap, even if it makes the
			// suggestion taller.
			white-space: normal;

			@media screen and ( min-width: @width-breakpoint-tablet ) {
				// On larger screens we want 2 columns of suggestions.
				// This flex basis will give us about the margin between suggestions
				// that we had before.
				.flex( 0, 0, 49.75% );
				margin-right: 0;
			}
		}

		.wbmad-suggestion__label__text {
			font-weight: bold;
		}
	}
}

.wbmad-suggestion__label__separator {
	margin: 0 0.4em;
}
</style>
