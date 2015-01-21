/***********************************************************************
 *       Module: Transform Matrix
 *  Description:
 *       Author: Copyright 2012-2014, Tyler Beck
 *      License: MIT
 ***********************************************************************/

define([
	'../math/Matrix4x4',
    '../math/Vector4'
], function( M, V ){

	/*================================================
	 * Helper Methods
	 *===============================================*/
	/**
	 * converts almost 0 float values to true 0
	 * @param v
	 * @returns {*}
	 */
	function floatZero( v ){
		if (v == 0) {
			v = 0;
		}
		return v;
	}

	/**
	 * converts degrees to radians
	 * @param deg
	 * @returns {number}
	 */
	function degToRad( deg ){
		return deg * Math.PI / 180;
	}

	/**
	 * true 0 cosine
	 * @param a
	 * @returns {*}
	 */
	function cos( a ){
		return floatZero( Math.cos(a ) );
	}

	/**
	 * true 0 sine
	 * @param a
	 * @returns {*}
	 */
	function sin( a ){
		return floatZero( Math.sin(a ) );
	}

	/**
	 * true 0 tangent
	 * @param a
	 * @returns {*}
	 */
	function tan( a ){
		return floatZero( Math.tan(a ) );
	}

	/*================================================
	 * Transform Constructor
	 *===============================================*/
	var TransformMatrix = function( v ){
		this.init( v );
		return this;
	};

	/*================================================
	 * Transform Prototype
	 *===============================================*/
	TransformMatrix.prototype = {

		/**
		 * initialize class
		 * @param v
		 */
		init: function( v ){
			this.value = M.identity();
			if (v && v.length ){
				var l = v.length;
				for (var i = 0; i < l; i++ ){
					this.value[i] = v[i];
				}
			}
		},

		/**
		 * applies translation
		 * @param x
		 * @param y
		 * @param z
		 * @returns {TransformMatrix}
		 */
		translate: function( x, y, z ){
			var translation =    [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1 ];
			return new TransformMatrix( M.multiply( this.value, translation ) );
		},

		/**
		 * applies scale
		 * @param x
		 * @param y
		 * @param z
		 * @returns {TransformMatrix}
		 */
		scale: function( x, y, z ){
			var scaler = [ x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1 ];
			return new TransformMatrix( M.multiply( this.value, scaler ) );
		},

		/**
		 * applies x axis rotation
		 * @param a
		 * @returns {TransformMatrix}
		 */
		rotateX: function( a ){
			return this.rotate( 1, 0, 0, a );
		},

		/**
		 * applies y axis rotation
		 * @param a
		 * @returns {TransformMatrix}
		 */
		rotateY: function( a ){
			return this.rotate( 0, 1, 0, a );
		},

		/**
		 * applies z axis rotation
		 * @param a
		 * @returns {TransformMatrix}
		 */
		rotateZ: function( a ){
			return this.rotate( 0, 0, 1, a );
		},

		/**
		 * applies vector rotation
		 * @param x
		 * @param y
		 * @param z
		 * @param a
		 * @returns {TransformMatrix}
		 */
		rotate: function( x, y, z, a ){
			var norm = ( new V( x, y, z ) ).normalize();
			x = norm.x;
			y = norm.y;
			z = norm.z;

			var c = cos(a);
			var s = sin(a);

			var rotation = [
				1+(1-c)*(x*x-1), z*s+x*y*(1-c),   -y*s+x*z*(1-c),  0,
				-z*s+x*y*(1-c),  1+(1-c)*(y*y-1), x*s+y*z*(1-c),   0,
				y*s+x*z*(1-c),   -x*s+y*z*(1-c),  1+(1-c)*(z*z-1), 0,
				0,               0,               0,               1
			];
			return new TransformMatrix( M.multiply( this.value, rotation ) );
		},

		/**
		 * applies x skew
		 * @param a
		 * @returns {TransformMatrix}
		 */
		skewX: function( a ){
			var t = tan( a );
			var skew = [ 1, 0, 0, 0, t, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];
			return new TransformMatrix( M.multiply( this.value, skew ) );
		},

		/**
		 * applies y skew
		 * @param a
		 * @returns {TransformMatrix}
		 */
		skewY: function( a ){
			var t = tan( a );
			var skew = [ 1, t, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];
			return new TransformMatrix( M.multiply( this.value, skew ) );
		},


		/**
		 * decomposes transform into component parts
		 * @returns {{}}
		 */
		decompose: function(){
			var m = this.value;
			var i, j, p, perspective, translate, scale, skew, quaternion;
			// Normalize the matrix.
			if (m[15] == 0) return false;
			p = m[15];
			for ( i=0; i<4; ++i ){
				for ( j=0; j<4; ++j ){
					m[i*4+j] /= p;
				}
			}

			// perspectiveMatrix is used to solve for perspective, but it also provides
			// an easy way to test for singularity of the upper 3x3 component.
			var perspectiveMatrix = m.slice(0);
			perspectiveMatrix[3] = 0;
			perspectiveMatrix[7] = 0;
			perspectiveMatrix[11] = 0;
			perspectiveMatrix[15] = 1;

			if ( M.determinant( perspectiveMatrix ) == 0){
				return false;
			}

			//perspective.
			if (m[3] != 0 || m[7] != 0 || m[11] != 0) {
				// rightHandSide is the right hand side of the equation.
				var right = new V( m[3], m[7], m[11], m[15] );
				var tranInvPers = M.transpose( M.inverse( perspectiveMatrix ) );
				perspective = right.multiplyMatrix( tranInvPers );
			}
			else{
				perspective = new V(0,0,0,1);
			}

			//translation
			translate = new V( m[12], m[13], m[14] );

			//scale & skew
			var row = [ new V(), new V(), new V() ];
			for ( i = 0; i < 3; i++ ) {
				row[i].x = m[4*i];
				row[i].y = m[4*i+1];
				row[i].z = m[4*i+2];
			}

			scale = new V();
			skew = new V();

			scale.x = row[0].length();
			row[0] = row[0].normalize();

			// Compute XY shear factor and make 2nd row orthogonal to 1st.
			skew.x = row[0].dot(row[1]);
			row[1] = row[1].combine(row[0], 1.0, -skew.x);

			// Now, compute Y scale and normalize 2nd row.
			scale.y = row[1].length();
			row[1] = row[1].normalize();
			skew.x = skew.x/scale.y;

			// Compute XZ and YZ shears, orthogonalize 3rd row
			skew.y = row[0].dot(row[2]);
			row[2] = row[2].combine(row[0], 1.0, -skew.y);
			skew.z = row[1].dot(row[2]);
			row[2] = row[2].combine(row[1], 1.0, -skew.z);

			// Next, get Z scale and normalize 3rd row.
			scale.z = row[2].length();
			row[2] = row[2].normalize();
			skew.y = (skew.y / scale.z);
			skew.z = (skew.z / scale.z);

			// At this point, the matrix (in rows) is orthonormal.
			// Check for a coordinate system flip.  If the determinant
			// is -1, then negate the matrix and the scaling factors.
			var pdum3 = row[1].cross(row[2]);
			if (row[0].dot( pdum3 ) < 0) {
				for (i = 0; i < 3; i++) {
					scale.at(i, scale.at(i)* -1);
					row[i].x *= -1;
					row[i].y *= -1;
					row[i].z *= -1;
				}
			}

			// Now, get the rotations out
			// FROM W3C
			quaternion = new V();
			quaternion.x = 0.5 * Math.sqrt(Math.max(1 + row[0].x - row[1].y - row[2].z, 0));
			quaternion.y = 0.5 * Math.sqrt(Math.max(1 - row[0].x + row[1].y - row[2].z, 0));
			quaternion.z = 0.5 * Math.sqrt(Math.max(1 - row[0].x - row[1].y + row[2].z, 0));
			quaternion.w = 0.5 * Math.sqrt(Math.max(1 + row[0].x + row[1].y + row[2].z, 0));

			if (row[2].y > row[1].z) quaternion.x = -quaternion.x;
			if (row[0].z > row[2].x) quaternion.y = -quaternion.y;
			if (row[1].x > row[0].y) quaternion.z = -quaternion.z;

			return {
				perspective: perspective,
				translate: translate,
				skew: skew,
				scale: scale,
				quaternion: quaternion.normalize()
			};
		},


		/**
		 * converts matrix to css string
		 * @returns {string}
		 */
		toString: function(){
			return "matrix3d("+ this.value.join(", ")+ ")";
		}

	};


	/**
	 * recomposes transform from component parts
	 * @param d
	 * @returns {TransformMatrix}
	 */
	TransformMatrix.recompose = function( d ){
		//console.log('Matrix4x4.recompose');
		var m = M.identity();
		var i, j, x, y, z, w;

		var perspective = d.perspective;
		var translate = d.translate;
		var skew = d.skew;
		var scale = d.scale;
		var quaternion = d.quaternion;

		// apply perspective
		m[3] = perspective.x;
		m[7] = perspective.y;
		m[11] = perspective.z;
		m[15] = perspective.w;

		// apply translation
		for ( i=0; i<3; ++i ){
			for ( j=0; j<3; ++j ){
				m[12+i] += translate.at( j ) * m[j*4+i]
			}
		}

		// apply rotation
		x = quaternion.x;
		y = quaternion.y;
		z = quaternion.z;
		w = quaternion.w;

		// Construct a composite rotation matrix from the quaternion values
		/**/
		var rmv = M.identity();
		rmv[0]  = 1 - 2 * ( y * y + z * z );
		rmv[1]  =     2 * ( x * y - z * w );
		rmv[2]  =     2 * ( x * z + y * w );
		rmv[4]  =     2 * ( x * y + z * w );
		rmv[5]  = 1 - 2 * ( x * x + z * z );
		rmv[6]  =     2 * ( y * z - x * w );
		rmv[8]  =     2 * ( x * z - y * w );
		rmv[9]  =     2 * ( y * z + x * w );
		rmv[10] = 1 - 2 * ( x * x + y * y );
		/*
		 var rmv = [
		 1 - 2*y*y - 2*z*z,  2*x*y - 2*z*w,      2*x*z + 2*y*w,      0,
		 2*x*y + 2*z*w,      1 - 2*x*x - 2*z*z,  2*y*z - 2*x*w,      0,
		 2*x*z - 2*y*w,      2*y*z + 2*x*w,      1 - 2*x*x - 2*y*y,  0,
		 0,                  0,                  0,                  1
		 ];
		 */
		var rotationMatrix = M.transpose( rmv );
		var matrix = M.multiply( m, rotationMatrix );

		//console.log('    skew');
		// apply skew
		var temp = Matrix4x4.identity();
		if ( skew.z ){
			temp[9] = skew.z;
			matrix = M.multiply( matrix, temp );
		}

		if (skew.y){
			temp[9] = 0;
			temp[8] = skew.y;
			matrix = M.multiply( matrix, temp );
		}

		if (skew.x){
			temp[8] = 0;
			temp[4] = skew.x;
			matrix = M.multiply( matrix, temp );
		}

		// apply scale
		m = matrix;
		for ( i=0; i<3; ++i ){
			for ( j=0; j<3; ++j ){
				m[4*i+j] *= scale.at( i );
			}
		}

		return new TransformMatrix( m );
	}


	return TransformMatrix;

});
