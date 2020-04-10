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
		store,
		computed;

	// Mock Vuex store and i18n-based computed props for testing
	beforeEach( () => {
		state = {
			currentTab: 'popular',
			images: {
				popular: [],
				user: []
			},

			pending: {
				popular: false,
				user: false
			}
		};

		getters = {
			isAuthenticated: jest.fn(),
			isAutoconfirmed: jest.fn()
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

		// Title is a required prop; fake a simple string at the computed prop
		// level instead of faking out the i18n plugin here; we just need to
		// provide string values
		computed = {
			popularTabTitle() {
				return 'popular';
			},
			userTabTitle() {
				return 'user';
			}
		};
	} );

	it( 'does not display if user is not logged in', () => {
		getters.isAuthenticated.mockReturnValue( false );
		getters.isAutoconfirmed.mockReturnValue( false );

		const wrapper = VueTestUtils.shallowMount( App, { store, localVue, computed } );
		expect( wrapper.contains( '.wbmad-suggested-tags-page-tabs-heading' ) ).toBe( false );
	} );

	it( 'does not display if user is not autoconfirmed', () => {
		getters.isAuthenticated.mockReturnValue( true );
		getters.isAutoconfirmed.mockReturnValue( false );

		const wrapper = VueTestUtils.shallowMount( App, { store, localVue, computed } );
		expect( wrapper.contains( '.wbmad-suggested-tags-page-tabs-heading' ) ).toBe( false );
	} );

	it( 'displays if user is both authenticated and autoconfirmed', () => {
		getters.isAuthenticated.mockReturnValue( true );
		getters.isAutoconfirmed.mockReturnValue( true );

		const wrapper = VueTestUtils.shallowMount( App, { store, localVue, computed } );
		expect( wrapper.contains( '.wbmad-suggested-tags-page-tabs-heading' ) ).toBe( true );
	} );

	it( 'dispatches the updateCurrentTab action when the onTabChange method is called', () => {
		getters.isAuthenticated.mockReturnValue( true );
		getters.isAutoconfirmed.mockReturnValue( true );

		// Use mount to test events emitted from child components
		const wrapper = VueTestUtils.mount( App, {
			store,
			localVue,
			computed
		} );

		// Emit a "tab-like" object with the appropriate queue
		wrapper.find( Tabs ).vm.$emit( 'tab-change', {
			$children: [ { queue: 'user' } ]
		} );

		// Expect the updateCurrentTab action to be dispatched
		expect( actions.updateCurrentTab.mock.calls.length ).toBe( 1 );

		// Expect the call to updateCurrentTab to contain the correct payload
		expect( actions.updateCurrentTab.mock.calls[ 0 ][ 1 ] ).toBe( 'user' );
	} );

	it( 'dispatches a getImages action for user images when mounted', () => {
		getters.isAuthenticated.mockReturnValue( true );
		getters.isAutoconfirmed.mockReturnValue( true );

		// Expect the getImages action to be dispatched when component is mounted
		expect( actions.getImages.mock.calls.length ).toBe( 0 );
		VueTestUtils.shallowMount( App, { store, localVue, computed } );
		expect( actions.getImages.mock.calls.length ).toBe( 1 );
	} );
} );