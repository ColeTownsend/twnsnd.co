var gulp        = require('gulp');
var glob        = require('glob');
var browserSync = require('browser-sync');
var notify      = require('gulp-notify');
var plumber     = require('gulp-plumber');
// var sass        = require('gulp-sass');
var sass        = require('gulp-ruby-sass');
// var sourcemaps = require('gulp-sourcemaps');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var deploy      = require("gulp-gh-pages");
// minification
var minifyCSS   = require('gulp-minify-css');
var uncss       = require('gulp-uncss');
// js
var uglify      = require('gulp-uglify');
var concat      = require('gulp-concat');
// images
var size        = require('gulp-size');
var imagemin    = require('gulp-imagemin');
var newer       = require('gulp-newer');
var cache       = require('gulp-cache');
var changed     = require('gulp-changed');

// error handlig
var onError = function(err) {
    console.log(err);
}


var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Test the Jekyll Site
 */
gulp.task('jekyll-dev', function (done) {
  browserSync.notify(messages.jekyllBuild);
  return cp.spawn('jekyll', ['build', '--config=_config.yml,_config.dev.yml'], {stdio: 'inherit'})
    .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-dev'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-dev, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-dev'], function() {
    browserSync({
        server: {
            baseDir: 'dist'
        }
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('public/_scss/i.scss')
        // .pipe(sourcemaps.init())
            .pipe(sass({
                loadPath: ['scss'],
                // includePaths: ['scss'],
                // noCache: true,
                style: "compressed",
                onError: browserSync.notify
            }))
        // .pipe(sourcemaps.write())
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('public/css'));
});

// css removal
gulp.task('uncss', function() {
    gulp.src('dist/css/i.css')
        .pipe(uncss({
            html: glob.sync('dist/**/*.html', 'dist/*.html'),
            ignore: [ // Keep some JS dependent CSS from being deleted,
                      // these are examples, you should configure as needed
                '.active',
                '.*-color',
            ]
        }))
        .pipe(gulp.dest('./out'));
});

// Minify css
gulp.task('minify-css', function() {
  gulp.src('dist/css/i.css')
    .pipe(minifyCSS({keepBreaks:true, debug:true}))
    .pipe(gulp.dest('dist/css/'));
});


// minify images
gulp.task('images', function() {
    var imgSrc = './public/images/**/*',
        imgDst = './dist/images';

    return gulp.src(imgSrc)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(changed(imgDst))
        .pipe(imagemin())
        .pipe(gulp.dest(imgDst))
        .pipe(notify({ message: 'Images task complete' }));
});

// concat
gulp.task('concat', function() {
  gulp.src(['./public/js/*.min.js', './public/js/uilang.min.js'])
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./public/js'))
    .pipe(notify({ message: 'Scripts concatenated' }));
});


/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('./public/js/*.js', ['concat']);
    gulp.watch('./public/**/*.scss', ['sass']);
    gulp.watch(['public/*.html', 'public/_data/*','public/_includes/*.html', 'public/_layouts/*.html', 'public/_posts/*'], ['jekyll-rebuild']);
});


gulp.task("deploy", ["sass", "concat","jekyll-build", "images", "minify-css"], function () {
    return gulp.src(["./dist/**/*","./_config.yml"])
        .pipe(deploy());
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);