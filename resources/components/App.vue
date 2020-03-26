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
		<div v-if="showTabs">
			<h2
				v-i18n-html:machinevision-machineaidedtagging-tabs-heading
				class="wbmad-suggested-tags-page-tabs-heading"
			/>

			<tabs v-on:tab-change="onTabChange">
				<tab title="Popular">
					<card-stack queue="popular" />
				</tab>

				<tab title="User">
					<card-stack queue="user" />
				</tab>
			</tabs>
		</div>

		<!-- Login message container -->
		<div v-else>
			Sorry, you can't see the tabs.
		</div>
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

module.exports = {
	name: 'MachineVision',

	components: {
		tabs: Tabs,
		tab: Tab,
		'card-stack': CardStack
	},

	computed: $.extend( {}, mapState( [
		'tabs',
		'pending',
		'success',
		'error'
	] ), mapGetters( [
		'showTabs'
	] ) ),

	methods: $.extend( {}, mapActions( [
		'updateCurrentTab',
		'getImages'
	] ), {
		onTabChange: function ( tab ) {
			this.updateCurrentTab( tab.title.toLowerCase() );
		}
	} )
};
</script>

<style lang="less">
</style>
