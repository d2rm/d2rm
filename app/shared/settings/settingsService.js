app.service('settingsService', ['storageService', '$translate', function settingsService(storageService, $translate) {
    var crypto = require('crypto'),
        algorithm = 'aes-256-ctr',
        key = storageService.get('key'),
        settings = JSON.parse(storageService.get('settings')) || {};

    if(!key) {
        try {
            key = crypto.randomBytes(20).toString('hex');
            storageService.set('key', key);
        } catch (e) {
            // handle error
            // most likely, entropy sources are drained
        }
    }

    function encrypt(text){
        if(!text) return '';
        var cipher = crypto.createCipher(algorithm,key);
        var crypted = cipher.update(text,'utf8','hex');
        crypted += cipher.final('hex');
        return crypted;
    }

    function decrypt(text){
        if(!text) return '';
        var decipher = crypto.createDecipher(algorithm,key);
        var dec = decipher.update(text,'hex','utf8');
        dec += decipher.final('utf8');
        return dec;
    }

    this.save = function save() {
        var settings = angular.copy(this.settings);
        settings.steamPassword = encrypt(settings.steamPassword);
        storageService.set('settings', JSON.stringify(settings));
        $translate.use(this.settings.language);
        alertify.success('Settings saved');
    };

    this.settings = {
        showNotifications : "ShowNotifications",
        language : settings.language || 'en_US',
        theme : "Theme",
        APIKey: settings.APIKey || '',
        steamUsername: settings.steamUsername || '',
        steamPassword: decrypt(settings.steamPassword) || '',
        saveAllMatches: settings.saveAllMatches
    };
}]);