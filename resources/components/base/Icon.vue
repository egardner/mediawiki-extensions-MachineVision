<template>
	<span
		class="wbmad-icon"
		v-bind:class="classArray"
	/>
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
		}
	},

	computed: {
		classArray() {
			// If we could use a computed property name for the icon class we
			// could return an object here and ditch the ternary operator for
			// the inverted class.
			return [
				// Use the existing OOUI classes for icon images for now.
				'oo-ui-icon-' + this.icon,
				this.invert ? 'oo-ui-image-invert' : ''
			];
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
	vertical-align: middle;
	width: 1.42857143em;
	user-select: none;
}
</style>
