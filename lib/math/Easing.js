/***********************************************************************
 *       Module: Easing
 *  Description:
 *       Author: Copyright 2012-2014, Tyler Beck
 *      License: MIT
 ***********************************************************************/

define([
   './Point',
   './Spline',
   './SplinePoint'
], function( Point ){

	/*================================================
	 * Attributes
	 *===============================================*/
	/**
	 * easing parameters
	 * @type {{back: {a: number, b: number}}}
	 */
	var params = {
		back: { a: 2.7, b: 1.7 }
	};

	/**
	 * optimized easing functions
	 * @type {{back: {easeIn: easeIn, easeOut: easeOut}, bounce: {easeIn: easeIn, easeOut: easeOut}, circular: {easeIn: easeIn, easeOut: easeOut}, cubic: {easeIn: easeIn, easeOut: easeOut}, elastic: {easeIn: easeIn, easeOut: easeOut}, exponential: {easeIn: easeIn, easeOut: easeOut}, quadratic: {easeIn: easeIn, easeOut: easeOut}, quartic: {easeIn: easeIn, easeOut: easeOut}, quintic: {easeIn: easeIn, easeOut: easeOut}, septic: {easeIn: easeIn, easeOut: easeOut}, sine: {easeIn: easeIn, easeOut: easeOut}}}
	 */
	var optimized = {
		//---------------------------------
		back: {
			easeIn: function( t, v, c, d ) {
				return c * (t /= d) * t * (params.back.a * t - params.back.b) + v;
			},
			easeOut: function( t, v, c, d ) {
				return c * ((t = t / d - 1) * t * (params.back.a * t + params.back.b) + 1) + v;
			}
		},
		//---------------------------------
		bounce: {
			easeIn: function( t, v, c, d ) {
				return c - optimized.bounce.easeOut( d - t, 0, c, d ) + v;
			},
			easeOut: function( t, v, c, d ) {
				return ((t /= d) < (1 / 2.75)) ?
				       (c * (7.5625 * t * t) + v) :
				       ( (t < (2 / 2.75)) ?
				         (c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + v) :
				         ( (t < (2.5 / 2.75)) ?
				           (c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + v) :
				           (c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + v)));
			}
		},
		//---------------------------------
		circular: {
			easeIn: function( t, v, c, d ) {
				return -c * (Math.sqrt( 1 - (t /= d) * t ) - 1) + v;
			},
			easeOut: function( t, v, c, d ) {
				return c * Math.sqrt( 1 - (t = t/d - 1) * t ) + v;
			}
		},
		//---------------------------------
		cubic: {
			easeIn: function( t, v, c, d ) {
				return c * (t /= d) * t * t + v;
			},
			easeOut: function( t, v, c, d ) {
				return c * ((t = t / d - 1) * t * t + 1) + v;
			}
		},
		//---------------------------------
		elastic: {
			easeIn: function( t, v, c, d ) {
				if ( t == 0 ) return v;
				if ( (t /= d) == 1 ) return v + c;
				var p,a,s;
				p = d * 0.3;
				a = c;
				s = p / 4;
				return -(a * Math.pow( 2, 10 * (t -= 1) ) * Math.sin( (t * d - s) * (2 * Math.PI) / p )) + v;
			},
			easeOut: function( t, v, c, d ) {
				if ( t == 0 ) return v;
				if ( (t /= d) == 1 ) return v + c;
				var s,a,p;
				p = d * 0.3;
				a = c;
				s = p / 4;
				return a * Math.pow( 2, -10 * t ) * Math.sin( (t * d - s) * (2 * Math.PI) / p ) + c + v;
			}
		},
		//---------------------------------
		exponential: {
			easeIn: function( t, v, c, d ) {
				return (t == 0) ? v : (c * Math.pow( 2, 10 * (t / d - 1) ) + v);
			},
			easeOut: function( t, v, c, d ) {
				return (t == d) ? (v + c) : (c * (-Math.pow( 2, -10 * t / d ) + 1) + v);
			}
		},
		//---------------------------------
		quadratic: {
			easeIn: function( t, v, c, d ) {
				return c * (t /= d) * t + v;
			},
			easeOut: function( t, v, c, d ) {
				return -c * (t /= d) * (t - 2) + v;
			}
		},
		//---------------------------------
		quartic: {
			easeIn: function( t, v, c, d ) {
				return c * (t /= d) * t * t * t + v;
			},
			easeOut: function( t, v, c, d ) {
				return -c * ((t = t / d - 1) * t * t * t - 1) + v;
			}
		},
		//---------------------------------
		quintic: {
			easeIn: function( t, v, c, d ) {
				return c * (t /= d) * t * t * t * t + v;
			},
			easeOut: function( t, v, c, d ) {
				return c * ((t = t / d - 1) * t * t * t * t + 1) + v;
			}
		},
		//---------------------------------
		septic: {
			easeIn: function( t, v, c, d ) {
				return c * (t /= d) * t * t * t * t * t * t + v;
			},
			easeOut: function( t, v, c, d ) {
				return c * ((t = t / d - 1) * t * t * t * t * t * t + 1) + v;
			}
		},
		//---------------------------------
		sine: {
			easeIn: function( t, v, c, d ) {
				return -c * Math.cos( t / d * (Math.PI / 2) ) + c + v;
			},
			easeOut: function( t, v, c, d ) {
				return c * Math.sin( t / d * (Math.PI / 2) ) + v;
			}
		}
	};

	/**
	 * map of easing methods
	 * @type {{}}
	 */
	var methods = {};

	/**
	 * default easing method
	 * @private
	 */
	var defaultEase = "none";

	/*================================================
	 * Methods
	 *===============================================*/
	/**
	 * sets the default easing method
	 * @param {String} ids
	 */
	function setDefaultEase( id ){
		if (methods[ id ]){
			defaultEase = id;
			methods['default'] = methods[id];
		}
	}

	/**
	 * calculates a point on a cubic bezier curve given time and points.
	 * @private
	 * @param {Number} t time 0 <= t <= 1
	 * @param {Point} p0 anchor 1
	 * @param {Point} p1 control 1
	 * @param {Point} p2 control 2
	 * @param {Point} p3 anchor 2
	 * @return {Point}
	 */
	function getPointOnCurve( t, p0, p1, p2, p3 ) {
		var inv = 1 - t;
		return p0.multiply( inv * inv * inv ).add(
			p1.multiply( 3 * inv * inv * t ),
			p2.multiply( 3 * inv * t * t ),
			p3.multiply( t * t * t )
		);
	}

	/**
	 * samples a splines points for use in time based easing
	 * @private
	 * @param {lola.geometry.Spline} spline
	 * @param {uint} resolution per spline section
	 */
	function sampleSpline( spline, resolution ) {
		var points = spline.getPoints();
		var sectionCount = points.length - 1;
		var samples = [];
		if (sectionCount > 0) {
			resolution *= sectionCount;
			var splits = [];
			for (var i = 1; i<= sectionCount; i++ ){
				splits.push( points[i].getAnchor().x );
			}
			//console.log(splits);
			var lastSplit = 0;
			var splitIndex = 0;
			var currentSplit = splits[0];
			for (var s = 0; s<= resolution; s++) {
				//console.log(s);
				var t = s/resolution;
				if (t <= currentSplit){
					t = (t-lastSplit)/(currentSplit-lastSplit);
					//console.log(t);
					var sample = cubicBezier(
						t,
						points[splitIndex].getAnchor(),
						points[splitIndex].getControl2(),
						points[splitIndex+1].getControl1(),
						points[splitIndex+1].getAnchor()
					);
					samples.push( sample );
				}
				else{
					splitIndex++;
					lastSplit = currentSplit;
					currentSplit = splits[ splitIndex ];
					s--;
				}
			}
		}
		return samples;
	}

	/**
	 * registers the an easing method using the given parameters
	 * @param id
	 * @param spline
	 * @param resolution
	 * @param overwrite
	 */
	function registerEasingSpline( id, spline, resolution, overwrite  ){
		resolution = resolution?resolution:25;
		overwrite = overwrite === true;

		var first = spline.getPoint(0).getAnchor();
		var last = spline.getPoint( (spline.getPoints().length - 1) ).getAnchor();

		if ( first.x == 0 && first.y == 0 && last.x == 1 && last.y == 1 ){
			//Todo: make sure spline can be fit to cartesian function

			var Ease = function(){

				var s = sampleSpline( spline, resolution );
				var l = s.length;

				this.getSpline = function(){
					return spline;
				};
				this.getSamples = function(){
					return s;
				};
				this.exec = function( t,v,c,d ){
					t/=d;
					var i = 0;
					//TODO: use a more efficient time search algorithm
					while( t>=s[i].x && i < l ){
						i++;
						if ( t <= s[i].x ){
							var low = s[i-1];
							var high = s[i];
							var p = (t - low.x) / (high.x - low.x);
							return v+c*(low.y+p*(high.y-low.y));
						}
					}

					return 0;
				};

				return this;
			};

			if ( !methods[ id ] || overwrite ){
				methods[ id ] = new Ease();
			}else{
				throw new Error("easing id already taken");
			}

		}else{
			throw new Error("invalid easing spline");
		}
	}

	/**
	 * registers a single section cubic-bezier easing method
	 * @param id
	 * @param p1x
	 * @param p1y
	 * @param p2x
	 * @param p2y
	 */
	function registerSimpleEasing(id,p1x,p1y,p2x,p2y){
		var spline = new Spline();
		var c1 = new Point( p1x, p1y );
		var c2 = new Point( 1-p2x, 1-p2y );
		var v1 = c1.toVector();
		var v2 = c2.toVector();
		spline.addPoint( new SplinePoint( 0, 0, 0, 0, v1.velocity, v1.angle ) );
		spline.addPoint( new SplinePoint( 1, 1, v2.velocity, v2.angle, 0, 0 ) );
		registerEasingSpline( id, spline );
	}

	/**
	 * registers an easing function
	 * @param {String} id
	 * @param {Function} fn
	 */
	function registerEasingFn( id, fn ){
		var Ease = function(){
			this.name = id;
			this.exec = fn;
			return this;
		};

		methods[ id ] = new Ease();
	}

	/**
	 * sets up easing
	 * @private
	 * @return {void}
	 */
	function preinitialize() {
		//do module initialization
		//easing that simulates css timing
		registerSimpleEasing("none", 0, 0, 1, 1);
		registerSimpleEasing("linear", 0, 0, 1, 1);
		registerSimpleEasing("ease", .25, .1, .25, 1);
		registerSimpleEasing("ease-in", .42, 0, 1, 1);
		registerSimpleEasing("ease-out", 0, 0, .58, 1);
		registerSimpleEasing("ease-in-out", .42, 0, .58, 1);

		//create easeInOut functions for types with easeIn and easeOut
		Object.keys(optimized).forEach( function(k){
			if (optimized[k].hasOwnProperty('easeIn') && optimized[k].hasOwnProperty('easeOut')) {
				var ei = optimized[k]["easeIn"];
				var eo = optimized[k]["easeOut"];
				var eio = function( t, v, c, d ){
					return (t < d / 2) ? ( ei(t,v,c/2,d/2) ) : (eo( t - d/2, ei(d,v,c/2,d),c/2,d/2));
				};

				registerEasingFn(k+'-in', ei );
				registerEasingFn(k+'-out', eo );
				registerEasingFn(k+'-in-out', eio );
			}
		} );
		var complete = $.now();
		setDefaultEase('ease-in-out');
	}

	/**
	 * gets a regsitered easing function
	 * @param {String} id
	 */
	function get( id ){
		//console.log("$.easing.get: "+id);
		if (methods[ id ]){
			return methods[ id ];
		}
		else {
			//$.warn('easing method "'+id+'" not found.');
			return methods[ defaultEase ];
		}
	}

	/*================================================
	 * Initialization
	 *===============================================*/
	preinitialize();

	/*================================================
	 * Exports
	 *===============================================*/
	return {
		get: get,
		setDefaultEase: setDefaultEase,
		registerEasingSpline: registerEasingSpline,
		registerSimpleEasing: registerSimpleEasing,
		registerEasingFn: registerEasingFn
	}

});



