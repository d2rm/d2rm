var mockery = require('mockery');

describe('settingsController Test', function() {
    var $controller, $rootScope, $scope, storageService, $location, settingsController, crypto;

    beforeEach(module('D2RM'));

    beforeEach(function() {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });
        crypto = module.exports = jasmine.createSpyObj('crypto', ['createCipher', 'createDecipher', 'update', 'final']);

        mockery.registerMock('crypto', crypto);
    });

    beforeEach(inject(function (_$controller_, _$location_, _$rootScope_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $location = _$location_;
        $scope = $rootScope.$new();
        $scope.page = {title: 'placeholder'};
        storageService = jasmine.createSpyObj('storageService', ['get', 'set']);
        storageService.get.and.returnValue(JSON.stringify({}));

        settingsController = $controller('settingsController', {
            $scope: $scope,
            storageService: storageService
        });
    }));

    it('should navigate back to the previous page on cancel', function() {
        spyOn(history, 'back');

        settingsController.cancel();

        expect(history.back).toHaveBeenCalled();
    });

    it('should navigate back to the previous page on save', function() {
        spyOn(history, 'back');

        settingsController.save();

        expect(history.back).toHaveBeenCalled();
    });

    it('should call createCipher, update and final when calling save with steamPassword set', function() {
        crypto.createCipher.and.returnValue(crypto);
        crypto.update.and.returnValue(crypto);
        spyOn(history, 'back');
        settingsController.model.steamPassword = '123';

        settingsController.save();

        expect(crypto.createCipher).toHaveBeenCalled();
        expect(crypto.update).toHaveBeenCalled();
        expect(crypto.final).toHaveBeenCalled();
    });
});