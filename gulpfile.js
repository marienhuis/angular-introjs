var gulp = require('gulp');
var concat = require('gulp-concat');
var jade = require('gulp-jade');
var order = require("gulp-order");
var print = require('gulp-print');

gulp.task('jade', function() {
    // place code for your default task here

    gulp.src('app/**/*.jade')
        .pipe(jade())
        .pipe(gulp.dest('./app'));
});

gulp.task('js', function() {

    return gulp.src([
        '!app/app.build.js',
        'app/**/*.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
    ])
    .pipe(order([
        'app/components/*.module.js',
        'app/components/*.directive.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'app/app.module.js',
        'app/**/*.service.js',
        'app/app.js',


    ], {base:'/htdocs/mhIntro'})) //For some reason it does not work without base (maybe Win10?)
    .pipe(print())
    .pipe(concat('app.build.js'))
    .pipe(gulp.dest('./app'));


    //'bower_components/**/*.js',
    //'app/components/mh-intro.module.js',
    //'app/components/*.module.js',
    //'app/components/*.directive.js',

    //'app/**/*.service.js',
    //'app/app.js'
    //'app/**/*.js'
});

gulp.task('reload', function() {
    // place code for your default task here
});

gulp.task('default', ['jade', 'js'], function() {

    var watcher = gulp.watch(['app/**/*.js', '!app/app.build.js'], ['js','reload']);
    watcher.on('change', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });

    gulp.watch('app/**/*.jade', ['jade']);


    // place code for your default task here
});