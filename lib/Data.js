/***********************************************************************
 *       Module: Data
 *  Description:
 *       Author: Copyright 2012-2014, Tyler Beck
 *      License: MIT
 ***********************************************************************/

define([
	'./Type',
    './util/Object',
	'./util/SelectorTypes'
], function( Type, Util, SelectorType ){

	/*!===============================================
	 * IMPORTANT USAGE NOTE
	 * removeData must be called prior to object
	 * removal in order to unlink and garbage collect
	 *==============================================*/

	/*================================================
	 * Attributes
	 *===============================================*/
	/**
	 * attribute for data storage uid
	 * @private
	 */
	var cacheIDProp = "X-DATA-UID";

	/**
	 * cache for all data storage
	 * @private
	 */
	var cache = {};

	/**
	 * uid for data references
	 * @private
	 */
	var uid = 1;


	/*================================================
	 * Methods
	 *===============================================*/
	/**
	 * get next data uid
	 * @return {int}
	 * @private
	 */
	function nextUid() {
		return uid++;
	}

	/**
	 * links element with data cache
	 * @param {Object} object
	 * @param {Boolean|undefined} create defaults to true,
	 * set to false to prevent creating a cache if one doesn't already exist
	 * @private
	 */
	function getCacheId( object, create ) {
		create = !(create === false);
		//assume if create cache is being called that there is no cache
		var cacheId = object[ cacheIDProp ];
		if ( !cacheId && create ) {
			cacheId = -1;
			//create cacheId
			switch ( Type.get( object ) ) {
				case 'applet':
				case 'embed':
				case 'number':
				case 'date':
				case 'array':
				case 'boolean':
				case 'regexp':
				case 'string':
				case 'textnode':
				case 'commentnode':
					//not supported
					break;
				case 'htmlobject':
					//TODO: implement special case for flash objects
					break;
				case 'function':
				case 'object':
				default:
					cacheId = nextUid();
					object[cacheIDProp] = cacheId;
					break;
			}
		}

		return cacheId;
	}

	/**
	 * gets an object's data for the specified namespace
	 * @param {Object} object the object for which to retrieve data
	 * @param {String} namespace the namespace to retrieve
	 * @param {Boolean|undefined} create namespace data for object if not found,
	 * defaults to false
	 */
	function getData( object, namespace, create ){
		create = !(create === false);
		var cid = getCacheId( object, false );
		namespace = namespace || '_default';
		if ( cache[ namespace ] == undefined || !cid || cache[ namespace ][cid] == undefined ) {
			if (create)
				return setData( object, {}, namespace, false );
			else
				return undefined;
		}
		else{
			return cache[ namespace ][ cid ];
		}
	}

	/**
	 * replaces/updates existing object data
	 * @param {Object} object
	 * @param {Object} data
	 * @param {String} namespace namespace to put data
	 * @param {Boolean|undefined} overwite overwite existing data, defaults to false
	 */
	function setData( object, data, namespace, overwite ) {
		//check for existing cache
		var cid = getCacheId( object, true );

		if ( cache[namespace] == undefined )
			cache[namespace] = {};

		if ( overwite || cache[namespace][cid] == undefined ){
			cache[namespace][cid] = data;
		}
		else{
			//extend current data
			var current = cache[namespace][cid];
			Util.extend( current, data );
		}

		return cache[namespace][cid];
	}

	/**
	 * removes object data
	 * @param {Object} object
	 * @param {String|undefined} namespace namespace to remove data,
	 * removes data from all namespaces if undefined
	 * @param {Boolean|undefined} recursive recurse childNodes to delete data
	 */
	function removeData( object, namespace, recursive ) {
		//remove object data
		var cacheId = getCacheId( object, false );
		var namespaces = [];
		if ( cacheId ) {
			if ( !namespace ) {
				for ( var ns in cache ) {
					namespaces.push( ns );
				}
			}
			else if ( Type.get( namespace ) != 'array' ){
				namespaces.push( namespace );
			}
			else {
				namespaces = namespace;
			}

			namespaces.forEach( function( nsp ) {
				delete cache[nsp][cacheId];
			} )
		}

		if ( recursive !== false ) {
			if ( object.childNodes && Type.get(object.childNodes) == "array") {
				//TODO: optimize iteration
				object.childNodes.forEach( function( item ) {
					removeData( item, namespace, true );
				} );
			}
		}

	}

	/**
	 * gets data for entire namespace
	 * @param {String} namespace the namespace to get from data cache
	 */
	function getNamespaceData( namespace ) {
		namespace = namespace || '_default';
		return cache[ namespace ];
	}

	/*================================================
	 * Selector Extension
	 *===============================================*/
	/**
	 * get selector extension definition
	 * @returns {*}
	 */
	function getSelectorMeta(){
		return {
			data: { type: SelectorType.GETSET, fn: function( object, data, namespace, overwite ){
				if (data)
					setData( object, data, namespace, overwite );
				else
					getData( object, namespace, overwite );
			}, valueIndex: 1 },
			dataRemove: { type: SelectorType.EXEC, fn: removeData }
		};
	}


	/*================================================
	 * Interface
	 *===============================================*/
	return {
		getSelectorMeta: getSelectorMeta,
		get: getData,
		set: setData,
		remove: removeData,
		namespace: getNamespaceData
	}

});