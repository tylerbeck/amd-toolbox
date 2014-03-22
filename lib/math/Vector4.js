/***********************************************************************
 *       Module: Vector4
 *  Description:
 *       Author: Copyright 2012-2014, Tyler Beck
 *      License: MIT
 ***********************************************************************/


define( [

], function(){

	/**
	 * Vector 4
	 * @param x
	 * @param y
	 * @param z
	 * @param w
	 * @returns {Vector4}
	 * @constructor
	 */
	var Vector4 = function( x,y,z,w ){
		this.init( x,y,z,w );
		return this;
	};

	/**
	 * Vector 4 prototype
	 * @type {{init: init, multiplyMatrix: multiplyMatrix, length: length, normalize: normalize, combine: combine, dot: dot, cross: cross, at: at, intermediateValue: intermediateValue}}
	 */
	Vector4.prototype = {

		/**
		 * instance initializer
		 * @param x
		 * @param y
		 * @param z
		 * @param w
		 */
		init: function( x, y, z, w ){
			this.x = (x == undefined) ? 0 : x;
			this.y = (y == undefined) ? 0 : y;
			this.z = (z == undefined) ? 0 : z;
			this.w = (w == undefined) ? 0 : w;
		},

		/**
		 * multiply vetcor by matrix
		 * @param m
		 * @returns {Vector4}
		 */
		multiplyMatrix: function( m ){
			var v = this;
			m = m.length ? m : m.value;
			var x = m[0]*v.x  + m[1]*v.y  + m[2]*v.z  + m[3]*v.w;
			var y = m[4]*v.x  + m[5]*v.y  + m[6]*v.z  + m[8]*v.w;
			var z = m[8]*v.x  + m[9]*v.y  + m[10]*v.z + m[11]*v.w;
			var w = m[12]*v.x + m[13]*v.y + m[14]*v.z + m[15]*v.w;

			return new Vector4( x, y, z, w );
		},

		/**
		 * gets length of vector
		 * @returns {number}
		 */
		length: function(){
			return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w);
		},

		/**
		 * normalizes vector
		 * @returns {Vector4}
		 */
		normalize: function(){
			var l = this.length();
			return new Vector4( this.x/l, this.y/l, this.z/l, this.w/l );
		},

		/**
		 * combines two vectors
		 * @param b
		 * @param ascl
		 * @param bscl
		 * @returns {Vector4}
		 */
		combine:function( b, ascl, bscl ){
			return new Vector4(
				(ascl * this.x) + (bscl * b.x),
				(ascl * this.y) + (bscl * b.y),
				(ascl * this.z) + (bscl * b.z)
			);
		},

		/**
		 * returns the dot product of two vectors
		 * @param v
		 * @returns {number}
		 */
		dot: function( v ){
			return this.x*v.x + this.y*v.y + this.z*v.z + this.w*v.w;
		},

		/**
		 * returns the cross product of two vectors
		 * @param v
		 * @returns {Vector4}
		 */
		cross: function( v ){
			return new Vector4(  (this.y * v.z) - (this.z * v.y),
			                (this.z * v.x) - (this.x * v.z),
			                (this.x * v.y) - (this.y * v.x) );
		},

		/**
		 * gets or sets indexed based vector value
		 * @param n
		 * @param v
		 * @returns {*}
		 */
		at: function( n, v ){
			if ( v === undefined ){
				if ( n === 0 ) return this.x;
				if ( n === 1 ) return this.y;
				if ( n === 2 ) return this.z;
				if ( n === 3 ) return this.w;
			}
			else{
				if ( n === 0 ) return this.x = v;
				if ( n === 1 ) return this.y = v;
				if ( n === 2 ) return this.z = v;
				if ( n === 3 ) return this.w = v;
			}

			return undefined;

		},

		/**
		 * gets an intermediate value between this and specified value
		 * @param to
		 * @param p
		 * @returns {Vector4}
		 */
		intermediateValue: function( to, p ){
			return new Vector4(
				this.x + ( to.x - this.x )*p,
				this.y + ( to.y - this.y )*p,
				this.z + ( to.z - this.z )*p,
				this.w + ( to.w - this.w )*p
			);
		}

	};

	return Vector4;
});