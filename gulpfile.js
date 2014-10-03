var gulp        = require('gulp');
var browserSync = require('browser-sync');
// var sass        = require('gulp-sass');
var sass        = require('gulp-ruby-sass');
// var sourcemaps = require('gulp-sourcemaps');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var deploy      = require("gulp-gh-pages");
var minifyCSS   = require('gulp-minify-css');

// images
// var imagemin = require('gulp-imagemin');
// var changed = require('gulp-changed');
// var defaultSettings = require("./settings.json");


var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build', '--config=_config.yml'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Test the Jekyll Site
 */
gulp.task('jekyll-dev', function (done) {
  browserSync.notify(messages.jekyllBuild);
  return cp.spawn('jekyll', ['build', '--config=_config.yml,_dev-config.yml'], {stdio: 'inherit'})
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

// Minify css
gulp.task('minify-css', function() {
  gulp.src('dist/css/*.css')
    .pipe(minifyCSS({keepBreaks:true}))
    .pipe(gulp.dest('dist/css'));
});

// minify images
gulp.task('images', function() {
  return gulp.src(paths.imagesSrc + '/**/*')
    .pipe(changed(paths.img))
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest(paths.img));
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('./public/**/*.scss', ['sass']);
    gulp.watch(['public/index.html', 'public/_data', 'public/_layouts/*.html', 'public/_posts/*'], ['jekyll-rebuild']);
});


gulp.task("deploy", ["jekyll-build"], function () {
    return gulp.src(["./dist/**/*","./_config.yml"])
        .pipe(deploy());
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);