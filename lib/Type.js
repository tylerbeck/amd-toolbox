/***********************************************************************
 *       Module: Type
 *  Description:
 *       Author: Copyright 2012-2014, Tyler Beck
 *      License: MIT
 ***********************************************************************/

define([
], function(){

	//==================================================================
	// Attributes
	//==================================================================
	/**
	 * map of types
	 * @private
	 * @type {Object}
	 */
	var map = {};

	/**
	 * primitive types
	 * @private
	 * @type {Array}
	 */
	var primitives = ["boolean","number","string","undefined","null"];

	//==================================================================
	// Methods
	//==================================================================
	/**
	 * creates map of object and element types
	 * @private
	 */
	function createMap(){

		var objTypes = "String Number Date Array Boolean RegExp Function Object Undefined Null";
		var tagTypes = "a abbr acronym address applet area article aside audio b base bdi bdo big body br button canvas caption center cite code col colgroup command datalist dd del details dfn dir div dl dt em embed fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link map mark menu meta meter nav noframes noscript ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strike strong style sub summary sup svg table tbody td textarea tfoot th thead time title tr track tt u ul var video wbrxmp";
		var specialTagTypes ="object";

		objTypes.split(' ').forEach( mapObject );
		tagTypes.split(' ').forEach( mapTag );
		specialTagTypes.split(' ').forEach( mapSpecialTag );

		var tn = document.createTextNode( 'test' );
		var cn = document.createComment( 'test' );
		var tntype = Object.prototype.toString.call( tn );
		var cntype = Object.prototype.toString.call( cn );
		var windowtype = Object.prototype.toString.call( window );

		map[ tntype ] = 'textnode';
		map[ cntype ] = 'commentnode';
		map[ windowtype ] = 'window';

	}

	/**
	 * maps tag type
	 * @param item
	 * @param index
	 * @private
	 */
	function mapTag( item, index ) {
		var tag = document.createElement( item );
		var type = Object.prototype.toString.call( tag );
		var name = type.replace( /\[object HTML/g, "" ).replace( /Element\]/g, "" );
		name = name == "" ? "Element" : name;
		map[ type ] = name.toLowerCase();
	}

	/**
	 * maps special tag types
	 * @param item
	 * @param index
	 * @private
	 */
	function mapSpecialTag( item, index ) {
		var tag = document.createElement( item );
		var type = Object.prototype.toString.call( tag );
		var name = type.replace( /\[object /g, "" ).replace( /Element\]/g, "" ); // keep HTML
		name = name == "" ? "Element" : name;
		map[ type ] = name.toLowerCase();
	}

	/**
	 * maps object types
	 * @param item
	 * @param index
	 * @private
	 */
	function mapObject( item, index ) {
		var type = "[object " + item + "]";
		map[ type ] = item.toLowerCase();
	}

	/**
	 * gets the specified object's type
	 * @param {Object} object
	 * @return {String}
	 */
	function getType( object ) {
		//if ( object ) {
		var type = map[ Object.prototype.toString.call( object ) ];
		if ( type )
			return type;
		return 'other';
	}

	/**
	 * returns true if object is a primitive value
	 * @param object
	 * @returns {boolean}
	 */
	function isPrimitive( object ) {
		return primitives.indexOf( getType(object) ) >= 0;
	}

	//==================================================================
	// initialization
	//==================================================================
	createMap();

	/*================================================
	 * Selector Extension
	 *===============================================*/
	/**
	 * get selector extension definition
	 * @returns {*}
	 */
	function getSelectorMeta(){
		return {
			type: { type: SelectorType.EXEC, fn: getType }
		};
	}


	/*================================================
	 * Interface
	 *===============================================*/
	return {
		getSelectorMeta: getSelectorMeta,
		get: getType,
		isPrimitive: isPrimitive
	}


});