<template>
	<transition name="mw-tab-fade-in">
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
	</transition>
</template>

<script>
// @vue/component
module.exports = {
	name: 'Tab',
	props: {
		name: {
			type: String,
			required: true
		},

		title: {
			type: String,
			required: true
		},

		disabled: {
			type: Boolean,
			required: false
		}
	},

	data: function () {
		return {
			isActive: false
		};
	},

	computed: {
		id: function () {
			return 'mw-tab-' + this.name;
		}
	}
};
</script>

<style lang="less">
.mw-tab-fade-in-enter {
	opacity: 0;
}

.mw-tab-fade-in-enter-active {
	transition: opacity 0.25s;
}
</style>
