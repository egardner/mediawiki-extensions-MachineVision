<template>
	<div class="wbmad-suggested-tags-page">
		<toast-notification
			v-if="publishError"
			v-bind:key="'publishError-' + Date.now()"
			type="error"
			duration="8"
			v-on:leave="onToastLeave"
		>
			<p v-i18n-html:machinevision-publish-error-message />
		</toast-notification>

		<toast-notification
			v-if="publishSuccess"
			v-bind:key="'publishSuccess-' + Date.now()"
			type="success"
			v-bind:duration="4"
			v-on:leave="onToastLeave"
		>
			<p v-i18n-html:machinevision-success-message />
		</toast-notification>

		<!-- Tabs container -->
		<template v-if="showTabs">
			<h2 v-i18n-html:machinevision-machineaidedtagging-tabs-heading
				class="wbmad-suggested-tags-page-tabs-heading" />

			<tabs v-bind:active="currentTab" v-on:tab-change="onTabChange">
				<!-- Popular tab -->
				<tab v-bind:id="'tab-popular'"
					name="popular"
					v-bind:title="popularTabTitle">
					<card-stack v-bind:queue="'popular'" />
				</tab>

				<!-- User tab -->
				<tab v-bind:id="'tab-user'"
					name="user"
					v-bind:title="userTabTitle">
					<card-stack v-bind:queue="'user'" />
				</tab>
			</tabs>

			<div v-i18n-html:machinevision-machineaidedtagging-license-information
				class="wbmad-suggested-tags-page-license-info" />
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
	ToastNotification = require( './base/ToastNotification.vue' ),
	CardStack = require( './CardStack.vue' );

// @vue/component
module.exports = {
	name: 'MachineVision',

	components: {
		tabs: Tabs,
		tab: Tab,
		'toast-notification': ToastNotification,
		'card-stack': CardStack
	},

	computed: $.extend( {}, mapState( [
		'currentTab',
		'publishStatus'
	] ), mapGetters( [
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
		},

		popularTabTitle: function () {
			return this.$i18n( 'machinevision-machineaidedtagging-popular-tab' ).text();
		},

		userTabTitle: function () {
			return this.$i18n( 'machinevision-machineaidedtagging-user-tab' ).text();
		},

		publishSuccess: function () {
			return this.publishStatus === 'success';
		},

		publishError: function () {
			return this.publishStatus === 'error';
		}
	} ),

	methods: $.extend( {}, mapActions( [
		'updateCurrentTab',
		'getImages',
		'updatePublishStatus'
	] ), {
		/**
		 * Watch the tab change events emitted by the <Tabs> component
		 * to ensure that Vuex state is kept in sync
		 *
		 * @param {VueComponent} tab
		 */
		onTabChange: function ( tab ) {
			this.updateCurrentTab( tab.name );
		},

		onToastLeave: function () {
			this.updatePublishStatus( null );
		}
	} ),

	mounted: function () {
		// TODO: Check URL fragment for tab name.
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

	.wbmad-suggested-tags-page-tabs-heading {
		border: 0;
		font-family: @font-family-sans;
		font-weight: 600;
		margin-top: 20px;
	}

	.mw-tabs__content {
		padding: 24px 4px 32px;
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
