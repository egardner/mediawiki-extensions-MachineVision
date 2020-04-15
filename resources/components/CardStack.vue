<template>
	<div class="wbmad-suggested-tags-cardstack">
		<wbmad-cardstack-placeholder v-if="isPending" />

		<template v-else-if="shouldDisplayImage">
			<wbmad-image-card />
		</template>

		<!-- TODO: Handle no images (cases: error; finished tagging user images). -->
		<template v-else>
			No images
		</template>
	</div>
</template>

<script>
var mapState = require( 'vuex' ).mapState,
	mapGetters = require( 'vuex' ).mapGetters,
	mapActions = require( 'vuex' ).mapActions,
	CardStackPlaceholder = require( './CardStackPlaceholder.vue' ),
	ImageCard = require( './ImageCard.vue' );

// @vue/component
module.exports = {
	name: 'CardStack',

	components: {
		'wbmad-cardstack-placeholder': CardStackPlaceholder,
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
	] ), mapGetters( [
		'currentImage'
	] ), {
		/**
		 * @return {Array}
		 */
		imagesInQueue: function () {
			return this.images[ this.queue ];
		},

		/**
		 * Pending state is queue-specific
		 * @return {bool}
		 */
		isPending: function () {
			return this.pending[ this.queue ];
		},

		/**
		 * Whether to render the ImageCard.
		 * We need a dedicated computed property for this because
		 * ResourceLoader can't handle "&&" in the template.
		 *
		 * @return {boolean}
		 */
		shouldDisplayImage: function () {
			return this.currentImage && this.imagesInQueue;
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
