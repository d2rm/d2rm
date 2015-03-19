app.controller('newPlaylistController', function ($rootScope, $scope, $location, DBService) {
    $scope.newPlaylistName = "";

    $scope.cancel = function () {
        $scope.newPlaylistName = "";
        $location.path('/');
    };

    $scope.save = function () {
        (function($rootScope, $location){
            DBService.InsertNewPlaylist({
                name : $scope.newPlaylistName
            }, function (newObj) {
                $rootScope.playlists.unshift(newObj);
                $location.path('/');
                $rootScope.$digest();
                $scope.newPlaylistName = "";
            });
        })($rootScope, $location);
    };
});