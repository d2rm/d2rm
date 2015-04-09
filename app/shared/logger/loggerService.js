app.factory('loggerService', function() {
    var util = require('util'),
        winston = require('winston');

    var CustomLogger = winston.transports.CustomerLogger = function (options) {
        this.name = 'customLogger';
        this.level = options.level || 'info';
    };

    util.inherits(CustomLogger, winston.Transport);

    CustomLogger.prototype.log = function (level, msg, meta, callback) {
        meta ? console[level](msg, meta) : console[level](msg);
        if(callback) callback(null, true);
    };

    var logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                handleExceptions: true,
                prettyPrint: true,
                colorize: true,
                json: false
            }),
            new (winston.transports.File)({
                filename: 'D2RM.log',
                level: 'info',
                maxsize: 5242880,
                maxFiles: 1,
                json: false,
                timestamp: true,
                prettyPrint: true,
                handleExceptions: true
            }),
            new (winston.transports.CustomerLogger)({
                handleExceptions: true,
                level: 'info'
            })
        ],
        exitOnError: false
    });

    return logger;
});