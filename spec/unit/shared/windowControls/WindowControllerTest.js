describe('WindowController Test', function() {
    var WindowController, $scope, window, storageService;

    beforeEach(function() {
        window = jasmine.createSpyObj('window', ['maximize', 'get', 'minimize', 'unmaximize', 'close']);
        window.get.and.returnValue(window);
        spyOn(global.window.nwDispatcher, 'requireNwGui').and.returnValue({
            Window: window
        });
        module('D2RM');
        inject(function($controller, $rootScope) {
            storageService = jasmine.createSpyObj('storageService', ['get', 'set']);
            $scope = $rootScope.$new();
            WindowController = $controller('windowController', {
                $scope: $scope,
                storageService: storageService
            });
        });
    });

    describe('window maximized', function() {
        beforeEach(function() {
            inject(function($controller, $rootScope) {
                storageService = jasmine.createSpyObj('storageService', ['get', 'set']);
                storageService.get.and.callFake(function(name) {
                    if(name == "windowMaximized") return "true";
                });
                $scope = $rootScope.$new();
                WindowController = $controller('windowController', {
                    $scope: $scope,
                    storageService: storageService
                });
            });
        });

        describe('restores window position on screen', function() {
            it('should call maximize on window', function() {
                expect(window.maximize).toHaveBeenCalled();
            });
        });

        it('should unmaximaze window when expandWindow is called', function() {
            $scope.expandWindow();

            expect(window.unmaximize).toHaveBeenCalled();
        });
    });

    it('should call minimize method on window when minimizeWindow is called', function() {
        $scope.minimizeWindow();

        expect(window.minimize).toHaveBeenCalled();
    });

    it('should maximize window when expandWindow is called', function() {
        $scope.expandWindow();

        expect(window.maximize).toHaveBeenCalled();
    });

    describe('closeWindow method', function() {
        beforeEach(function() {
            $scope.closeWindow();
        });

        it('should call close method on window when  is called', function() {
            expect(window.close).toHaveBeenCalled();
        });

        it('should save window position on screen', function() {
            expect(storageService.set.calls.count()).toEqual(3);
        });
    });
});