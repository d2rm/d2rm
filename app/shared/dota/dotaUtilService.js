app.service('dotaUtilService', ['loggerService', 'settingsService', function (logger, settingsService) {
    var settings = settingsService.settings;
    var request = require("request");
    var fs = require('fs');

    /**
     * Will check the latest available version of the constants by requesting constants.json from github.
     * The callback will be executed if the version was changed.
     * @param {function} cb - Callback arguments: error
     */
    this.updateConstantsFiles = function(cb){
        var constants;
        try {
            constants = JSON.parse(fs.readFileSync('constants.json'));
        } catch(e) {
            constants = {version: 0};
        }
        request.get("https://raw.githubusercontent.com/d2rm/d2rm/master/constants.json", function (err, req, data) {
                if(err) {
                    return cb(err);
                }
                if(req.statusCode < 200 || req.statusCode > 299) {
                    return cb(new Error(req.statusCode));
                }
                try {
                    data = JSON.parse(data);
                } catch(e) {
                    return cb(e);
                }
                if(data.version !== constants.version) {
                    fs.writeFile('constants.json', JSON.stringify(data, null, 4), function(err) {
                        if(err) return cb(err);
                        request.get("https://raw.githubusercontent.com/d2rm/d2rm/master/abilities.json", function (err, req, data) {
                            if(req.statusCode < 200 || req.statusCode > 299) {
                                return cb(new Error(req.statusCode));
                            }
                            try {
                                data = JSON.parse(data);
                            } catch(e) {
                                return cb(e);
                            }
                            fs.writeFile('abilities.json', JSON.stringify(data, null, 4), function(err) {
                                if(err) return cb(err);
                                cb(null);
                            });
                        });
                    });
                } else {
                    cb(null);
                }
            }
        );
    };
}]);