<template>
	<div class="mw-tabs">
		<div class="mw-tabs__header" role="tablist">
			<div v-for="(tab, index) in tabs"
				v-bind:id="tab.id + '-label'"
				v-bind:key="tab.title"
				v-bind:class="determineTabClasses( tab, index )"
				v-bind:aria-selected="index === selectedIndex"
				v-bind:aria-controls="tab.id"
				class="mw-tabs__header__item"
				role="tab"
				tabindex="0"
				v-on:click="selectTab( index )"
				v-on:keyup.enter="selectTab( index )"
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

	data: function () {
		return {
			selectedIndex: 0,
			tabs: this.$children
		};
	},

	methods: {
		selectTab: function ( index ) {
			if ( this.tabs[ index ].disabled === true ) {
				return false;
			}

			this.selectedIndex = index;
		},

		setTabState: function ( active ) {
			this.tabs.forEach( function ( tab, index ) {
				tab.isActive = ( index === active );
			} );
		},

		determineTabClasses: function ( tab, index ) {
			return {
				'is-active': index === this.selectedIndex,
				'is-disabled': tab.disabled
			};
		}
	},

	watch: {
		selectedIndex: function ( newIndex ) {
			this.setTabState( newIndex );
			this.$emit( 'tab-change', this.tabs[ this.selectedIndex ] );
		}
	},

	mounted: function () {
		this.setTabState( this.selectedIndex );
	}
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../../style-variables.less';

// stylelint-disable selector-class-pattern

.mw-tabs {
	&__header {
		.flex-display();
		.box-shadow( inset 0 -1px 0 0 @base50 );

		&__item {
			color: @base30;
			cursor: pointer;
			font-weight: bold;
			margin: 6px 6px -1px 0;
			padding: 6px 13px;
			transition: color 100ms, box-shadow 100ms;

			&:hover,
			&.is-active {
				color: @progressive;
				.box-shadow( inset 0 -2px 0 0 @progressive );
			}

			&:hover {
				color: @progressive-hover;
				.box-shadow( inset 0 -2px 0 0 @progressive-hover );
			}

			&.is-disabled {
				color: @base50;
				cursor: not-allowed;

				&:hover,
				&.is-active {
					color: @base50;
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
