<template>
	<div v-if="unreviewedCount > 0"
		class="wbmad-personal-uploads-count">
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
@import '../style-variables.less';

.wbmad-personal-uploads-count {
	.fade-in( 0.5s );
	font-weight: bold;
	margin-bottom: 16px;

	p {
		margin: 0;
	}
}
</style>
