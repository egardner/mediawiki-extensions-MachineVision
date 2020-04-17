'use strict';

/* eslint-disable no-implicit-globals */
const actions = require( '../../resources/store/actions.js' ),
	imageFixtures = require( './fixtures/imageData.json' ),
	apiResponse = require( './fixtures/apiResponse.json' ),
	mockApi = global.wikibase.api.getLocationAgnosticMwApi();

describe( 'getters', () => {
	// eslint-disable-next-line no-unused-vars
	let fixtures,
		context;

	beforeEach( () => {
		jest.clearAllMocks();
		// Create a fresh copy of imageFixtures so any mutations made to the
		// data is reset for each test
		fixtures = [ ...imageFixtures ];

		// Context objects are jest mock functions whose calls can be
		// investigated in tests
		context = {
			state: {
				currentTab: 'popular',
				images: {
					popular: [],
					user: []
				}
			},
			commit: jest.fn(),
			getters: {},
			dispatch: jest.fn()
		};
	} );

	describe( 'updateCurrentTab', () => {
		it( 'it calls the setTab mutation', () => {
			actions.updateCurrentTab( context, 'user' );
			expect( context.commit.mock.calls[ 0 ][ 0 ] ).toBe( 'setTab' );
		} );

		it( 'setTab mutation is called with the correct tab argument', () => {
			actions.updateCurrentTab( context, 'user' );
			expect( context.commit.mock.calls[ 0 ][ 1 ] ).toBe( 'user' );
		} );
	} );

	describe( 'getImages', () => {
		it( 'makes a GET request to the API with the correct parameters', () => {
			actions.getImages( context );
			expect( mockApi.get ).toHaveBeenCalled();
			expect( mockApi.get ).toHaveBeenCalledWith(
				expect.objectContaining( {
					action: 'query',
					format: 'json',
					formatversion: 2,
					generator: 'unreviewedimagelabels',
					guillimit: 10,
					prop: 'imageinfo|imagelabels',
					iiprop: 'url',
					iiurlwidth: 800,
					ilstate: 'unreviewed',
					meta: 'unreviewedimagecount'
				} )
			);
		} );

		it( 'defaults to fetching images for the current tab queue if no "queue" option is provided', () => {
			context.state.currentTab = 'popular';
			actions.getImages( context );
			expect( context.commit ).toHaveBeenCalledWith( 'setPending', {
				queue: 'popular',
				pending: true
			} );

			context.state.currentTab = 'user';
			actions.getImages( context );
			expect( context.commit ).toHaveBeenCalledWith( 'setPending', {
				queue: 'user',
				pending: true
			} );
		} );

		it( 'fetches user images if a "user" queue option is provided', () => {
			context.state.currentTab = 'popular';
			actions.getImages( context, { queue: 'user' } );
			expect( context.commit ).toHaveBeenCalledWith( 'setPending', {
				queue: 'user',
				pending: true
			} );
		} );

		it( 'Commits an addImage mutation for each image in the response', done => {
			var apiImages = apiResponse.query.pages;
			mockApi.get.mockResolvedValue( apiResponse );

			actions.getImages( context ).then( () => {
				var mutations = context.commit.mock.calls,
					addImageMutations = mutations.filter( mutation => {
						return mutation[ 0 ] === 'addImage';
					} );

				expect( addImageMutations.length ).toBe( apiImages.length );
				done();
			} );
		} );

		it( 'Removes the pending state on the appropriate queue when request completes', done => {
			context.state.currentTab = 'popular';
			mockApi.get.mockResolvedValue( apiResponse );

			actions.getImages( context ).then( () => {
				expect( context.commit ).toHaveBeenCalledWith( 'setPending', {
					queue: 'popular',
					pending: false
				} );
				done();
			} );
		} );

		test.todo( 'Handles errors successfully' );
	} );

	describe( 'toggleTagConfirmation', () => {
		it( 'Commits a toggleSuggestion mutation with the tag index as an argument', () => {
			var suggestions = fixtures[ 0 ].suggestions,
				tagIndex = 1,
				tag = suggestions[ tagIndex ];

			Object.defineProperty( context.getters, 'currentImageSuggestions', {
				get: jest.fn().mockReturnValue( suggestions )
			} );

			actions.toggleTagConfirmation( context, tag );
			expect( context.commit ).toHaveBeenCalledWith( 'toggleSuggestion', tagIndex );
		} );
	} );

	describe( 'publishTags', () => {
		it( 'dispatches the setDepictsStatements action with a payload of all currently confirmed tags', () => {
			var suggestions = fixtures[ 0 ].suggestions,
				confirmed;

			suggestions[ 0 ].confirmed = true;

			confirmed = suggestions.filter( function ( suggestion ) {
				return suggestion.confirmed;
			} );

			Object.defineProperty( context.getters, 'currentImageSuggestions', {
				get: jest.fn().mockReturnValue( suggestions )
			} );

			Object.defineProperty( context.getters, 'currentImageTitle', {
				get: jest.fn().mockReturnValue( suggestions )
			} );

			actions.publishTags( context );
			expect( context.dispatch ).toHaveBeenCalledWith( 'setDepictsStatements', confirmed );
		} );

		it( 'makes a reviewimagelabels POST request with a reviewbatch including both confirmed and unconfirmed tags', () => {
			var suggestions = fixtures[ 0 ].suggestions,
				reviewBatch,
				json;

			suggestions[ 0 ].confirmed = true;
			reviewBatch = suggestions.map( suggestion => {
				return {
					label: suggestion.wikidataId,
					review: suggestion.confirmed ? 'accept' : 'reject'
				};
			} );

			json = JSON.stringify( reviewBatch );

			Object.defineProperty( context.getters, 'currentImageSuggestions', {
				get: jest.fn().mockReturnValue( suggestions )
			} );

			Object.defineProperty( context.getters, 'currentImageTitle', {
				get: jest.fn().mockReturnValue( 'Test' )
			} );

			actions.publishTags( context );
			expect( mockApi.postWithToken ).toHaveBeenCalledWith( 'csrf', {
				action: 'reviewimagelabels',
				filename: 'Test',
				batch: json
			} );
		} );

		// For these tests, mockApi needs to return jQuery deferred objects
		// rather than vanilla promises
		test.todo( 'dispatches an updatePublishStatus action with "success" as payload if requests are successful' );
		test.todo( 'dispatches an updatePublishStatus action with "failure" as payload if requests fail' );
		test.todo( 'dispatches a skipImage action regardless of success or failure' );
	} );

	describe( 'setDepictsStatements', () => {
		it( 'makes a wbsetclaim POST request for each confirmed tag provided in the payload', done => {
			var tags = fixtures[ 0 ].suggestions;

			actions.setDepictsStatements( context, tags ).then( () => {
				expect( mockApi.postWithToken ).toHaveBeenCalledTimes( tags.length );
				done();
			} );
		} );
	} );

	describe( 'skipImage', () => {
		it( 'commits the removeImage mutation', () => {
			actions.skipImage( context );
			expect( context.commit ).toHaveBeenCalledWith( 'removeImage' );
		} );
	} );

	describe( 'updatePublishStatus', () => {
		it( 'commits the setPublishStatus mutation with the payload as an argument', () => {
			actions.updatePublishStatus( context, true );
			expect( context.commit ).toHaveBeenCalledWith( 'setPublishStatus', true );

			actions.updatePublishStatus( context, false );
			expect( context.commit ).toHaveBeenCalledWith( 'setPublishStatus', false );
		} );
	} );
} );
