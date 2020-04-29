<template>
	<div
		class="mw-suggestion"
		tabindex="0"
		v-bind:class="builtInClasses"
		v-on:click="$emit( 'click' )"
		v-on:keyup.enter="$emit( 'click' )"
		v-on:keyup.space="$emit( 'click' )"
	>
		<div class="mw-suggestion__content">
			<slot v-if="hasSlot" />
			<label v-else class="mw-suggestion__label">
				{{ text }}
			</label>
		</div>
		<icon
			class="mw-suggestion__icon"
			icon="check"
			v-bind:title="iconText"
			v-bind:label="iconText"
		/>
	</div>
</template>

<script>
var Icon = require( './Icon.vue' );

/**
 * Toggleable suggestion element.
 *
 * Text is required since it's used for the icon title and label. If a slot is
 * present it will be displayed; otherwise the text will be displayed as a
 * label.
 */
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
			iconText: this.$i18n( 'machinevision-suggestion-confirm-undo-title', this.text ).parse()
		};
	},

	computed: {
		/**
		 * Conditional classes.
		 * @return {Object}
		 */
		builtInClasses: function () {
			return {
				'mw-suggestion--confirmed': this.confirmed
			};
		},

		/**
		 * @return {boolean}
		 */
		hasSlot: function () {
			return !!this.$slots.default;
		}
	}
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../../style-variables.less';

.mw-suggestion {
	.box-sizing( border-box );
	.flex-display();
	.transition( color @transition-duration-base );
	align-items: center;
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

	&:focus {
		border-color: @accent30;
		box-shadow: inset 0 0 0 1px @accent30;
		outline: 0;
	}

	label {
		cursor: pointer;
	}

	.mw-suggestion__content {
		.transition-transform( 0.2s );
		cursor: pointer;
		display: inline-block;
	}

	// Base icon overrides.
	.mw-icon {
		.transition( opacity 0.2s );
		min-height: 0;
		min-width: 0;
		opacity: 0;
		position: absolute;
		right: 0.5em;
		visibility: hidden; // Hide from screen readers.
		width: 0; // Don't take up space yet.
	}

	&--confirmed {
		background-color: @accent90;
		border-color: @accent30;
		color: @base0;
		position: relative;

		.mw-suggestion__content {
			transform: translateX( -0.5em );
		}

		.mw-icon {
			opacity: 1;
			visibility: visible;
			width: 1em;
		}
	}
}
</style>
