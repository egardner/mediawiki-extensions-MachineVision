const VueTestUtils = require( '@vue/test-utils' );
const Vuex = require( 'vuex' );
const App = require( '../../resources/components/App.vue' );
const Tabs = require( '../../resources/components/base/Tabs.vue' );
const i18n = require( './plugins/i18n' );

const localVue = VueTestUtils.createLocalVue();
localVue.use( i18n );
localVue.use( Vuex );

describe( 'App', () => {
	let state,
		getters,
		actions,
		store;

	// Mock Vuex store for testing
	beforeEach( () => {
		state = {
			currentTab: 'A',
			images: {
				A: [],
				B: []
			},

			pending: {
				A: false,
				B: false
			}
		};

		getters = {
			isAuthenticated: jest.fn(),
			isAutoconfirmed: jest.fn(),
			tabs: function () {
				return Object.keys( state.images );
			}
		};

		actions = {
			getImages: jest.fn(),
			updateCurrentTab: jest.fn()
		};

		store = new Vuex.Store( {
			state,
			getters,
			actions
		} );
	} );

	it( 'does not display if user is not logged in', () => {
		getters.isAuthenticated.mockReturnValue( false );
		getters.isAutoconfirmed.mockReturnValue( false );

		const wrapper = VueTestUtils.shallowMount( App, { store, localVue } );
		expect( wrapper.contains( '.wbmad-suggested-tags-page-tabs-heading' ) ).toBe( false );
	} );

	it( 'does not display if user is not autoconfirmed', () => {
		getters.isAuthenticated.mockReturnValue( true );
		getters.isAutoconfirmed.mockReturnValue( false );

		const wrapper = VueTestUtils.shallowMount( App, { store, localVue } );
		expect( wrapper.contains( '.wbmad-suggested-tags-page-tabs-heading' ) ).toBe( false );
	} );

	it( 'displays if user is both authenticated and autoconfirmed', () => {
		getters.isAuthenticated.mockReturnValue( true );
		getters.isAutoconfirmed.mockReturnValue( true );

		const wrapper = VueTestUtils.shallowMount( App, { store, localVue } );
		expect( wrapper.contains( '.wbmad-suggested-tags-page-tabs-heading' ) ).toBe( true );
	} );

	it( 'dispatches the updateCurrentTab action when the tab is changed', () => {
		getters.isAuthenticated.mockReturnValue( true );
		getters.isAutoconfirmed.mockReturnValue( true );

		// Use mount so we can trigger event from the child Tab component,
		// but stub the ImageCard because we don't care about it here
		const wrapper = VueTestUtils.mount( App, {
			store,
			localVue,
			stubs: [ 'wbmad-image-card' ]
		} );

		wrapper.find( Tabs ).vm.$emit( 'tab-change', { title: 'B' } );

		// Expect the updateCurrentTab action to be dispatched
		expect( actions.updateCurrentTab.mock.calls.length ).toBe( 1 );

		// Expect the call to updateCurrentTab to contain the correct payload
		expect( actions.updateCurrentTab.mock.calls[ 0 ][ 1 ] ).toBe( 'b' );
	} );

	it( 'dispatches a getImages action for user images when mounted', () => {
		getters.isAuthenticated.mockReturnValue( true );
		getters.isAutoconfirmed.mockReturnValue( true );

		// Expect the getImages action to be dispatched when component is mounted
		expect( actions.getImages.mock.calls.length ).toBe( 0 );
		VueTestUtils.shallowMount( App, { store, localVue } );
		expect( actions.getImages.mock.calls.length ).toBe( 1 );
	} );
} );
