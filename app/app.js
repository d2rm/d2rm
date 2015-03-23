var app = angular.module('D2RM', ['ngRoute', 'ngAnimate', 'angular-loading-bar', 'ui.sortable'])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
        $routeProvider
            .when('/players', {
                'controller'  : 'playersController',
                'templateUrl' : 'app/components/players/playersView.html'
            })
            .when('/donate', {
                'controller'  : function($scope) {$scope.page.title = 'Donate'},
                'templateUrl' : 'app/components/donate/donateView.html'
            })
            .when('/settings', {
                'controller'  : 'settingsController',
                'controllerAs': 'settings',
                'templateUrl' : 'app/components/settings/settingsView.html'
            })
            .when('/history', {
                'controller'  : 'historyController',
                'templateUrl' : 'app/components/history/historyView.html'
            })
            .when('/newplaylist', {
                'controller'  : 'newPlaylistController',
                'templateUrl' : 'app/components/playlist/newPlaylistView.html'
            })
            .when('/playlist/:id', {
                'controller'  : 'playlistController',
                'templateUrl' : 'app/components/playlist/playlistView.html'
            })
            .when('/home', {
                'controller'  : 'homeController',
                'templateUrl' : 'app/components/home/homeView.html'
            })
            .otherwise({'redirectTo' : '/home'});
    }]);