app.controller("MainAppController", function($rootScope, $scope, $location, DBService){
    $scope.version = require('./package.json').version;
    $scope.$location = $location;
    $rootScope.playlists = [];

    var gui = require('nw.gui');
    var win = gui.Window.get();
    var prevPlaylistOrder = [];

    function processArgs() {
        var args = gui.App.argv;
        var processed = [];
        args.forEach(function(arg) {
            if(processed.indexOf(arg) < 0) {
                processed.push(arg);
                switch (arg) {
                    case '--debug': {
                        return win.showDevTools(); //TODO: make this more robust - set winston log level
                    }
                    case '--version': {
                        console.log("DOTA 2 Replay Manager v" + $scope.version);
                        return gui.App.quit();
                    }
                }
            }
        });
    }
    processArgs();

    $scope.getLocationPath = function (path, startsWith) {
        return startsWith ? ($location.path().indexOf(path) == 0) : ($location.path() == path);
    };

    DBService.getAllPlaylists(function (data) {
        $rootScope.playlists = data;
    });

    $scope.sortableOptions = {
        update: function(e, ui) {prevPlaylistOrder = $rootScope.playlists.slice();},
        stop: function(e, ui) {
            $rootScope.playlists.forEach(function(val, i) {
                if(val._id != prevPlaylistOrder[i]._id) {
                    DBService.updatePlaylistPosition(val._id, i);
                }
            });
        }
    };
});