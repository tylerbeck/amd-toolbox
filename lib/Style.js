/***********************************************************************
 *       Module: Style
 *  Description:
 *       Author: Copyright 2012-2014, Tyler Beck
 *      License: MIT
 ***********************************************************************/

define([
	'./util/String',
	'./Type'
],function( string, Type ){

	/*================================================
	 * Attributes
	 *===============================================*/
	/**
	 * map of css to js properties
	 * @type {{}}
	 */
	var toJsMap = {};

	/**
	 * map of js to css properties
	 * @type {{}}
	 */
	var fromJsMap = {};

	/**
	 * animation type code lookups
	 * @type {{}}
	 */
	var transformMethod = {
		"color": 1,
		"font-stretch": 2,
		"font-weight": 3,
		"integer": 4,
		"length": 5,
		"lpc": 6,
		"lpc-list": 7,
		"number": 8,
		"percentage": 9,
		"rectangle": 10,
		"shadow-list": 11,
		"shorthand": 12,
		"transform": 13,
		"visibility": 14
	};

	/**
	 * map of properties to type code
	 * @type {{}}
	 */
	var transformType = {
		background: 12,
		backgroundColor: 1,
		backgroundPosition: 7,
		backgroundSize: 7,
		border: 12,
		borderBottom: 12,
		borderBottomColor: 1,
		borderBottomLeftRadius: 6,
		borderBottomRightRadius: 6,
		borderBottomWidth: 5,
		borderColor: 12,
		borderLeft: 12,
		borderLeftColor: 1,
		borderLeftWidth: 5,
		borderRadius: 12,
		borderRight: 12,
		borderRightColor: 1,
		borderRightWidth: 5,
		borderTop: 12,
		borderTopColor: 1,
		borderTopLeftRadius: 6,
		borderTopRightRadius: 6,
		borderTopWidth: 5,
		borderWidth: 12,
		bottom: 6,
		boxShadow: 11,
		clip: 10,
		color: 1,
		columnCount: 4,
		columnGap: 5,
		columnRule: 12,
		columnRuleColor: 1,
		columnRuleWidth: 5,
		columnWidth: 5,
		columns: 12,
		flex: 12,
		flexBasis: 6,
		flexGrow: 8,
		flexShrink: 8,
		font: 12,
		fontSize: 5,
		fontSizeAdjust: 8,
		fontStretch: 2,
		fontWeight: 3,
		height: 6,
		left: 6,
		letterSpacing: 5,
		lineHeight: 5,
		margin: 5,
		marginBottom: 5,
		marginLeft: 5,
		marginRight: 5,
		marginTop: 5,
		maxHeight: 6,
		maxWidth: 6,
		minHeight: 6,
		minWidth: 6,
		opacity: 8,
		order: 4,
		outline: 12,
		outlineColor: 1,
		outlineOffset: 5,
		outlineWidth: 5,
		padding: 5,
		paddingBottom: 5,
		paddingLeft: 5,
		paddingRight: 5,
		paddingTop: 5,
		perspective: 5,
		perspectiveOrigin: 6,
		right: 6,
		textDecoration: 12,
		textDecorationColor: 1,
		textIndent: 6,
		textShadow: 11,
		top: 6,
		transform: 13,
		transformOrigin: 6,
		verticalAlign: 5,
		visibility: 14,
		width: 6,
		wordSpacing: 5,
		zIndex: 4
	};

	/**
	 * style property hooks
	 * @type {{}}
	 * @private
	 */
	var propertyMap = {};

	/**
	 * hooks for getting and setting styles
	 * @type {{}}
	 */
	var styleHook = {};

	/*================================================
	 * Property Methods
	 *===============================================*/
	/**
	 * gets the transform method type for the specified property
	 * @param property
	 * @returns {*}
	 */
	function getTransformType( property ){
		//check if type is already mapped
		var type =  transformType[ property ];
		if (type !== undefined){
			return type;
		}

		return mapTransformType( property );
	}

	/**
	 * maps a property to a transform type
	 * @param property
	 * @returns {*}
	 */
	function mapTransformType( property ){
		var prop = property.replace( /^(webkit|ms|moz|o)([A-Z])/, "$2" );
		prop = prop.charAt( 0 ).toLowerCase() + prop.slice(1);
		transformType[ property ] = transformType[ prop ] || 0;

		return transformType[ property ];
	}

	/**
	 * converts a dasherized css property to a js compatible value
	 * @param property
	 * @returns {String}
	 */
	function toJs( property ){

		//first check if property has been mapped
		if ( toJsMap[ property ] )
			return toJsMap[ property ];

		//if not matched, convert to js style
		var original = property;
		var matches = property.match(/^-(webkit|moz|ms|o)-(.+)$/);
		if (matches){
			property = matches[1]+'-'+matches[2];
		}
		var prop = string.toCamelCase( property );

		//map css to js and vice versa
		toJsMap[ original ] = prop;
		fromJsMap[ prop ] = original;

		return prop;
	}

	/**
	 * converts a dasherized css property to a js compatible value
	 * @param property
	 * @returns {String}
	 */
	function fromJs( property ){

		//first check if property has been mapped
		if ( fromJsMap[ property ] )
			return fromJsMap[ property ];

		var prop = string.toDashed( property );
		var matches = prop.match(/^(webkit|moz|ms|o)-(.+)$/);
		if (matches){
			prop = '-'+matches[1]+'-'+matches[2];
		}

		toJsMap[ prop ] = property;
		fromJsMap[ property ] = prop;

		return prop;
	}

	/**
	 * returns a mapped property
	 * @param property
	 * @returns {*}
	 */
	function getProperty( property ){
		return propertyMap[ property ] || property;
	}

	/**
	 * maps a css property name
	 * @param from
	 * @param to
	 */
	function mapProperty( from, to ){
		propertyMap[ from ] = to;
	}

	/*================================================
	 * Style Methods
	 *===============================================*/
	/**
	 * gets the computed style of a node
	 * @param node
	 * @param style
	 * @returns {*}
	 */
	function getComputedStyle( node, style ){

		var compStyle, result;
		var prop = getProperty( style );

		if ( document.defaultView && document.defaultView.getComputedStyle ) {
			//console.log( document.defaultView );
			//console.log( document.defaultView.getComputedStyle );
			compStyle = document.defaultView.getComputedStyle( node, undefined );
		}

		if (compStyle){
			if (style){
				//console.log( 'using getComputedStyle', compStyle );
				result = compStyle.getPropertyValue( string.toDashed(prop) );
				if (result == "" && compStyle[prop] == undefined )
					result = undefined;
			}
			else{
				result = compStyle;
			}
		}
		else if ( typeof(document.body.currentStyle) !== "undefined") {
			//console.log( 'using currentStyle', node["currentStyle"] );
			result = style ? node["currentStyle"][prop] : node["currentStyle"];
		}

		return result;
	}

	/**
	 * gets raw style of an object
	 * @public
	 * @param {Node} node styleable object
	 * @param {String} style style property
	 * @return {String}
	 */
	function getRawStyle( node, style ){
		var prop = getProperty( style );
		var result = node.style[ prop ];
		if ( !result || result == "" ){
			result = getComputedStyle( node, prop );
		}

		return result;
	}

	/**
	 * sets raw style on an object
	 * @public
	 * @param {Node} node styleable object
	 * @param {String} style style property
	 * @param {*} value leave undefined to get style
	 */
	function setRawStyle( node, style, value ){
		var prop = getProperty( style );
		return node.style[ prop ] = value;
	}

	/**
	 * gets and sets styles
	 * @param node
	 * @param style
	 * @param value
	 * @param useHooks
	 * @returns {*}
	 */
	function style( node, style, value, useHooks ){
		var prop = getProperty( style );
		//if ( canStyle( node ) ) {
			if ( styleHook[ prop ] != null && useHooks !== false ) {
				return styleHook[prop].apply( node, arguments );
			}
			else {
				if ( value == undefined )
					return self.getRawStyle( node, prop );
				else
					return self.setRawStyle( node, prop, value );
			}
		//}

		return false;
	}

	/**
	 * removes an objects style property
	 * @param obj
	 * @param style
	 */
	function clearStyle( obj, style ) {
		delete obj.style[ getProperty( style ) ];
	}

	/**
	 * registers hook for style property
	 * @param {String} style
	 * @param {Function} fn function(obj, style, value):*
	 */
	function registerStyleHook( style, fn ){
		var prop = getProperty( style );
		styleHook[ prop ] = fn;
	}

	/**
	 * sets a dimension style with or without units
	 * gets a dimensional style with no units
	 * @param alias
	 * @param {String|Array} style
	 * @private
	 */
	function registerStyleAlias( alias, style ){
		var styles = ( Type.get(style) == "array") ? style : [style];
		var fnc = function( o, s, v ){
			var result;
			if (v == undefined) {
				result = getRawStyle( o, styles[0] );
			}
			else {
				styles.forEach( function( s ){
					result = setRawStyle( o, s, v );
				});
			}
			return result;
		};

		registerStyleHook( alias, fnc );
	}

	/*================================================
	 * Class Methods
	 *===============================================*/
	/**
	 * gets or sets an objects classes
	 * @param {Node} obj
	 * @param {String|Array|undefined} classes leave undefined to get classes
	 * @return {Array}
	 */
	function classes( obj, classes ) {
		if ( classes != undefined ) {
			//console.log('setting classes:', classes);
			if ( Type.get( classes ) != 'array' ) {
				if ( Type.get( classes ) == 'string' )
					classes = [classes];
				else
					classes = [];
			}
			obj.className = classes.join( " " );
			return classes;

		}
		else {
			var names = (obj && obj.className) ? obj.className.replace( /\s+/g , " " ): "";
			return names.split( " " ).reverse();
		}
	}

	/**
	 * returns
	 * @param obj
	 * @param className
	 */
	function hasClass( obj, className ) {
		var names = classes( obj );
		return names.indexOf( className ) >= 0;
	}

	/**
	 * adds class to object if not already added
	 * @param {Node} obj
	 * @param {String} className
	 */
	function addClass( obj, className ) {
		var names = classes( obj );
		if ( names.indexOf( className ) == -1 ) {
			names.push( className );
			classes( obj, names );
		}
	}

	/**
	 * removes a class from an object
	 * @param {Node} obj
	 * @param {String} className
	 */
	function removeClass( obj, className ) {
		var names = classes( obj );
		var index = names.indexOf( className );
		if ( index >= 0 ) {
			names.splice( index, 1 );
			classes( obj, names );
		}
	}



	/*================================================
	 * Export public members
	 *===============================================*/
	return {
		transformType: transformType,
		transformMethod: transformMethod,
		toJs: toJs,
		fromJs: fromJs,
		mapProperty: mapProperty,
		getProperty: getProperty,
		getComputedStyle: getComputedStyle,
		getRawStyle: getRawStyle,
		setRawStyle: setRawStyle,
		style: style,
		clearStyle: clearStyle,
		registerStyleHook: registerStyleHook,
		registerStyleAlias: registerStyleAlias,
		classes: classes,
		hasClass: hasClass,
		addClass: addClass,
		removeClass: removeClass,









	}
});