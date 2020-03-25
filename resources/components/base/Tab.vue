<template>
	<div v-show="isActive" class="tab">
		<slot />
	</div>
</template>

<script>
module.exports = {
	name: 'Tab',
	props: {
		title: {
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
