define([],function(){

	/**
	 * ConsoleTransport
	 * proxies logging to browser console
	 * @constructor
	 */
	var ConsoleTransport = function(){

		/**
		 * reference to scope
		 * @type {ConsoleTransport}
		 */
		var self = this;

		//make sure console is available
		if ( window.console == undefined ){
			window.console = {
				log: function(){},
				debug: function(){},
				info: function(){},
				warn: function(){},
				error: function(){}
			}
		}

		/**
		 * log method
		 */
		self.write = function(){
			console.log.apply( console, arguments );
		};

		/**
		 * debug method
		 */
		self.debug = function(){
			console.debug.apply( console, arguments );
		};

		/**
		 * info method
		 */
		self.info = function(){
			console.info.apply( console, arguments );
		};

		/**
		 * warn method
		 */
		self.warn = function(){
			console.warn.apply( console, arguments );
		};

		/**
		 * error method
		 */
		self.error = function(){
			console.error.apply( console, arguments );
		};

	};

	return ConsoleTransport;

});