<template>
	<div class="wbmad-suggested-tags-cardstack">
		<h3>
			Showing image from {{ queue }} feed
		</h3>

		<div v-if="pending">
			<p>
				Loading...
			</p>
		</div>

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
var mapState = require( 'vuex' ).mapState;

module.exports = {
	name: 'CardStack',
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
