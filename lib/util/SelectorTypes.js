define([
], function(){

	return {
		/**
		 * Selector method getter setter type
		 * @type {number}
		 */
		GETSET: 0,

		/**
		 * Selector method getter setter type
		 * @type {number}
		 */
		GETSETKEY: 1,

		/**
		 * Selector method iterator type
		 * @type {number}
		 */
		ITERATE: 2,

		/**
		 * Selector method execution type, passes each selected item to method
		 * @type {number}
		 */
		EXEC: 3,
		/**
		 * Selector method aggregate type, passes all selected items to method
		 * @type {number}
		 */
		AGGREGATE: 4


	};
});
