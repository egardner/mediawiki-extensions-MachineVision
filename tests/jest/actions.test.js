'use strict';

/* eslint-disable no-implicit-globals */
const actions = require( '../../resources/store/actions.js' ),
	imageFixtures = require( './fixtures/imageData.json' );

describe( 'getters', () => {
	let fixtures,
		context;

	beforeEach( () => {
		// Create a fresh copy of imageFixtures so any mutations made to the
		// data is reset for each test
		fixtures = [ ...imageFixtures ];

		// Context objects are jest mock functions whose calls can be
		// investigated in tests
		context = {
			commit: jest.fn(),
			getters: jest.fn(),
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
		test.todo( 'makes a GET request to the API with the correct parameters' );
		test.todo( 'defaults to fetching popular images if no "queue" option is provided' );
		test.todo( 'fetches user images if a "user" queue option is provided' );
		test.todo( 'sets the appropriate queue into the pending state when a request is made' );
		test.todo( 'MvImage objects returned by the API contain arrays of MvSuggestions objects' );
		test.todo( 'Commits an addImage mutation for each image in the response' );
		test.todo( 'Removes the pending state on the appropriate queue when request completes' );
		test.todo( 'Handles errors successfully' );
	} );

	describe( 'toggleTagConfirmation', () => {
		test.todo( 'Finds a tag matching the payload among the current image suggestions' );
		test.todo( 'Commits a toggleSuggestion mutation with the tag index as an argument' );
	} );

	describe( 'publishTags', () => {
		test.todo( 'dispatches the setDepictsStatements action with a payload of all currently confirmed tags' );
		test.todo( 'makes a reviewimagelabels POST request with a reviewbatch including both confirmed and unconfirmed tags' );
		test.todo( 'dispatches an updatePublishStatus action with "success" as payload if requests are successful' );
		test.todo( 'dispatches an updatePublishStatus action with "failure" as payload if requests fail' );
		test.todo( 'dispatches a skipImage action regardless of success or failure' );
	} );

	describe( 'setDepictsStatements', () => {
		test.todo( 'makes a wbsetclaim POST request for each confirmed tag provided in the payload' );
	} );

	describe( 'skipImage', () => {
		test.todo( 'commits the removeImage mutation' );
	} );

	describe( 'updatePublishStatus', () => {
		test.todo( 'commits the setPublishStatus mutation with the payload as an argument' );
	} );
} );
