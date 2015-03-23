describe('newPlaylistController Test', function() {
    beforeEach(module('D2RM'));

    var $controller, $rootScope, $location, $scope;

    beforeEach(inject(function(_$controller_, _$rootScope_, _$location_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $location = _$location_;
        $scope = $rootScope.$new();
        var mockedDBService = {InsertNewPlaylist: function(object, cb) {return cb(object);}};

        $rootScope.playlists = [];

        var newPlaylistController = $controller('newPlaylistController', {
            $rootScope: $rootScope,
            $scope: $scope,
            $location: $location,
            DBService: mockedDBService
        });
    }));

    it('sets location to "/" on cancel', function() {
        $scope.cancel();

        expect($location.path()).toBe('/');
    });

    it('sets location to "/" on save', function() {
        $scope.save();

        expect($location.path()).toBe('/');
    });

    describe('adding playlists', function() {
        beforeEach(function() {
            $scope.newPlaylistName = "TestPlaylist";
        });

        it('adds playlist to playlists array', function() {
            $scope.save();

            expect($rootScope.playlists).toEqual([{name: 'TestPlaylist'}]);
        });

        it('clears the playlist name after saving', function() {
            $scope.save();

            expect($scope.newPlaylistName).toEqual('');
        });
    });

});