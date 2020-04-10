<template>
	<div class="wbmad-suggested-tags-cardstack">
		<wbmad-cardstack-placeholder v-if="isPending" />

		<template v-else>
			<template v-if="currentImage">
				<wbmad-image-card v-bind:image="currentImage" />
			</template>

			<!-- TODO: Handle no images (cases: error; finished tagging user images). -->
			<template v-else>
				No images
			</template>
		</template>
	</div>
</template>

<script>
var mapState = require( 'vuex' ).mapState,
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
