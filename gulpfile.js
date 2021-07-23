/* paths to project folders */

var paths = {
    input: 'src/',
    output: 'dist/',
    scripts: {
        input: 'src/js/*.js',
        output: 'dist/js/'
    },
    styles: {
        input: 'src/sass/**/*.{scss,sass}',
        output: 'dist/css/'
    },
    html: {
        input: 'src/**/*.html',
        output: 'dist/'
    },
    copy: {
        input: 'src/copy/**/*',
        output: 'dist/'
    },
    reload : './dist'
};

var banner = {
    main: '/*!' +
        ' <%= package.name %> v<%= package.version %>' +
        ' | (c) ' + new Date().getFullYear() + ' <%= package.author.name %>' +
        ' | <%= package.license %> License' +
        // ' | <%= package.repository.url %>' +
        ' */\n'
};

/* packages to install */
const {
    gulp,
    src,
    dest,
    watch,
    series,
    parallel
} = require('gulp');
const del = require('del');
const rename = require('gulp-rename');
const header = require('gulp-header');
const package = require('./package.json');

// scripts
const lazypipe = require('lazypipe');
const uglify = require('gulp-terser');
const optimizejs = require('gulp-optimize-js');

// Styles
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const prefix = require('autoprefixer');
const minify = require('cssnano');

// HTML 
const htmlmin = require('gulp-htmlmin');

// BrowserSync
const browserSync = require('browser-sync');

// Remove pre-existing content from output folders
var cleanDist = function(done) {
    // Clean the dist folder
    del.sync([
        paths.output
    ]);
    // Signal completion
    return done();
};

exports.cleanDist = cleanDist;

/* tasks */
var jsTasks = lazypipe()
    .pipe(optimizejs)
    .pipe(rename, {
        suffix: '.min'
    })
    .pipe(uglify)
    .pipe(optimizejs)
    .pipe(dest, paths.scripts.output);

var minJsTask = function(done) {
    src(paths.scripts.input).pipe(jsTasks())
    done();
}

// exports.minjs = minJsTask;

// Process, lint, and minify Sass files
var buildStyles = function(done) {
    // Run tasks on all Sass files
    return src(paths.styles.input)
        .pipe(sass({
            outputStyle: 'expanded',
            sourceComments: true
        }))
        .pipe(postcss([
            prefix({
                cascade: true,
                remove: true
            })
        ]))
        .pipe(header(banner.main, {
            package: package
        }))
        .pipe(dest(paths.styles.output))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(postcss([
            minify({
                discardComments: {
                    removeAll: true
                }
            })
        ]))
        .pipe(dest(paths.styles.output));
        done();
};

exports.buildStyle = buildStyles;

// optimize html
var buildHTML = function(done) {
    // minify html files
    return src(paths.html.input)
        .pipe(htmlmin({
            collapseWhitespace: true,
            minifyCSS: true
        }))
        .pipe(dest(paths.html.output));
    done();
};

// Copy static files into output folder
var copyFiles = function(done) {
    // Copy static files
    return src(paths.copy.input)
        .pipe(dest(paths.copy.output));
    done();
};

// Watch for changes to the src directory
var startServer = function(done) {
    // Initialize BrowserSync
    browserSync.init({
        server: {
            baseDir: paths.reload,
            //serve pages with no .html
            serveStaticOptions: {
                extensions: ['html']
            }
        }
    });
    // Signal completion
    done();
};

// Reload the browser when files change
var reloadBrowser = function(done) {
    browserSync.reload();
    done();
};

// Watch for changes
var watchSource = function(done) {
    watch(paths.input, series(exports.default, reloadBrowser));
    done();
};

/**  Export Tasks */
// Default task
// gulp
exports.default = series(
    cleanDist,
    parallel(
        minJsTask,
        buildStyles,
        buildHTML,
        copyFiles
    )
);

// Watch and reload
// gulp watch
exports.watch = series(
    exports.default,
    startServer,
    watchSource
);