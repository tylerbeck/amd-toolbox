/***********************************************************************
 *       Module: Spline
 *  Description:
 *       Author: Copyright 2012-2014, Tyler Beck
 *      License: MIT
 ***********************************************************************/

define( [
	'./SplinePoint'
], function( SplinePoint ) {
	/**
	 * Spline class
	 * @class
	 * @param {Array|undefined} points array of spline points
	 * @param {uint} flags
	 */
	var Spline = function( points, flags ) {
		/**
		 * array of {SplinePoint}
		 * @type {Array}
		 * @private
		 */
		points = points ? points : [];

		/**
		 * spline flags
		 * @type {Boolean}
		 */
		flags = flags == undefined ? Spline.BEGIN | Spline.END : flags;

		/**
		 * adds a point at the specified index.
		 * if index is not passed, point will be added at last position
		 * @param {SplinePoint} splinePoint
		 * @param {uint|undefined} index
		 */
		this.addPoint = function( splinePoint, index ) {
			if ( index == undefined )
				index = points.length;

			points.splice( index, 0, splinePoint );
		};

		/**
		 * removes the point at the specified index.
		 * @param {uint} index
		 */
		this.removePoint = function( index ) {
			if ( index != undefined )
				points.splice( index, 1, undefined );
		};

		/**
		 * updates/replaces a point at the specified index.
		 * @param {SplinePoint} splinePoint
		 * @param {uint} index
		 */
		this.updatePoint = function( splinePoint, index ) {
			if ( index != undefined )
				points.splice( index, 1, splinePoint );
		};

		/**
		 * gets the splinePoint at the specified index.
		 * @param {uint} index
		 */
		this.getPoint = function( index ) {
			if ( index < points.length )
				return points[ index ];
			return null;
		};

		/**
		 * gets all splinePoints.
		 */
		this.getPoints = function() {
			return points;
		};

		/**
		 * draws spline
		 * @param {Boolean} close draw a closed spline
		 * @param {Object|String|undefined} ctx
		 */
		this.draw = function( ctx, flgs ) {
			flgs = flgs == undefined ? flags : flgs;
			var sl = points.length;
			//console.log('drawSpline: '+sl);
			if ( sl > 1 ) {
				var p = [];
				//console.log(pts);
				points.forEach( function( item ) {
					p.push( item.getControl1(), item.getAnchor(), item.getControl2() );
				} );
				var pl = p.length;

				if ( flgs & Spline.CONTROLS ) {
					var d = function( q, r ) {
						ctx.beginPath();
						ctx.moveTo( p[q].x, p[q].y );
						ctx.lineTo( p[r].x, p[r].y );
						ctx.stroke();
						ctx.closePath();
					};
					/*for (var n=0; n<pl-3; n+=3){
					 d(n,n+1);
					 d(n+1,n+2);
					 } */
					d( 1, 2 );
					d( 3, 4 );
					//d(n,n+1);
				}

				if ( !(flgs & Spline.NOBEGIN) )
					ctx.beginPath();
				ctx.moveTo( p[1].x, p[1].y );
				for ( var i = 2; i < pl - 3; i += 3 ) {
					ctx.bezierCurveTo(
						p[i].x, p[i].y,
						p[i + 1].x, p[i + 1].y,
						p[i + 2].x, p[i + 2].y
					);
				}

				if ( flgs & Spline.CLOSED ) {
					ctx.bezierCurveTo(
						p[pl - 1].x, p[pl - 1].y,
						p[0].x, p[0].y,
						p[1].x, p[1].y
					);
				}

				if ( flgs & Spline.FILL ) {
					ctx.fill();
				}

				if ( flgs & Spline.STROKE ) {
					ctx.stroke();
				}

				if ( !(flgs & Spline.NOEND) )
					ctx.closePath();

			}
			else {
				throw new Error( 'not enough spline points' );
			}
		};

		/**
		 * translates and / or scales a spline based on the specified bounding points
		 * @param {Point} oldMin
		 * @param {Point} oldMax
		 * @param {Point} newMin
		 * @param {Point} newMax
		 * @param {Boolean|undefined} flipX
		 * @param {Boolean|undefined} flipY
		 * @return {Spline}
		 */
		this.normalize = function( oldMin, oldMax, newMin, newMax, flipX, flipY ) {

			flipX = flipX === true;
			flipY = flipY === true;

			var norm = new Spline();
			var spts = this.getPoints();
			var l = spts.length;
			var oldSize = oldMax.subtract( oldMin );
			var newSize = newMax.subtract( newMin );

			var normalizePoint = function( pt ) {
				pt = pt.subtract( oldMin ).divide( oldSize );
				if ( flipX ) pt.x = 1 - pt.x;
				if ( flipY ) pt.y = 1 - pt.y;
				return pt.multiply( newSize ).add( newMin );
			};

			for ( var i = 0; i < l; i++ ) {
				//get points
				var cp1 = spts[i].getControl1();
				var anch = spts[i].getAnchor();
				var cp2 = spts[i].getControl2();

				//normalize points
				var nanch = normalizePoint( anch );
				var ncv1 = nanch.subtract( normalizePoint( cp1 ) ).toVector();
				var ncv2 = normalizePoint( cp2 ).subtract( nanch ).toVector();

				var np = new SplinePoint( nanch.x, nanch.y, ncv1.velocity, ncv1.angle, ncv2.velocity, ncv2.angle );
				norm.addPoint( np );
			}

			return norm;
		};

		/**
		 * converts object to object list of strings
		 * @return {Object}
		 */
		this.listPoints = function() {
			var pts = {};
			var ct = 0;
			points.forEach( function( item ) {
				pts[ct++] = item.toString();
			} );
			return pts;
		};

		return this;
	};
	Spline.CLOSED = 0x1;
	Spline.FILL = 0x2;
	Spline.STROKE = 0x4;
	Spline.CONTROLS = 0x8;
	Spline.NOBEGIN = 0x10;
	Spline.NOEND = 0x11;

	return Spline;

} );