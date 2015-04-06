describe('PlaylistController Test', function() {
    beforeEach(module('D2RM'));

    var $controller, $rootScope, $routeParams, $scope, DBService;

    beforeEach(inject(function (_$controller_, _$routeParams_, _$rootScope_, $httpBackend) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $routeParams = _$routeParams_;
        $scope = $rootScope.$new();
        $scope.page = {title: 'placeholder'};
        $routeParams.id = 'TestID';
        DBService = jasmine.createSpyObj('DBService', ['getPlaylist']);
        DBService.getPlaylist = jasmine.createSpy('getPlaylist', function(id, cb) {
            cb({name: id});
        }).and.callThrough();
        $httpBackend.expectGET('languages/en_US.json')
            .respond(200);

        var playlistController = $controller('playlistController', {
            $scope: $scope,
            $routeParams: $routeParams,
            DBService: DBService
        });
    }));

    it('should have id in $routeParams', function() {
        expect($routeParams.id).toBeDefined();
    });

    it('should call DBService.getPlaylist once with id param', function() {
        expect(DBService.getPlaylist.calls.count()).toEqual(1);
        expect(DBService.getPlaylist.calls.argsFor(0)[0]).toEqual($routeParams.id);
    });

    it('should set $scope.page.title to "TestID"', function() {
        expect($scope.page.title).toEqual("TestID");
    });
});