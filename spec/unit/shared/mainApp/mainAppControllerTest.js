describe('MainAppController Test', function() {
    var mockery = require('mockery');
    var MainAppController, $scope, $rootScope, $location, DBService, loggerService, dotaUtilService, window;

    beforeEach(function() {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });
        mockery.registerMock('./package.json', {version: "1.0.0"});
        window = jasmine.createSpyObj('window', ['showDevTools', 'get']);
        window.get.and.returnValue(window);
        module('D2RM');
        inject(function($controller, _$rootScope_, _$location_) {
            $rootScope = _$rootScope_;
            $location = _$location_;
            spyOn($location, 'path').and.returnValue('test');
            DBService = jasmine.createSpyObj('DBService', ['getAllPlaylists', 'updatePlaylistPosition']);
            loggerService = {
                transports: {
                    file: {level: ''},
                    console: {level: ''},
                    customLogger: {level: ''}
                }
            };
            dotaUtilService = jasmine.createSpyObj('dotaUtilService', ['updateConstantsFiles']);
            $scope = $rootScope.$new();
        });
    });

    afterEach(function(){
        mockery.disable();
    });

    describe('with empty argv', function() {
        beforeEach(function() {
            inject(function($controller) {
                spyOn(global.window.nwDispatcher, 'requireNwGui').and.returnValue({
                    Window: window,
                    App: {argv: []}
                });
                MainAppController = $controller('MainAppController', {
                    $rootScope: $rootScope,
                    $scope: $scope,
                    $location: $location,
                    DBService: DBService,
                    loggerService: loggerService,
                    dotaUtilService: dotaUtilService
                });
            });
        });

        it('should return true if path is in location.path when getLocationPath method is called', function() {
            var path = $scope.getLocationPath('test', false);

            expect(path).toBeTruthy();
        });

        it('should return true if path starts with provided path in location.path when getLocationPath method is called', function() {
            var path = $scope.getLocationPath('test', true);

            expect(path).toBeTruthy();
        });

        it('should set playlists in rootScope using DBService', function() {
            DBService.getAllPlaylists.and.callFake(function(cb) {
                cb(['test']);
                expect($rootScope.playlists).toEqual(['test']);
            });
        });

        it('should set prevPlaylistOrder on sortableOptions.update by copying $rootScope.playlists', function() {
            spyOn($rootScope.playlists, 'slice');

            $scope.sortableOptions.update();

            expect($rootScope.playlists.slice).toHaveBeenCalled();
        });

        it('should call DBService.updatePlaylistPosition on sortableOptions.stop', function() {
            $rootScope.playlists = [{_id: '1234'}, {_id: '123'}];
            $scope.sortableOptions.update();
            $rootScope.playlists = [{_id: '123'}, {_id: '1234'}];

            $scope.sortableOptions.stop();

            expect(DBService.updatePlaylistPosition).toHaveBeenCalled();
        });
    });

    describe('with -v in argv', function() {
        var quit;
        beforeEach(function() {
            inject(function($controller) {
                quit = jasmine.createSpy('quit');
                spyOn(global.window.nwDispatcher, 'requireNwGui').and.returnValue({
                    Window: window,
                    App: {argv: ["-v"], quit: quit}
                });
                spyOn(console, 'log');
                MainAppController = $controller('MainAppController', {
                    $rootScope: $rootScope,
                    $scope: $scope,
                    $location: $location,
                    DBService: DBService,
                    loggerService: loggerService,
                    dotaUtilService: dotaUtilService
                });
            });
        });

        it('should call console.log with app version', function() {
            expect(console.log).toHaveBeenCalledWith("DOTA 2 Replay Manager v" + $scope.version);
        });

        it('should call quit method on gui.App', function() {
            expect(quit).toHaveBeenCalled();
        });
    });

    describe('with --debug in argv', function() {
        beforeEach(function() {
            inject(function($controller) {
                spyOn(global.window.nwDispatcher, 'requireNwGui').and.returnValue({
                    Window: window,
                    App: {argv: ["--debug"]}
                });
                MainAppController = $controller('MainAppController', {
                    $rootScope: $rootScope,
                    $scope: $scope,
                    $location: $location,
                    DBService: DBService,
                    loggerService: loggerService,
                    dotaUtilService: dotaUtilService
                });
            });
        });

        it('should call showDevTools method on window', function() {
            expect(window.showDevTools).toHaveBeenCalled();
        });

        it('should set level to debug on all 3 transports', function() {
            expect(loggerService.transports.console.level).toEqual('debug');
            expect(loggerService.transports.file.level).toEqual('debug');
            expect(loggerService.transports.customLogger.level).toEqual('debug');
        });
    });
});