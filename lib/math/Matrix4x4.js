/***********************************************************************
 *       Module: 4x4Matrix
 *  Description:
 *       Author: Copyright 2012-2014, Tyler Beck
 *      License: MIT
 ***********************************************************************/

define([

], function(){

	/*================================================
	 * Helper Methods
	 *===============================================*/

	/**
	 *  Calculates the determinant of a 2x2 matrix.
	 *  @param {number} a - Top-left value of the matrix.
	 *  @param {number} b - Top-right value of the matrix.
	 *  @param {number} c - Bottom-left value of the matrix.
	 *  @param {number} d - Bottom-right value of the matrix.
	 *  @returns {number}
	 */
	function determinant2x2( a, b, c, d ){
		return a * d - b * c;
	}

	/**
	 *  Calculates the determinant of a 3x3 matrix.
	 *  @param {number} a1 - Matrix value in position [1, 1].
	 *  @param {number} a2 - Matrix value in position [1, 2].
	 *  @param {number} a3 - Matrix value in position [1, 3].
	 *  @param {number} b1 - Matrix value in position [2, 1].
	 *  @param {number} b2 - Matrix value in position [2, 2].
	 *  @param {number} b3 - Matrix value in position [2, 3].
	 *  @param {number} c1 - Matrix value in position [3, 1].
	 *  @param {number} c2 - Matrix value in position [3, 2].
	 *  @param {number} c3 - Matrix value in position [3, 3].
	 *  @returns {number}
	 */
	function determinant3x3( a1, a2, a3, b1, b2, b3, c1, c2, c3 ) {

		return a1 * determinant2x2(b2, b3, c2, c3) -
		       b1 * determinant2x2(a2, a3, c2, c3) +
		       c1 * determinant2x2(a2, a3, b2, b3);
	}

	/**
	 *  Calculates the determinant of a 4x4 matrix.
	 *  Calculates the determinant of a 3x3 matrix.
	 *  @param {number} a1 - Matrix value in position [1, 1].
	 *  @param {number} a2 - Matrix value in position [1, 2].
	 *  @param {number} a3 - Matrix value in position [1, 3].
	 *  @param {number} a4 - Matrix value in position [1, 4].
	 *  @param {number} b1 - Matrix value in position [2, 1].
	 *  @param {number} b2 - Matrix value in position [2, 2].
	 *  @param {number} b3 - Matrix value in position [2, 3].
	 *  @param {number} b4 - Matrix value in position [2, 4].
	 *  @param {number} c1 - Matrix value in position [3, 1].
	 *  @param {number} c2 - Matrix value in position [3, 2].
	 *  @param {number} c3 - Matrix value in position [3, 3].
	 *  @param {number} c4 - Matrix value in position [3, 4].
	 *  @param {number} d1 - Matrix value in position [4, 1].
	 *  @param {number} d2 - Matrix value in position [4, 2].
	 *  @param {number} d3 - Matrix value in position [4, 3].
	 *  @param {number} d4 - Matrix value in position [4, 4].
	 *  @returns {number}
	 */
	function determinant4x4( a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3, a4, b4, c4, d4 ) {
		return a1 * determinant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4) -
		       b1 * determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4) +
		       c1 * determinant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4) -
		       d1 * determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
	}

	/**
	 * 4x4 identity matrix
	 * @type {number[]}
	 */
	var identity = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	];

	/*================================================
	 * Static Methods
	 *===============================================*/
	/**
	 * Static 4x4 matrix math
	 * @type {{multiply: multiply, adjoint: adjoint, inverse: inverse, subtract: subtract, add: add, equals: equals, determinant: determinant, transpose: transpose}}
	 */
	var Matrix4x4 = {
		/**
		 * 4x4 identity matrix
		 * @returns {number[]}
		 */
		identity: function(){
			return identity.slice(0);
		},

		/**
		 * multiplies 2 4x4 matrices represented by 16 element arrays
		 * @param a {Array}
		 * @param b {Array}
		 * @returns {Array}
		 */
		multiply: function( a, b ){
			var c = new Array(16);

			c[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
			c[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
			c[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
			c[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];

			c[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
			c[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
			c[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
			c[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];

			c[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
			c[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
			c[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
			c[11] = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];

			c[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
			c[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
			c[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
			c[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];

			//TODO: test if the following method of multiplication is slower
			//var n1, n2, n3;

			/*for( n1 = 0; n1 < 4; n1++) {
			 for( n2 = 0; n2 < 4; n2++) {
			 var sum = 0;
			 for( n3 = 0; n3 < 4; n3++) {
			 sum += self.value[4*n3+n2] * arr[4*n1+n3];
			 }
			 result[4*n1+n2] = sum;
			 }
			 }*/

			return c;
		},

		/**
		 * multiplies 2 4x4 matrices represented by 16 element arrays
		 * @param m
		 * @returns {*[]}
		 */
		adjoint: function( m ){
			var a1 = m[0],
				a2 = m[1],
				a3 = m[2],
				a4 = m[3],
				b1 = m[4],
				b2 = m[5],
				b3 = m[6],
				b4 = m[7],
				c1 = m[8],
				c2 = m[9],
				c3 = m[10],
				c4 = m[11],
				d1 = m[12],
				d2 = m[13],
				d3 = m[14],
				d4 = m[15];

			return [
				determinant3x3( b2, b3, b4, c2, c3, c4, d2, d3, d4),
				-determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4),
				determinant3x3( a2, a3, a4, b2, b3, b4, d2, d3, d4),
				-determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4),

				-determinant3x3(b1, b3, b4, c1, c3, c4, d1, d3, d4),
				determinant3x3( a1, a3, a4, c1, c3, c4, d1, d3, d4),
				-determinant3x3(a1, a3, a4, b1, b3, b4, d1, d3, d4),
				determinant3x3( a1, a3, a4, b1, b3, b4, c1, c3, c4),

				determinant3x3( b1, b2, b4, c1, c2, c4, d1, d2, d4),
				-determinant3x3(a1, a2, a4, c1, c2, c4, d1, d2, d4),
				determinant3x3( a1, a2, a4, b1, b2, b4, d1, d2, d4),
				-determinant3x3(a1, a2, a4, b1, b2, b4, c1, c2, c4),

				-determinant3x3(b1, b2, b3, c1, c2, c3, d1, d2, d3),
				determinant3x3( a1, a2, a3, c1, c2, c3, d1, d2, d3),
				-determinant3x3(a1, a2, a3, b1, b2, b3, d1, d2, d3),
				determinant3x3( a1, a2, a3, b1, b2, b3, c1, c2, c3)
			];
		},

		/**
		 * inverses matrix
		 * @param m
		 * @returns {*}
		 */
		inverse: function( m ){

			//start with identity
			var inv = identity.slice(0);

			//identity or translation
			if (Matrix4x4.equals( identity, m, [14,13,12] )){
				inv[12] = -m[12];
				inv[13] = -m[13];
				inv[14] = -m[14];

				return inv;
			}

			//check determinant matrix
			var det = Matrix4x4.determinant( m );
			if ( Math.abs( det ) < 1e-8 ) return false;

			//get adjoint matrix to seed values
			var result = Matrix4x4.adjoint( m );
			var l = 16;
			for ( var i=0; i < l; ++i ){
				result[ i ] /= det;
			}

			return result;
		},

		/**
		 * subtracts matrix b from a, represented as 16 element arrays
		 * @param a
		 * @param b
		 * @returns {Array}
		 */
		subtract: function( a, b ){
			var result = new Array(16);
			for ( var i = 0; i < 16; ++i ){
				result[i] = a[i] - b[i];
			}
			return result;
		},

		/**
		 * adds matrix a and b, represented as 16 element arrays
		 * @param a
		 * @param b
		 * @returns {Array}
		 */
		add: function( a, b ){
			var result = new Array(16);
			for ( var i = 0; i < 16; ++i ){
				result[i] = a[i] + b[i];
			}
			return result;
		},

		/**
		 * compares matrices for equality
		 * @param a
		 * @param b
		 * @param exclude
		 * @returns {boolean}
		 */
		equals: function( a, b, exclude ){
			exclude = exclude || false;
			if ( a.length != 16 || a.length != b.length )
				return false;

			for (var i=0; i<16; i++){
				if ( !(exclude && exclude.indexOf(i) >= 0) ){
					if ( a[i] != b[i] ){
						return false;
					}
				}
			}

			return true;
		},

		/**
		 * calculates determinant
		 * @returns {number}
		 */
		determinant: function( m ){
			return determinant4x4.apply( m, m );
		},

		/**
		 * transposes matrix
		 * @returns {Array}
		 */
		transpose: function( m ){
			var result = new Array( 16 );
			for ( var i=0; i<4; ++i ){
				for ( var j=0; j<4; ++j ){
					result[ i*4 + j ] = m[ j*4 + i ];
				}
			}

			return result;
		}

	};

	return Matrix4x4;
});
