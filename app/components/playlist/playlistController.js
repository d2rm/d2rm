app.controller('playlistController', function ($scope, $routeParams, DBService) {
    DBService.getPlaylist($routeParams.id, function(data) {
        $scope.page.title = data.name;
        $scope.$apply();
    });
});