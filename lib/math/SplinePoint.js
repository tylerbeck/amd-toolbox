/***********************************************************************
 *       Module: Spline Point
 *  Description:
 *       Author: Copyright 2012-2014, Tyler Beck
 *      License: MIT
 ***********************************************************************/

define( [
    './Point',
    './Vector'
], function( Point, Vector ) {

	/**
	 * Represents a control point for a spline
	 * @param anchorX
	 * @param anchorY
	 * @param entryStrength
	 * @param entryAngle
	 * @param exitStrength
	 * @param exitAngle
	 * @returns {SplinePoint}
	 * @constructor
	 */
	var SplinePoint = function( anchorX, anchorY, entryStrength, entryAngle, exitStrength, exitAngle ) {
		/**
		 * splinepoint anchor point
		 * @type {Point|undefined}
		 */
		var anchor;

		/**
		 * splinepoint entry vector
		 * @type {Vector|undefined}
		 */
		var entry;

		/**
		 * splinepoint exit vector
		 * @type {Vector|undefined}
		 */
		var exit;

		/**
		 * sets the SplinePoint's entry and exit angles
		 * if exitAngle is omitted, exitAngle is set to entryAngle + PI both
		 * @param {Number|undefined} entryAngle
		 * @param {Number|undefined} exitAngle
		 */
		this.setAngle = function( entryAngle, exitAngle) {
			entry.angle = entryAngle;
			exit.angle = exitAngle==undefined?entryAngle+Math.PI:exitAngle;
		};

		/**
		 * sets the SplinePont's entry vector
		 * @param {Vector} vector
		 */
		this.setEntry = function( vector ) {
			entry = vector;
		};

		/**
		 * sets the SplinePoint's exit vector
		 * @param {Vector} vector
		 */
		this.setExit = function( vector ) {
			exit = vector;
		};

		/**
		 * gets the spline point's anchor
		 * @return {Point}
		 */
		this.getAnchor =function(){
			return anchor;
		};

		/**
		 * gets the spline point's entry control point
		 * @param {Boolean} vector
		 * @return {Point}
		 */
		this.getControl1 = function( vector ){
			if (vector) return entry;
			return anchor.subtract( entry.toPoint() );
		};

		/**
		 * gets the spline point's exit control point
		 * @param {Boolean} vector
		 * @return {Point}
		 */
		this.getControl2 = function( vector ){
			if (vector) return exit;
			return anchor.add( exit.toPoint() );
		};

		/**
		 * converts object to readable string
		 * @return {String}
		 */
		this.toString = function(){
			return [anchor,entry,exit].join(" ");
		};

		//initialize
		anchor = new Point( anchorX, anchorY );
		entry = new Vector( entryStrength, entryAngle );
		exit = new Vector( exitStrength, exitAngle==undefined?entryAngle+Math.PI:exitAngle );

		return this;
	};

	return SplinePoint;

} );
