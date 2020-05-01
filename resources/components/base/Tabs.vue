<template>
	<div class="mw-tabs">
		<div class="mw-tabs__header" role="tablist">
			<div v-for="tab in tabs"
				v-bind:id="tab.id + '-label'"
				v-bind:key="tab.title"
				v-bind:class="determineTabLabelClasses( tab )"
				v-bind:aria-selected="tab.name === currentTabName"
				v-bind:aria-controls="tab.id"
				class="mw-tabs__header__item"
				role="tab"
				tabindex="0"
				v-on:click="selectTab( tab.name )"
				v-on:keyup.enter="selectTab( tab.name )"
			>
				{{ tab.title }}
			</div>
		</div>

		<div class="mw-tabs__content">
			<slot />
		</div>
	</div>
</template>

<script>
// @vue/component
module.exports = {
	name: 'Tabs',

	props: {
		active: {
			type: String,
			default: null
		}
	},

	data: function () {
		return {
			tabs: {},
			currentTabName: null
		};
	},

	methods: {
		/**
		 * Change the current tab.
		 * @param {string} tabName
		 */
		selectTab: function ( tabName ) {
			if ( this.tabs[ tabName ].disabled === true ) {
				return;
			}

			this.currentTabName = tabName;
		},

		/**
		 * Set active attribute on each tab.
		 * @param {string} currentTabName
		 */
		setTabState: function ( currentTabName ) {
			var tabName;
			for ( tabName in this.tabs ) {
				this.tabs[ tabName ].isActive = ( tabName === currentTabName );
			}
		},

		/**
		 * Set tab label classes.
		 * @param {VueComponent} tab
		 * @return {Object}
		 */
		determineTabLabelClasses: function ( tab ) {
			return {
				'is-active': tab.name === this.currentTabName,
				'is-disabled': tab.disabled
			};
		},

		/**
		 * Create an object with tabs keyed by their names, then set the
		 * isActive attribute for each tab.
		 */
		initializeTabs: function () {
			var tabs = this.$children;
			this.tabs = {};

			tabs.forEach( function ( tab ) {
				this.tabs[ tab.name ] = tab;
			}.bind( this ) );

			// If no active tab was passed in as a prop, default to first one.
			this.currentTabName = this.active ? this.active : Object.keys( this.tabs )[ 0 ];
			this.setTabState( this.currentTabName );
		}
	},

	watch: {
		/**
		 * When the tab stored in state changes, select that tab.
		 * @param {string} newTabName
		 */
		active: function ( newTabName ) {
			this.selectTab( newTabName );
		},

		/**
		 * When the current tab changes, set active states and emit an event.
		 * @param {string} newTabName
		 */
		currentTabName: function () {
			this.setTabState( this.currentTabName );

			// Don't emit an event if the currentTabName changed as a result of
			// the active prop changing.
			if ( this.currentTabName !== this.active ) {
				this.$emit( 'tab-change', this.tabs[ this.currentTabName ] );
			}
		}
	},

	mounted: function () {
		this.initializeTabs();
	}
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../../../lib/wikimedia-ui-base.less';

// stylelint-disable selector-class-pattern

.mw-tabs {
	&__header {
		.flex-display();
		.box-shadow( inset 0 -1px 0 0 @border-color-base );

		&__item {
			color: @color-base--subtle;
			cursor: pointer;
			font-weight: bold;
			margin: 6px 6px 0 0;
			padding: 6px 13px;
			transition: color 100ms, box-shadow 100ms;

			&:hover,
			&.is-active {
				color: @color-primary;
				.box-shadow( inset 0 -2px 0 0 @color-primary );
			}

			&:hover {
				color: @color-primary--hover;
				.box-shadow( inset 0 -2px 0 0 @color-primary--hover );
			}

			&.is-disabled {
				color: @color-base--disabled;
				cursor: not-allowed;

				&:hover,
				&.is-active {
					color: @color-base--disabled;
					box-shadow: unset;
				}
			}
		}
	}

	&__content {
		padding: 20px;
	}
}
</style>
