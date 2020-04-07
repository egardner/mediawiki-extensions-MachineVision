<template>
	<div class="wbmad-suggested-tags-cardstack">
		<h3>
			Showing image from {{ queue }} feed
		</h3>

		<wbmad-spinner v-if="isPending" />

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
	mapActions = require( 'vuex' ).mapActions,
	Spinner = require( './Spinner.vue' ),
	ImageCard = require( './ImageCard.vue' );

// @vue/component
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
		/**
		 * @return {Array}
		 */
		imagesInQueue: function () {
			return this.images[ this.queue ];
		},

		/**
		 * @return {Object|undefined}
		 */
		currentImage: function () {
			return this.imagesInQueue[ 0 ];
		},

		/**
		 * Pending state is queue-specific
		 * @return {bool}
		 */
		isPending: function () {
			return this.pending[ this.queue ];
		}
	} ),

	methods: $.extend( {}, mapActions( [
		'getImages'
	] ) ),

	watch: {
		/**
		 * If a queue reaches zero images, attempt to fetch more
		 *
		 * @param {Array} oldVal
		 * @param {Array} newVal
		 */
		imagesInQueue: function ( oldVal, newVal ) {
			if ( newVal.length === 0 ) {
				this.getImages( {
					queue: this.currentTab
				} );
			}
		}
	}
};
</script>