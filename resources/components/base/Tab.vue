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
