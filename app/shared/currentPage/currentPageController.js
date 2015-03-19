app.controller('currentPageController', function($scope) {
    this.title = 'placeholder';
    this.clickBack = function() {
        history.back();
    };
    this.clickForward = function() {
        history.forward();
    };
});