<template>
	<div class="wbmad-suggested-tags-cardstack">
		<h3>
			Showing image from {{ queue }} feed
		</h3>

		<wbmad-spinner v-if="pending" />

		<div v-else>
			<ul>
				<li v-for="(image, index) in images" v-bind:key="index">
					{{ image }}
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
var mapState = require( 'vuex' ).mapState,
	Spinner = require( './Spinner.vue' );

module.exports = {
	name: 'CardStack',

	components: {
		'wbmad-spinner': Spinner
	},

	props: {
		queue: {
			type: String,
			required: true
		}
	},

	computed: $.extend( {}, mapState( [
		'currentTab',
		'pending',
		'images'
	] ) )
};
</script>
