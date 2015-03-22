'use strict';

exports.config = {
    chromeDriver: './cache/0.12.0/win64/chromedriver', // relative path to node-webkit's chromedriver
    chromeOnly: true, // starting Selenium server isn't required in our case
    specs: ['spec/e2e/**/*.js'],
    baseUrl: 'file:///D:/Code/D2RM-Angular/index.html?test=protractor',

    onPrepare: function() {

        // By default, Protractor use data:text/html,<html></html> as resetUrl, but 
        // location.replace (see http://git.io/tvdSIQ) from the data: to the file: protocol is not allowed
        // (we'll get ‘not allowed local resource’ error), so we replace resetUrl with one
        // with the file: protocol (this particular one will open system's root folder)
        browser.resetUrl = 'file:///D:/Code/D2RM-Angular/index.html';

        // This isn't required and used to avoid ‘Cannot extract package’ error showed
        // before Protractor have redirected node-webkit to resetUrl.
        browser.driver.get('file:///D:/Code/D2RM-Angular/index.html');
    }
};