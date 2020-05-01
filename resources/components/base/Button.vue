<template>
	<button
		class="mw-button"
		v-bind:class="builtInClasses"
		v-bind:disabled="disabled"
		v-on:click="$emit( 'click' )"
	>
		<icon
			v-if="icon"
			v-bind:icon="icon"
			v-bind:invert="invert"
		/>
		<slot />
	</button>
</template>

<script>
var Icon = require( './Icon.vue' );

// @vue/component
module.exports = {
	name: 'Button',

	components: {
		icon: Icon
	},

	props: {
		disabled: {
			type: Boolean
		},
		frameless: {
			type: Boolean
		},
		icon: {
			type: String,
			default: null
		},
		// In OOUI, flags are passed in as an array (or a string or an object)
		// and are handled by a separate mixin. Passing them in individually is
		// a bit more readable and intuitive, plus it makes the code in this
		// component simpler.
		progressive: {
			type: Boolean
		},
		destructive: {
			type: Boolean
		},
		primary: {
			type: Boolean
		}
	},

	computed: {
		builtInClasses: function () {
			return {
				'mw-button--framed': !this.frameless,
				'mw-button--icon': this.icon,
				'mw-button--progressive': this.progressive,
				'mw-button--destructive': this.destructive,
				'mw-button--primary': this.primary
			};
		},
		invert: function () {
			return ( this.primary || this.disabled ) && !this.frameless;
		}
	}
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../../../lib/wikimedia-ui-base.less';

.mw-button {
	.transition( ~'background-color 100ms, color 100ms, border-color 100ms, box-shadow 100ms' );
	background-color: transparent;
	border: 0;
	color: @color-base;
	cursor: pointer;
	font-size: inherit;
	font-weight: bold;
	padding: 6px;
	user-select: none;

	&:hover,
	&:focus {
		background-color: rgba( 0, 24, 73, 0.02745098 );
		color: @color-base--emphasized;
	}

	.mw-icon {
		height: 100%;
		left: 5/14em;
		position: absolute;
		top: 0;
		transition: opacity 100ms;

		/* stylelint-disable-next-line selector-class-pattern */
		&:not( .oo-ui-icon-invert ) {
			opacity: 0.87;
		}
	}

	// Variants.
	&--icon {
		padding-left: 30/14em;
		position: relative;
	}

	&--framed {
		background-color: @background-color-framed;
		border: @border-base;
		border-radius: 2px;
		padding: 6px 12px;

		&:hover,
		&:focus {
			background-color: @background-color-framed--hover;
			color: @color-base--hover;
		}

		&.mw-button--icon {
			padding-left: 38/14em;
			position: relative;
		}

		/* stylelint-disable-next-line no-descending-specificity */
		.mw-icon {
			left: 11/14em;
		}
	}

	&--progressive {
		color: @color-primary;

		&:hover,
		&:focus {
			color: @color-primary--hover;
		}

		&.mw-button--framed {
			&:hover,
			&:focus {
				border-color: @color-primary;
				color: @color-primary;
			}
		}
	}

	&--destructive {
		color: @color-destructive;

		&:hover,
		&:focus {
			color: @color-destructive--hover;
		}

		&.mw-button--framed {
			&:hover,
			&:focus {
				border-color: @color-destructive;
				color: @color-destructive;
			}
		}
	}

	&--primary {
		&.mw-button--framed {
			// Default to progressive.
			background-color: @color-primary;
			border-color: @color-primary;
			color: @color-base--inverted;

			&:hover,
			&:focus {
				background-color: @color-primary--hover;
				border-color: @color-primary--hover;
				box-shadow: inset 0 0 0 1px @color-primary--hover;
				color: @color-base--inverted;
			}

			&.mw-button--destructive {
				background-color: @color-destructive;
				border-color: @color-destructive;

				&:hover,
				&:focus {
					background-color: @color-destructive--hover;
					border-color: @color-destructive--hover;
					box-shadow: inset 0 0 0 1px @color-destructive--hover;
				}
			}
		}
	}

	&:disabled {
		color: @color-base--disabled;
		cursor: auto;

		&:hover,
		&:focus {
			background-color: @background-color-base;
		}

		&.mw-button--framed {
			background-color: @background-color-filled--disabled;
			border-color: @border-color-base--disabled;
			color: @color-base--inverted;

			&:hover,
			&:focus {
				background-color: @background-color-filled--disabled;
				border-color: @border-color-base--disabled;
				box-shadow: inset 0 0 0 1px @background-color-filled--disabled;
			}
		}

		&:not( .mw-button--framed ) .mw-icon {
			opacity: 0.51;
		}
	}
}
</style>
