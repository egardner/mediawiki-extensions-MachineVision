<template>
	<div
		class="mw-suggestion"
		tabindex="0"
		v-bind:class="classObject"
		v-on:click="onClick"
		v-on:keydown.enter="onClick"
	>
		<label class="mw-suggestion__label">
			<slot />
		</label>
		<icon
			v-if="confirmed"
			icon="check"
			v-bind:title="iconText"
			v-bind:label="iconText"
		/>
	</div>
</template>

<script>
var Icon = require( './Icon.vue' );

module.exports = {
	name: 'Suggestion',

	components: {
		icon: Icon
	},

	props: {
		text: {
			type: String,
			required: true
		},
		confirmed: {
			type: Boolean,
			default: false
		}
	},

	data: function () {
		return {
			iconText: this.$i18n( 'machinevision-suggestion-confirm-undo-title', this.text ).parse(),
			toggled: false
		};
	},

	computed: {
		classObject() {
			return {
				'mw-suggestion--confirmed': this.confirmed,
				'mw-suggestion--toggled': this.toggled
			};
		}
	},

	methods: {
		onClick: function () {
			// Adding the toggled class only after a suggestion has been toggled
			// once, that is, the first time it is selected, will allow us to
			// animate the process of un-selecting a suggestion (sliding it back
			// to center) without firing off that animation when the component
			// first mounts.
			this.toggled = true;
			this.$emit( 'click' );
		}
	}
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../../style-variables.less';

.mw-suggestion {
	.transition( color @transition-duration-base );
	background-color: @base90;
	border: @suggestion-border-width solid @base50;
	color: @base10;
	cursor: pointer;
	margin: 0 4px 4px 0;
	padding: 4px 1.25em;
	border-radius: 18px;
	white-space: nowrap;

	&:hover,
	&:focus {
		color: @base0;
	}

	.mw-suggestion__label {
		cursor: pointer;
		display: inline-block;
	}

	// Animate the process of moving a label back to center when unconfirmed.
	&--toggled {
		.mw-suggestion__label {
			@keyframes slideRight {
				0% {
					.transform( translateX( -0.5em ) );
				}

				100% {
					.transform( translateX( 0 ) );
				}
			}
			animation: slideRight 0.2s;
		}
	}

	&--confirmed {
		background-color: @accent90;
		border-color: @accent10;
		color: @base0;
		position: relative;

		.mw-suggestion__label {
			@keyframes slideLeft {
				0% {
					.transform( translateX( 0 ) );
				}

				100% {
					.transform( translateX( -0.5em ) );
				}
			}
			.transform( translateX( -0.5em ) );
			animation: slideLeft 0.2s;
		}

		.mw-icon {
			.fade-in( 0.2s );
			min-height: 0;
			min-width: 0;
			position: absolute;
			right: 0.5em;
			width: 1em;
		}
	}
}

.mw-hide-outline .mw-suggestion {
	outline: 0;
}
</style>
