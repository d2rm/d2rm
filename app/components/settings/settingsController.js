app.controller('settingsController', function ($scope, storageService) {
    $scope.page.title = 'Settings';
    var storage = storageService,
        crypto = require('crypto'),
        algorithm = 'aes-256-ctr',
        password = '6zwcSMcX',
        settings = JSON.parse(storage.get('settings')) || {},
        gui = require('nw.gui');

    this.model = {
        showNotifications : "ShowNotifications",
        language : "Language",
        theme : "Theme",
        steamUsername: settings.steamUsername || '',
        steamPassword: decrypt(settings.steamPassword) || '',
        saveAllMatches: settings.saveAllMatches
    };

    function encrypt(text){
        if(!text) return '';
        var cipher = crypto.createCipher(algorithm,password);
        var crypted = cipher.update(text,'utf8','hex');
        crypted += cipher.final('hex');
        return crypted;
    }

    function decrypt(text){
        if(!text) return '';
        var decipher = crypto.createDecipher(algorithm,password);
        var dec = decipher.update(text,'hex','utf8');
        dec += decipher.final('utf8');
        return dec;
    }

    this.getAPIKey = function() {
        gui.Shell.openExternal('http://steamcommunity.com/dev/apikey');
    };

    this.save = function() {
        var self = this;
        self.model.steamPassword = encrypt(self.model.steamPassword);
        storage.set('settings', JSON.stringify(self.model));
        history.back();
    };

    this.cancel = function() {
        history.back();
    };
});