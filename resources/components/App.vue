<template>
	<wbmad-fade-in>
		<div class="wbmad-suggested-tags-page">
			<template v-if="showToasts">
				<mw-toast-notification
					v-for="message in imageMessages"
					v-bind:key="message.key"
					v-bind:type="message.type"
					v-bind:duration="message.duration"
					v-on:leave="onToastLeave"
				>
					<p>{{ $i18n( message.messageKey ) }}</p>
				</mw-toast-notification>
			</template>

			<!-- Tabs container -->
			<template v-if="showTabs">
				<h2 v-i18n-html:machinevision-machineaidedtagging-tabs-heading
					class="wbmad-suggested-tags-page-tabs-heading" />

				<tabs v-bind:active="currentTab" v-on:tab-change="onTabChange">
					<!-- Popular tab -->
					<tab name="popular" v-bind:title="popularTabTitle">
						<card-stack v-bind:queue="'popular'" />
					</tab>

					<!-- User tab -->
					<tab name="user" v-bind:title="userTabTitle">
						<personal-uploads-count />
						<card-stack v-bind:queue="'user'" />
					</tab>
				</tabs>

				<p v-i18n-html:machinevision-machineaidedtagging-preferences-link
					class="wbmad-suggested-tags-page-preferences-link" />

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
	</wbmad-fade-in>
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
 * - Dispatch a modal dialog if necessary (onboarding dialog)
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
	CardStack = require( './CardStack.vue' ),
	PersonalUploadsCount = require( './PersonalUploadsCount.vue' ),
	OnboardingDialog = require( '../widgets/OnboardingDialog.js' ),
	FadeIn = require( './FadeIn.vue' ),
	url = new mw.Uri();

// @vue/component
module.exports = {
	name: 'MachineVision',

	components: {
		tabs: Tabs,
		tab: Tab,
		'mw-toast-notification': ToastNotification,
		'card-stack': CardStack,
		'personal-uploads-count': PersonalUploadsCount,
		'wbmad-fade-in': FadeIn
	},

	computed: $.extend( {}, mapState( [
		'currentTab',
		'imageMessages'
	] ), mapGetters( [
		'isAuthenticated',
		'isAutoconfirmed',
		'tabs'
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

		showToasts: function () {
			return this.imageMessages && this.imageMessages.length > 0;
		}
	} ),

	methods: $.extend( {}, mapActions( [
		'updateCurrentTab',
		'getImages',
		'hideImageMessage'
	] ), {
		/**
		 * Watch the tab change events emitted by the <Tabs> component
		 * to ensure that Vuex state is kept in sync
		 *
		 * @param {VueComponent} tab
		 */
		onTabChange: function ( tab ) {
			window.history.replaceState( null, null, '#' + tab.name );
			this.updateCurrentTab( tab.name );
		},

		/**
		 * Hide a toast notification that has past its display duration.
		 *
		 * @param {string} toastKey
		 */
		onToastLeave: function ( toastKey ) {
			this.hideImageMessage( toastKey );
		},

		/**
		 * @param {HashChangeEvent} e
		 */
		onHashChange: function ( e ) {
			var newHash = new URL( e.newURL ).hash,
				newTabName = newHash.substring( 1 );

			if ( this.tabs.indexOf( newTabName ) !== -1 ) {
				this.updateCurrentTab( newTabName );
			}
		},

		showOnboardingDialog: function () {
			var onboardingDialog,
				prefKey = 'wbmad-onboarding-dialog-dismissed',
				windowManager;

			// Don't show if user has dismissed it or if this isn't the user
			// tab. Type coercion is necessary due to limitations of browser
			// localstorage.
			if ( Number( mw.user.options.get( prefKey ) ) === 1 ) {
				return;
			}

			windowManager = new OO.ui.WindowManager();
			onboardingDialog = new OnboardingDialog( { onboardingPrefKey: prefKey } );

			$( document.body ).append( windowManager.$element );
			windowManager.addWindows( [ onboardingDialog ] );
			windowManager.openWindow( onboardingDialog );
		}
	} ),

	watch: {
		currentTab: function ( newVal ) {
			if ( this.isAuthenticated && newVal === 'user' ) {
				this.showOnboardingDialog();
			}
		}
	},

	mounted: function () {
		// If there's a URL fragment and it's one of the tabs, select that tab.
		// Otherwise, default to "popular" add a fragement to the URL.
		var urlFragment = url.fragment,
			hash = ( urlFragment && this.tabs.indexOf( urlFragment ) !== -1 ) ?
				urlFragment :
				this.tabs[ 0 ];

		this.tabs.forEach( function ( tab ) {
			this.getImages( { queue: tab } );
		}.bind( this ) );

		window.history.replaceState( null, null, '#' + hash );
		this.updateCurrentTab( hash );

		// Listen for hash changes.
		window.addEventListener( 'hashchange', this.onHashChange );
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
		padding: 24px 4px 16px;
	}

	.wbmad-suggested-tags-page-license-info {
		.box-sizing( border-box );
		background-color: @base90;
		padding: 16px;

		p {
			margin: 0;
		}
	}

	.wbmad-suggested-tags-page-preferences-link {
		margin: 0 0 16px;
	}
}
</style>
