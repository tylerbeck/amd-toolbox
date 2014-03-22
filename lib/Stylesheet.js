/***********************************************************************
 *       Module: Stylesheet
 *  Description:
 *       Author: Copyright 2012-2014, Tyler Beck
 *      License: MIT
 ***********************************************************************/

define([
	'./Type'
],function( Type ){

	/*================================================
	 * Attributes
	 *===============================================*/
	/**
	 * map of css3 rule types
	 * @type {{style: number, charset: number, import: number, media: number, fontFace: number, page: number, keyframes: number, keyframe: number, namespace: number, counterStyle: number, supports: number, document: number, fontFeatureValues: number, viewport: number, regionStyle: number}}
	 */
	var ruleType = {
		style: 1,
		charset: 2,
		import: 3,
		media: 4,
		fontFace: 5,
		page: 6,
		keyframes: 7,
		keyframe: 8,
		namespace: 10,
		counterStyle: 11,
		supports: 12,
		document: 13,
		fontFeatureValues: 14,
		viewport: 15,
		regionStyle: 16
	};

	/**
	 *
	 * @type {boolean|*}
	 */
	var useCssRules = ( (document.styleSheets.length > 0 && document.styleSheets[0].cssRules) || document.createStyleSheet == undefined  );

	/**
	 * stylesheet map
	 * @type {{}}
	 */
	var stylesheets = {};

	/*================================================
	 * Stylesheet Methods
	 *===============================================*/
	/**
	 * adds a stylesheet to the document head with an optional source
	 * @param {String|undefined} source url for external stylesheet
	 * @param {String|undefined} id reference id for stylesheet
	 */
	function addStyleSheet( source, id ) {
		var stylesheet;
		if (useCssRules){
			stylesheet = document.createElement( 'style' );
			stylesheet.type = "text/css";
		}
		else{
			stylesheet = document.createStyleSheet();
		}
		var head = document.getElementsByTagName("head")[0];
		head.appendChild( stylesheet );

		if (source) {
			stylesheet.source = source;
		}

		if (id) {
			registerStyleSheet( stylesheet, id );
		}

	}

	/**
	 * registers a stylesheet with the css module
	 * @param {Node} stylesheet stylesheet object reference
	 * @param {String} id the id with which to register stylesheet
	 */
	function registerStyleSheet( stylesheet, id ) {
		stylesheets[ id ] = stylesheet;
	}

	/*================================================
	 * RuleList Methods
	 *===============================================*/
	/**
	 * gets all top level css rule lists
	 * @returns {Array}
	 */
	function getStyleSheetRulesLists(){
		var list = [];
		var ss = document.styleSheets;
		var rulesProp = useCssRules ? 'cssRules' : 'rules';
		for ( var i = 0, l = ss.length; i < l; i++ ){
			list.push( ss[i][rulesProp] );
		}
		return list;
	}

	/*================================================
	 * Rule Methods
	 *===============================================*/
	/**
	 * adds a rule to a stylesheet
	 * @param {String} selector
	 * @param {Object} styles an object containing key value pairs of style properties and values
	 * @param {String|Object|undefined} stylesheet registered stylesheet id or stylesheet reference
	 * @return {Object}
	 */
	function addRule( selector, styles, stylesheet ) {
		if ( Type.get(stylesheet) == "string" ){
			stylesheet = stylesheets["_default"];
		}
		stylesheet = stylesheet || stylesheets["_default"];
		styles = styles || [];

		var ri = useCssRules ? stylesheet.cssRules.length : stylesheet.rules.length;
		if ( stylesheet.addRule )
			stylesheet.addRule( selector, null, ri );
		else
			stylesheet.insertRule( selector + ' { }', ri );

		var rule = useCssRules ? stylesheet.cssRules[ri] : stylesheet.rules[ri];

		if ( styles ){
			var props = styles.keys();
			props.forEach( function( item ){
				//TODO:implement

				//self.style( rule, item, styles[item] );
			});
		}

		return rule;
	}

	/**
	 * removes a rule from stylesheet
	 * @param selector
	 * @param stylesheet
	 */
	function removeRule( selector, stylesheet ){
		var rules = (useCssRules) ? stylesheet.cssRules : stylesheet.rules;
		for ( var i= 0, l=rules.length; i<l; i++ ){
			if ( rules[i] && rules[i].selectorText && rules[i].selectorText.toLowerCase() ){
				if ( useCssRules )
					stylesheet.deleteRule( i );
				else
					stylesheet.removeRule( i );
			}
		}
	}

	/**
	 * get array of matching rules or rule indices
	 * @param stylesheet
	 * @param type
	 * @param indices
	 * @returns {Array}
	 */
	function getRules( stylesheet, type, indices ){
		var rules = [];
		var cssRules = (useCssRules) ? stylesheet.cssRules : stylesheet.rules;

		for ( var i= 0, l=cssRules.length; i<l; i++ ){
			var rule = cssRules[i];
			if ( type === false || rule.type == type ){
				rules.push( indices ? i : rule );
			}
		}

		return rules;
	}


	/*================================================
	 * Export Public Members
	 *===============================================*/
	return {
		ruleType: ruleType,
		addStyleSheet: addStyleSheet,
		registerStyleSheet: registerStyleSheet,
		getStyleSheetRulesLists: getStyleSheetRulesLists,
		addRule: addRule,
		removeRule: removeRule,
		getRules: getRules
	}



});
