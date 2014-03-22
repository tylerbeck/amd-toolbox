/***********************************************************************
 *       Module: XEvent
 *  Description:
 *       Author: Copyright 2012-2014, Tyler Beck
 *      License: MIT
 ***********************************************************************/

define([
    './Type',
    './util/Object',
    './DOM',
    './Data',
    './util/Array',
	'./util/SelectorTypes'
], function( Type, Util, DOM, Data, ArrayUtil, SelectorType ){

	/*================================================
	 * Attributes
	 *===============================================*/
	/**
	 * event maping
	 * @type {Object}
	 * @private
	 */
	var map = { 'mousewheel':['mousewheel','DOMMouseScroll'] };

	/**
	 * event hooks
	 * @type {Object}
	 * @private
	 */
	var hooks = {};

	/**
	 * event listener uid
	 * @type {int}
	 * @private
	 */
	var uid = 0;

	/**
	 * event data namespace
	 * @type {string}
	 */
	var dataNamespace = "_event";

	/**
	 * use dom event
	 * @type {boolean}
	 */
	var domEvent = document.addEventListener != undefined;

	/**
	 * use attach event
	 * @type {boolean}
	 */
	var msEvent = document.attachEvent != undefined;



	/*================================================
	 * Event Methods
	 *===============================================*/
	/**
	 * add hook to event hooks
	 * @param {String} type
	 * @param {Object} object
	 */
	function addHook( type, object ){
		hooks[ type ] = object;
	}

	/**
	 * returns actual event phase to use
	 * @param {Object} target
	 * @param {Boolean|undefined} useCapture
	 * @return {String}
	 */
	function phaseString( target, useCapture ) {
		return ((useCapture && (domEvent || msEvent)) || (!target.dispatchEvent && !target.attachEvent)) ? 'capture' : 'bubble';
	}

	/**
	 * add a framework event listener
	 * @param {Object} target
	 * @param {String} type
	 * @param {Function} handler
	 * @param {Boolean|undefined} useCapture
	 * @param {uint|undefined} priority default 0xFFFFFF
	 * @param {Object|undefined} scope
	 * @param {Boolean|undefined} useHooks
	 */
	function addListener( target, type, handler, useCapture, priority, scope, useHooks ) {
		//var required = [['target',target],['type',type],['handler',handler]];
		//var info = [target,'type: '+type,'useCapture: '+useCapture];
		//if ( $.util.checkArgs('ERROR: lola.event.addListener( '+type+' )', required, info) ){
			if (useHooks !== false && hooks[type] != null){
				var hook = hooks[type];
				return hook.addListener( target, type, handler, useCapture, priority, hook );
			}
			else {
				var data = Data.get( target, dataNamespace );
				if ( !data ) {
					data = { capture:{}, bubble:{} };
					Data.set( target, data, dataNamespace, true );
				}

				var phase = phaseString( target, useCapture );
				priority = priority || XEvent.PRIORITY_NORMAL;
				scope = scope || target;

				//assign handler a uid so it can be easily referenced
				if ( !handler.uid )
					handler.uid = ++uid;

				if ( data[phase] == null )
					data[phase] = {};
				if ( data[phase][type] == null )
					data[phase][type] = {};

				data[phase][type][handler.uid] = {priority:priority, uid:handler.uid, handler:handler, scope:scope };


				//since duplicate dom listeners are discarded just add listener every time
				// function checks if event listener can actually be added
				if ( phase == 'capture' )
					addDOMListener( target, type, captureHandler, true );
				else
					addDOMListener( target, type, bubbleHandler, false );

				return uid;
			}
		//}
	}

	/**
	 * remove a framework event listener
	 * @param {Object} target
	 * @param {String} type
	 * @param {Function} handler
	 * @param {Boolean|undefined} useCapture
	 * @param {Boolean|undefined} useHooks
	 */
	function removeListener( target, type, handler, useCapture, useHooks ) {
		//var required = [['target',target],['type',type],['handler',handler]];
		//var info = [target,'type: '+type,'useCapture: '+useCapture];
		//if ( $.util.checkArgs('ERROR: lola.event.removeListener( '+type+' )', required, info) ){
			if (useHooks !== false && hooks[type] != null){
				hooks[type]['removeListener'].call( hooks[type], target, type, handler, useCapture );
			}
			else {
				var data = Data.get( target, dataNamespace );
				if ( !data ) data = { capture:{}, bubble:{} };
				var phase = phaseString( target, useCapture );
				//get handler uid
				var uid = Type.get( handler ) == 'function' ? handler.uid : handler;
				if (data && data[phase] && data[phase][type] ){
					delete data[phase][type][uid];
					//if there are no more listeners in stack remove handler
					// function checks if event listener can actually be removed
					if ( data[phase][type] && Object.keys( data[phase][type] ).length == 0 ) {
						delete data[phase][type];
						if ( phase == 'capture' )
							removeDOMListener( target, type, captureHandler, true );
						else
							removeDOMListener( target, type, bubbleHandler, false );

					}
				}
			}
		//}
	}

	/**
	 * removes all listeners associated with handler
	 * @param {String|Array} types
	 * @param {Function} handler
	 * @param {Boolean|undefined} useCapture
	 */
	function removeHandler( handler, types, useCapture ) {
		//console.info( '$.event.removeHandler: '+type+' '+capture );
		var required = [['handler',handler]];
		var info = [];
		//if ( $.utils.checkArgs('ERROR: lola.event.removeHandler', required, info) ){
			//get handler uid
			var uid = ""+(Type.get( handler ) == 'function' ? handler.uid : handler);

			//get event data
			var data = Data.namespace( dataNamespace );
			if ( data ) {
				var ctypes = (useCapture == undefined) ? ['capture','bubble'] : useCapture ? ['capture'] : ['bubble'];
				//iterate data
				for ( var oid in data ) {
					if ( types != undefined )
						types = Type.get( types ) == 'array' ? types : [types];
					for ( var phase in ctypes ) {
						var type;
						if ( types ) {
							for ( type in types ) {
								if ( data[oid][phase][type] )
									delete  data[oid][phase][type][uid];
							}
						}
						else {
							for ( type in data[oid][phase] ) {
								delete  data[oid][phase][type][uid];
							}
						}
						//rempve DOM listener if needed
						if ( Object.keys( data[oid][phase][type] ).length == 0 )
							removeDOMListener( target, type, (phase == 'capture') ? captureHandler : bubbleHandler, (phase == 'capture') );
					}
				}
			}
		//}
	}

	/**
	 * internal capture listener
	 * @param {Object} event
	 * @private
	 */
	function captureHandler( event ) {
		event = event || window.event;
		handler( event, 'capture' )
	}

	/**
	 * internal bubble listener
	 * @param {Object} event
	 * @private
	 */
	function bubbleHandler( event ) {
		event = event || window.event;
		handler( event, 'bubble' )
	}

	/**
	 * internal listener
	 * @private
	 * @param {Object} event
	 * @param {String} phase
	 */
	function handler( event, phase ) {
		event = event ? event : window.event;
		//console.log( '$.event.handler: '+event.type+' '+phase );

		var e = (event.originalEvent) ? event : new XEvent( event, {} );
		var data = Data.get( e.currentTarget, dataNamespace );
		if ( data && data[phase] && data[phase][event.type] ) {
			//console.info('    found event');
			var stack = [];
			for ( var uid in data[phase][event.type] ) {
				stack.push( data[phase][event.type][uid] );
			}
			//stack = stack.sort( $.util.prioritySort );
			stack = ArrayUtil.sortOn( 'priority', stack );
			for ( var i in stack ) {
				if ( e._immediatePropagationStopped )
					break;
				var obj = stack[i];
				if ( obj.handler )
					obj.handler.call( obj.scope, e );
				else
					delete data[phase][event.type][obj.uid];
			}
		}
	}

	/**
	 * triggers a framework event on an object
	 * @param {Object} object
	 * @param {String} type
	 * @param {Boolean|undefined} bubbles
	 * @param {Boolean|undefined} cancelable
	 * @param {Object|undefined} data
	 */
	function trigger( object, type, bubbles, cancelable, data ) {
		//console.log('$.event.trigger:',type, object);
		//var args = [object, type];
		//var names = ['target','type'];
		//var group = 'lola.event.trigger: type='+type+' bubbles='+bubbles;
		//if ( $.util.checkArgs(args, names, group) ){
			//console.log('   valid');
			if ( bubbles == undefined )
				bubbles = true;
			if ( cancelable == undefined )
				cancelable = true;

			var event = type;
			if ( Type.get( event ) === 'string' ) {
				//console.log('   event is string');
				event = document.createEvent( "Event" );
				//console.log(event);
				event.initEvent( type, bubbles, cancelable );
				event.data = data;
			}

			if ( object.dispatchEvent ) {
				//console.log('   dispatching object event', event);
				object.dispatchEvent( event );
			}
			else {
				//console.log('   dispatching xevent');
				event = new XEvent( event, object );
				handler( event, 'capture' );
				if (bubbles)
					handler( event, 'bubble' );
			}
		//}
	}


	/**
	 * add a DOM event listener
	 * @param {Object} target
	 * @param {String} type
	 * @param {Function} handler
	 * @param {Boolean|undefined} useCapture
	 */
	function addDOMListener( target, type, handler, useCapture ) {
		type = map[type] ? map[type] : [type];
		type.forEach( function(t) {
			try {
				if ( domEvent && target.addEventListener )
					target.addEventListener( t, handler, useCapture );
				else if ( msEvent && target.attachEvent )
					target.attachEvent( 'on' + t, handler );
				else if ( target['on' + t.toLowerCase()] == null )
					target['on' + type.toLowerCase()] = handler;
			}
			catch( error ) {
				//errors here are because we can't add dom events to some object types
				//$.syslog( 'lola.event.addDOMListener error:', target, t, handler, useCapture );
			}
		} );
	}

	/**
	 * remove a DOM event listener
	 * @param {Object} target
	 * @param {String} type
	 * @param {Function} handler
	 * @param {Boolean|undefined} useCapture
	 */
	function removeDOMListener( target, type, handler, useCapture ) {
		type = map[type] ? map[type] : [type];
		type.forEach( function(t) {
			try {
				if ( domEvent && target.removeEventListener )
					target.removeEventListener( t, handler, useCapture );
				else if ( msEvent && target.detachEvent )
					target.detachEvent( 'on' + t, handler );
				else if ( target['on' + t.toLowerCase()] == null )
					delete target['on' + t.toLowerCase()];
			}
			catch( error ) {
				//errors here are because we can't remove dom events from some object types
				//$.syslog( 'lola.event.removeDOMListener error:', target, t, handler, useCapture );
			}
		} );
	}

	/**
	 * creates a new xevent
	 * @param event
	 * @param target
	 * @returns {XEvent}
	 */
	function createNew( event, target ){
		return new XEvent( event, target );
	}

	/**
	 * gives an object an xevent interface; can be used on objects or prototypes
	 * @param obj
	 */
	function make( obj ){

		obj.on = obj.bind = function( type, handler, useCapture, priority, scope, useHooks ){
			addListener( this, type, handler, useCapture, priority, scope, useHooks );
		};

		obj.off = obj.unbind = function( type, handler, useCapture, useHooks ){
			removeListener( this, type, handler, useCapture, useHooks );
		};

		obj.trigger = function( type, bubbles, cancelable, data ){
			trigger( this, type, bubbles, cancelable, data );
		}

	}


	/*================================================
	 * Utility Methods
	 *===============================================*/

	function after( items, event, handler, timeout ){

		//create a context for tracking each set of items
		var ctx = {};
		make( ctx );
		ctx.count = items.length;
		ctx.results = [];
		ctx.timeout = -1;
		ctx.handler = function( e ){
			ctx.results.push( e.data );
			//only need to listen for event once... remove listener
			removeListener( e.currentTarget, event, ctx.handler );
			if (ctx.count == ctx.results.length){
				//clear timeout if set
				clearTimeout( ctx.timeout );
				//trigger complete event
				ctx.trigger('complete', undefined, undefined, ctx.results );
			}
		};

		//if a timeout has been specified stop listing after specified time.
		if ( timeout ){
			ctx.timeout = setTimeout( function(){
				for ( var i=0, l=0; i<items.length; i++ ){
					//remove listener to allow proper garbage collection
					removeListener( items[i], event, ctx.handler );
				}
				ctx.trigger('complete', undefined, undefined, false );
			}, timeout );
		}

		//trigger specified handler once the context triggers complete
		ctx.on( 'complete', handler );

		//add event listeners for each item
		for ( var i=0, l=0; i<items.length; i++ ){
			var item = items[i];
			if (item.hasOwnProperty('on')){
				item.on( event, ctx.handler );
			}
		}

	}

	/*================================================
	 * Event Building Methods
	 *===============================================*/
	/**
	 * gets the dom target
	 * @param {Object} event
	 * @param {Object} target
	 * @return {Object}
	 */
	function getDOMTarget( event, target ) {
		if ( event ) {
			if ( event.currentTarget )
				target = event.currentTarget;
			else if ( event.srcElement )
				target = event.srcElement;

			if ( target && target.nodeType == 3 ) // defeat Safari bug
				target = target.parentNode;
		}
		return target;
	}

	/**
	 * returns global and local x,y coordinates of event
	 * @param {Event} e
	 * @return {Object}
	 */
	function getXY( e ) {
		var globalX = 0;
		var globalY = 0;
		var localX = e.offsetX || undefined;
		var localY = e.offsetY || undefined;

		if ( e.pageX || e.pageY ) {
			globalX = e.pageX;
			globalY = e.pageY;
		}
		else if ( e.clientX || e.clientY ) {
			globalX = e.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
			globalY = e.clientY + document.documentElement.scrollTop + document.body.scrollTop;
		}

		if ( e.currentTarget != undefined && ( localX == undefined || localY == undefined ) ){
			var trgOffset = DOM.getOffset( e.currentTarget );

			localX = globalX - trgOffset.x;
			localY = globalY - trgOffset.y;
		}


		return {
			globalX: globalX,
			globalY: globalY,
			localX: localX,
			localY: localY
		};
	}

	/**
	 * @description returns key code for key events
	 * @param {Event} e
	 * @return {int}
	 */
	function getDOMKeycode( e ) {
		var code;
		if ( e.keyCode )
			code = e.keyCode;
		else if ( e.which )
			code = e.which;

		return code;
	}

	/**
	 * returns key string for key events
	 * @param {Event} e
	 * @return {String}
	 */
	function getDOMKey( e ) {
		var code = getDOMKeycode(e);
		if (code > 0xFFFF) {
			code -= 0x10000;
			return String.fromCharCode(0xD800 + (code >> 10), 0xDC00 + (code & 0x3FF));
		}
		else {
			return String.fromCharCode(code);
		}
	}


	/*================================================
	 * Event Class
	 *===============================================*/
	/**
	 * XEvent constructor
	 * @param event
	 * @param target
	 * @returns {XEvent}
	 * @constructor
	 */
	var XEvent = function( event, target ){
		this.init( event, target );
		return this;
	};

	/**
	 * XEvent prototype
	 * @type {{originalEvent: null, propagationStopped: boolean, immediatePropagationStopped: boolean, target: null, currentTarget: null, globalX: null, globalY: null, key: null, init: init, preventDefault: preventDefault, stopPropagation: stopPropagation, stopImmediatePropagation: stopImmediatePropagation}}
	 */
	XEvent.prototype = {
		/**
		 * reference to original event
		 * @type {Event}
		 */
		originalEvent: null,

		/**
		 * flag for propagation stopped
		 * @type {Boolean}
		 * @private
		 */
		propagationStopped: false,

		/**
		 * flag for immediate propagation stopped
		 * @type {Boolean}
		 * @private
		 */
		immediatePropagationStopped: false,

		/**
		 * event's target
		 * @type {Object}
		 */
		target: null,

		/**
		 * event's currentTarget
		 * @type {Object}
		 */
		currentTarget: null,

		/**
		 * global x position (Mouse/Touch Events)
		 * @type {Number}
		 */
		globalX: null,

		/**
		 * global y position (Mouse/Touch Events)
		 * @type {Number}
		 */
		globalY: null,

		/**
		 * key code for Key Events
		 * @type {int}
		 */
		key: null,

		/**
		 * class initializer
		 * @param {Event} event
		 * @param {Object} target
		 */
		init: function( event, target ) {
			//target, source, overwrite, errors, deep, ignore
			Util.extend( this, event, ['layerX','layerY'] );
			this.originalEvent = event;
			this.target = event.target;
			this.currentTarget = getDOMTarget( event, target );
			var pos = getXY( event );
			this.globalX = pos.globalX;
			this.globalY = pos.globalY;
			this.localX = pos.localX;
			this.localY = pos.localY;

			this.key = getDOMKey( event );

			if (event.wheelDelta || event.axis){
				var wdo = { x:event.wheelDeltaX, y:event.wheelDeltaY };
				if (event.axis){
					wdo.x = -3 * ((event.axis === 2) ? 0 : event.detail);
					wdo.y = -3 * ((event.axis === 1) ? 0 : event.detail);
				}
			}

			this.wheelDelta = wdo;
		},

		/**
		 * prevents an events default behavior
		 */
		preventDefault: function(){
			if (this.originalEvent.preventDefault)
				this.originalEvent.preventDefault();
			return false;
		},

		/**
		 * stops event propagation
		 */
		stopPropagation: function(){
			this.originalEvent.stopPropagation();
			this.propagationStopped = true;
		},

		/**
		 * stops immediate event propagation
		 */
		stopImmediatePropagation: function(){
			this.originalEvent.stopImmediatePropagation();
			this.immediatePropagationStopped = true;
		}
	};

	XEvent.PRIORITY_BEFORE = 1;
	XEvent.PRIORITY_FIRST = 0x400000;
	XEvent.PRIORITY_NORMAL = 0x800000;
	XEvent.PRIORITY_LAST= 0xC00000;
	XEvent.PRIORITY_AFTER = 0xFFFFFF;
	XEvent.domEvent = domEvent;
	XEvent.msEvent = msEvent;

	/*================================================
	 * Selector Extension
	 *===============================================*/
	/**
	 * get selector extension definition
	 * @returns {*}
	 */
	function getSelectorMeta(){
		return {
			make: { type: SelectorType.EXEC, fn: make },
			on: { type: SelectorType.EXEC, fn: addListener },
			off: { type: SelectorType.EXEC, fn: removeListener },
			after: { type: SelectorType.AGGREGATE, fn: after },
			trigger: { type: SelectorType.EXEC, fn: trigger }
		};
	}



	/*================================================
	 * Interface
	 *===============================================*/
	return {
		getSelectorMeta: getSelectorMeta,
		addListener: addListener,
		removeListener: removeListener,
		removeHandler: removeHandler,
		trigger: trigger,
		addHook: addHook,
		make: make,
		create: createNew,
		XEvent: XEvent
	}

});