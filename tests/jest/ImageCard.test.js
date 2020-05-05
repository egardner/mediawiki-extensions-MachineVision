const VueTestUtils = require( '@vue/test-utils' );
const Vuex = require( 'vuex' );
const ImageCard = require( '../../resources/components/ImageCard.vue' );
const i18n = require( './plugins/i18n' );
const imageFixtures = require( './fixtures/imageData.json' );

const localVue = VueTestUtils.createLocalVue();
localVue.use( i18n );
localVue.use( Vuex );

describe( 'ImageCard', () => {
	let state,
		getters,
		actions,
		store;

	beforeEach( () => {
		state = {
			images: {
				popular: imageFixtures,
				user: []
			}
		};

		getters = {
			currentImage: jest.fn(),
			currentImageSuggestions: jest.fn()
		};

		actions = {
			publishTags: jest.fn(),
			skipImage: jest.fn()
		};

		store = new Vuex.Store( {
			state,
			getters,
			actions
		} );
	} );

	it( 'publish button is disabled when no suggestions are confirmed', () => {
		getters.currentImage.mockReturnValue( imageFixtures[ 0 ] );
		getters.currentImageSuggestions.mockReturnValue( imageFixtures[ 0 ].suggestions );

		const wrapper = VueTestUtils.mount( ImageCard, { store, localVue } );
		const publishButton = wrapper.find( '.wbmad-action-buttons__publish' );

		expect( publishButton.attributes( 'disabled' ) ).toBe( 'disabled' );
		expect( actions.publishTags ).not.toHaveBeenCalled();

		publishButton.trigger( 'click' );
		expect( actions.publishTags ).not.toHaveBeenCalled();
	} );

	it( 'publish button is enabled when at least one suggestion is confirmed', () => {
		let unconfirmedSuggestion = imageFixtures[ 0 ].suggestions[ 0 ];
		let confirmedSuggestion = imageFixtures[ 0 ].suggestions[ 1 ];
		confirmedSuggestion.confirmed = true;

		getters.currentImage.mockReturnValue( imageFixtures[ 0 ] );
		getters.currentImageSuggestions.mockReturnValue( [
			unconfirmedSuggestion,
			confirmedSuggestion
		] );

		const wrapper = VueTestUtils.mount( ImageCard, { store, localVue } );
		const publishButton = wrapper.find( '.wbmad-action-buttons__publish' );

		expect( publishButton.attributes( 'disabled' ) ).not.toBe( 'disabled' );
	} );

	it( 'dispatches the publish action when the publish button is clicked', () => {
		let unconfirmedSuggestion = imageFixtures[ 0 ].suggestions[ 0 ];
		let confirmedSuggestion = imageFixtures[ 0 ].suggestions[ 1 ];
		confirmedSuggestion.confirmed = true;

		getters.currentImage.mockReturnValue( imageFixtures[ 0 ] );
		getters.currentImageSuggestions.mockReturnValue( [
			unconfirmedSuggestion,
			confirmedSuggestion
		] );

		const wrapper = VueTestUtils.mount( ImageCard, { store, localVue } );
		const publishButton = wrapper.find( '.wbmad-action-buttons__publish' );
		expect( actions.publishTags ).not.toHaveBeenCalled();

		publishButton.trigger( 'click' );
		wrapper.vm.confirmTagsDialog.emit( 'confirm' );
		expect( actions.publishTags ).toHaveBeenCalled();
	} );

	it( 'dispatches the skipImage action when the skip button is clicked', () => {
		getters.currentImage.mockReturnValue( imageFixtures[ 0 ] );
		getters.currentImageSuggestions.mockReturnValue( imageFixtures[ 0 ].suggestions );

		const wrapper = VueTestUtils.mount( ImageCard, { store, localVue } );
		const skipButton = wrapper.find( '.wbmad-action-buttons__skip' );

		expect( actions.skipImage ).not.toHaveBeenCalled();

		skipButton.trigger( 'click' );
		expect( actions.skipImage ).toHaveBeenCalled();
	} );
} );
