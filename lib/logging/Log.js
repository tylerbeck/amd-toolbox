define([
	'./transports/Console'
], function( ConsoleTransport ){

	/**
	 * Logging Class
	 * @param level
	 * @param transports
	 * @constructor
	 */
	var Log = function( level, transports ){

		//set default values
		level = parseInt( level ) || 0;
		transports = transports || [ new ConsoleTransport() ];

		/**
		 * reference to scope
		 * @type {Log}
		 */
		var self = this;

		/**
		 * current log level
		 * @type {*|number}
		 */
		var logLevel = level || Logger.ALL;

		/**
		 * set the current log level
		 * @param level
		 */
		self.setLevel = function( level ){
			logLevel = level;
		};


		/**
		 * set the current log level
		 * @param level
		 */
		self.setTransports = function( trans ){
			transports = trans;
		};


		/**
		 * iterates transports and calls specified log method on each
		 * @param level
		 * @param method
		 * @param arguments
		 */
		function output( level, method, arguments ){
			if ( logLevel >= level ){
				for ( var i= 0,l=transports.length; i<l; i++ ){
					var transport = transports[i];
					if ( transport[ method ] ){
						transport[ method ].apply( transport, arguments );
					}
				}
			}
		}


		/**
		 * log method
		 */
		self.write = function( /* arguments */ ){
			output( Log.ALL, 'write', arguments );
		};

		/**
		 * debug method
		 */
		self.debug = function( /* arguments */ ){
			output( Log.DEBUG, 'debug', arguments );
		};

		/**
		 * info method
		 */
		self.info = function( /* arguments */ ){
			output( Log.INFO, 'info', arguments );
		};

		/**
		 * warn method
		 */
		self.warn = function( /* arguments */ ){
			output( Log.WARN, 'warn', arguments );
		};

		/**
		 * log method
		 */
		self.error = function( /* arguments */ ){
			output( Log.ERROR, 'error', arguments );
		};


		//return instance
		return self;

	};

	//add static values for log levels
	Log.ALL = 5;
	Log.DEBUG = 4;
	Log.INFO = 3;
	Log.WARN = 2;
	Log.ERROR = 1;
	Log.NONE = 0;

	//add default transport class reference
	Log.DefaultTransport = ConsoleTransport;

	return Log;

});