describe('storageService Test', function() {
    var storageService;

    beforeEach(function() {
        module('D2RM');
        inject(function(_storageService_) {
            storageService = _storageService_;
        });
        localStorage.clear();
    });

    it('should set value in localStorage when set method is called', function() {
        storageService.set('test', 'test value');

        expect(localStorage.getItem('test')).toEqual('test value');
    });

    it('should retrieve value from localStorage when get method is called', function() {
        localStorage.setItem('test', 'test value');

        expect(storageService.get('test')).toEqual('test value');
    });

    it('should remove value from localStorage when remove method is called', function() {
        localStorage.setItem('test', 'test value');

        storageService.remove('test');

        expect(localStorage.getItem('test')).toBe(null);
    });
});