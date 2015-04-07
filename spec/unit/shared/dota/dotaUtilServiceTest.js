describe('dotaUtilService Test', function() {
    var mockery = require('mockery');
    var request, fs, dotaUtilService;

    beforeEach(function() {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });
        request = jasmine.createSpyObj('request', ['get']);
        fs = jasmine.createSpyObj('fs', ['readFileSync', 'writeFile']);
        mockery.registerMock('request', request);
        mockery.registerMock('fs', fs);

        module('D2RM', function($provide) {
            $provide.value('settingsService', {settings: {}});
            $provide.value('loggerService', {});
        });

        inject(function(_dotaUtilService_) {
            dotaUtilService = _dotaUtilService_;
        });
    });

    afterEach(function(){
        mockery.disable();
    });

    describe('updateConstantsFiles method', function() {
        beforeEach(function() {
            fs.readFileSync.and.callFake(function() {
                return {version: 1};
            });
        });

        it('should call request.get with url of remote constants file', function() {
            request.get.and.callFake(function(url, cb) {
                cb('ERROR', {statusCode: 200}, JSON.stringify({version: 1}));
            });

            dotaUtilService.updateConstantsFiles(function() {});

            expect(request.get).toHaveBeenCalled();
        });

        it('should call the callback with the error if an error occurs', function() {
            request.get.and.callFake(function(url, cb) {
                cb('ERROR', {statusCode: 200}, JSON.stringify({version: 1}));
            });

            dotaUtilService.updateConstantsFiles(function(err) {
                expect(err).toEqual('ERROR');
            });
        });

        it('should call the callback with an Error object containing the status code if it is not between 200 and 299', function() {
            request.get.and.callFake(function(url, cb) {
                cb(null, {statusCode: 400}, JSON.stringify({version: 1}));
            });

            dotaUtilService.updateConstantsFiles(function(err) {
                expect(err).toEqual(new Error(400));
            });
        });

        it('should call JSON.parse on data if no errors occur', function() {
            request.get.and.callFake(function(url, cb) {
                cb(null, {statusCode: 200}, JSON.stringify({version: 1}));
            });
            spyOn(JSON, 'parse').and.returnValue({version: 1});

            dotaUtilService.updateConstantsFiles(function() {});

            expect(JSON.parse).toHaveBeenCalledWith(JSON.stringify({version: 1}));
        });

        it('should call the callback with an error if JSON.parse fails', function() {
            request.get.and.callFake(function(url, cb) {
                cb(null, {statusCode: 200}, JSON.stringify({version: 1}));
            });
            spyOn(JSON, 'parse').and.throwError('ERROR');

            dotaUtilService.updateConstantsFiles(function(err) {
                expect(err).toBeDefined();
            });
        });

        describe('if constants versions do not match', function() {
            beforeEach(function() {
                request.get.and.callFake(function(url, cb) {
                    cb(null, {statusCode: 200}, JSON.stringify({version: 2}));
                });
            });

            it('should call fs.writeFile twice', function() {
                fs.writeFile.and.callFake(function(name, data, cb) {
                    cb(null);
                });
                dotaUtilService.updateConstantsFiles(function() {});

                expect(fs.writeFile.calls.count()).toEqual(2);
            });

            it('should call the callback with error if there is an error writing files', function() {
                fs.writeFile.and.callFake(function(name, data, cb) {
                    cb('ERROR');
                });

                dotaUtilService.updateConstantsFiles(function(err) {
                    expect(err).toEqual('ERROR');
                });
            });
        });
    });
});