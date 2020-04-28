'use strict';

module.exports = {
	currentTab: 'popular',

	images: {
		popular: [],
		user: []
	},

	pending: {
		popular: false,
		user: false
	},

	/**
	 * @TODO Currently four possible status states exist:
	 * - "success"
	 * - "error"
	 * - "pending"
	 * - null (default)
	 *
	 * It may be time to think about enforcing a consistent and constrained
	 * list of states here and in the corresponding mutation, maybe by defining
	 * publish states in an external object and importing them here
	 */
	publishStatus: null,

	userStats: {}
};
