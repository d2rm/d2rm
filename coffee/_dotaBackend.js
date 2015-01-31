var Backend;

Backend = (function() {
    function Backend() {
        this.fetched_matched = 0;
        this.api_url = "https://api.steampowered.com/IDOTA2Match_570";
        this.remote = "http://dotabuff.com";
        this.vanity_url = "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=";
        this.summaries_url = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=";
        this.asset_path = path.join(require('nw.gui').App.dataPath, 'images');
        this.ensureFolderExists(this.asset_path, function(err) {
            if(err) return logger.error("[CONSTANTS] " + err);
        });
        this.q = async.queue(ReplayParser.parseReplay, 1);
        this.q.drain = function() {
            alertify.success("Finished parsing replays");
        };
    }

    Backend.prototype.refreshDOTA = function(cb) {
        var self = this;
        var account_ids = DotaUtils.getTrackedAccountIDs();
        if(!Settings.get('api-key')) return cb("API key is not set");
        if(!account_ids) return cb("No tracked players");
        async.series([
            function (cb) {
                if (Settings.get('save-all-matches') == "false") return cb(null);
                //scrape players full match history
                db.players.find({
                    full_history: 1
                }, function (err, docs) {
                    if(err) return cb("Problem fetching players from database.");
                    else if(!docs) return cb("No players to scrape");
                    async.mapSeries(docs, function (player, cb2) {
                        var account_id = player.account_id;
                        var player_url = self.remote + "/players/" + account_id + "/matches";
                        self.checkAPIavailability(account_id, function(available) { // TODO: remove the dotabuff code
                            if(available) {
                                logger.info('[BACKEND] Fetching full match history for ' + account_id + ' through dotabuff.');
                                self.getMatchPage(player_url, function (err) {
                                    //done scraping player
                                    db.players.update({
                                        account_id: account_id
                                    }, {
                                        $set: {
                                            full_history: 0
                                        }
                                    });
                                    cb2(err);
                                });
                            } else {
                                logger.info('[BACKEND] Fetching full match history for ' + account_id + ' through client.');
                                self.clientGetMatchHistory(account_id, true, function(err) {cb(err);});
                            }
                        });
                    }, function (err) {
                        logger.info("[BACKEND] Scraping full match history");
                        cb(err);
                    });
                });
            },
            function (cb) {
                //scrape players' match histories
                if (!account_ids) return cb("No tracked players");
                async.mapSeries(account_ids, function (account_id, cb2) {
                    if(account_id == parseInt(Settings.get('steam-account-id'))) {
                        logger.debug('scraping MMR for ' + account_id);
                        db.players.findOne({account_id: account_id}, function(err, player) {
                            if(err) return cb2(err);
                            DotaUtils.getLatestMatchId(account_id, function(err, last_db_match) {
                                if(err || player.full_history == 1) last_db_match = 0;
                                self.clientScrapeMMR(function(err) {
                                    db.players.update({
                                        account_id: account_id
                                    }, {
                                        $set: {
                                            full_history: 0
                                        }
                                    });
                                    cb2(err);
                                }, last_db_match);
                            });
                        });
                    } else {
                        self.checkAPIavailability(account_id, function (available) {
                            if (available) {
                                db.players.findOne({account_id: account_id}, function (err, player) {
                                    if (err) return cb("Problem fetching players from database.");
                                    else if (!player) cb("Couldn't find tracked player in database");
                                    self.queueReq("api", player);
                                    cb2(err);
                                });
                            } else {
                                self.clientGetMatchHistory(account_id, false, function(err) {cb(err);});
                                cb2(null);
                            }
                        });
                    }
                }, function (err) {
                    logger.info("[BACKEND] Fetching players' histories");
                    cb(err);
                });
            },
            function (cb) {
                //parse unparsed matches
                db.matches.find({
                    parse_status: 0
                }, function (err, docs) {
                    if(err) return cb("Problem fetching unparsed matches from database.");
                    else if(!docs) return cb("No unparsed matches");
                    async.mapSeries(docs, function (match, cb2) {
                        self.queueReq("parse", match);
                        cb2(err);
                    }, function (err) {
                        logger.info("[BACKEND] Parsing unparsed matches");
                        cb(err);
                    });
                });
            }
        ], function (err) {
            if(!err) return cb(null, "[BACKEND] Scraping tracked player information");
            else return cb(err);
        });
    };

    Backend.prototype.getMatchPage = function(url, cb) {
        var self = this;
        request(url, function(err, resp, body) {
            logger.info("[REMOTE] %s", url);
            var parsedHTML = cheerio.load(body);
            var matchCells = parsedHTML('td[class=cell-xlarge]');
            matchCells.each(function(i, matchCell) {
                var match_url = self.remote + cheerio(matchCell).children().first().attr('href');
                var match = {};
                match.match_id = Number(match_url.split(/[/]+/).pop());
                self.requestDetails(match, function(err) {});
            });
            var nextPath = parsedHTML('a[rel=next]').first().attr('href');
            if(nextPath) {
                self.getMatchPage(self.remote + nextPath, cb);
            } else {
                cb(null);
            }
        });
    };

    Backend.prototype.requestDetails = function(match, cb) {
        var self = this;
        db.matches.findOne({
            match_id: match.match_id
        }, function(err, doc) {
            if(!doc) {
                self.queueReq("api", match);
            }
            cb(null);
        });
    };

    Backend.prototype.queueReq = function(type, data, cb) {
        var self = this;
        cb = cb || function() {};
        var url;
        if(type === "api") {
            if(data.match_id) {
                url = self.api_url + "/GetMatchDetails/V001/?key=" + Settings.get('api-key') + "&match_id=" + data.match_id;
            } else if(data.query) {
                logger.debug(data.query);
                url = self.summaries_url + Settings.get('api-key') + "&steamids=" + data.query;
                logger.debug(url);
            } else if(data.account_id) {
                url = self.api_url + "/GetMatchHistory/V001/?key=" + Settings.get('api-key') + "&account_id=" + data.account_id;
            }
            self.apiRequest({url: url, payload: data}, cb);
        }
        if(type === "parse") {
            data = {
                match_id: data.match_id,
                start_time: data.start_time
            };
            var payload = {
                data: data,
                url: url
            };
            self.q.push(payload, false, function(err) {
                if(err) {
                    alertify.error("Problem parsing the match. Details saved to dota.log");
                    logger.error("[PARSER] Error: " + err);
                }
            });
        }
    };

    Backend.prototype.apiRequest = function (data, cb) {
        var self = this;
        var payload = data.payload;
        self.getData(data.url, function(err, data) {
            if(data.response) {
                //summaries response
                var playersData = data.response.players;
                logger.debug("Player data: ");
                logger.debug(playersData);
                if(playersData && playersData.length > 0) {
                    async.map(playersData, self.insertPlayer, function (err) {
                        if(err) return cb(err);
                    });
                    var account_id = Number(DotaUtils.convert64to32(playersData[0].steamid));
                    playersData[0].account_id = account_id;
                    cb(null, playersData[0]);
                } else {
                    var error = "[BACKEND] No players in response object";
                    logger.error(error);
                    return cb(error, null);
                }
            } else if(data.result.error || data.result.status == 2 || data.success == 42) {
                logger.debug("[BACKEND]" + data);
                return cb(data);
            } else if(payload.match_id) {
                var match = data.result;
                if(payload.hero_id) self.__clientAssociateMatch(match, payload.hero_id, payload.accountId);
                self.insertMatch(match, function (err) {
                    cb(err);
                });
            } else {
                if(data.result.status == 15)
                {
                    if (payload.account_id) {
                        logger.info('[BACKEND] Fetching match history for ' + payload.account_id + ' through client.');
                        self.clientGetMatchHistory(payload.account_id, false, function(err) {cb(err);});
                    }
                } else {
                    var resp = data.result.matches;
                    if (payload.account_id) {
                        async.map(resp, function (match, cb) { // TODO: Potentia error here - async is undefined?
                            self.requestDetails(match, function (err) {
                                cb(err);
                            });
                        }, function (err) {
                            cb(err);
                        });
                    }
                }
            }
        });
    };

    Backend.prototype.insertMatch = function(match, cb) {
        var self = this;
        var summaries = {};
        var steamids = [];
        
        match.parse_status = (Settings.get('save-all-replays') == 'true' ? 0 : 3);
        db.matches.update({match_id: match.match_id}, {$set: match}, {upsert: true});
        match.players.forEach(function(player) {
            if(player.account_id) steamids.push(DotaUtils.convert32to64(player.account_id).toString());
        });
        summaries.query = steamids.join();
        self.queueReq("api", summaries);
        if(match.parse_status === 0) self.queueReq("parse", match);
        cb(null);
    };

    /*
     * Inserts/updates a player in the database
     */
    Backend.prototype.insertPlayer = function(player, cb) {
        var account_id = Number(DotaUtils.convert64to32(player.steamid));
        db.players.update({
            account_id: account_id
        }, {
            $set: player
        }, {
            upsert: true
        }, function(err) {
            cb(err);
        });
    };

    Backend.prototype.updateConstants = function(cb) {
        var self = this;
        DotaUtils.updateConstantsFiles(function(err) {
            if (err) return logger.error(err);
            var constants, ability_ids;
            try {
                constants = JSON.parse(fs.readFileSync(path.join(require('nw.gui').App.dataPath, 'constants.json')));
                ability_ids = JSON.parse(fs.readFileSync(path.join(require('nw.gui').App.dataPath, 'abilities.json')));
            } catch(e) {
                constants = require('../constants.json');
                ability_ids = require('../abilities.json');
            }
            if (!constants || !ability_ids) return cb("[CONSTANTS] json resource files not found");
            if (!Settings.get('api-key')) return cb("[CONSTANTS] API key is not set");
            async.map(Object.keys(constants), function (key, cb) {
                var val = constants[key];
                if (typeof(val) == "string" && val.slice(0, 4) == "http") {
                    //insert API key if necessary
                    val = val.slice(-4) === "key=" ? val + Settings.get('api-key') : val;
                    self.getData(val, function (err, result) {
                        constants[key] = result;
                        cb(null);
                    });
                } else {
                    cb(null);
                }
            }, function (err) {
                var heroes = constants.heroes.result.heroes;
                heroes.forEach(function (hero) {
                    var hero_name = hero.name.replace("npc_dota_hero_", "") + "_sb.png";
                    var hero_path = path.join(self.asset_path, 'heroes/');
                    self.downloadAssets(hero_path, hero_name, "http://cdn.dota2.com/apps/dota2/images/heroes/" + hero_name);
                    hero.img = "file://" + hero_path + hero_name;
                });
                constants.heroes = DotaUtils.buildLookup(heroes);
                constants.hero_names = {};
                for (var i = 0; i < heroes.length; i++) {
                    constants.hero_names[heroes[i].name] = heroes[i];
                }
                var items = constants.items.itemdata;
                constants.item_ids = {};
                for (var key in items) {
                    constants.item_ids[items[key].id] = key;
                    var item_name = items[key].img;
                    var item_path = path.join(self.asset_path, 'items/');
                    self.downloadAssets(item_path, item_name, "http://cdn.dota2.com/apps/dota2/images/items/" + item_name);
                    items[key].img = "file://" + item_path + item_name;
                }
                constants.items = items;
                var lookup = {};
                for (i = 0; i < ability_ids.length; i++) {
                    lookup[ability_ids[i].id] = ability_ids[i].name;
                }
                constants.ability_ids = lookup;
                constants.ability_ids[5060] = constants.ability_ids[5059];
                constants.ability_ids[5061] = constants.ability_ids[5059];
                var abilities = constants.abilities.abilitydata;
                for (key in abilities) {
                    var ability_name = key + "_md.png";
                    var ability_path = path.join(self.asset_path, 'abilities/');
                    self.downloadAssets(ability_path, ability_name, "http://cdn.dota2.com/apps/dota2/images/abilities/" + ability_name);
                    abilities[key].img = "file://" + ability_path + ability_name;
                }
                var temp = abilities.nevermore_shadowraze1;
                abilities.nevermore_shadowraze2 = {};
                abilities.nevermore_shadowraze3 = {};
                for (var attr in temp) {
                    abilities.nevermore_shadowraze2[attr] = temp[attr];
                    abilities.nevermore_shadowraze3[attr] = temp[attr];
                }
                abilities.nevermore_shadowraze1.dname = "Shadowraze (near)";
                abilities.nevermore_shadowraze2.dname = "Shadowraze (medium)";
                abilities.nevermore_shadowraze3.dname = "Shadowraze (far)";
                abilities.nevermore_shadowraze2.attrib = 'RANGE: <span class="attribVal">450</span>';
                abilities.nevermore_shadowraze3.attrib = 'RANGE: <span class="attribVal">700</span>';
                abilities.stats = {
                    dname: "Stats",
                    img: 'images/Stats.png',
                    attrib: "+2 All Attributes"
                };
                constants.abilities = abilities;
                lookup = {};
                var regions = constants.regions.regions;
                for (i = 0; i < regions.length; i++) {
                    lookup[regions[i].id] = regions[i].name;
                }
                constants.regions = lookup;
                constants.regions["251"] = "Peru";
                db.constants.update({}, constants, {
                    upsert: true
                }, function (err) {
                    logger.info("[CONSTANTS] updated constants");
                    cb(null);
                });
            });
        });
    };

    Backend.prototype.getData = function(url, cb) {
        var operation = retry.operation({
            retries: 10,
            factor: 1.71,
            minTimeout: 1000
        });
        //logger.debug("[API] %s", url);
        operation.attempt(function(currentAttempt) {
            request(url, function(err, res, body) {
                if(operation.retry(err) || operation.retry(res.statusCode != 200) || operation.retry(!body)) {
                    if(!res) {
                        logger.info("[API] Attempt " + currentAttempt + "/10: Error getting data, retrying");
                        logger.info("[API] URL: " + url);
                        return;
                    }
                    else if(res.statusMessage == "Forbidden") {
                        operation._attempts = 10;
                        operation._fn = function() {alertify.error("Invalid API Key");};
                    }
                    return;
                }
                if(err || res.statusCode != 200 || !body)
                    err = operation.mainError();
                else
                    err = null;
                cb(err, JSON.parse(body));
            });
        });
    };

    Backend.prototype.downloadAssets = function(path, filename, url) {
        var self = this;
        self.ensureFolderExists(path, function(err) {
            if(err) return logger.error("[CONSTANTS] " + err);
            fs.stat(path + filename, function (err) {
                if(err) {
                    if (err.errno === 34) {
                        self.saveImageAsset(url,
                            path + filename);
                    } else {
                        logger.error("[CONSTANTS] " + err);
                    }
                }
            });
        });
    };

    Backend.prototype.ensureFolderExists = function(path, mask, cb) {
        if (typeof mask == 'function') { // allow the `mask` parameter to be optional
            cb = mask;
            mask = 0777;
        }
        fs.mkdir(path, mask, function(err) {
            if (err) {
                if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
                else cb(err); // something else went wrong
            } else cb(null); // successfully created folder
        });
    };

    Backend.prototype.saveImageAsset = function(url, filename) {
        request(url, {encoding: 'binary'}, function(err, response, body) {
            if(err || response.statusCode !== 200) return logger.error("[CONSTANTS] " + err);
            fs.writeFile(filename, body, 'binary', function (err) {
                if(err) return logger.error("[CONSTANTS] " + err);
            });
        });
    };

    Backend.prototype.getPlayerSummary = function(userID, cb) {
        var self = this;
        if(DotaUtils.isInt(userID)) return self.queueReq('api', {query: DotaUtils.convert32to64(userID)}, cb);
        self.resolveVanityURL(userID, function(err, data) {
            if(err || data.response.success != 1) {
                logger.info("[BACKEND] Vanity url doesn't exist.");
                return cb(data);
            }
            return self.queueReq('api', {query: data.response.steamid}, cb);
        });
    };

    Backend.prototype.resolveVanityURL = function(userID, cb) {
        var self = this;
        self.getData(self.vanity_url + Settings.get('api-key') + "&vanityurl=" + userID, cb);
    };

    Backend.prototype.clientGetMatchHistory = function(account_id, full, cb) {
        var self = this;
        DotaUtils.assureSteamConnection(function() {
            logger.info("[DOTA] requesting match history data of %s", account_id);
            // Try to get match history for 15 sec, else give up and try again later.
            dotaUtils.setTimeout();
            if(full) self.__clientScrapeFullMatchHistory(account_id, cb);
            else self.__clientUpdateMatchHistory(account_id, cb);
        });
    };
    
    Backend.prototype.__clientSaveMatches = function(matches, accountId) {
        var self = this;
        matches.forEach(function(match) {
            var lobby_type = match.lobbyType;
            if(lobby_type != -1) {
                if(lobby_type != 1 && lobby_type != 3) {
                    self.requestDetails(
                        {
                            "match_id": match.matchId, 
                            "hero_id": match.heroId, 
                            "accountId": accountId
                        }, function() {}
                    );
                } else {
                    logger.debug('private match');
                    match = DotaUtils.toUnderscore(match);
                    db.matches.findOne({match_id: Number(match.match_id)}, function(err, doc) {
                        if(err) logger.error(err);
                        else if(doc) logger.debug('[BACKEND] private match already in database; not fetching.');
                        else self.__clientSavePrivateMatch(match);
                    });
                }
            }
        });
    };
    
    Backend.prototype.__clientSavePrivateMatch = function(match) {
        var self = this;
        Dota2.matchDetailsRequest(match.match_id, function(err, data) {
            if(err) logger.error('[DOTA] Unable to fetch match details for match id ' + match.match_id);
            var match_details = DotaUtils.toUnderscore(data.match);
            match_details.match_id = Number(match_details.match_id);
            self.insertMatch(match_details, function (err) {
                if(err) logger.error(err);
            });
        });
    };
    
    Backend.prototype.__clientUpdateMatchHistory = function(account_id, cb, first_match_id, last_match_id) {
        var self = this;
        first_match_id = first_match_id || 0;
        last_match_id = last_match_id || 0;
        var success = function() {
            logger.info("[DOTA] Finished fetching player match history from the client.");
            self.fetched_matched = 0;
            dotaUtils.removeTimeout();
            cb(null);
        };
        DotaUtils.getLatestMatchId(account_id, function(err, latest_match) {
            if(err) return logger.error(err);
            else if(first_match_id >= latest_match) {
                Dota2.getPlayerMatchHistory(account_id, last_match_id, function (err, data) {
                    if (err) return cb(err);
                    self.__clientSaveMatches(data.matches, account_id);
                    self.fetched_matched += 13;
                    if (self.fetched_matched < 100 && data.matches.length == 13) {
                        var matches = data.matches;
                        self.__clientUpdateMatchHistory(account_id, cb, Number(matches[0].matchId), Number(matches[12].matchId));
                    } else {
                        success();
                    }
                });
            } else {
                success();
            }
        });
    };
    
    Backend.prototype.__clientScrapeFullMatchHistory = function(account_id, cb, match_id) {
        var self = this;
        match_id = match_id || 0;
        Dota2.getPlayerMatchHistory(account_id, match_id, function(err, data) {
            if(err) return cb(err);
            self.__clientSaveMatches(data.matches, account_id);
            if(data.matches.length == 13) {
                self.__clientScrapeFullMatchHistory(account_id, cb, Number(data.matches[12].matchId));
            } else {
                logger.info("[DOTA] Finished fetching full player match history from the client.");
                db.players.update({
                    account_id: account_id
                }, {
                    $set: {
                        full_history: 0
                    }
                });
                dotaUtils.removeTimeout();
                cb(null);
            }
        });
    };

    Backend.prototype.__clientAssociateMatch = function(match, hero_id, account_id) {
        match.players.forEach(function(player) {
            if(player.hero_id == hero_id) player.account_id = account_id;
        });
    };
    
    Backend.prototype.checkAPIavailability = function(account_id, cb) {
        var self = this;
        var url = self.api_url + "/GetMatchHistory/V001/?key=" + Settings.get('api-key') + "&account_id=" + account_id;
        self.getData(url, function(err, data) {
            var available = true;
            if(data.result.status == 15) available = false;
            cb(available);
        });
    };
    
    Backend.prototype.clientScrapeMMR = function(cb, last_db_match_id, last_match_id) { 
        var self = this;
        last_match_id = last_match_id || 0;
        logger.info('[DOTA] Scraping MMR history');
        DotaUtils.assureSteamConnection(function () {
            dotaUtils.setTimeout();
            var account_id = Dota2.AccountID;
            self.cont = true;
            Dota2.getPlayerMatchHistory(account_id, last_match_id, function (err, data) {
                if (err) return cb('[DOTA] Unable to fetch player match history for ' + account_id);
                var matches = data.matches;
                self.__clientSaveMatches(matches, account_id);
                var cont = matches.every(function (match) {
                    var old_MMR = match.previousRank;
                    var match_id = match.matchId;
                    if(match_id >= last_db_match_id) {
                        if (old_MMR) {
                            var query = {$set: {}};
                            query.$set["team_MMR." + match_id] = old_MMR + match.rankChange;
                            var solo = false;
                            if (match.soloRank) {
                                solo = true;
                                query.$set["solo_MMR." + match_id] = old_MMR + match.rankChange;
                            }
                            DotaUtils.checkIfMatchInMMRData(account_id, match_id, solo, function (err, res) {
                                if (err) return cb('[BACKEND] Could not determine if MMR data is preset for match');
                                else if (res) {
                                    self.cont = false;
                                    return;
                                }
                                db.players.update({
                                    account_id: account_id
                                }, query, {upsert: true});
                            });
                        }
                    } else {
                        self.cont = false;
                        return;
                    }
                    return self.cont;
                });
                dotaUtils.removeTimeout();
                if (cont && matches.length == 13) self.clientScrapeMMR(cb, last_db_match_id, Number(matches[12].matchId));
                else {
                    self.cont = false;
                    logger.info('[DOTA] Finished scraping MMR history from the client.');
                    cb(null);
                }
            });
        });
    };
    
    return Backend;
    
})();