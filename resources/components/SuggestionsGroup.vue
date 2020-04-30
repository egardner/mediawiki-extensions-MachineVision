<template>
	<transition-group
		name="wbmad-suggestion-expand"
		tag="div"
		class="wbmad-suggestions-group"
		v-bind:class="builtInClasses"
	>
		<suggestion v-for="suggestion in currentImageSuggestions"
			v-bind:key="suggestion.wikidataId"
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

		<!-- TODO: Add custom tag button. -->
	</transition-group>
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
	] ) ),

	watch: {
		// TODO: Try to find a way to get the transition to look right without
		// mutating the list of images. If we can't, at least mutate it in
		// the mutation instead of here.
		tagDetailsExpanded: function () {
			var odds = [],
				evens = [];

			// Without this, the transition doesn't move how I'd expect it to.
			// This reorders the items so that they move in a more intuitive
			// way durin the transition.
			this.currentImageSuggestions.forEach( function ( item ) {
				if ( item % 2 === 0 ) {
					evens.push( item );
				} else {
					odds.push( item );
				}
			} );

			this.currentImageSuggestions = odds.concat( evens );
		}
	}
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

// TODO: need height/width transitions if possible.
// TODO: Need to make sure transition works no matter where you've scrolled to.
.wbmad-suggestion-expand-move {
	transition: transform 1s;
}
</style>
