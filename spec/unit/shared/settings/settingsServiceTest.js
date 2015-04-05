describe('settingsService Test', function() {
    var mockery = require('mockery');
    var crypto, settingsService, storageService;

    beforeEach(function() {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });
        crypto = module.exports = jasmine.createSpyObj('crypto', ['randomBytes', 'toString', 'createCipher', 'createDecipher', 'update', 'final']);
        spyOn(history, 'back');

        mockery.registerMock('crypto', crypto);

        module('D2RM', function($provide) {
            storageService = jasmine.createSpyObj('storageService', ['get', 'set']);
            storageService.get.and.callFake(function(arg) {
                if(arg == 'key') return null;
                return JSON.stringify({})
            });
            $provide.value('storageService', storageService);
        });

        inject(function(_settingsService_) {
            settingsService = _settingsService_;
        });
    });

    afterEach(function(){
        mockery.disable();
    });

    it('should call createCipher, update and final when calling save with steamPassword set', function() {
        crypto.createCipher.and.returnValue(crypto);
        crypto.update.and.returnValue(crypto);
        settingsService.settings.steamPassword = '123';

        settingsService.save();

        expect(crypto.createCipher).toHaveBeenCalled();
        expect(crypto.update).toHaveBeenCalled();
        expect(crypto.final).toHaveBeenCalled();
    });

    it('should generate a new unique security key if one does not exist', function() {
        expect(crypto.randomBytes).toHaveBeenCalledWith(20);
    });
});