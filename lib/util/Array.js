/***********************************************************************
 *       Module: Array Utility
 *  Description:
 *       Author: Copyright 2012-2014, Tyler Beck
 *      License: MIT
 ***********************************************************************/

define([

],function(){

	/**
	 * checks an array of objects for a property with value
	 * @public
	 * @param {Array<Object>} array array to check
	 * @param {String} property property to inspect
	 * @param value value to match
	 * @return {Boolean}
	 */
	function hasObjectWithProperty( array, property, value ) {
		var callback = function( item, index, arr ) {
			return item[property] == value;
		};
		return array.some( callback );
	}

	/**
	 * returns a unique copy of the array
	 * @public
	 * @param array
	 * @return {Array}
	 */
	function unique( array ) {
		var tmp = [];
		for (var i = array.length-1; i >= 0; i--){
			if (tmp.indexOf( array[i] ) == -1){
				tmp.push( array[i] );
			}
		}

		return tmp;
	}

	/**
	 * checks if array contains object
	 * @public
	 * @param {Array} array
	 * @return {Boolean}
	 */
	function isIn ( array, value ) {
		return array.indexOf( value ) >= 0;
	}

	/**
	 * removes null values from array
	 * @public
	 * @param {Array} array
	 * @return {Array}
	 */
	function prune( array ) {
		var tmp = [];
		array.forEach( function(item){
			if ( item != null && item != undefined ){
				tmp.push( item );
			}
		});
		return tmp;
	}

	/**
	 * creates a sort function for property
	 * @private
	 * @param {String} property
	 * @return {Function}
	 */
	function getSortFunction( property ){
		return function( a, b ) {
			var x = a[property];
			var y = b[property];
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		};
	}

	/**
	 * sort an array on a property
	 * @param {String} property
	 * @param {Array} array
	 */
	function sortOn( property, array ){
		return array.sort( getSortFunction(property) );
	}

	/**
	 * extends an object with methods from this utility class
	 * @param obj
	 */
	function extendObj( obj ){
		var exclude = ['extend'];
		for ( var k in exports ){
			if ( exports.hasOwnProperty( k ) && exclude.indexOf( k ) < 0 && !obj.hasOwnProperty(k)){
				obj[ k ] = exports[ k ];
			}
		}
	}

	/**
	 * checks if object is an array
	 * @param array
	 * @returns {*}
	 */
	function isArray( array ){
		return Array.isArray( array );
	}

	/**
	 * converts array like objects to arrays
	 * @param arrayLike
	 */
	function toArray( arrayLike ){
		return Array.prototype.slice.call( arrayLike, 0 );
	}


	/**
	 * public methods and properties
	 * @type {{extend: extend, hasObjectWithProperty: hasObjectWithProperty, unique: unique, isIn: isIn, prune: prune, sortOn: sortOn}}
	 */
	return {
		extendObj: extendObj,
		hasObjectWithProperty: hasObjectWithProperty,
		unique: unique,
		isIn: isIn,
		prune: prune,
		sortOn: sortOn,
		isArray: isArray,
		toArray: toArray
	}
});