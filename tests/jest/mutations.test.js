const imageFixtures = require( './fixtures/imageData.json' ),
	mutations = require( '../../resources/store/mutations.js' );

describe( 'mutations', () => {
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

	describe( 'setTab', () => {
		it( 'sets the current tab state to the value of its payload', () => {
			mutations.setTab( state, 'user' );
			expect( state.currentTab ).toBe( 'user' );
		} );

		it( 'throws an error if desired tab does not exist as a key in state.images', () => {
			expect( () => {
				mutations.setTab( state, 'foo' );
			} ).toThrow();
		} );
	} );

	describe( 'setPending', () => {
		it( 'sets the pending state of the specified queue to the specified value', () => {
			mutations.setPending( state, {
				queue: 'user',
				pending: true
			} );

			expect( state.pending.user ).toBe( true );
		} );

		it( 'sets the pending state of the current tab queue if no queue is provided', () => {
			mutations.setPending( state, { pending: true } );
			expect( state.pending.popular ).toBe( true );
		} );

		it( 'throws an error if desired tab does not exist as a key in state.images', () => {
			expect( () => {
				mutations.setPending( state, {
					queue: 'foo',
					pending: true
				} );
			} ).toThrow();
		} );
	} );

	describe( 'addImage', () => {
		it( 'adds the image object to the specified queue', () => {
			var image = fixtures[ 0 ];
			mutations.addImage( state, { image: image, queue: 'user' } );

			expect( state.images.user.length ).toBe( 1 );
			expect( state.images.user[ 0 ] ).toEqual( image );
		} );

		it( 'defaults to current tab queue if no queue is specified', () => {
			var image = fixtures[ 0 ];
			mutations.addImage( state, { image: image } );

			expect( state.images.popular.length ).toBe( 1 );
			expect( state.images.popular[ 0 ] ).toEqual( image );
		} );

		it( 'throws an error if specified queue does not exist', () => {
			var image = fixtures[ 0 ];

			expect( () => {
				mutations.addImage( state, { image: image, queue: 'foo' } );
			} ).toThrow();
		} );
	} );

	describe( 'removeImage', () => {
		it( 'removes the first image from the queue of the current tab', () => {
			state.images.popular = fixtures;
			expect( state.images.popular.length ).toBe( 4 );

			mutations.removeImage( state );
			expect( state.images.popular.length ).toBe( 3 );

			mutations.removeImage( state );
			expect( state.images.popular.length ).toBe( 2 );
		} );
	} );

	describe( 'clearImages', () => {
		it( 'resets the queue of the current tab to an empty array', () => {
			state.images.popular = fixtures;
			state.images.user = fixtures;

			expect( state.images.popular.length ).toBe( 4 );
			expect( state.images.user.length ).toBe( 4 );

			mutations.clearImages( state );
			expect( state.images.popular ).toEqual( [] );
			expect( state.images.user.length ).toBe( 4 );
		} );

		it( 'resets pending state of the current tab to true', () => {
			state.images.popular = fixtures;
			mutations.clearImages( state );
			expect( state.pending.popular ).toBe( true );
		} );
	} );

	describe( 'toggleSuggestion', () => {
		it( 'finds a suggestion of the first image in the active tab based on index and toggles its state', () => {
			var image = fixtures[ 0 ],
				suggestions = image.suggestions;

			state.images.popular = [ image ];
			expect( state.images.popular[ 0 ].suggestions[ 0 ].confirmed ).toBe( false );

			mutations.toggleSuggestion( state, 0 );
			expect( state.images.popular[ 0 ].suggestions[ 0 ].confirmed ).toBe( true );
			expect( state.images.popular[ 0 ].suggestions[ 0 ].wikidataId ).toEqual( suggestions[ 0 ].wikidataId );
		} );
	} );

	describe( 'setPublishStatus', () => {
		it( 'sets the publishStatus state to the specified value', () => {
			mutations.setPublishStatus( state, 'error' );
			expect( state.publishStatus ).toBe( 'error' );
		} );
	} );
} );