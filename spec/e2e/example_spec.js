describe('D2RM donate page', function() {
    it('should be titled "Donate"', function() {
        browser.get('/donate');
		element(by.binding('page.title')).getText().then(function(title) {
		  expect(title).toBe('Donate');
		});
    });
});
