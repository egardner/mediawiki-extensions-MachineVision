<template>
	<div class="wbmad-suggested-tags-page">
		<!-- Error message box: convert to component -->
		<div v-if="error" class="wbmad-toast wbmad-publish-error-toast">
			<p v-i18n-html:machinevision-publish-error-message />
		</div>

		<!-- Success message box: convert to component -->
		<div v-if="success" class="wbmad-toast wbmad-success-toast">
			<p v-i18n-html:machinevision-success-message />
		</div>

		<!-- Tabs container -->
		<template v-if="showTabs">
			<h2
				v-i18n-html:machinevision-machineaidedtagging-tabs-heading
				class="wbmad-suggested-tags-page-tabs-heading"
			/>

			<tabs v-on:tab-change="onTabChange">
				<tab v-for="( tab, index ) in tabs"
					v-bind:key="'tab-' + index"
					v-bind:title="tab">
					<card-stack v-bind:queue="tab" />
				</tab>
			</tabs>
		</template>

		<!-- Login message container -->
		<template v-else-if="!isAuthenticated">
			<!-- eslint-disable-next-line vue/no-v-html -->
			<p v-html="loginMessage" />
		</template>

		<template v-else>
			<p v-i18n-html:machinevision-autoconfirmed-message />
		</template>
	</div>
</template>

<script>
/**
 * Things this component should be responsible for:
 *
 * - Display the placeholder UI and remove it when ready?
 *
 * - Control access to this feature: user should only see tabs
 *   if they are authenticated and autoconfirmed.
 *
 * - Dispatch a modal dialogue if necessary (onboarding dialogue)
 *
 * - Handle URL params and listen for changes: on initial load
 *   this component should parse the URL and determine whether the
 *   user has requested the user-specific queue from the start.
 *   This component should also listen for changes in hash using
 *   a watcher.
 *
 * - Dispatch Vuex actions where appropriate to:
 *   fetch images
 *   change the current tab
 *
 * - Display any necessary messages to the user (errors, etc)
 *
 * - Finally, this component should render the hierarchy of
 *   children responsible for showing the rest of the UI
 */

var mapState = require( 'vuex' ).mapState,
	mapGetters = require( 'vuex' ).mapGetters,
	mapActions = require( 'vuex' ).mapActions,
	Tabs = require( './base/Tabs.vue' ),
	Tab = require( './base/Tab.vue' ),
	CardStack = require( './CardStack.vue' );

// @vue/component
module.exports = {
	name: 'MachineVision',

	components: {
		tabs: Tabs,
		tab: Tab,
		'card-stack': CardStack
	},

	computed: $.extend( {}, mapState( [
		'success',
		'error'
	] ), mapGetters( [
		'tabs',
		'isAuthenticated',
		'isAutoconfirmed'
	] ), {
		/**
		 * Whether or not to display the full UI
		 *
		 * @return {bool}
		 */
		showTabs: function () {
			return this.isAuthenticated && this.isAutoconfirmed;
		},

		/**
		 * @TODO fix this message to not require server-side wikitext parsing
		 * so that we can rely on the i18n plugin instead of depending on
		 * mw.config here
		 *
		 * @return {string}
		 */
		loginMessage: function () {
			return mw.config.get( 'wgMVSuggestedTagsLoginMessage' );
		}
	} ),

	methods: $.extend( {}, mapActions( [
		'updateCurrentTab',
		'getImages'
	] ), {
		/**
		 * Watch the tab change events emitted by the <Tabs> component
		 * to ensure that Vuex state is kept in sync
		 *
		 * @param {string} tab name
		 */
		onTabChange: function ( tab ) {
			this.updateCurrentTab( tab.title.toLowerCase() );
		}
	} ),

	mounted: function () {
		// popular images are pre-loaded on the server side;
		// immediately fetch user images in the mounted hook so that they'll be
		// ready for the user if they switch tabs
		this.getImages( {
			queue: 'user'
		} );
	}
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../style-variables.less';

.wbmad-suggested-tags-page {
	max-width: @wbmad-max-width;

	// Necessary to center fixed toast messages within page element on desktop.
	@media screen and ( min-width: @width-breakpoint-tablet ) {
		.flex-display();
		flex-wrap: wrap;
		justify-content: center;
	}

	.wbmad-suggested-tags-page-tabs-heading,
	.wbmad-suggested-tags-page-tabs,
	.wbmad-suggested-tags-page-license-info {
		width: 100%;
	}

	.wbmad-suggested-tags-page-tabs-heading {
		border: 0;
		font-family: @font-family-sans;
		font-weight: 600;
		margin-top: 20px;
	}

	.wbmad-suggested-tags-page-license-info {
		.box-sizing( border-box );
		background-color: @base90;
		padding: 16px;

		p {
			margin: 0;
		}
	}
}
</style>