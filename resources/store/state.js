'use strict';

module.exports = {
	currentTab: 'popular',

	images: {
		popular: [],
		user: []
	},

	fetchPending: {
		popular: false,
		user: false
	},

	fetchError: {
		popular: false,
		user: false
	},

	publishPending: false,

	unreviewedCount: 0,

	userStats: {},

	imageMessages: []
};
