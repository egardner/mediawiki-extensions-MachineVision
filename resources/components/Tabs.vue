<template>
	<div class="tabs">
		<ul class="tabs__header">
			<li v-for="(tab, index) in tabs"
				v-bind:key="tab.title"
				v-bind:class="{ 'is-active': index === selectedIndex }"
				v-on:click="selectTab( index )">
				{{ tab.title }}
			</li>
		</ul>

		<div class="tabs__content">
			<slot />
		</div>
	</div>
</template>

<script>
module.exports = {
	name: 'Tabs',

	data: function () {
		return {
			selectedIndex: 0,
			tabs: this.$children
		};
	},

	methods: {
		selectTab: function ( index ) {
			this.selectedIndex = index;
		},

		setTabState: function ( active ) {
			this.tabs.forEach( function ( tab, index ) {
				tab.isActive = ( index === active );
			} );
		}
	},

	mounted: function () {
		this.setTabState( this.selectedIndex );
	},

	watch: {
		selectedIndex: function ( newIndex ) {
			this.setTabState( newIndex );
		}
	}
};
</script>
