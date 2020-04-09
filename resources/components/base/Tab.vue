<template>
	<div
		v-show="isActive"
		v-bind:id="id"
		v-bind:aria-hidden="!isActive"
		v-bind:aria-labeledby="id + '-label'"
		class="mw-tab"
		role="tabpanel"
	>
		<slot />
	</div>
</template>

<script>
// @vue/component
module.exports = {
	name: 'Tab',
	props: {
		title: {
			type: String,
			required: true
		},

		disabled: {
			type: Boolean,
			required: false
		},

		id: {
			type: String,
			required: true
		}
	},

	data: function () {
		return {
			isActive: true
		};
	}
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../../style-variables.less';

// stylelint-disable selector-class-pattern
.fade-enter-active,
.fade-leave-active {
	transition: opacity 300ms;
}

.fade-enter,
.fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
	opacity: 0;
}

.mw-tab {
	// position: absolute;
}

</style>
