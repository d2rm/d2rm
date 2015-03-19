app.controller('playlistController', function ($scope, $routeParams, DBService) {
    $scope.playlistTracks = [];

    DBService.getAllPlaylistTracks($routeParams.id, function (data) {
        $scope.playlistTracks = data;
    });
});