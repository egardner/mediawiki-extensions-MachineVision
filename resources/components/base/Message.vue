<template>
	<div
		class="mw-message"
		v-bind:class="builtInClasses"
		v-bind:aria-live="type !== 'error' ? 'polite' : false"
		v-bind:role="type === 'error' ? 'alert' : false "
	>
		<icon
			v-bind:icon="icon"
			v-bind:class="iconClass"
		/>
		<div class="mw-message__content">
			<slot />
		</div>
	</div>
</template>

<script>
var Icon = require( './Icon.vue' ),
	ICON_MAP = {
		notice: 'infoFilled',
		error: 'error',
		warning: 'alert',
		success: 'check'
	};

// @vue/component
module.exports = {
	name: 'Message',

	components: {
		icon: Icon
	},

	props: {
		type: {
			type: String,
			default: 'notice'
		},
		inline: {
			type: Boolean
		}
	},

	computed: {
		typeClass: function () {
			return 'mw-message--' + this.type;
		},
		builtInClasses: function () {
			var classes = { 'mw-message--block': !this.inline };
			classes[ this.typeClass ] = true;
			return classes;
		},
		icon: function () {
			return ICON_MAP[ this.type ];
		},
		iconClass: function () {
			return 'oo-ui-image-' + this.type;
		}
	}
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../../../lib/wikimedia-ui-base.less';

.mw-message {
	color: @color-notice;
	font-weight: bold;
	max-width: 50em;
	position: relative;

	&--error {
		color: @color-error;
	}

	&--success {
		color: @color-success;
	}

	&--block {
		color: @color-notice;
		font-weight: normal;
		padding: 16px 24px;

		&.mw-message--notice {
			background-color: @background-color-notice--framed;
			border: @border-notice;
		}

		&.mw-message--error {
			background-color: @background-color-error--framed;
			border: @border-error;
		}

		&.mw-message--warning {
			background-color: @background-color-warning--framed;
			border: @border-warning;
		}

		&.mw-message--success {
			background-color: @background-color-success--framed;
			border: @border-success;
		}
	}

	.mw-icon {
		position: absolute;
	}
}

.mw-message__content {
	margin-left: 2em;
}
</style>
