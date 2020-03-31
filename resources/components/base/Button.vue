<template>
	<button
		class="wbmad-button"
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

module.exports = {
	name: 'Button',

	components: {
		icon: Icon
	},

	props: {
		disabled: {
			type: Boolean,
			default: false
		},
		framed: {
			type: Boolean,
			default: true
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
			type: Boolean,
			default: false
		},
		destructive: {
			type: Boolean,
			default: false
		},
		primary: {
			type: Boolean,
			default: false
		}
	},

	computed: {
		builtInClasses: function () {
			return {
				'wbmad-button--framed': this.framed,
				'wbmad-button--icon': this.icon,
				'wbmad-button--progressive': this.progressive,
				'wbmad-button--destructive': this.destructive,
				'wbmad-button--primary': this.primary
			};
		},
		invert: function () {
			return ( this.primary || this.disabled && this.framed );
		}
	}
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../../style-variables.less';

.wbmad-button {
	background-color: transparent;
	border: 0;
	color: @base10;
	cursor: pointer;
	font-size: inherit;
	font-weight: bold;
	padding: 6px;
	transition: background-color 100ms, color 100ms, border-color 100ms, box-shadow 100ms;
	user-select: none;

	&:hover,
	&:focus {
		background-color: rgba( 0, 24, 73, 0.02745098 );
		color: @base0;
	}

	.wbmad-icon {
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
		background-color: @base90;
		border: 1px solid @base50;
		border-radius: 2px;
		padding: 6px 12px;

		&:hover,
		&:focus {
			background-color: @base100;
			color: @base10-hover;
		}

		&.wbmad-button--icon {
			padding-left: 38/14em;
			position: relative;
		}

		/* stylelint-disable-next-line no-descending-specificity */
		.wbmad-icon {
			left: 11/14em;
		}
	}

	&--progressive {
		color: @progressive;

		&:hover,
		&:focus {
			color: @progressive-hover;
		}

		&.wbmad-button--framed {
			&:hover,
			&:focus {
				border-color: @progressive;
				color: @progressive;
			}
		}
	}

	&--destructive {
		color: @destructive;

		&:hover,
		&:focus {
			color: @destructive-hover;
		}

		&.wbmad-button--framed {
			&:hover,
			&:focus {
				border-color: @destructive;
				color: @destructive;
			}
		}
	}

	&--primary {
		&.wbmad-button--framed {
			// Default to progressive.
			background-color: @progressive;
			border-color: @progressive;
			color: @base100;

			&:hover,
			&:focus {
				background-color: @progressive-hover;
				border-color: @progressive-hover;
				box-shadow: inset 0 0 0 1px @progressive-hover;
				color: @base100;
			}

			&.wbmad-button--destructive {
				background-color: @destructive;
				border-color: @destructive;

				&:hover,
				&:focus {
					background-color: @destructive-hover;
					border-color: @destructive-hover;
					box-shadow: inset 0 0 0 1px @destructive-hover;
				}
			}
		}
	}

	&:disabled {
		color: @base30;
		cursor: auto;

		&:hover,
		&:focus {
			background-color: @base100;
		}

		&.wbmad-button--framed {
			background-color: @base70;
			border-color: @base70;
			color: @base100;

			&:hover,
			&:focus {
				background-color: @base70;
				border-color: @base70;
				box-shadow: inset 0 0 0 1px @base70;
			}
		}

		&:not( .wbmad-button--framed ) .wbmad-icon {
			opacity: 0.51;
		}
	}
}
</style>
