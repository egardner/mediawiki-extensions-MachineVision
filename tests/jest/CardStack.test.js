const Vue = require( 'vue' );
const VueTestUtils = require( '@vue/test-utils' );
const Vuex = require( 'vuex' );
const CardStack = require( '../../resources/components/CardStack.vue' );
const ImageCard = require( '../../resources/components/ImageCard.vue' );
const Suggestion = require( '../../resources/components/base/Suggestion.vue' );
const i18n = require( './plugins/i18n' );

const localVue = VueTestUtils.createLocalVue();
localVue.use( i18n );
localVue.use( Vuex );

describe( 'CardStack', () => {
	let state,
		mutations,
		actions,
		store;

	beforeEach( () => {
		state = {
			currentTab: 'popular',
			images: {
				popular: [
					{
						title: 'File:Fullsizeoutput 3c9.jpeg',
						pageid: 16,
						descriptionurl: 'http://localhost/mediawiki/index.php/File:Fullsizeoutput_3c9.jpeg',
						thumburl: 'http://localhost/mediawiki/images/thumb/9/97/Fullsizeoutput_3c9.jpeg/800px-Fullsizeoutput_3c9.jpeg',
						thumbheight: 533,
						suggestions: [
							{
								text: 'winter',
								wikidataId: 'Q1311',
								confirmed: false
							},
							{
								text: 'snow',
								wikidataId: 'Q7561',
								confirmed: false
							}
						]
					}
				],
				user: []
			},
			pending: {
				popular: false,
				user: false
			}
		};

		mutations = {
			removeImage: function ( state ) {
				state.images[ state.currentTab ].shift();
			}
		};

		actions = {
			getImages: jest.fn()
		};

		store = new Vuex.Store( {
			state,
			mutations,
			actions
		} );

	} );

	it( 'passes the first image in the appropriate Vuex queue to ImageCard as props', () => {
		const wrapper = VueTestUtils.mount( CardStack, {
			propsData: {
				queue: 'popular'
			},
			store,
			localVue
		} );

		let imageCard = wrapper.find( ImageCard );
		expect( imageCard.vm.image ).toMatchObject( wrapper.vm.currentImage );
	} );

	it( 'does not render the ImageCard component when there are no images in the queue', () => {
		const wrapper = VueTestUtils.shallowMount( CardStack, {
			propsData: {
				queue: 'user'
			},
			store,
			localVue
		} );

		expect( wrapper.contains( ImageCard ) ).toBe( false );
	} );

	it( 'dispatches the getImages action when the count of the image queue reaches zero', done => {
		VueTestUtils.shallowMount( CardStack, {
			propsData: {
				queue: 'popular'
			},
			store,
			localVue
		} );

		expect( actions.getImages ).not.toHaveBeenCalled();
		store.commit( 'removeImage' );

		Vue.nextTick( () => {
			expect( actions.getImages ).toHaveBeenCalled();
			done();
		} );
	} );

	it( 'Clicking a suggestion inside ImageCard does not change the data inside Cardstack', () => {
		const wrapper = VueTestUtils.mount( CardStack, {
			propsData: {
				queue: 'popular'
			},
			store,
			localVue
		} );

		let imageCard = wrapper.find( ImageCard );
		let suggestion = wrapper.find( Suggestion );

		let suggestionInParent = wrapper.vm.currentImage.suggestions[ 0 ];
		let suggestionInChild = imageCard.vm.suggestions[ 0 ];

		expect( suggestionInParent.confirmed ).toBe( false );
		expect( suggestionInChild.confirmed ).toBe( false );
		suggestion.trigger( 'click' );
		expect( suggestionInParent.confirmed ).toBe( false );
		expect( suggestionInChild.confirmed ).toBe( true );
	} );
} );
