<template>
	<span
		class="wbmad-icon"
		v-bind:class="builtInClasses"
	>
		{{ label }}
	</span>
</template>

<script>
module.exports = {
	name: 'Icon',
	props: {
		icon: {
			type: String,
			default: null
		},
		invert: {
			type: Boolean,
			default: false
		},
		label: {
			type: [ String, Object ],
			default: null
		}
	},

	computed: {
		builtInClasses() {
			// Use the existing OOUI classes for icon images for now.
			var iconClass = 'oo-ui-icon-' + this.icon,
				classes = { 'oo-ui-image-invert': this.invert };
			classes[ iconClass ] = true;
			return classes;
		}
	}
};
</script>

<style lang="less">
.wbmad-icon {
	background-size: contain;
	background-position: center center;
	background-repeat: no-repeat;
	display: inline-block;
	height: 1.42857143em;
	line-height: 2.5;
	margin: 0;
	overflow: hidden;
	padding: 0;
	position: static;
	text-indent: -9999px;
	vertical-align: middle;
	width: 1.42857143em;
	user-select: none;
}
</style>
