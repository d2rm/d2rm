const PLATFORM = "win64"; // Pass wanted platform all/osx32/osx64/win32/win6/linux32/linux64

var gulp = require('gulp'),
    shell = require('gulp-shell'),
    concat = require('gulp-concat'),
    minifyCSS = require('gulp-minify-css'),
    sass = require('gulp-sass'),
    nwBuilder = require("node-webkit-builder"),
    gutil = require("gulp-util"),
    ignore = require("gulp-util");

var Globals = {
    "nwVersion" : "0.12.0"
};

gulp.task('default', ['buildDev']);
gulp.task('buildFirst', ['scssToCss', 'minifyCss', 'concatJS', 'nwBuild']);
gulp.task('buildDev', ['scssToCss', 'concatJS', 'openApp']);

gulp.task('nwBuild', function () {
    var ProdNodeModules = [
        "./node_modules/angular/angular.min.js",
        "./node_modules/angular-animate/angular-animate.min.js",
        "./node_modules/angular-resource/angular-resource.min.js",
        "./node_modules/angular-route/angular-route.min.js",
        "./node_modules/angular-loading-bar/build/loading-bar.min.js",
        "./node_modules/moment/**",
        "./node_modules/request/**",
        "./node_modules/nedb/**",
        "./node_modules/underscore/underscore-min.js"
    ];
    var nw = new nwBuilder({
        version : Globals.nwVersion,
        files : ["./app/**", "!./app/**/*.jade", "./node_modules", "./assets/**", "./package.json", "./index.html", "!./assets/sass/**"].concat(ProdNodeModules),
        platforms : (!PLATFORM || PLATFORM == 'all' ? ['osx32', 'osx64', 'linux32', 'linux64', 'win32', 'win64'] : [PLATFORM])
    }).on('log', function (msg) { gutil.log('node-webkit-builder', msg) });
    return nw.build().catch(function (err) {
        gutil.log('node-webkit-builder', err);
    });
});

gulp.task('openApp', function () {
    gulp.src('cache/' + Globals.nwVersion + '/' + PLATFORM + '/nw.exe', {read: true})
        .pipe(shell(['<%= file.path %> ./ --enable-logging --debug']));
});

gulp.task('concatJS', function () {
    gulp.src(['app/**/*.js', 'assets/js/**/*.js', '!assets/js/main.js'])
        .pipe(concat('main.js'))
        .pipe(gulp.dest('assets/js/'));
});

gulp.task('scssToCss', function () {
    gulp.src('assets/sass/main.scss')
        .pipe(sass())
        .pipe(gulp.dest('assets/css'));
});

gulp.task('minifyCss', function () {
    gulp.src('assets/css/main.css')
        .pipe(minifyCSS())
        .pipe(gulp.dest('assets/css'));
});