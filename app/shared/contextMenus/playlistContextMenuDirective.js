app.directive('playlistContextMenu', function($rootScope, DBService){
    var gui = require('nw.gui');

    function createDeleteMenuItem($scope) {
        var playlist = $scope.playlist;

        return new gui.MenuItem({
            label: 'Delete ' + playlist.name,
            click: function() {
                (function($rootScope) {
                    DBService.deletePlaylist(playlist._id);
                    $rootScope.playlists.some(function (el, i, arr) {
                        if (el._id == playlist._id) {
                            arr.splice(i, 1);
                            return true;
                        }
                        return false;
                    });
                    $rootScope.$digest();
                })($rootScope);
            }
        });
    }

    return {
        restrict : 'A',
        link: function ($scope, element) {
            element.on('contextmenu', function(e) {
                var menu = new gui.Menu();
                menu.append(createDeleteMenuItem($scope));
                menu.popup(e.clientX, e.clientY);
            });
        }
    };
});