describe('playlistContextMenuDirective Test', function() {
    var $compile, $rootScope, $scope, gui, menu, element, DBService;

    beforeEach(function() {
        DBService = jasmine.createSpyObj('DBService', ['deletePlaylist']);
        gui = jasmine.createSpyObj('gui', ['Menu', 'MenuItem']);
        menu = jasmine.createSpyObj('menu', ['append', 'popup']);
        gui.Menu.and.returnValue(menu);
        spyOn(global.window.nwDispatcher, 'requireNwGui').and.returnValue(gui);
        module('D2RM', function($provide) {
            $provide.value('DBService', DBService);
        });
        inject(function(_$compile_, _$rootScope_, $httpBackend){
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            $httpBackend.expectGET('languages/en_US.json')
                .respond(200);
        });
        var playlist = {_id: '123', name: 'Test'};
        $rootScope.playlists = [playlist];
        $scope.playlist = playlist;
        element = $compile("<div playlist-context-menu></div>")($scope);
    });

    it('should call Menu on nw.gui', function() {
        element.trigger('contextmenu');
        $scope.$digest();

        expect(gui.Menu).toHaveBeenCalled();
    });

    it('should call gui.MenuItem', function() {
        element.trigger('contextmenu');
        $scope.$digest();

        expect(gui.MenuItem).toHaveBeenCalled();
    });

    it('should set label of MenuItem to "Delete Test"', function() {
        gui.MenuItem.and.callFake(function(obj) {
            expect(obj.label).toEqual('Delete Test');
        });

        element.trigger('contextmenu');
        $scope.$digest();
    });

    it('should call deletePlaylist method on DBService with "123" if menu item is clicked', function() {
        gui.MenuItem.and.callFake(function(obj) {
            obj.click();
        });

        element.trigger('contextmenu');
        $scope.$digest();

        expect(DBService.deletePlaylist).toHaveBeenCalledWith('123');
    });

    it('should remove playlist object from $rootScope.playlists if menu item is clicked', function() {
        gui.MenuItem.and.callFake(function(obj) {
            obj.click();
        });

        element.trigger('contextmenu');
        $scope.$digest();

        expect($rootScope.playlists).toEqual([]);
    });

    it('should leave $rootScope.playlists alone if menu item is clicked but it does not contain the playlist object', function() {
        $rootScope.playlists = [{_id: '1234', name: 'Not Test'}];
        gui.MenuItem.and.callFake(function(obj) {
            obj.click();
        });

        element.trigger('contextmenu');
        $scope.$digest();

        expect($rootScope.playlists).toEqual([{_id: '1234', name: 'Not Test'}]);
    });
});