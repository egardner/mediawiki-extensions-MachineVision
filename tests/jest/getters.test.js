'use strict';

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

	describe( 'currentImageTitle', () => {
		it( 'returns the title of the current image without the "File:" prefix', () => {
			var mockGetters = {
				currentImage: {
					title: 'File:Test.jpg'
				}
			};

			expect( getters.currentImageTitle( {}, mockGetters ) ).toBe( 'Test.jpg' );
		} );
	} );

	describe( 'currentImageMediaInfoId', () => {
		it( 'returns the MediaInfoId of the current image by prefixing pageId with "M"', () => {
			var mockGetters = {
				currentImage: {
					pageid: 123
				}
			};

			expect( getters.currentImageMediaInfoId( {}, mockGetters ) ).toBe( 'M123' );
		} );
	} );

	describe( 'currentImageSuggestions', () => {
		it( 'returns the suggestions array of the current image', () => {
			var suggestions = fixtures[ 0 ].suggestions,
				mockGetters = {
					currentImage: {
						suggestions: fixtures[ 0 ].suggestions
					}
				};

			expect( getters.currentImageSuggestions( {}, mockGetters ) ).toEqual( suggestions );
		} );

		it( 'filters out any suggestions that do not contain text', () => {
			var goodSuggestions = fixtures[ 0 ].suggestions,
				badSuggestion = { wikidataId: 'Q123', confirmed: false, foo: 'bar' },
				allSuggestions = [ ...goodSuggestions, badSuggestion ],
				mockGetters = {
					currentImage: {
						suggestions: allSuggestions
					}
				};

			expect( getters.currentImageSuggestions( {}, mockGetters ) ).toEqual( goodSuggestions );
		} );
	} );
} );
