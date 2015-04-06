describe('Testing routes', function() {
    beforeEach(module('D2RM'));

    var route, location, rootScope;

    beforeEach(inject(
        function( _$route_, _$location_, _$rootScope_, $httpBackend ) {
            location = _$location_;
            route = _$route_;
            rootScope = _$rootScope_;
            $httpBackend.expectGET('languages/en_US.json')
                .respond(200);
        }));

    describe('Players route', function() {
        beforeEach(inject(
            function($httpBackend) {
                $httpBackend.expectGET('app/components/players/playersView.html')
                    .respond(200);
            }));

        it('should load the players page on successful load of /players', function() {
            location.path('/players');
            rootScope.$digest();
            expect(route.current.controller).toBe('playersController')
        });
    });

    describe('Donate route', function() {
        beforeEach(inject(
            function($httpBackend) {
                $httpBackend.expectGET('app/components/donate/donateView.html')
                    .respond(200);
            }));

        it('should load the donate page on successful load of /donate', function() {
            location.path('/donate');
            rootScope.$digest();
        });
    });

    describe('Settings route', function() {
        beforeEach(inject(
            function($httpBackend) {
                $httpBackend.expectGET('app/components/settings/settingsView.html')
                    .respond(200);
            }));

        it('should load the settings page on successful load of /settings', function() {
            location.path('/settings');
            rootScope.$digest();
            expect(route.current.controller).toBe('settingsController')
        });
    });

    describe('History route', function() {
        beforeEach(inject(
            function($httpBackend) {
                $httpBackend.expectGET('app/components/history/historyView.html')
                    .respond(200);
            }));

        it('should load the history page on successful load of /history', function() {
            location.path('/history');
            rootScope.$digest();
            expect(route.current.controller).toBe('historyController')
        });
    });

    describe('New playlist route', function() {
        beforeEach(inject(
            function($httpBackend) {
                $httpBackend.expectGET('app/components/playlist/newPlaylistView.html')
                    .respond(200);
            }));

        it('should load the new playlist page on successful load of /newplaylist', function() {
            location.path('/newplaylist');
            rootScope.$digest();
            expect(route.current.controller).toBe('newPlaylistController')
        });
    });

    describe('Playlist route', function() {
        beforeEach(inject(
            function($httpBackend) {
                $httpBackend.expectGET('app/components/playlist/playlistView.html')
                    .respond(200);
            }));

        it('should load the playlist page on successful load of /playlist/9', function() {
            location.path('/playlist/9');
            rootScope.$digest();
            expect(route.current.controller).toBe('playlistController')
        });

        it('should set the route id param to 9 when loading /playlist/9', function() {
            location.path('/playlist/9');
            rootScope.$digest();
            expect(route.current.params.id).toBe('9')
        });
    });

    describe('Home route', function() {
        beforeEach(inject(
            function($httpBackend) {
                $httpBackend.expectGET('app/components/home/homeView.html')
                    .respond(200);
            }));

        it('should load the home page on successful load of /home', function() {
            location.path('/home');
            rootScope.$digest();
            expect(route.current.controller).toBe('homeController')
        });
    });

    describe('Undefined route', function() {
        beforeEach(inject(
            function($httpBackend) {
                $httpBackend.expectGET('app/components/home/homeView.html')
                    .respond(200);
            }));

        it('should load the home page when trying to access undefined route', function() {
            location.path('/not-exist');
            rootScope.$digest();
            expect(route.current.controller).toBe('homeController')
        });
    });
});