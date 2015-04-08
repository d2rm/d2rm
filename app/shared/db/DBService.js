app.factory('DBService', ['loggerService', function (logger) {
    function MainDAO()
    {
        var self = this;
        var async = require("async");
        var q = async.priorityQueue(function(task, cb) {task(cb);}, 100);
        q.drain = function() {
            logger.debug('queue is drained');
        };
        self.Datastore = require("nedb");
        self.dbFolder = "DB";
        self.db = {
            CONSTANTS : new self.Datastore({ filename : self.dbFolder + "/constants.adb" , autoload : true}),
            PLAYERS : new self.Datastore({ filename : self.dbFolder + "/players.adb" , autoload : true}),
            PLAYLIST : new self.Datastore({ filename : self.dbFolder + "/playlist.adb" , autoload : true}),
            MATCHES : new self.Datastore({ filename : self.dbFolder + "/matches.adb" , autoload : true})
        };
        self.db.PLAYERS.ensureIndex({fieldName: 'account_id', unique: true});
        self.db.MATCHES.ensureIndex({fieldName: 'match_id', unique: true});

        /** PlaylistDAO Queries */
        self.deletePlaylist = function(id) {
            q.push(function(cb) {
                self.db.PLAYLIST.remove({_id: id}, {}, function(err) {
                    cb(err);
                })
            }, 0);
        };

        self.updatePlaylistPosition = function(id, position) {
            q.push(function(cb) {
                self.db.PLAYLIST.update({_id: id}, {
                    $set: {
                        position: position
                    }
                }, {}, function(err) {
                    cb(err);
                });
            }, 0);
        };

        self.getAllPlaylists = function (callback) {
            q.push(function (cb) {
                self.db.PLAYLIST.find({}).sort({position: 1}).exec(function (err, data) {
                    cb(err);
                    callback(data);
                });
            }, 0);
        };

        self.InsertNewPlaylist = function (playlistObj, callback) {
            q.push(function(cb) {
                self.db.PLAYLIST.findOne({ "hash" : playlistObj.name }).exec(function (err, data) {
                    if(data === null)
                    {
                        playlistObj.position = 0;
                        self.db.PLAYLIST.insert(JSON.parse(angular.toJson(playlistObj)), function (err, NewObj) {
                            cb(err);
                            if(err)
                            {
                                logger.error("PlaylistDAO Error: ", err);
                                return false;
                            }
                            logger.info("new PlaylistDAO Object Created", NewObj);
                            if(callback) callback(NewObj);
                        });
                    } else {
                        cb(err);
                    }
                });
            }, 0);
        };

        self.getPlaylist = function(id, callback) {
            q.push(function(cb) {
                self.db.PLAYLIST.findOne({_id: id}).exec(function(err, data) {
                    cb(err);
                    if(data) callback(data);
                });
            }, 0);
        };
        /** End PlaylistDAO Queries */

        /** MatchesDAO Queries */

        /** End MatchesDAO Queries */

        /** HistoryDAO Queries */

        /** End HistoryDAO Queries */

        /** PlayersDAO Queries */

        /** End PlayersDAO Queries */
    }

    MainDAO.prototype.constructor = MainDAO;

    return new MainDAO();
}]);