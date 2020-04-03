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
			return ICON_MAP[ this.type ]
		},
		iconClass: function () {
			return 'oo-ui-image-' + this.type
		}
	}
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../../style-variables.less';

.mw-message {
	font-weight: bold;
	max-width: 50em;
	position: relative;

	&--error {
		color: @errorColor;
	}

	&--success {
		color: @successColor;
	}

	&--block {
		border: 1px solid;
		color: @base10;
		font-weight: normal;
		padding: 16px 24px;

		&.mw-message--notice {
			background-color: @base80;
			border-color: @base50;
		}

		&.mw-message--error {
			background-color: @errorBackground;
			border-color: @errorBorder;
		}

		&.mw-message--warning {
			background-color: @warningBackground;
			border-color: @warningBorder;
		}

		&.mw-message--success {
			background-color: @successBackground;
			border-color: @successBorder;
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
