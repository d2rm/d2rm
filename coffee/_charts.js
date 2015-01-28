var Charts;

Charts = (function() {
    function Charts() {
        this.height = 400;
    }
    
    Charts.prototype.generateMatchCharts = function(data) {
        var self = this;
        self.data = data;
        var difference = self.data.difference;
        var gold = self.data.gold;
        var xp = self.data.xp;
        var lh = self.data.lh;
        var match_charts = [
            {
                bindTo: "#chart-diff",
                columns: difference,
                x: 'time',
                type: "area-spline",
                xLabel: 'Game Time (minutes)',
                yLabel: 'Radiant Advantage'
            }, {
                bindTo: "#chart-gold",
                columns: gold,
                x: 'time',
                type: "spline",
                xLabel: 'Game Time (minutes)',
                yLabel: 'Gold'
            }, {
                bindTo: "#chart-xp",
                columns: xp,
                x: 'time',
                type: "spline",
                xLabel: 'Game Time (minutes)',
                yLabel: 'XP'
            }, {
                bindTo: "#chart-lh",
                columns: lh,
                x: 'time',
                type: "spline",
                xLabel: 'Game Time (minutes)',
                yLabel: 'LH'
            }
        ];
        match_charts.forEach(function(chart, i) {
            match_charts[i] = {
                bindto: chart.bindTo,
                size: {
                    height: self.height
                },
                data: {
                    x: chart.x,
                    columns: chart.columns,
                    type: chart.type
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        tick: {
                            format: function (x) {
                                return moment().startOf('day').seconds(x).format("H:mm");
                            }
                        },
                        label: chart.xLabel
                    },
                    y: {
                        label: chart.yLabel
                    }
                },
                color: {
                    pattern: ['#3c77d3', '#75dcc4', '#9c309b', '#e8de3d', '#d97d29',
                        '#df9dc5', '#98a567', '#73c8db', '#23642c', '#856d33']
                }
            };
        });
        delete match_charts[0].color;

        async.eachSeries(match_charts, function(chart, cb) {
            c3.generate(chart);
            setTimeout(cb, 50);
        });
    };
    
    //Charts.prototype.generatePlayerCharts = function(player) {
    //    var self = this;
    //    player.match_ids.unshift("Match IDs");
    //    player.winrate.unshift("Winrate");
    //    player.gpm.unshift("GPM");
    //    player.xpm.unshift("XPM");
    //    player.winrate_match_ids = player.match_ids.slice(player.match_ids.length/2 + 1);
    //    player.winrate_match_ids.unshift("Match IDs");
    //    self.player = player;
    //    self.data = {mmr: [], winrate: [player.winrate, player.winrate_match_ids], 
    //        gpm: [player.gpm, player.match_ids], xpm: [player.xpm, player.match_ids]};
    //    DotaUtils.getMatches(player.account_id, function(err, matches) {
    //        if (err) return logger.error(err);
    //        self.matches = matches;
    //        db.constants.find({}, function (err, constants) {
    //            if (err) return logger.error(err);
    //            self.constants = constants[0];
    //        });
    //    });
    //    var player_charts = [
    //        {
    //            bindTo: "#winrate_chart",
    //            columns: self.data.winrate,
    //            hide: ["Match IDs"],
    //            yLabel: 'Win Rate'
    //        }, {
    //            bindTo: "#xpm_chart",
    //            columns: self.data.xpm,
    //            hide: ["Match IDs"],
    //            yLabel: 'XPM'
    //        }, {
    //            bindTo: "#gpm_chart",
    //            columns: self.data.gpm,
    //            hide: ["Match IDs"],
    //            yLabel: 'GPM'
    //        }
    //    ];
    //    if(player.account_id == Number(Settings.get('steam-account-id'))) {
    //        console.log('would do mmr');
    //        //var team = player.team_MMR;
    //        //var solo = player.solo_MMR;
    //        //if(team) self.processMMR(team, "Team");
    //        //if(solo) self.processMMR(solo, "Solo");
    //        //player_charts.push({
    //        //    bindTo: "#MMR_chart",
    //        //    columns: self.data.mmr,
    //        //    hide: ["Team Match IDs", "Solo Match IDs"],
    //        //    yLabel: 'MMR'
    //        //});
    //    }
    //    async.eachSeries(player_charts, function(chart, cb) {
    //        chart.chart = c3.generate({
    //            bindto: chart.bindTo,
    //            size: {
    //                height: self.height
    //            },
    //            data: {
    //                selection: {
    //                    enabled: true
    //                },
    //                columns: chart.columns,
    //                hide: chart.hide,
    //                type: 'spline',
    //                onclick: function (d) {
    //                    var match_id = Number(chart.chart.data.values("Match IDs")[d.index]);
    //                    viewHelper.clearContent();
    //                    viewHelper.referrer.bridge = true;
    //                    viewHelper.referrer.match_id = null;
    //                    viewHelper.referrer.account_id = self.player.account_id;
    //                    viewHelper.showMatch(match_id);
    //                }
    //            },
    //            zoom: {
    //                enabled: true
    //            },
    //            tooltip: {
    //                grouped: false,
    //                contents: function (d) {
    //                    var match_id = Number(chart.chart.data.values("Match IDs")[d[0].index]),
    //                        match = $.grep(self.matches, function (e) {
    //                            return e.match_id === match_id;
    //                        })[0],
    //                        player = $.grep(match.players, function (e) {
    //                            return e.account_id === self.player.account_id;
    //                        })[0],
    //                        playerRadiant = DotaUtils.isRadiant(player),
    //                        player_win = (playerRadiant == match.radiant_win),
    //                        hero = self.constants.heroes[player.hero_id],
    //                        mode = self.constants.modes[match.game_mode] ? self.constants.modes[match.game_mode].name : match.game_mode,
    //                        result = player_win ? "Won" : "Lost",
    //                        font_color = player_win ? "#499249" : "#c23c2a",
    //                        date = moment.unix(match.start_time + match.duration).fromNow(),
    //                        kills = player.kills,
    //                        deaths = player.deaths,
    //                        assists = player.assists,
    //                        lh = player.last_hits,
    //                        deny = player.denies,
    //                        gpm = player.gold_per_min,
    //                        xpm = player.xp_per_min;
    //                    return '<div style="float: left">' +
    //                    '<span style="font-size:14px;font-weight:bold;color: ' + font_color + '">' +
    //                    result + '</span><br>' +
    //                    '<div style="padding-top: 2px;padding-bottom: 2px;">' +
    //                    date + '<br>' +
    //                    'Mode: ' + mode + '<br>' +
    //                    'KDA: ' + kills + '/' + deaths + '/' + assists + '<br>' +
    //                    'CS: ' + lh + '/' + deny + '<br>' +
    //                    'GPM: ' + gpm + '<br>' +
    //                    'XPM: ' + xpm + '<br>' +
    //                    '</div>' +
    //                    '<span style="font-size:12px;font-weight:bold;color:#f0a868;">' + chart.yLabel + ': ' + d[0].value + '</span>' +
    //                    '</div>' +
    //                    '<span style="float: right">' +
    //                    '<img src="' + hero.img + '" title="' + hero.localized_name + '">' +
    //                    '</span>';
    //                }
    //            },
    //            legend: {
    //                hide: chart.hide
    //            },
    //            axis: {
    //                x: {
    //                    show: false
    //                },
    //                y: {
    //                    label: chart.yLabel
    //                }
    //            },
    //            grid: {
    //                y: {
    //                    show: true
    //                }
    //            }
    //        });
    //        setTimeout(cb, 50);
    //    });
    //};
    
    Charts.prototype.generatePlayerMMRChart = function(cb) {
        var self = this;
        var account_id = parseInt(Settings.get('steam-account-id'));
        db.players.findOne({account_id: account_id}, function(err, player) {
            if(err) return cb(err);
            else if(!player || player.length < 1) return cb("Couldn't fetch steam player from database.");
            else if(!player.team_MMR && !player.solo_MMR) return cb("No MMR data found.");
            self.data = {mmr: []};
            var team = player.team_MMR;
            var solo = player.solo_MMR;
            if(team) self.processMMR(team, "Team");
            if(solo) self.processMMR(solo, "Solo");
            DotaUtils.getMatches(account_id, function(err, matches) {
                db.constants.find({}, function (err, constants) {
                    if (err) return logger.error(err);
                    constants = constants[0];
                    var chart = c3.generate({
                        bindto: '#MMR_chart',
                        size: {
                            height: self.height
                        },
                        data: {
                            selection: {
                                enabled: true
                            },
                            columns: self.data.mmr,
                            hide: ["Team Match IDs", "Solo Match IDs"],
                            type: 'spline',
                            onclick: function (d) {
                                var match_id = Number(chart.data.values("Team Match IDs")[d.index]);
                                viewHelper.clearContent();
                                viewHelper.referrer.bridge = true;
                                viewHelper.referrer.match_id = null;
                                viewHelper.referrer.account_id = account_id;
                                viewHelper.showMatch(match_id);
                            }
                        },
                        zoom: {
                            enabled: true
                        },
                        tooltip: {
                            grouped: false,
                            contents: function (d) {
                                var mmr = d[0].value,
                                    type = d[0].id.split(' ')[0],
                                    match_ids_name =  type + ' Match IDs',
                                    mmr_name =  type + ' MMR',
                                    old_mmr = chart.data.values(mmr_name)[d[0].index - 1],
                                    mmr_change = mmr - old_mmr,
                                    player_win = mmr_change > 1,
                                    match_id = Number(chart.data.values(match_ids_name)[d[0].index]),
                                    match = $.grep(matches, function (e) {
                                        return e.match_id === match_id;
                                    })[0],
                                    player = $.grep(match.players, function (e) {
                                        return e.account_id === account_id;
                                    })[0],
                                    hero = constants.heroes[player.hero_id],
                                    mode = constants.modes[match.game_mode] ? constants.modes[match.game_mode].name : match.game_mode,
                                    result = player_win ? "Won" : "Lost",
                                    font_color = player_win ? "#499249" : "#c23c2a",
                                    date = moment.unix(match.start_time + match.duration).fromNow(),
                                    kills = player.kills,
                                    deaths = player.deaths,
                                    assists = player.assists,
                                    lh = player.last_hits,
                                    deny = player.denies,
                                    gpm = player.gold_per_min,
                                    xpm = player.xp_per_min;
                                mmr_change = ViewUtils.getSignedNumber(mmr_change);
                                return '<div style="float: left">' +
                                    '<span style="font-size:14px;font-weight:bold;color: ' + font_color + '">' +
                                    result + '</span><br>' +
                                    '<div style="padding-top: 2px;padding-bottom: 2px;">' +
                                        date + '<br>' +
                                        'Mode: ' + mode + '<br>' +
                                        'KDA: ' + kills + '/' + deaths + '/' + assists + '<br>' +
                                        'CS: ' + lh + '/' + deny + '<br>' +
                                        'GPM: ' + gpm + '<br>' +
                                        'XPM: ' + xpm + '<br>' +
                                    '</div>' +
                                    '<span style="font-size:12px;font-weight:bold;color:#f0a868;">MMR: ' + mmr + ' (' + old_mmr + ' ' + mmr_change + ') ' + '</span>' +
                                '</div>' +
                                '<span style="float: right">' +
                                    '<img src="' + hero.img + '" title="' + hero.localized_name + '">' +
                                '</span>';
                            }
                        },
                        legend: {
                            hide: ["Team Match IDs", "Solo Match IDs"]
                        },
                        axis: {
                            x: {
                                show: false
                            },
                            y: {
                                label: 'MMR'
                            }
                        },
                        grid: {
                            y: {
                                show: true
                            }
                        }
                    });
                    return cb(null);
                });
            });
        });
    };
    
    Charts.prototype.processMMR = function(obj, type) {
        var self = this;
        var mmrs = [];
        var match_ids = Object.keys(obj);
        match_ids = match_ids.map(function(match_id) {
            return Number(match_id);
        });
        match_ids.sort(function (a, b) {
            return a - b;
        });
        match_ids.forEach(function(match_id) {
            mmrs.push(obj[match_id.toString()]);
        });
        mmrs.unshift(type + " MMR");
        match_ids.unshift(type + " Match IDs");
        self.data.mmr.push(mmrs);
        self.data.mmr.push(match_ids);
    };

    return Charts;

})();