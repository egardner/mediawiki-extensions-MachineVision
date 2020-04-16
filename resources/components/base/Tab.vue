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
