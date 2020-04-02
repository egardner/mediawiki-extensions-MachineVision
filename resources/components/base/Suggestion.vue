<template>
	<div
		class="mw-suggestion"
		tabindex="0"
		v-bind:class="classObject"
		v-on:click="$emit( 'click' )"
		v-on:keydown.enter="onClick"
	>
		<label class="mw-suggestion__label">
			<slot />
		</label>
		<icon
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
			iconText: this.$i18n( 'machinevision-suggestion-confirm-undo-title', this.text ).parse()
		};
	},

	computed: {
		classObject() {
			return {
				'mw-suggestion--confirmed': this.confirmed
			};
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
		.transition-transform( 0.2s );
		cursor: pointer;
		display: inline-block;
	}

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
		border-color: @accent10;
		color: @base0;
		position: relative;

		.mw-suggestion__label {
			transform: translateX( -0.5em );
		}

		.mw-icon {
			opacity: 1;
			visibility: visible;
			width: 1em;
		}
	}
}

.mw-hide-outline .mw-suggestion {
	outline: 0;
}
</style>
