var ViewHelper;

ViewHelper = (function() {
    function ViewHelper() {
        this.contentWrap = $('#ContentWrapper');
        this.spinner = $('#Spinner');
        this.referrer = {bridge: false, account_id: null, match_id: null};
    }

    ViewHelper.prototype.resolveRedirect = function () {
        var self = this;
        if(self.referrer.bridge) {
            self.referrer.bridge = false;
            if (self.referrer.account_id) {
                self.clearContent();
                self.showPlayer(self.referrer.account_id);
            } else if (self.referrer.match_id) {
                self.clearContent();
                self.showMatch(self.referrer.match_id);
            }
        } else {
            $('#SideBar li.' + self.referrer.page).click();
        }
    };
    
    ViewHelper.prototype.bindReplayEvents = function() {
        var self = this;
        var match_id = $('.match_info').attr('id');
        $('#watch').click(function() {
            var path = '"' + path.join(Settings.get('steam-folder'), '/steam.exe') +
                '" -applaunch 570 +"playdemo ' + path.join('replays', match_id) + '.dem';
            logger.debug(path);
            exec(path);
            History.addMatch(Number(match_id));
        });
        $('#download').click(function() {
            alertify.message("Downloading replay...");
            $(this).css('display', 'none');
            $('#downloading').css('display', 'block');
            db.matches.findOne({match_id: Number(match_id)}, function(err, match) {
                if(err) return alertify.error("There was a problem fetching the replay.");
                var data = {
                    match_id: match.match_id,
                    start_time: match.start_time
                };
                var payload = {
                    data: data,
                    url: null
                };
                ReplayParser.parseReplay(payload, true, function(err) {
                    if(err) return alertify.error("There was a problem fetching the replay.");
                    alertify.success("Replay downloaded and parsed.");
                    self.clearContent();
                    self.showMatch(match_id);
                });
            });
        });
        $('#delete').click(function() {
            var fileName = Settings.get('replay-folder') + path.sep + match_id + ".dem";
            alertify.confirm().set('title', "Confirm Deletion")
                .set('message', "Are you sure you want to delete this replay?")
                .set('labels', {ok: 'Yes', cancel: 'No'})
                .set('onok', function() {
                    fs.unlink(fileName);
                    self.clearContent();
                    self.showMatch(match_id);
                }).show();
        });
    };

    ViewHelper.prototype.bindEvents = function () {
        var self = this;
        $('#back').click(function() {
            self.resolveRedirect();
        });
        $('#playersTable tbody').on('click', '.player-link', function() {
            var player_id = $(this).attr('id');
            $('#SideBar').find('.active').removeClass('active');
            self.referrer.page = 'tracked-players';
            self.clearContent();
            self.showPlayer(player_id);
        });
        $('#playerTeammatesTable tbody').on('click', '.player-link', function() {
            var teammate_id = $(this).attr('id');
            var account_id = $('.player_info').attr('id');
            self.clearContent();
            self.referrer.bridge = true;
            self.referrer.match_id = null;
            self.referrer.account_id = Number(account_id);
            self.showPlayer(teammate_id);
        });
        $('#matchPlayersTable tbody').on('click', '.player-link', function() {
            var account_id = $(this).attr('id');
            var match_id = $('.match_info').attr('id');
            self.clearContent();
            self.referrer.bridge = true;
            self.referrer.account_id = null;
            self.referrer.match_id = Number(match_id);
            self.showPlayer(account_id);
        });
        $('#matchesTable tbody').on('click', '.match-link', function() {
            var match_id = $(this).attr('id');
            $('#SideBar').find('.active').removeClass('active');
            self.referrer.page = 'matches';
            self.clearContent();
            self.showMatch(match_id);
        });
        $('#playerMatchesTable tbody').on('click', '.match-link', function() {
            var match_id = $(this).attr('id');
            var account_id = $('.player_info').attr('id');
            self.clearContent();
            self.referrer.bridge = true;
            self.referrer.match_id = null;
            self.referrer.account_id = Number(account_id);
            self.showMatch(match_id);
        });
        $('#player-nav-tabs').on('click', 'a', function () {
            var account_id = $(this).attr('data-id');
            var route = $(this).attr('class');
            self.clearContent();
            self.showPlayer(account_id, route);
        });
        $('#match-nav-tabs').on('click', 'a', function () {
            var match_id = $(this).attr('data-id');
            var route = $(this).attr('class');
            self.clearContent();
            self.showMatch(match_id, route);
        });
    };

    ViewHelper.prototype.clearContent = function () {
        var self = this;
        self.contentWrap.empty().scrollTop();
        self.spinner.css('display', 'block');
    };

    ViewHelper.prototype.generatePlayerMatchesTableData = function (matches, constants) {
        var table = [];
        for(var i = 0; i < matches.length; i++) {
            var match = matches[i];
            var row = [];
            var available = "Yes";
            var fileName = Settings.get('replay-folder') + path.sep + match.match_id + ".dem";
            if(!fs.existsSync(fileName)) available = "No";
            row[0] = '<a href="#" class="match-link" id="' + match.match_id + '">' + match.match_id + '</a>';
            var hero = constants.heroes[match.players[match.slot].hero_id];
            if (hero) row[1] = '<img src="' + hero.img + '" title="' + hero.localized_name + '">' + hero.localized_name;
            else row[1] = match.players[match.slot].hero_id;
            row[2] = match.player_win ? "Won" : "Lost";
            row[3] = constants.modes[match.game_mode] ? constants.modes[match.game_mode].name : match.game_mode;
            row[4] = moment().startOf('day').seconds(match.duration).format("H:mm:ss");
            row[5] = moment.unix(match.start_time + match.duration).fromNow();
            row[6] = match.players[match.slot].kills;
            row[7] = match.players[match.slot].deaths;
            row[8] = match.players[match.slot].assists;
            row[9] = match.players[match.slot].last_hits;
            row[10] = match.players[match.slot].denies;
            row[11] = match.players[match.slot].gold_per_min;
            row[12] = match.players[match.slot].xp_per_min;
            row[13] = match.players[match.slot].hero_damage;
            row[14] = match.players[match.slot].tower_damage;
            row[15] = constants.parse_status[match.parse_status];
            row[16] = available;
            table.push(row);
        }
        return table;
    };

    ViewHelper.prototype.generatePlayerHeroesTableData = function (player, constants) {
        var table = [];
        for(var key in constants.heroes) {
            var hero = constants.heroes[key];
            var row = [];
            row[0] = '<img src="' + hero.img + '" title="' + hero.localized_name + '" style="padding-right: 1em;">' + 
                hero.localized_name;
            var entry = player.heroes[hero.id];
            row[1] = entry ? entry.games : 0;
            row[2] = entry ? entry.win : 0;
            row[3] = entry ? entry.lose : 0;
            row[4] = (entry ? (100*entry.win/entry.games).toFixed(2) : 0.00) + '%';
            table.push(row);
        }
        return table;
    };

    ViewHelper.prototype.generatePlayerTeammateTableData = function (player) {
        var table = [];
        for(var key in player.teammates) {
            var teammate = player.teammates[key];
            var row = [];
            var name = teammate.personaname || teammate.account_id;
            row[0] = '<img src="' + teammate.avatar + '" title="' + name + '" style="padding-right: 1em;">' + 
                '<a href="#" class="player-link" id="' + teammate.account_id + '">' + name + '</a>';
            row[1] = teammate.games;
            row[2] = teammate.win;
            row[3] = teammate.lose;
            row[4] = (100*teammate.win/teammate.games).toFixed(2) + '%';
            table.push(row);
        }
        return table;
    };

    ViewHelper.prototype.showPlayer = function (account_id, route) {
        var self = this;
        var p, playerRadiant, table, data;
        if(!route) route = 'index';
        db.players.findOne({account_id: Number(account_id)}, function (err, player) {
            if (err) return logger.error(err);
            else if(!player) return makeView('404', {message: "No information about this player found in the database."})
                .appendTo(self.contentWrap);
            DotaUtils.getMatches(player.account_id, function(err, matches) {
                var account_id = player.account_id;
                var counts = {};
                var heroes = {};
                player.win = 0;
                player.lose = 0;
                player.games = 0;
                player.match_ids = [];
                player.gpm = [];
                player.xpm = [];
                player.winrate = [];
                for(var i = 0; i < matches.length; i++) {
                    for(var j = 0; j < matches[i].players.length; j++) {
                        p = matches[i].players[j];
                        if(p.account_id == account_id) {
                            playerRadiant = DotaUtils.isRadiant(p);
                            matches[i].player_win = (playerRadiant == matches[i].radiant_win);
                            matches[i].slot = j;
                            if(matches[i].player_win) player.win += 1;
                            else player.lose += 1;
                            player.games += 1;
                            if(!heroes[p.hero_id]) {
                                heroes[p.hero_id] = {};
                                heroes[p.hero_id].games = 0;
                                heroes[p.hero_id].win = 0;
                                heroes[p.hero_id].lose = 0;
                            }
                            heroes[p.hero_id].games += 1;
                            if(matches[i].player_win) {
                                heroes[p.hero_id].win += 1;
                            } else {
                                heroes[p.hero_id].lose += 1;
                            }
                            // For future graphs feature
                            //if(route == "graphs") {
                            //    player.match_ids.unshift(matches[i].match_id);
                            //    player.gpm.unshift(p.gold_per_min);
                            //    player.xpm.unshift(p.xp_per_min);
                            //    if(i>=matches.length/2) player.winrate.unshift((player.win/player.games*100).toFixed(2));
                            //}
                        }
                    }
                    if(route == "teammates") {
                        for(j = 0; j < matches[i].players.length; j++) {
                            p = matches[i].players[j];
                            if(DotaUtils.isRadiant(p) == playerRadiant) { //teammates of player
                                if(!counts[p.account_id]) {
                                    counts[p.account_id] = {};
                                    counts[p.account_id].account_id = p.account_id;
                                    counts[p.account_id].win = 0;
                                    counts[p.account_id].lose = 0;
                                    counts[p.account_id].games = 0;
                                }
                                counts[p.account_id].games += 1;
                                if(matches[i].player_win) {
                                    counts[p.account_id].win += 1;
                                } else {
                                    counts[p.account_id].lose += 1;
                                }
                            }
                        }
                    }
                }
                //convert counts to array and filter
                db.constants.find({}, function (err, constants) {
                    if (err) return logger.error(err);
                    constants = constants[0];
                    player.teammates = [];
                    for (var id in counts) {
                        var count = counts[id];
                        if (id != constants.anonymous_account_id && id != player.account_id && count.games >= 2) {
                            player.teammates.push(count);
                        }
                    }
                    player.heroes = heroes;
                    DotaUtils.fillPlayerNames(player.teammates, function (err) {
                        if (err) return logger.error(err);
                        if (route == "index") {
                            data = {};
                            matches.forEach(function (m) {
                                data[m.start_time] = 1;
                            });
                        }
                        else if(route == 'matches') table = self.generatePlayerMatchesTableData(matches, constants);
                        else if(route == 'heroes') table = self.generatePlayerHeroesTableData(player, constants);
                        else if(route == 'teammates') table = self.generatePlayerTeammateTableData(player);
                        makeView(playerPages[route].template, {
                            route: route,
                            tabs: playerPages,
                            table: table,
                            data: data || {},
                            player: player
                        }).appendTo(self.contentWrap);
                    });
                });
            });
        });
    };

    ViewHelper.prototype.showMatch = function (match_id, route) {
        var self = this;
        if(!route) route = 'index';
        var available = true;
        var fileName = Settings.get('replay-folder') + path.sep + match_id + ".dem";
        if(!fs.existsSync(fileName)) available = false;
        db.matches.findOne({match_id: Number(match_id)}, function (err, match) {
            if (err) return logger.error(err);
            DotaUtils.fillPlayerNames(match.players, function (err) {
                if (err) return logger.error(err);
                db.constants.find({}, function (err, constants) {
                    if (err) return logger.error(err);
                    else if(route == 'graphs') {
                        if (match.parsed_data) {
                            //compute graphs
                            var goldDifference = ['Gold'];
                            var xpDifference = ['XP'];
                            var generatePlayerData = function (elem, j) {
                                if (match.players[j].player_slot < 64) {
                                    goldtotal += elem.gold[i];
                                    xptotal += elem.xp[i];
                                } else {
                                    xptotal -= elem.xp[i];
                                    goldtotal -= elem.gold[i];
                                }
                            };
                            for (var i = 0; i < match.parsed_data.times.length; i++) {
                                var goldtotal = 0;
                                var xptotal = 0;
                                match.parsed_data.players.forEach(generatePlayerData);
                                goldDifference.push(goldtotal);
                                xpDifference.push(xptotal);
                            }
                            var time = ["time"].concat(match.parsed_data.times);
                            var data = {
                                difference: [time, goldDifference, xpDifference],
                                gold: [time],
                                xp: [time],
                                lh: [time]
                            };
                            match.parsed_data.players.forEach(function (elem, i) {
                                var hero = constants[0].heroes[match.players[i].hero_id].localized_name;
                                data.gold.push([hero].concat(elem.gold));
                                data.xp.push([hero].concat(elem.xp));
                                data.lh.push([hero].concat(elem.lh));
                            });
                            makeView(matchPages[route].template, {
                                route: route,
                                tabs: matchPages,
                                match: match,
                                constants: constants[0],
                                moment: moment,
                                data: data,
                                available: available
                            }).appendTo(self.contentWrap);
                        }
                    } else {
                        makeView(matchPages[route].template, {
                            route: route,
                            tabs: matchPages,
                            match: match,
                            constants: constants[0],
                            moment: moment,
                            available: available
                        }).appendTo(self.contentWrap);
                    }
                });
            });
        });
    };
    
    return ViewHelper;
})();