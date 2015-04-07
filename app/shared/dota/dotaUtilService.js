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
        function makeRequest(url, cb2) {
            request.get(url, function (err, req, data) {
                if (err) {
                    return cb2(err);
                }
                if (req.statusCode < 200 || req.statusCode > 299) {
                    return cb2(new Error(req.statusCode));
                }
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    return cb2(e);
                }
                cb2(err, data);
            });
        }
        function writeDataToFile(name, data, cb2) {
            fs.writeFile(name, JSON.stringify(data, null, 4), function(err) {
                if(err) return cb2(err);
                cb2(null);
            });
        }

        makeRequest("https://raw.githubusercontent.com/d2rm/d2rm/master/constants.json", function(err, data) {
            if(err) return cb(err);
            if(data.version !== constants.version) {
                writeDataToFile('constants.json', data, function(err) {
                    if(err) return cb(err);
                    makeRequest("https://raw.githubusercontent.com/d2rm/d2rm/master/abilities.json", function(err, data) {
                        writeDataToFile('abilities.json', data, function(err) {
                            if(err) return cb(err);
                            cb(null);
                        });
                    });
                });
            } else {
                cb(null);
            }
        });
    };
}]);