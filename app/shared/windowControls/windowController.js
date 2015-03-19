app.controller('windowController', function ($scope) {
    var gui = require('nw.gui'),
        win = gui.Window.get();

    $scope.isWindowExpanded = false;

    $scope.closeWindow = function () {
        win.close();
    };
    $scope.minimizeWindow = function () {
        win.minimize();
    };
    $scope.expandWindow = function () {
        if($scope.isWindowExpanded)
        {
            win.unmaximize();
        }
        else
        {
            win.maximize();
        }
        $scope.isWindowExpanded = !$scope.isWindowExpanded;
    };
});