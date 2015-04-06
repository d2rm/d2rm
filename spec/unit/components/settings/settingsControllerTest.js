describe('settingsController Test', function() {
    var $controller, $rootScope, $scope, settingsService, $location, settingsController;
    var mockery = require('mockery');

    beforeEach(function() {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });
        mockery.registerMock('./languages/metadata.json', {});
        spyOn(history, 'back');
        module('D2RM');
        inject(function (_$controller_, _$location_, _$rootScope_) {
            $controller = _$controller_;
            $rootScope = _$rootScope_;
            $location = _$location_;
            $scope = $rootScope.$new();
            $scope.page = {title: 'placeholder'};
            settingsService = jasmine.createSpyObj('settingsService', ['save']);

            settingsController = $controller('settingsController', {
                $scope: $scope,
                settingsService: settingsService
            });
        })
    });

    it('should call save method on settingsService on save', function() {
        settingsController.save();

        expect(settingsService.save).toHaveBeenCalled();
    });

    it('should navigate back to the previous page on cancel', function() {
        settingsController.cancel();

        expect(history.back).toHaveBeenCalled();
    });

    it('should navigate back to the previous page on save', function() {
        settingsController.save();

        expect(history.back).toHaveBeenCalled();
    });
});