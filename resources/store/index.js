'use strict';

var Vue = require( 'vue' ),
	Vuex = require( 'ext.MachineVision.vuex' );

Vue.use( Vuex );

module.exports = new Vuex.Store( {
	state: {
		images: []
	},

	mutations: {
		addImage: function ( state, image ) {
			state.images.push( image );
		}
	}
} );
