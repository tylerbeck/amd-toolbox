/***********************************************************************
 *       Module: Animation
 *  Description: Top-level animation controller
 *       Author: Copyright 2012-2014, Tyler Beck
 *      License: MIT
 ***********************************************************************/

define( [

], function() {

	//==================================================================
	// Attributes
	//==================================================================

	/**
	 * animation uid generator
	 * @private
	 */
	var freeAnimationIds = [];

	/**
	 * map of animations
	 * @private
	 */
	var animations = {};

	/**
	 * indicates whether module is ticking
	 * @private
	 */
	var active = false;

	/**
	 * frame type
	 * @private
	 */
	var animationFrameType = 0;

	/**
	 * timeout for browsers that don't support animationFrame
	 * @private
	 */
	var timeout = 1000 / 30;

	/**
	 * event handler
	 * @param target
	 * @param event
	 * @param bubble
	 * @param capture
	 */
	var dispatchEvent = function( target, event, bubble, capture ) {
		//this is the default event handler... it doesn't do anything.
	};

	//==================================================================
	// Getters & Setters
	//==================================================================


	//==================================================================
	// Methods
	//==================================================================
	/**
	 * sets the function that handles dispatching events
	 * @param fn function( target, event, bubble, capture )
	 */
	function setEventDispatcher( fn ) {
		if ( typeof fn == 'function' )
			dispatchEvent = fn;
	}

	/**
	 * start ticking
	 */
	function startTicking() {
		//console.log('startTicking:',active);
		if ( !active ) {
			active = true;
			requestTick();
		}
	}

	/**
	 * set callback for animation frame
	 * @private
	 */
	function requestTick() {
		requestFrame( tick );
	}

	/**
	 * set callback for animation frame
	 * @param {Function} callback
	 */
	function requestFrame( callback ) {
		if ( animationFrameType == 1 )
			window.requestAnimationFrame( callback );
		else if ( animationFrameType == 2 )
			window.mozRequestAnimationFrame( callback );
		else if ( animationFrameType == 3 )
			window.webkitRequestAnimationFrame( callback );
		else if ( animationFrameType == 4 )
			window.oRequestAnimationFrame( callback );
		else
			setTimeout( callback, timeout );
	}

	/**
	 * registers a animation with the framework
	 * @param name
	 * @param {Animation} animation
	 */
	function register( name, animation ) {
		animations[ name ] = animation;
	}

	/**
	 * removes a registered animation
	 * @param {string} name
	 */
	function remove( name ) {
		if ( animations[name] ) {
			delete animations[name];
		}
	}

	/**
	 * starts the referenced animation
	 * @param {string} name
	 * @private
	 */
	function start( name ) {
		if ( animations[ name ] ) {
			animations[ name ].start();
		}
	}

	/**
	 * stops the referenced animation
	 * @param name
	 */
	function stop( name ) {
		if ( animations[ name ] ) {
			animations[ name ].stop();
		}
	}

	/**
	 * pauses the referenced animation
	 * @param name
	 */
	function pause( name ) {
		if ( animations[ name ] ) {
			animations[ name ].pause();
		}
	}

	/**
	 * resumes the referenced animation
	 * @param name
	 */
	function resume( name ) {
		if ( animations[ name ] ) {
			animations[ name ].resume();
		}
	}

	/**
	 * executes a frame tick for animationing engine
	 * @private
	 */
	function tick() {
		//console.log( 'Animation.tick', animations);

		//iterate through animations and check for active state
		//if active, run position calculation on animations
		var activityCheck = false;
		var now = Date.now();
		for ( var k in animations ) {
			//console.log('   ',k )
			var anim = animations[ k ];
			if ( anim.isActive() ) {
				activityCheck = true;
				if ( !anim.isComplete() ) {
					anim.enterFrame( now );
				}
				else {
					//catch complete on next tick
					//TODO: handle animation complete
					dispatchEvent( anim, 'animationcomplete', false, false );
					delete animations[ k ];
					freeAnimationIds.push( parseInt( k ) );
				}
			}
		}

		if ( activityCheck ) {
			requestTick();
		}
		else {
			active = false;
		}
	}

	//==================================================================
	// Class Object
	//==================================================================
	/**
	 * Animation Class
	 * @namespace Animation
	 * @param name
	 * @param tickFn tick( now, delta, elapsed )
	 * @param tickScope
	 * @returns {Animation}
	 * @constructor
	 */
	var Animation = function( name, tickFn, tickScope ) {
		var self = this;
		var startTime = -1;
		var pauseTime = -1;
		var lastTime = -1;
		var active = false;
		var complete = false;
		var tick = (typeof tickFn === "function") ? tickFn : function() {
			return false;
		};

		/**
		 * enter frame handler
		 * @param now
		 */
		this.enterFrame = function( now ) {
			var delta = now - lastTime;
			var elapsed = now - startTime;
			lastTime = now;
			active = tick.call( tickScope, now, delta, elapsed );
		};

		/**
		 * gets the current activity status
		 * @returns {boolean}
		 */
		this.isActive = function() {
			return active;
		};

		/**
		 * gets the current complete status
		 * @returns {boolean}
		 */
		this.isComplete = function() {
			return complete;
		};

		/**
		 * starts an inactive animation
		 */
		this.start = function() {
			if ( !active ) {
				this.restart();
			}
		};

		/**
		 * pauses an active animation
		 */
		this.pause = function() {
			if ( active ) {
				active = false;
				pauseTime = Date.now();
				dispatchEvent( self, 'animationpause', false, false );
			}
		};

		/**
		 * resumes a paused animation
		 */
		this.resume = function() {
			if ( !active ) {
				active = true;
				startTime += Date.now() - pauseTime;
				startTicking();
				dispatchEvent( self, 'animationresume', false, false );
			}
		};

		/**
		 * restarts an animation
		 */
		this.restart = function() {
			active = true;
			complete = false;
			startTime = lastTime = Date.now();
			startTicking();
			dispatchEvent( self, 'animationstart', false, false );
		};

		/**
		 * stops an animation
		 */
		this.stop = function() {
			active = false;
			complete = true;
			dispatchEvent( self, 'animationstop', false, false );
		};

		//register with animation framework
		register( name, this );

		return this;
	};

	Animation.register = register;
	Animation.remove = remove;
	Animation.start = start;
	Animation.stop = stop;
	Animation.pause = pause;
	Animation.resume = resume;

	//==================================================================
	// Initialization
	//==================================================================
	//determine animation frame type
	if ( window.requestAnimationFrame )
		animationFrameType = 1;
	else if ( window.mozRequestAnimationFrame )
		animationFrameType = 2;
	else if ( window.webkitRequestAnimationFrame )
		animationFrameType = 3;
	else if ( window.oRequestAnimationFrame )
		animationFrameType = 4;


	return Animation;

} );