app.controller("MainAppController", function($rootScope, $scope, $location, DBService){
    $scope.searchTerm = null;
    $scope.version = require('./package.json').version;
    $scope.$location = $location;
    $rootScope.playlists = [];

    $scope.getLocationPath = function (path, startsWith) {
        return startsWith ? ($location.path().indexOf(path) == 0) : ($location.path() == path);
    };

    DBService.getAllPlaylists(function (data) {
        $rootScope.playlists = data;
    });
});