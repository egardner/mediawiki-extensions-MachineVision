<template>
	<h1>Hello from Vue</h1>
</template>

<script>
var mapMutations = require( 'ext.MachineVision.vuex' ).mapMutations,
	initialData = mw.config.get( 'wgMVSuggestedTagsInitialData' );

module.exports = {
	name: 'MachineVision',
	methods: mapMutations( [
		'addImage'
	] ),
	mounted: function () {
		initialData.forEach( function ( image ) {
			this.addImage( image );
		}.bind( this ) );
	}
};
</script>

<style lang="less">
</style>
