/***********************************************************************
 *       Module: DOM
 *  Description:
 *       Author: Copyright 2012-2014, Tyler Beck
 *      License: MIT
 ***********************************************************************/

define( [
	'./Type',
	'./util/SelectorTypes',
	'./math/Point'
], function( Type, SelectorType, Point ) {

	/*================================================
	 * Attributes
	 *===============================================*/
	/**
	 * map of attribute getter/setter hooks
	 * @private
	 * @type {Object}
	 */
	var attributeHooks = {};


	/*================================================
	 * Methods
	 *===============================================*/
	/**
	 * sets or gets an node attribute
	 * @param {Object} object the object on which to access the attribute
	 * @param {String} name the name of the attribute
	 * @param {*} value (optional) value to set
	 * @param {Boolean} value (optional) value to set
	 */
	function attr( object, name, value, useHooks ) {
		if ( useHooks !== false && attributeHooks[ name ] ) {
			return attributeHooks[name].apply( object, arguments );
		}
		else if ( object ) {
			if ( value || value == "" ) {
				//set value
				if ( Type.isPrimitive( value ) ) {
					return object[name] = value;
				}
				else {
					throw new Error( 'attribute values must be primitives' );
				}
			}
			else {
				//get value
				return object[ name ];
			}
		}
	}


	/**
	 * returns offset of object relative to descendant or root
	 * @param {Element} elem
	 * @param {Element|undefined} relativeTo get offset relative to this element
	 *
	 */
	function getOffset( elem, relativeTo ) {
		var point = new Point( elem.offsetLeft, elem.offsetTop );
		if ( elem.offsetParent ) {
			var parent = self.getOffset( elem.offsetParent );
			point = point.add( parent );
		}
		if ( relativeTo ) {
			var relative = self.getOffset( relativeTo );
			point = point.subtract( relative );
		}
		return point;
	}


	/**
	 * gets the size of an element
	 * @param elem
	 * @returns {math.Point}
	 */
	function getSize( elem ){

		var w = -1,
			h = -1;
		if ( Type.get( elem ) == 'window' ){
			w = elem.innerWidth;
			h = elem.innerHeight;
		}
		else{
			w = elem.offsetWidth;
			h = elem.offsetHeight;
		}

		return new Point( w, h );
	}



	//TODO: add more DOM manipulation methods

	/*================================================
	 * Selector Extension
	 *===============================================*/
	/**
	 * get selector extension definition
	 * @returns {*}
	 */
	function getSelectorMeta(){
		return {
			attr: { type: SelectorType.GETSETKEY, fn: attr, valueIndex: 2 },
			offset: { type: SelectorType.ITERATE, fn: getOffset },
			size: { type: SelectorType.ITERATE, fn: getSize }
		};
	}

	/*================================================
	 * Interface
	 *===============================================*/
	return {
		getSelectorMeta: getSelectorMeta,
		getOffset: getOffset,
		attr: attr
	};

} );