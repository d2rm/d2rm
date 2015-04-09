describe('loggerService Test', function() {
    var mockery = require('mockery');
    var util, winston, loggerService, customLogger;

    beforeEach(function() {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });
        util = jasmine.createSpyObj('util', ['inherits']);
        customLogger = jasmine.createSpy('customLogger');
        winston = jasmine.createSpyObj('winston', ['Transport', 'Logger']);
        winston.transports = {Console: null, File: null};
        spyOn(winston.transports, 'Console');
        spyOn(winston.transports, 'File');
        mockery.registerMock('util', util);
        mockery.registerMock('winston', winston);
        module('D2RM');
        inject(function(_loggerService_) {
            loggerService = _loggerService_;
        });
    });

    afterEach(function(){
        mockery.disable();
    });

    it('should call winston.transports.Console', function() {
        expect(winston.transports.Console).toHaveBeenCalled();
    });

    it('should call winston.transports.File', function() {
        expect(winston.transports.File).toHaveBeenCalled();
    });

    it('should have winston.transports.customLogger defined', function() {
        expect(winston.Logger.calls.mostRecent().args[0].transports).toBeDefined();
    });

    it('should call info method on console when calling CustomerLogger.prototype.log with info as level', function() {
        spyOn(console, 'info');

        winston.transports.CustomerLogger.prototype.log('info', 'Test', {test: 'Test'}, function() {});

        expect(console.info).toHaveBeenCalledWith('Test', {test: 'Test'});
    });

    it('should call info method on console when calling CustomerLogger.prototype.log without meta and callback', function() {
        spyOn(console, 'info');

        winston.transports.CustomerLogger.prototype.log('info', 'Test');

        expect(console.info).toHaveBeenCalledWith('Test');
    });

    it('should call util.inherits', function() {
        expect(util.inherits).toHaveBeenCalled();
    });
});