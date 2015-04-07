describe('currentPageController Test', function() {
    var $controller, $rootScope, $scope, currentPageController;

    beforeEach(function() {
        spyOn(history, 'forward');
        spyOn(history, 'back');
        module('D2RM');
        inject(function (_$controller_, _$rootScope_) {
            $controller = _$controller_;
            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            currentPageController = $controller('currentPageController', {
                $scope: $scope
            });
        })
    });

    it('should navigate to the next page on clickForward', function() {
        currentPageController.clickForward();

        expect(history.forward).toHaveBeenCalled();
    });

    it('should navigate back to the previous page on clickBack', function() {
        currentPageController.clickBack();

        expect(history.back).toHaveBeenCalled();
    });
});