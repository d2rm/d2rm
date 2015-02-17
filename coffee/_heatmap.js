var Heatmap;

Heatmap = (function() {
    function Heatmap() {
        this.account_id = null;
    }
    
    Heatmap.prototype.createHeatmap = function(account_id, data) {
        var self = this;
        
        self.account_id = account_id;
        self.options = {
            domain: "month",
            subDomain: "day",
            data: data,
            tooltip: true,
            legend: [1,2,3,4],
            highlight: new Date(),
            itemName: ["match", "matches"],
            onComplete: function() {self.populateDatatable(moment().startOf('day').unix(), moment().unix());},
            subDomainTextFormat: function(date, value) {
                return value;
            },
            cellSize: 15,
            previousSelector: "#prev",
            nextSelector: "#next",
            onClick: function(date, nb) {
                self.cal.highlight(date);
                var start_time = Date.parse(date)/1000;
                var end_time = moment.unix(start_time).endOf('day')/1000;
                if(nb === null) {
                    $('#match-container').css('display', 'none');
                    $('#no-matches-notification').css('display', 'block');
                } else {
                    self.populateDatatable(start_time, end_time);
                }
            }
        };
        self.initCal();
        self.initDataTable();
        self.responsiveCal();
    };
    
    Heatmap.prototype.initDataTable = function() {
        var self = this;
        self.dataTable = $('.dataTable').dataTable({
            "data": {},
            "order": [[0, "desc"]],
            "deferRender": true,
            "aoColumnDefs": [
                { "sClass": "hero", "aTargets": [ 1 ] }
            ],
            "createdRow": function ( row, data, index ) {
                if ( data[2] == "Won" ) {
                    $(row).addClass('success');
                } else {
                    $(row).addClass('danger');
                }
            }
        });
    };

    Heatmap.prototype.sixMonthsAgo = function(){
        return new Date(moment().subtract(5, 'month'));
    };

    Heatmap.prototype.oneYearAgo = function(){
        return new Date(moment().subtract(11, 'month'));
    };

    Heatmap.prototype.initCal = function () {
        var self = this;
        self.cal = new CalHeatMap();
        self.cal.init(self.options);
    };

    Heatmap.prototype.responsiveCal = function() {
        var self = this;
        if( $(window).width() < 1300 ) {
            self.options.start = self.sixMonthsAgo();
            self.options.range = 6;
        } else {
            self.options.start = self.oneYearAgo();
            self.options.range = 12;
        }
        if(self.cal)
            self.cal = self.cal.destroy(function() {
                $('#cal-heatmap').empty();
                self.initCal(self.options);
                $('#cal-heatmap').css('position', 'relative');
            });
    };

    Heatmap.prototype.populateDatatable = function (start_time, end_time) {
        var self = this;
        var num = (Settings.get('hide-test-matches') == "true") ? 1 : 0;
        db.matches.find({
            duration: {
                $exists: true
            },
            human_players: {$gt: num},
            start_time: {$gte: start_time, $lte: end_time},
            $where: function () {
                var result = this.players.some(function (player) {
                    return player.account_id == self.account_id;
                });
                return result;
            }
        }).sort({match_id: -1}).exec(function(err, matches) {
            if (err) return logger.error(err);
            if(!matches || matches.length < 1) {
                $('#match-container').css('display', 'none');
                $('#no-matches-notification').css('display', 'block');
                return;
            }
            for(var i = 0; i < matches.length; i++) {
                for (var j = 0; j < matches[i].players.length; j++) {
                    var p = matches[i].players[j];
                    if (p.account_id == self.account_id) {
                        var playerRadiant = DotaUtils.isRadiant(p);
                        matches[i].player_win = (playerRadiant == matches[i].radiant_win);
                        matches[i].slot = j;
                    }
                }
            }
            db.constants.find({}, function (err, constants) {
                if (err) return logger.error(err);
                constants = constants[0];
                self.dataTable.fnClearTable();
                self.dataTable.fnAddData(viewHelper.generatePlayerMatchesTableData(matches, constants));
                $('#match-container').css('display', 'block');
                $('#no-matches-notification').css('display', 'none');
            });
        });
    };
    
    return Heatmap;
})();