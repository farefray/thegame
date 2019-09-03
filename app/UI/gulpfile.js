'use strict';

// load plugins
var gulp = require('gulp');
var sass = require('gulp-sass');
var minifycss = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var concat = require('gulp-concat');
var del = require('del');
var notify = require('gulp-notify');
var uglify = require('gulp-uglify');

var includes = require('./src/includes.json');

// styles
gulp.task('styles', function() {
  var tmp = gulp.src('src/styles/app.scss').pipe(sass().on('error', sass.logError));

  // unminified
  tmp.pipe(concat('rpgui.css')).pipe(gulp.dest('../public/UI/'));

  // minified
  return tmp
    .pipe(concat('rpgui.min.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('../public/UI/'))
    .pipe(notify({ message: 'styles task complete' }));
});

// scripts
gulp.task('scripts', function() {
  var tmp = gulp.src(includes);

  // unminified
  tmp
    .pipe(concat('rpgui.js'))
    .pipe(gulp.dest('../public/UI/'))
    .pipe(notify({ message: 'scripts task complete' }));

  // minified
  return tmp
    .pipe(concat('rpgui.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('../public/UI/'))
    .pipe(notify({ message: 'scripts task complete' }));
});

// images
gulp.task('images', function() {
  return gulp
    .src('src/img/**/*')
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('../public/UI/img'))
    .pipe(notify({ message: 'images task complete' }));
});

// clean
gulp.task('clean', function() {
  return del(['../public/UI/css', '../public/UI/js', '../public/UI/images']);
});

// default task
gulp.task('default', ['watch'], function() {
  //    gulp.start('styles', 'scripts', 'images');
});

// watch
gulp.task('watch', ['clean', 'styles', 'scripts', 'images'], function() {
  // Watch .scss files
  gulp.watch('src/styles/**/*.scss', ['styles']);

  // Watch .js files
  gulp.watch('src/scripts/**/*.js', ['scripts']);

  // Watch image files
  gulp.watch('src/images/**/*', ['images']);

  // Watch any files in ../public/UI/, reload on change
  gulp.watch(['../public/UI/**']);
});

// ../public/UI
gulp.task('UI', ['clean', 'styles', 'scripts', 'images'], function() {});
