<template>
	<a
		class="mw-button"
		role="button"
		v-bind:class="builtInClasses"
		v-bind:aria-disabled="disabled ? 'true' : 'false'"
		v-bind:tabindex="tabIndex"
		v-bind:rel="noFollow ? 'nofollow' : false"
		v-on:click="onClick"
	>
		<icon
			v-if="icon"
			v-bind:icon="icon"
			v-bind:invert="invert"
		/>
		<slot />
	</a>
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
		},

		// We're not supposed to use boolean props that default to true, but
		// the code is much simpler if we set it this way. Otherwise, we'd
		// need to declare a new variable in data and set it to this.noFollow
		// if it exists and true otherwise. Change my mind.
		noFollow: {
			type: Boolean,
			default: true
		}
	},

	computed: {
		builtInClasses: function () {
			return {
				'mw-button--disabled': this.disabled,
				'mw-button--framed': !this.frameless,
				'mw-button--icon': this.icon,
				'mw-button--progressive': this.progressive,
				'mw-button--destructive': this.destructive,
				'mw-button--primary': this.primary
			};
		},

		invert: function () {
			return ( this.primary || this.disabled ) && !this.frameless;
		},

		tabIndex: function () {
			return this.disabled ? -1 : 0;
		}
	},

	methods: {
		onClick: function () {
			if ( this.disabled ) {
				return;
			}

			this.$emit( 'click' );
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
	border: @border-width-base @border-style-base transparent;
	border-radius: 2px;
	color: @color-base;
	cursor: pointer;
	font-size: inherit;
	font-weight: bold;
	padding: 6px;
	text-decoration: none;
	user-select: none;

	&:hover {
		background-color: rgba( 0, 24, 73, 0.02745098 );
		color: @color-base--emphasized;
		text-decoration: none;
	}

	&:focus {
		border-color: @color-primary;
		box-shadow: @box-shadow-base--focus;
		outline: 0;
		text-decoration: none;
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
		border-color: @border-color-base;
		padding: 6px 12px;

		&:hover {
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

		&:hover {
			color: @color-primary--hover;
		}

		&.mw-button--framed {
			&:hover {
				border-color: @color-primary--hover;
			}
		}
	}

	&--destructive {
		color: @color-destructive;

		&:hover {
			color: @color-destructive--hover;
		}

		&:focus {
			border-color: @color-destructive;
			box-shadow: inset 0 0 0 1px @color-destructive;
		}

		&.mw-button--framed {
			&:hover {
				border-color: @color-destructive--hover;
			}

			&:focus {
				box-shadow: inset 0 0 0 1px @color-destructive,
					inset 0 0 0 2px @color-base--inverted;
			}
		}
	}

	&--primary {
		&.mw-button--framed {
			// Default to progressive.
			background-color: @color-primary;
			border-color: @color-primary;
			color: @color-base--inverted;

			&:hover {
				background-color: @color-primary--hover;
				border-color: @color-primary--hover;
			}

			&:focus {
				box-shadow: @box-shadow-primary--focus;
			}

			&.mw-button--destructive {
				background-color: @color-destructive;
				border-color: @color-destructive;

				&:hover {
					background-color: @color-destructive--hover;
					border-color: @color-destructive--hover;
				}

				&:focus {
					box-shadow: inset 0 0 0 1px @color-destructive,
						inset 0 0 0 2px @color-base--inverted;
				}
			}
		}
	}

	&--disabled {
		color: @color-base--disabled;

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
				box-shadow: none;
			}
		}

		&:not( .mw-button--framed ) .mw-icon {
			opacity: 0.51;
		}
	}
}

// Necessary specificity match.
a.mw-button--disabled {
	cursor: default;
}
</style>
