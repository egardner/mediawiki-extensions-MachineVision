const Vue = require( 'vue' );
const VueTestUtils = require( '@vue/test-utils' );
const Vuex = require( 'vuex' );
const ImageCard = require( '../../resources/components/ImageCard.vue' );
const i18n = require( './plugins/i18n' );
const imageFixtures = require( './fixtures/imageData.json' );

const localVue = VueTestUtils.createLocalVue();
localVue.use( i18n );
localVue.use( Vuex );

describe( 'ImageCard', () => {
	let actions,
		store;

	beforeEach( () => {
		actions = {
			publishTags: jest.fn(),
			skipImage: jest.fn()
		};

		store = new Vuex.Store( {
			state: {},
			actions
		} );
	} );

	it( 'makes a deep copy of suggestions data received from props', () => {
		const wrapper = VueTestUtils.mount( ImageCard, {
			propsData: {
				image: imageFixtures[ 0 ]
			},
			store,
			localVue
		} );

		let propsSuggestion = imageFixtures[ 0 ].suggestions[ 0 ];
		let localSuggestion = wrapper.vm.suggestions[ 0 ];

		expect( localSuggestion ).toEqual( propsSuggestion );
		expect( localSuggestion ).not.toBe( propsSuggestion );
	} );

	it( 'publish button is disabled when no suggestions are confirmed', () => {
		const wrapper = VueTestUtils.mount( ImageCard, {
			propsData: {
				image: imageFixtures[ 0 ]
			},
			store,
			localVue
		} );

		const publishButton = wrapper.find( '.wbmad-action-buttons__publish' );

		expect( publishButton.attributes( 'disabled' ) ).toBe( 'disabled' );
		expect( actions.publishTags ).not.toHaveBeenCalled();
		publishButton.trigger( 'click' );
		expect( actions.publishTags ).not.toHaveBeenCalled();
	} );

	it( 'dispatches the publish action when the publish button is clicked', done => {
		const wrapper = VueTestUtils.mount( ImageCard, {
			propsData: {
				image: imageFixtures[ 0 ]
			},
			store,
			localVue
		} );

		const publishButton = wrapper.find( '.wbmad-action-buttons__publish' );
		wrapper.vm.toggleConfirmed( wrapper.vm.suggestions[ 0 ] ); // confirm a suggestion to enable publish button

		Vue.nextTick( () => {
			expect( actions.publishTags ).not.toHaveBeenCalled();
			publishButton.trigger( 'click' );
			expect( actions.publishTags ).toHaveBeenCalled();
			done();
		} );
	} );

	it( 'dispatches the skipImage action when the skip button is clicked', () => {
		const wrapper = VueTestUtils.mount( ImageCard, {
			propsData: {
				image: imageFixtures[ 0 ]
			},
			store,
			localVue
		} );

		const skipButton = wrapper.find( '.wbmad-action-buttons__skip' );

		expect( actions.skipImage ).not.toHaveBeenCalled();
		skipButton.trigger( 'click' );
		expect( actions.skipImage ).toHaveBeenCalled();
	} );
} );
