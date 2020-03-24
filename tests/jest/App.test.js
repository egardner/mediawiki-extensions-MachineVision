const VueTestUtils = require( '@vue/test-utils' );
const Vuex = require( 'vuex' );
const App = require( '../../resources/components/App.vue' );
const i18n = require( '../../../../resources/src/vue/i18n.js' );

const localVue = VueTestUtils.createLocalVue();
localVue.use( i18n );
localVue.use( Vuex );

describe( 'App', () => {
	let actions,
		getters,
		store;

	// Mock Vuex store for testing
	beforeEach( () => {
		getters = {
			showTabs: jest.fn()
		};

		actions = {
			getImages: jest.fn()
		};

		store = new Vuex.Store( {
			state: {
				currentTab: 'A'
			},
			getters,
			actions
		} );
	} );

	it( 'dispatches the getImages action as soon as it is mounted', () => {
		VueTestUtils.shallowMount( App, { store, localVue } );
		expect( actions.getImages ).toHaveBeenCalled();
	} );

	it( 'displays tabs if "showTabs" is true', () => {
		getters.showTabs.mockReturnValue( true );
		const wrapper = VueTestUtils.shallowMount( App, { store, localVue } );
		expect( wrapper.contains( '.wbmad-suggested-tags-page-tabs-heading' ) ).toBe( true );
	} );

	it( 'does not display tabs if "showTabs" is false', () => {
		getters.showTabs.mockReturnValue( false );
		const wrapper = VueTestUtils.shallowMount( App, { store, localVue } );
		expect( wrapper.contains( '.wbmad-suggested-tags-page-tabs-heading' ) ).toBe( false );
	} );
} );
