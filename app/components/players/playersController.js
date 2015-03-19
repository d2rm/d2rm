app.controller('featuredController', function ($scope, apiService) {
    $scope.artist = {
        id : null,
        imageCover : null,
        imageSmall : null,
        name : null,
        albums : []
    };


    apiService.getArtistWithFullAlbum("Katy Perry", function (data) {
        $scope.artist = data;
    });
});