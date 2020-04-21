<template>
	<div class="wbmad-suggested-tags-cardstack">
		<wbmad-cardstack-placeholder v-if="isPending" />

		<template v-else-if="shouldDisplayImage">
			<wbmad-fade-in mode="out-in">
				<wbmad-image-card v-bind:key="currentImageId" />
			</wbmad-fade-in>
		</template>

		<wbmad-user-message v-else-if="showUserCta"
			class="wbmad-user-cta"
			v-bind:heading="$i18n( 'machinevision-cta-heading' )"
			v-bind:text="$i18n( 'machinevision-cta-text' )"
			v-bind:cta="$i18n( 'machinevision-cta-cta' )"
			v-on:cta-click="goToPopularTab"
		/>

		<wbmad-user-message v-else-if="showUserCtaNoLabeledUploads"
			class="wbmad-user-cta--no-uploads"
			v-bind:heading="$i18n( 'machinevision-no-uploads-cta-heading' )"
			v-bind:text="$i18n( 'machinevision-no-uploads-cta-text' )"
			v-bind:cta="$i18n( 'machinevision-cta-cta' )"
			v-on:cta-click="goToPopularTab"
		/>

		<wbmad-user-message v-else
			class="wbmad-user-cta--generic-no-images"
			v-bind:heading="$i18n( 'machinevision-generic-no-images-heading' )"
			v-bind:text="$i18n( 'machinevision-generic-no-images-text' )"
		/>
	</div>
</template>

<script>
var mapState = require( 'vuex' ).mapState,
	mapGetters = require( 'vuex' ).mapGetters,
	mapActions = require( 'vuex' ).mapActions,
	CardStackPlaceholder = require( './CardStackPlaceholder.vue' ),
	ImageCard = require( './ImageCard.vue' ),
	UserImage = require( './UserMessage.vue' ),
	FadeIn = require( './transitions/FadeIn.vue' );

// @vue/component
module.exports = {
	name: 'CardStack',

	components: {
		'wbmad-cardstack-placeholder': CardStackPlaceholder,
		'wbmad-image-card': ImageCard,
		'wbmad-user-message': UserImage,
		'wbmad-fade-in': FadeIn
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
		'images',
		'userStats'
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
			return this.currentTab === this.queue && this.currentImage && this.imagesInQueue;
		},

		/**
		 * @return {boolean}
		 */
		isUserTab: function () {
			return this.queue === 'user';
		},

		/**
		 * Whether or not the user has labeled uploads, which will determine the
		 * message shown to them when they finish tagging personal uploads.
		 * @return {boolean}
		 */
		userHasLabeledUploads: function () {
			return this.userStats.total > 0;
		},

		/**
		 * Whether or not to show a message and CTA based on the user tagging
		 * all of their images.
		 * @return {boolean}
		 */
		showUserCta: function () {
			return this.isUserTab && this.userHasLabeledUploads;
		},

		/**
		 * Whether or not to show a message and CTA based on the user having no
		 * personal uploads, encouraging them to upload some images.
		 * @return {boolean}
		 */
		showUserCtaNoLabeledUploads: function () {
			return this.isUserTab && !this.userHasLabeledUploads;
		},

		/**
		 * We need a unique ID for each image card so the component isn't
		 * reused. Otherwise, transitions won't work.
		 * @return {number}
		 */
		currentImageId: function () {
			return this.currentImage.pageid;
		}
	} ),

	methods: $.extend( {}, mapActions( [
		'getImages',
		'updateCurrentTab'
	] ), {
		goToPopularTab: function () {
			window.history.replaceState( null, null, '#popular' );
			this.updateCurrentTab( 'popular' );
		}
	} ),

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

<style lang="less">
.wbmad-user-cta {
	.wbmad-user-message-icon {
		background-image: url( ../icons/empty-state-icon.svg );
	}
}

.wbmad-user-cta--no-uploads,
.wbmad-user-cta--generic-no-images {
	.wbmad-user-message-icon {
		background-image: url( ../icons/empty-state-icon-no-uploads.svg );
	}
}
</style>
