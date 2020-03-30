<template>
	<div class="wbmad-suggested-tags-cardstack">
		<h3>
			Showing image from {{ queue }} feed
		</h3>

		<wbmad-spinner v-if="pending" />

		<div v-else>
			<div v-if="currentImage">
				<wbmad-image-card v-bind:image="currentImage" />
			</div>

			<div v-else>
				No images
			</div>
		</div>
	</div>
</template>

<script>
var mapState = require( 'vuex' ).mapState,
	Spinner = require( './Spinner.vue' ),
	ImageCard = require( './ImageCard.vue' );

module.exports = {
	name: 'CardStack',

	components: {
		'wbmad-spinner': Spinner,
		'wbmad-image-card': ImageCard
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
	] ), {
		currentImage: function () {
			return this.images[ 0 ];
		}
	} )
};
</script>
