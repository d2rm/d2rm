app.controller('settingsController', function ($scope, settingsService) {
    var gui = require('nw.gui');

    $scope.page.title = 'Settings';

    this.languages = require('./languages/metadata.json').languages;

    this.model = angular.copy(settingsService.settings);

    this.getAPIKey = function() {
        gui.Shell.openExternal('http://steamcommunity.com/dev/apikey');
    };

    this.save = function() {
        settingsService.settings = this.model;
        settingsService.save();
        history.back();
    };

    this.cancel = function() {
        history.back();
    };
});