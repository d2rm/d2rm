var DotaUtils;

DotaUtils = (function() {
    function DotaUtils() {}

    /**
     * 
     * @param account_id {int}
     * @param cb {function}
     */
    DotaUtils.getMatches = function(account_id, cb) {
        var num = (Settings.get('hide-test-matches') == "true") ? 1 : 0;
            db.matches.find({
            duration: {
                $exists: true
            },
            human_players: {$gt: num},
            $where: function () {
                var result = this.players.some(function (player) {
                    return player.account_id == account_id;
                });
                return result;
            }
        }).sort({match_id: -1}).exec(cb);
    };
    
    DotaUtils.getLatestMatchId = function(account_id, cb) {
        DotaUtils.getMatches(account_id, function(err, matches) {
            if (err) return cb(err);
            var latest_match = null;
            if (matches.length > 0) latest_match = matches[0].match_id;
            cb(null, latest_match);
        });
    };

    /**
     * Given an array of player ids, join with data from players collection
     * @param players {array}
     * @param cb {function}
     */
    DotaUtils.fillPlayerNames = function(players, cb) {
        async.mapSeries(players, function(player, cb) {
            db.players.findOne({
                account_id: player.account_id
            }, function(err, dbPlayer) {
                if(dbPlayer) {
                    for(var prop in dbPlayer) {
                        player[prop] = dbPlayer[prop];
                    }
                }
                cb(null);
            });
        }, function(err) {
            cb(err);
        });
    };

    /**
     * Converts a steamid 64 to a steamid 32
     * @param {string} id
     * @returns {BigNumber}
     */
    DotaUtils.convert64to32 = function(id) {
        return BigNumber(id).minus('76561197960265728');
    };
    
    /**
     * Converts a steamid 64 to a steamid 32
     * @param {int} id
     * @returns {BigNumber}
     */
    DotaUtils.convert32to64 = function(id) {
        if(id.length === 17)
            return id;
        return BigNumber('76561197960265728').plus(id);
    };

    /**
     * 
     * @param {object} player The player to te test
     * @returns {boolean} True if the player is on radiant
     */
    DotaUtils.isRadiant = function(player) {
        return player.player_slot < 64;
    };

    /**
     * 
     * @param x Variable to test
     * @returns {boolean} True if x is an int
     */
    DotaUtils.isInt = function(x) {
        var reg = /^\d+$/;
        return reg.test(x);
    };

    /**
     * DANGER - Clears the match and players databases excluding tracked players 
     * @param cb {function}
     */
    DotaUtils.clearDota = function(cb) {
        db.matches.remove({}, {multi: true}, function(err) {
            if(err) return cb(err);
            logger.info("Cleared matches");
            var account_ids = DotaUtils.getTrackedAccountIDs();
            db.players.remove({ account_id: { $nin: account_ids }}, {multi: true}, function(err) {
                if(err) return cb(err);
                logger.info("Cleared players database");
                cb(null);
            });
        });
    };

    /**
     * 
     * @returns {Array} Array of account tracked account ids
     */
    DotaUtils.getTrackedAccountIDs = function() {
        var account_ids = [];
        var steam_account_id = parseInt(Settings.get('steam-account-id'));
        try {
            account_ids = Object.keys(JSON.parse(Settings.get('tracked-users')));

            for(var i=0; i<account_ids.length; i++) {
                account_ids[i] = parseInt(account_ids[i]);
            }
            if(steam_account_id && $.inArray(steam_account_id, account_ids) == -1) account_ids.push(steam_account_id);
            return account_ids;
        } catch (e) {
            if(steam_account_id) {
                account_ids.push(steam_account_id);
                return account_ids;
            } else {
                var msg = "No tracked users set";
                logger.error(msg);
                return alertify.error(msg);
            }
        }
    };

    DotaUtils.purgePlayerMatches = function() {
        var account_ids = DotaUtils.getTrackedAccountIDs();
        db.matches.remove({
            $not: {
                $where: function () {
                    var result = this.players.some(function (player) {
                        var case_result = $.inArray(player.account_id, account_ids) > -1;
                        return case_result;
                    });
                    return result;
                }
            }
        }, { multi: true }, function(err, numRemoved) {
            if(err) return logger.error("[BACKEND] Error: " + err);
            logger.info("[BACKEND] Matches removed: " + numRemoved);
            return DotaUtils.purgeExtraPlayers();
        });
    };

    DotaUtils.purgeExtraPlayers = function() {
        db.matches.find({}, function (err, matches) {
            var playersToKeep = DotaUtils.getTrackedAccountIDs();
            matches.forEach(function (match) {
                match.players.forEach(function (player) {
                    playersToKeep.push(player.account_id);
                });
            });
            db.players.remove({
                account_id: {
                    $nin: playersToKeep
                }
            }, { multi: true }, function (err, numRemoved) {
                if(err) return logger.error("[BACKEND] Error: " + err);
                logger.info("[BACKEND] Players removed: " + numRemoved);
            });
        });
    };

    DotaUtils.buildLookup = function(array) {
        var lookup = {};
        for(var i = 0; i < array.length; i++) {
            lookup[array[i].id] = array[i];
        }
        return lookup;
    };

    /**
     * Logs onto steam and launches Dota 2
     * @param {function} cb
     * @param {string} user
     * @param {string} pass
     * @param {string} authCode
     */
    DotaUtils.logOnSteam = function(cb, user, pass, authcode) {
        user = user || Settings.get('steam-user');
        pass = pass || Settings.get('steam-password');
        authcode = authcode || null;
        var onSteamLogOn = function onSteamLogOn() {
                logger.info("[STEAM] Logged on.");
                Steam.gamesPlayed([570]);
                setTimeout(function() {if(Steam.loggedOn) cb(null);}, 3000);
            },
            onSteamSentry = function onSteamSentry(newSentry) {
                logger.info("[STEAM] Received sentry.");
                fs.writeFileSync("sentry", newSentry);
            },
            onSteamServers = function onSteamServers(servers) {
                logger.info("[STEAM] Received servers.");
                fs.writeFile("servers", JSON.stringify(servers));
            },
            onSteamError = function onSteamError(e) {
                if(e.cause == "logonFail") {
                    switch (e.eresult) {
                        case 5:
                            alertify.error("The steam user details you have provided are wrong. Please check them through the settings menu.").dismissOthers();
                            return cb(e);
                        case 50:
                            alertify.error("The steam account you have chosen is already logged in elsewhere.").dismissOthers();
                            return cb(e);
                        case 63:
                            settingsPanel.close();
                            alertify.prompt("Steam Guard Enabled",
                                "Please check your email and enter the steam guard code below: ",
                                "Steam guard code...",
                                function (evt, value) {
                                    DotaUtils.logOnSteam(cb, user, pass, value);
                                },
                                function () {
                                    alertify.message('You will be unable to use this steam account without the code');
                                }
                            );
                            break;
                        default:
                            cb(e);
                    }
                } else if(e.cause == 'loggedOff') {
                    switch(e.eresult) {
                        case 6:
                        case 50:
                            alertify.error("The steam account you have chosen is already logged in elsewhere.").dismissOthers();
                            return cb(e);
                        default:
                            cb(e);
                    }
                } else {
                    cb(e);
                }
            };
        if(!fs.existsSync("sentry")) {
            fs.openSync("sentry", 'w');
        }
        var logOnDetails = {
            "accountName": user,
            "password": pass
        };
        var sentry = fs.readFileSync("sentry");
        if(authcode) logOnDetails.authCode = authcode;
        if(sentry.length) logOnDetails.shaSentryfile = sentry;
        Steam.logOn(logOnDetails);
        Steam.on("loggedOn", onSteamLogOn).on('sentry', onSteamSentry).on('servers', onSteamServers).on('error', onSteamError);
    };
    
    DotaUtils.prototype.setTimeout = function() {
        var self = this;
        self.timeout = setTimeout(function() {
            Dota2.exit();
            Steam.logOff();
            Steam = new steam.SteamClient();
            Dota2 = new dota2.Dota2Client(Steam, false);
            logger.warn("[DOTA] request timed out.");
            return logger.warn("STEAM TIMEOUT");
        }, 15000);
    };
    
    DotaUtils.prototype.removeTimeout = function() {
        var self = this;
        clearTimeout(self.timeout);
    };
    
    DotaUtils.assureSteamConnection = function(cb) {
        if(!Steam.loggedOn) {
            DotaUtils.logOnSteam(function(err) {
                if(err) return logger.error('[STEAM] Problem ');
                Steam.gamesPlayed([]);
                Dota2.launch();
                Dota2.on("ready", function () {
                    cb();
                });
            });
        } else {
            cb();
        }
    };

    DotaUtils.toUnderscore = function(o){
        var copy;

        if(Array.isArray(o)) {
            copy = [];
            for(var i=0; i < o.length; i++) {
                var value = o[i];
                if(typeof(value) == 'object') value = DotaUtils.toUnderscore(value);
                copy[i] = value;
            }
        } else {
            copy = {};
            var propNames = Object.getOwnPropertyNames(o);
            propNames.forEach(function (name) {
                var value = o[name];
                if (typeof(value) == 'object') value = DotaUtils.toUnderscore(value);
                copy[name.replace(/([A-Z])/g, function ($1) {
                    return "_" + $1.toLowerCase();
                })] = value;
            });
        }

        return copy;
    };

    DotaUtils.printDBInfo = function() {
        db.players.count({}, function (err, result) {
            console.log("players");
            console.log(result);
        });

        db.matches.count({}, function (err, result) {
            console.log("matches");
            console.log(result);
        });
    };
    
    DotaUtils.addTrackedPlayer = function(idToAdd, cb) {
        if(!Settings.get('api-key')) return "Please set an API key first then try again";
        if(idToAdd !== '') backend.getPlayerSummary(idToAdd, function (err, player) {
            if(err) return alertify.error("There was a problem fetching player summary.");
            var name = player.personaname;
            var id = player.account_id;
            db.players.update({
                account_id: id
            }, {
                $set: {
                    full_history: 1
                }
            }, {}, function(err) {
                if(err) return "There was a problem updating the player in the database";
                cb(null, name, id);
            });
        });
    };

    DotaUtils.trackSteamAccount = function(cb) {
        DotaUtils.assureSteamConnection(function() {
            logger.info("[DOTA] requesting player profile");
            logger.debug("[DOTA] account ID: " + Dota2.AccountID);
            DotaUtils.addTrackedPlayer(Dota2.AccountID, function(err, name, id) {
                if(err) return cb(err);
                else if(name && id) {
                    Settings.set('steam-account-id', id);
                    alertify.success("Tracking steam account of " + name);
                    return cb(null);
                }
                return cb("[DOTA UTILS] Undefined Error");
            });
        });
    };
    
    DotaUtils.checkIfMatchInMMRData = function(account_id, match_id, solo, cb) {
        var type = (solo) ? "solo_MMR" : "team_MMR";
        var query = {account_id: account_id};
        query[type + "." + match_id] = {$exists: true};
        logger.debug("[UTILS] MMR data query :" + query);
        db.players.findOne(query, function(err, result) {
            if(err) return cb(err);
            else if(result) return cb(null, true);
            return cb(null, false);
        });
    };

    /**
     * Will check the latest available version of the constants by requesting constants.json from github.
     * The callback will be executed if the version was changed.
     * @param {function} cb - Callback arguments: error
     */
    DotaUtils.updateConstantsFiles = function(cb){
        var constants;
        try {
            constants = JSON.parse(fs.readFileSync(path.join(require('nw.gui').App.dataPath, 'constants.json')));
        } catch(e) {
            constants = require('../constants.json');
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
                    fs.writeFile(path.join(require('nw.gui').App.dataPath, 'constants.json'), JSON.stringify(data, null, 4), function(err) {
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
                            fs.writeFile(path.join(require('nw.gui').App.dataPath, 'abilities.json'), JSON.stringify(data, null, 4), function(err) {
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

    return DotaUtils;

})();