var mockery = require('mockery');
var db = {};
var filenameMap = {
    "DB/constants.adb": 'constants',
    "DB/players.adb": 'players',
    "DB/matches.adb": 'matches',
    "DB/playlist.adb": 'playlist'
};
var nedbMock = function(val) {
    var name = filenameMap[val.filename];
    var nedb = jasmine.createSpyObj(name, ['insert', 'remove', 'update', 'find', 'findOne', 'exec', 'ensureIndex', 'sort']);
    db[name] = nedb;
    return nedb;
};
var DBService, cb;

describe('DBService Test', function() {
    beforeEach(function() {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });

        mockery.registerMock('nedb', nedbMock);
    });

    beforeEach(module('D2RM'));

    beforeEach(inject(function(_DBService_) {
        DBService = _DBService_;
        db.playlist.exec = function(cb) {
            cb(null, ['Test']);
        };
        spyOn(db.playlist, 'exec').and.callThrough();
        cb = jasmine.createSpy('callback');
    }));

    afterEach(function(){
        mockery.disable();
    });

    describe('PlaylistDAO Queries', function() {
        describe('getPlaylist method', function() {
            beforeEach(function() {
                db.playlist.findOne.and.returnValue(db.playlist);
            });

            it('should call findOne on the playlist database when calling getPlaylist', function() {
                DBService.getPlaylist('TestID', cb);

                expect(db.playlist.findOne).toHaveBeenCalledWith({_id: 'TestID'});
            });

            it('should call the callback function with ["Test"]', function() {
                DBService.getPlaylist('TestID', cb);

                expect(cb).toHaveBeenCalledWith(['Test']);
            });
        });

        describe('deletePlaylist method', function() {
            it('should call remove on the playlist database', function() {
                DBService.deletePlaylist('test');

                expect(db.playlist.remove).toHaveBeenCalledWith({_id: 'test'});
            });
        });

        describe('updatePlaylistPosition method', function() {
            it('should call update on playlist database', function() {
                DBService.updatePlaylistPosition('test', 'updatedName');

                expect(db.playlist.update).toHaveBeenCalledWith({_id: 'test'}, {$set: {position: 'updatedName'}});
            });
        });

        describe('getAllPlaylists method', function() {
            beforeEach(function() {
                db.playlist.find.and.returnValue(db.playlist);
                db.playlist.sort.and.returnValue(db.playlist);
            });

            it('should call find on the playlist database with {}', function() {
                DBService.getAllPlaylists(function() {});

                expect(db.playlist.find).toHaveBeenCalledWith({});
            });

            it('should call find, sort and exec on the playlist database once', function() {
                DBService.getAllPlaylists(function() {});

                expect(db.playlist.find.calls.count()).toEqual(1);
                expect(db.playlist.sort.calls.count()).toEqual(1);
                expect(db.playlist.exec.calls.count()).toEqual(1);
            });

            it('should call the callback function with ["Test"]', function() {
                DBService.getAllPlaylists(cb);

                expect(cb).toHaveBeenCalledWith(['Test']);
            });
        });

        describe('InsertNewPlaylist method', function() {
            beforeEach(function() {
                db.playlist.findOne.and.returnValue(db.playlist);
                db.playlist.exec = jasmine.createSpy('exec', function(cb) {cb(null, null);}).and.callThrough();
            });

            it('should call findOne and exec once', function() {
                DBService.InsertNewPlaylist({name: "Test"});

                expect(db.playlist.findOne).toHaveBeenCalledWith({hash: "Test"});
            });

            it('should call insert on playlist database if no data is returned by findOne', function() {
                DBService.InsertNewPlaylist({name: "Test"});

                expect(db.playlist.insert.calls.count()).toEqual(1);
                expect(db.playlist.insert.calls.argsFor(0)[0]).toEqual({name: "Test", position: 0});
            });

            it('should log the new playlist if there are no errors', function() {
                db.playlist.insert = jasmine.createSpy('insert', function(val, cb) {
                    cb(null, val);
                }).and.callThrough();
                spyOn(console, 'info');
                var testObj ={name: "Test"};

                DBService.InsertNewPlaylist(testObj, cb);

                expect(console.info).toHaveBeenCalledWith("new PlaylistDAO Object Created", testObj);
            });

            it('should print error to console if there is an error on insert to playlist database', function() {
                db.playlist.insert = jasmine.createSpy('insert', function(val, cb) {
                    cb('error', val);
                }).and.callThrough();
                spyOn(console, 'error');

                DBService.InsertNewPlaylist({name: "Test"}, cb);

                expect(console.error).toHaveBeenCalledWith("PlaylistDAO Error: ", 'error');
            });
        });
    });
});