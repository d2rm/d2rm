app.controller('windowController', function ($scope, storageService) {
    var gui = global.window.nwDispatcher.requireNwGui(),
        win = gui.Window.get(),
        storage = storageService;

    function restoreWindow() {
        $scope.isWindowExpanded = storage.get('windowMaximized') === 'true';
        if($scope.isWindowExpanded) return win.maximize();
        win.x = storage.get("windowLocationX");
        win.y = storage.get("windowLocationY");
    }

    function saveWindowLocationOnScreen () {
        storage.set("windowLocationX", win.x);
        storage.set("windowLocationY", win.y);
        storage.set('windowMaximized', $scope.isWindowExpanded);
    }

    restoreWindow();

    $scope.closeWindow = function () {
        saveWindowLocationOnScreen();
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