'use strict';

/* eslint-disable no-implicit-globals */
const getters = require( '../../resources/store/getters.js' ),
	imageFixtures = require( './fixtures/imageData.json' );

describe( 'getters', () => {
	let state,
		fixtures;

	beforeEach( () => {
		state = {
			images: {
				popular: [],
				user: []
			},

			pending: {
				popular: false,
				user: false
			},

			currentTab: 'popular',
			publishStatus: null
		};

		// Create a fresh copy of imageFixtures so any mutations made to the
		// data is reset for each test
		fixtures = [ ...imageFixtures ];
	} );

	describe( 'tabs', () => {
		it( 'returns the keys of the state.images object', () => {
			expect( getters.tabs( state ) ).toEqual( Object.keys( state.images ) );
		} );
	} );

	describe( 'currentImage', () => {
		it( 'returns the first image of queue corresponding to the current tab', () => {
			state.images.popular = fixtures;
			expect( getters.currentImage( state ) ).toEqual( fixtures[ 0 ] );
		} );
	} );

	// Still trying to figure out the best way to test getters that rely on other getters...

	describe( 'currentImageTitle', () => {
		test.todo( 'returns the title of the current image' );
	} );

	describe( 'currentImageMediaInfoId', () => {
		test.todo( 'returns the MediaInfoId of the current image' );
	} );

	describe( 'currentImageSuggestions', () => {
		test.todo( 'returns the suggestions array of the current image' );
		test.todo( 'filters out any suggestions that do not contain text' );
	} );
} );
