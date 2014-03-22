/***********************************************************************
 *       Module: Selector
 *  Description:
 *       Author: Copyright 2012-2014, Tyler Beck
 *      License: MIT
 ***********************************************************************/

define( [
	'./util/Array',
	'./util/SelectorTypes'
], function( ArrayUtil, SelectorType ) {

	/*================================================
	 * Attributes
	 *===============================================*/
	/**
	 * flag to use external selection library (like Sizzle)
	 * @type {boolean}
	 */
	var useExternalSelectorLib = false;

	/*================================================
	 * Selector Methods
	 *===============================================*/

	/**
	 * helper method for returning single value or array of values
	 * @param values
	 * @returns {*}
	 */
	function v( values ){
		return (values.length == 1) ? values[0] : values;
	}

	/**
	 * Selector method
	 * @param selector
	 * @param context {*|undefined}
	 * @returns {Selector}
	 * @constructor
	 */
	var Selector = function( selector, context ) {

		//counter for setting length
		var n = 0;

		//determine how to process selector
		if ( ArrayUtil.isArray( selector ) ) {
			var sl = selector.length;
			for ( n = 0; n < sl; n++ ) {
				this[n] = selector[n];
			}
		}
		else if ( typeof selector === 'object' ) {
			this[n] = selector;
			n++;
		}
		else if ( typeof selector === "string" ) {
			if ( useExternalSelectorLib ) {
				//TODO: allow use of external selector class like Sizzle
				/*var siz = Sizzle( selector, context );
				 for (n=0; n<sl; n++){
				 this[n] = siz[n];
				 }*/
			}
			else {
				//use querySelectorAll
				try {
					if ( !context ) {
						context = document;
					}

					var nodeList = context.querySelectorAll( selector );
					var nl = nodeList.length;
					for ( n = 0; n < nl; n++ ) {
						this[n] = nodeList.item( n );
					}
					this.length = n;
				}
				catch ( e ) {
					if ( console && console.warn ) {
						console.warn( 'Exception:', selector );
					}
				}
			}
		}
		/*else if (typeof selector == "function") {
		 lola.addInitializer( selector );
		 }
		 else if (selector == undefined && context == undefined ){
		 this[0] = lola;
		 n++;
		 }*/

		this.length = n;

		return this;
	};

	/**
	 * Selector prototype
	 * @type {{}}
	 */
	Selector.prototype = {
		forEach: Array.prototype.forEach,
		every: Array.prototype.every,
		filter: Array.prototype.filter,
		indexOf: Array.prototype.indexOf,
		join: Array.prototype.join,
		lastIndexOf: Array.prototype.lastIndexOf,
		map: Array.prototype.map,
		push: Array.prototype.push,
		pop: Array.prototype.pop,
		shift: Array.prototype.shift,
		unshift: Array.prototype.unshift,
		slice: Array.prototype.slice,
		splice: Array.prototype.splice,
		reverse: Array.prototype.reverse,

		/**
		 * assigns guid to elements
		 * @return {Selector}
		 */
		identify: function() {
			this.forEach( function( item ) {
				//TODO: reimplement using local GUID generator
				//if ( !item.id )
				//	item.id = "lola-guid-" + $.getGUID()
			} );

			return this;
		},

		/**
		 * returns the element at the specified index
		 * @param {int} index
		 * @return {Object}
		 */
		get: function( index ) {
			if ( index == undefined )
				index = 0;
			return this[ index ];
		},

		/**
		 * returns selector with element at the specified index
		 * @param {int} index
		 * @return {Selector}
		 */
		at: function( index ) {
			if ( index == undefined )
				index = 0;
			return Selector( this[ index ] );
		},

		/**
		 * returns all of the selected elements
		 * @return {Array}
		 */
		getAll: function() {
			return this.slice(0);
		},

		/**
		 * returns element count
		 * @return {int}
		 */
		count: function() {
			return this.length;
		},

		/**
		 *concatenates the elements from one or more
		 * @param {Selector|Array|Object} obj object to concatenate
		 * @param {Boolean|undefined} unique
		 * @return {Selector}
		 */
		concat: function( obj, unique ) {

			var self = this;

			if ( obj instanceof Selector || ArrayUtil.isArray( obj ) ){
				obj.forEach( function(item){
					self.unshift( item );
					self.length++;
				})
			}
			else{
				self.unshift( obj );
				self.length++;
			}

			if ( unique == undefined || unique === true ){
				return Selector( ArrayUtil.unique( self ) );
			}

			return self;
		},

		/**
		 * iteration helper method
		 * assumes first argument is a method to call on selector elements
		 * @returns {*|Array}
		 */
		i: function( /* arguments */ ){
			//console.log('i: ', arguments);
			var result = [];
			var selector = this;
			var l = arguments.length;
			//console.log(l);
			if ( l ){
				var fn = arguments[0];
				var args = Array.prototype.slice.call( arguments, 1 );
				this.forEach( function( item ){
					//console.log('args', [ item ].concat(args));
					result.push( fn.apply( selector, [ item ].concat( args ) ) );
				});
			}

			return v( result );
		},

		/**
		 * similar to 'i' helper method, but always returns selector object
		 * @private
		 */
		s: function( /*arguments*/ ){
			//console.log('s: ', arguments);
			this.i.apply( this, arguments );
			return this;
		},


		/**
		 * iterates over elements and applies argument 0 and returns
		 * this if the last argument is undefined, otherwise returns
		 * values. Use for extending value setter/getters on Selector
		 *
		 * @private
		 */
		g: function( /*arguments*/ ){
			//console.log('g: ', arguments);
			var valueIndex = arguments[0];
			var args = Array.prototype.slice.call( arguments, 1 );
			var result = this.i.apply( this, args );
			return ( args[ valueIndex+1 ] == undefined ) ? this : v( result );
		}


	};

	/**
	 * extend Selector prototype with methods that return values
	 */
	Selector.extendModules = function( /*args*/ ){
		var modules = Array.prototype.slice.call( arguments, 0 );
		modules.forEach( function(module){
			if (module.hasOwnProperty('getSelectorMeta')){
				//this is a module
				Selector.extend( module.getSelectorMeta() );
			}
		});
	};


	/**
	 * extend Selector prototype with methods that return values
	 * @param obj
	 */
	Selector.extend = function( obj ){

		//iterate method names
		var names = Object.keys( obj );
		names.forEach( function(name){

			var meta = obj[ name ];

			//make sure required values are set on meta
			if ( meta.type == undefined )
				throw new Error('type must be set.');
			if ( meta.fn == undefined )
				throw new Error('fn must be set.');

			switch( meta.type ){
				case SelectorType.EXEC:
					Selector.prototype[ name ] = function( /*arguments*/ ){
						return this.s.apply( this, [ meta.fn ].concat( ArrayUtil.toArray( arguments ) ) );
					};
					break;

				case SelectorType.AGGREGATE:
					Selector.prototype[ name ] = function( /*arguments*/ ){
						meta.fn.apply( this, [ this.getAll() ].concat( ArrayUtil.toArray( arguments ) ) );
						return this;
					};
					break;

				case SelectorType.ITERATE:
					Selector.prototype[ name ] = function( /*arguments*/ ){
						return this.i.apply( this, [ meta.fn ].concat( ArrayUtil.toArray( arguments ) ) );
					};
					break;

				case SelectorType.GETSET:
					Selector.prototype[ name ] = function( /*arguments*/ ){
						return this.g.apply( this, [ 0, meta.fn ].concat( ArrayUtil.toArray( arguments ) ) );
					};
					break;

				case SelectorType.GETSETKEY:
					if ( meta.valueIndex == undefined )
						throw new Error('valueIndex must be set for GETSET Selector methods.');
					Selector.prototype[ name ] = function( /*arguments*/ ){
						return this.g.apply( this, [ meta.valueIndex, meta.fn ].concat( ArrayUtil.toArray( arguments ) ) );
					};
					break;
			}
		});
	};

	/**
	 * get new selector object
	 * @param selector
	 * @param context
	 * @returns {Selector}
	 */
	Selector.select = function( selector, context ){
		return new Selector( selector, context );
	};

	/*================================================
	 * Interface
	 *===============================================*/
	return Selector;

} );