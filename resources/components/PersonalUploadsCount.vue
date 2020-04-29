<template>
	<div class="wbmad-personal-uploads-count">
		<p>{{ $i18n( 'machinevision-personal-uploads-count', unreviewedCount ) }}</p>
	</div>
</template>

<script>
var mapState = require( 'vuex' ).mapState;

module.exports = {
	name: 'PersonalUploadsCount',

	computed: $.extend( {}, mapState( [
		'unreviewedCount'
	] ) )
};
</script>

<style lang="less">
.wbmad-personal-uploads-count {
	font-weight: bold;
	margin-bottom: 1em;
}
</style>
