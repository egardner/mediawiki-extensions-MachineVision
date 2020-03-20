<template>
	<div>
		<h1>Hello from Vue</h1>

		<div v-if="showTabs">
			<h2>{{ currentTab }}</h2>
		</div>

		<div v-else>
			You don't have permission to see tabs.
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

var mapState = require( 'ext.MachineVision.vuex' ).mapState,
	mapGetters = require( 'ext.MachineVision.vuex' ).mapGetters;

module.exports = {
	name: 'MachineVision',

	/**
	 * Due to the need to support ES5, we can't use spread operator or
	 * Object.assign; jQuery.extend is our best option
	 */
	computed: $.extend(
		{},
		mapState( [ 'currentTab' ] ),
		mapGetters( [ 'showTabs' ] )
	),

	/**
	 * Due to the need to support ES5, we still have to manually bind these
	 * functions; make sure to remember!
	 */
	mounted: function () {

	}.bind( this )
};
</script>

<style lang="less">
</style>
