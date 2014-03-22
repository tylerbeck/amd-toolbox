/***********************************************************************
 *       Module: Object Utility
 *  Description:
 *       Author: Copyright 2012-2014, Tyler Beck
 *      License: MIT
 ***********************************************************************/

define([

],function(){

	/**
	 * extends obj1 with properties of obj2
	 * @param obj1
	 * @param obj2
	 * @param ignore
	 * @returns {{}}
	 */
	function extend( obj1, obj2, ignore ){
		if ( typeof obj1 == 'object' && typeof obj2 == 'object' ){
			for ( var k in obj2 ){
				if ( obj2.hasOwnProperty(k) && ignore.indexOf( k ) == -1 )
					obj1[ k ] = obj2[ k ];
			}
		}
		return obj1;
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

	return {
		extendObj: extendObj,
		extend: extend
	}

});