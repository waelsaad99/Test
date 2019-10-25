'use strict';


// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCss = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var sassdoc = require('sassdoc');
var browserSync = require('browser-sync').create();
var nunjucksRender = require('gulp-nunjucks-render');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var siteOutput = './dist';


// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

var input = './assets/sass/**/*.scss';
var inputMain = './assets/sass/main.scss';
var vendors = './assets/vendors/*.css';
var output = siteOutput + '/assets/css';
var inputTemplates = './pages/*.html';
var inputPartials = './templates/**/*.html';
var sassOptions = { outputStyle: 'expanded' };
var autoprefixerOptions = { browsers: ['last 2 versions', '> 5%', 'Firefox ESR'] };
var sassdocOptions = { dest: siteOutput + '/sassdoc' };


// -----------------------------------------------------------------------------
// Sass compilation and merge Vendor Css files
// -----------------------------------------------------------------------------

gulp.task('sass', function () {
  return gulp
    .src([inputMain,vendors])
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(concat({path: 'main.css'}))
    .pipe(cleanCss())
    .pipe(gulp.dest(output))
    .pipe(browserSync.stream());
});


// -----------------------------------------------------------------------------
// Javascript and merge Vendors Js files
// -----------------------------------------------------------------------------

gulp.task('scripts', function () {
  return gulp.src([
    './assets/scripts/*.js',
    './assets/vendors/*.js'
  ])
    .pipe(concat({ path: 'main.js' }))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(gulp.dest(siteOutput + '/assets/scripts'));
});


// -----------------------------------------------------------------------------
// Templating
// -----------------------------------------------------------------------------

gulp.task('nunjucks', function () {
  nunjucksRender.nunjucks.configure(['./templates/']);
  // Gets .html and .nunjucks files in pages
  return gulp.src(inputTemplates)
    // Renders template with nunjucks
    .pipe(nunjucksRender())
    // output files in dist folder
    .pipe(gulp.dest(siteOutput))
});


// -----------------------------------------------------------------------------
// Imagemin
// -----------------------------------------------------------------------------

gulp.task('img', function () {
  return gulp.src('./assets/images/**/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(siteOutput + '/assets/images'));
});


// -----------------------------------------------------------------------------
// Fonts
// -----------------------------------------------------------------------------

gulp.task('fonts', function() {
  return gulp.src(['./assets/fonts/*'])
  .pipe(gulp.dest(siteOutput + '/assets/fonts/'));
});


// -----------------------------------------------------------------------------
// Sass documentation generation
// -----------------------------------------------------------------------------

gulp.task('sassdoc', function () {
  return gulp
    .src(input)
    .pipe(sassdoc(sassdocOptions))
    .resume();
});


// -----------------------------------------------------------------------------
// Watchers
// -----------------------------------------------------------------------------

gulp.task('watch', function () {
  // Watch the sass input folder for change,
  // and run `sass` task when something happens
  gulp.watch(input, ['sass']).on('change', function (event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });

  gulp.watch('./scripts/*', ['scripts']).on('change', browserSync.reload);

  // Watch nunjuck templates and reload browser if change
  gulp.watch(inputTemplates, ['nunjucks']).on('change', browserSync.reload);

  // Watch of partials changes and reload browser if change
  gulp.watch(inputPartials, ['nunjucks']).on('change', browserSync.reload);
});


// -----------------------------------------------------------------------------
// Static server
// -----------------------------------------------------------------------------

gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: siteOutput
    }
  });
});


// -----------------------------------------------------------------------------
// Default task
// -----------------------------------------------------------------------------

gulp.task('default', ['sass', 'nunjucks', 'img', 'fonts', 'scripts', 'watch', 'browser-sync']);
