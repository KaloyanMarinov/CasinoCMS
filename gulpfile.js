// ## Globals
var argv         = require('minimist')(process.argv.slice(2));
var autoprefixer = require('gulp-autoprefixer');
var browserSync  = require('browser-sync').create();
var changed      = require('gulp-changed');
var concat       = require('gulp-concat');
var flatten      = require('gulp-flatten');
var fileinclude  = require('gulp-file-include');
var gulp         = require('gulp');
var gulpif       = require('gulp-if');
var newer        = require('gulp-newer');
var imagemin     = require('gulp-imagemin');
var extReplace   = require("gulp-ext-replace");
var lazypipe     = require('lazypipe');
var less         = require('gulp-less');
var merge        = require('merge-stream');
var cssNano      = require('gulp-cssnano');
var plumber      = require('gulp-plumber');
var rev          = require('gulp-rev');
var sass         = require('gulp-sass');
var gcmq         = require('gulp-group-css-media-queries');
var cleanCSS     = require('gulp-clean-css');
var sourcemaps   = require('gulp-sourcemaps');
var uglify       = require('gulp-uglify');

// See https://github.com/austinpray/asset-builder
var manifest = require('asset-builder-nobower')('./assets/manifest.json');

// `path` - Paths to base asset directories. With trailing slashes.
// - `path.source` - Path to the source files. Default: `assets/`
// - `path.dist` - Path to the build directory. Default: `dist/`
var path = manifest.paths;

// `config` - Store arbitrary configuration values here.
var config = manifest.config || {};

// `globs` - These ultimately end up in their respective `gulp.src`.
// - `globs.js` - Array of asset-builder JS dependency objects. Example:
//   ```
//   {type: 'js', name: 'main.js', globs: []}
//   ```
// - `globs.css` - Array of asset-builder CSS dependency objects. Example:
//   ```
//   {type: 'css', name: 'main.css', globs: []}
//   ```
// - `globs.fonts` - Array of font path globs.
// - `globs.images` - Array of image path globs.
// - `globs.bower` - Array of all the main Bower files.
var globs = manifest.globs;

// `project` - paths to first-party assets.
// - `project.js` - Array of first-party JS assets.
// - `project.css` - Array of first-party CSS assets.
var project = manifest.getProjectGlobs();

// CLI options
var enabled = {
  // Enable static asset revisioning when `--production`
  rev: argv.production,
  // Disable source maps when `--production`
  maps: !argv.production,
  // Fail styles task on error when `--production`
  failStyleTask: argv.production,
  // Fail due to JSHint warnings only when `--production`
  failJSHint: argv.production,
  // Strip debug statments from javascript when `--production`
  stripJSDebug: argv.production,
};

// Path to the compiled assets manifest in the dist directory
var revManifest = path.dist + 'assets.json';

// Error checking; produce an error rather than crashing.
var onError = function(err) {
  console.log(err.toString());
  this.emit('end');
};

// ## Reusable Pipelines
// See https://github.com/OverZealous/lazypipe

// ### Write to rev manifest
// If there are any revved files then write them to the rev manifest.
// See https://github.com/sindresorhus/gulp-rev
var writeToManifest = function(directory, done) {
  return lazypipe()
    .pipe(gulp.dest, path.dist + directory)
    .pipe(browserSync.stream, {match: '**/*.{js,css}'})
    .pipe(rev.manifest, revManifest, {
      base: path.dist,
      merge: true
    })
    .pipe(gulp.dest, path.dist)().on('end', done);
};

// ### CSS processing pipeline
// Example
// ```
// gulp.src(cssFiles)
//   .pipe(cssTasks('main.css')
//   .pipe(gulp.dest(path.dist + 'styles'))
// ```
var cssTasks = function(filename) {
  return lazypipe()
    .pipe(function() {
      return gulpif(!enabled.failStyleTask, plumber());
    })
    .pipe(function() {
      return gulpif(enabled.maps, sourcemaps.init());
    })
    .pipe(function() {
      return gulpif('*.less', less());
    })
    .pipe(function() {
      return gulpif('*.scss', sass({
        outputStyle: 'nested', // libsass doesn't support expanded yet
        precision: 10,
        includePaths: ['.'],
        errLogToConsole: !enabled.failStyleTask
      }));
    })
    .pipe(concat, filename)
    .pipe(autoprefixer, {
      flexbox: true,
      overrideBrowserslist: [
        'last 2 versions',
        'android 4',
        'opera 12'
      ]
    })
    .pipe(function() {
      return gcmq();
    })
    .pipe(function () {
      return cleanCSS({
        compatibility: '10+',
        level: {
          2: {
            mergeAdjacentRules: true,
            mergeIntoShorthands: true,
            mergeMedia: false,
            mergeNonAdjacentRules: true,
            mergeSemantically: false,
            overrideProperties: true,
            removeEmpty: true,
            reduceNonAdjacentRules: true,
            removeDuplicateFontRules: true,
            removeDuplicateMediaBlocks: false,
            removeDuplicateRules: true,
            restructureRules: true,
          }
        }
      });
    })
    .pipe(cssNano, {
      safe: true
    })
    .pipe(function() {
      return gulpif(enabled.rev, rev());
    })
    .pipe(function() {
      return gulpif(enabled.maps, sourcemaps.write('.', {
        sourceRoot: 'assets/styles/'
      }));
    })();
};

var processStyles = function(done) {
  var merged = merge();
  manifest.forEachDependency('css', function(dep) {
    var cssTasksInstance = cssTasks(dep.name);
    if (!enabled.failStyleTask) {
      cssTasksInstance.on('error', function(err) {
        console.error(err.message);
        this.emit('end');
      });
    }
    merged.add(gulp.src(dep.globs, {base: 'styles'})
      .pipe(plumber({errorHandler: onError}))
      .pipe(cssTasksInstance));
  });
  return merged
    .pipe(writeToManifest('styles', done));
};

// ### JS processing pipeline
// Example
// ```
// gulp.src(jsFiles)
//   .pipe(jsTasks('main.js')
//   .pipe(gulp.dest(path.dist + 'scripts'))
// ```
var jsTasks = function(filename) {
  return lazypipe()
    .pipe(function() {
      return gulpif(enabled.maps, sourcemaps.init());
    })
    .pipe(concat, filename)
    .pipe(uglify, {
      compress: {
        'drop_debugger': enabled.stripJSDebug
      }
    })
    .pipe(function() {
      return gulpif(enabled.rev, rev());
    })
    .pipe(function() {
      return gulpif(enabled.maps, sourcemaps.write('.', {
        sourceRoot: 'assets/scripts/'
      }));
    })();
};

var processScripts = function(done) {
  var merged = merge();
  manifest.forEachDependency('js', function(dep) {
    merged.add(
      gulp.src(dep.globs, {base: 'scripts'})
        .pipe(plumber({errorHandler: onError}))
        .pipe(jsTasks(dep.name))
    );
  });
  return merged
    .pipe(writeToManifest('scripts', done));
};

// ## Gulp tasks
// Run `gulp -T` for a task summary

// ### Styles
// `gulp styles` - Compiles, combines, and optimizes Bower CSS and project CSS.
// By default this task will only log a warning if a precompiler error is
// raised. If the `--production` flag is set: this task will fail outright.
gulp.task('styles', gulp.series(processStyles));

// ### Scripts
// `gulp scripts` - Runs JSHint then compiles, combines, and optimizes Bower JS
// and project JS.
gulp.task('scripts', gulp.series(processScripts));

// ### Fonts
// `gulp fonts` - Grabs all the fonts and outputs them in a flattened directory
// structure. See: https://github.com/armed/gulp-flatten
gulp.task('fonts', function() {
  return gulp.src(globs.fonts)
    .pipe(flatten())
    .pipe(gulp.dest(path.dist + 'fonts'))
    .pipe(browserSync.stream());
});

// ### Images
// `gulp images` - Run lossless compression on all the images.
gulp.task('images', function() {
  return gulp.src(globs.images)
    .pipe(newer(path.dist + 'images'))
    .pipe(imagemin([
      imagemin.jpegtran({progressive: true}),
      imagemin.gifsicle({interlaced: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({plugins: [
        {removeUnknownsAndDefaults: false},
        {cleanupIDs: false},
        {removeDimensions: false}
      ]})
    ]))
    .pipe(gulp.dest(path.dist + 'images'))
    .pipe(browserSync.stream());
});

// ### File Include
gulp.task('fileinclude', async function() { // jshint ignore:line
  gulp.src(['./pages-1/*.html'])
  .pipe(flatten())
    .pipe(fileinclude({
      prefix: '@@',
      basepath: './templates/',
    }))
    .pipe(gulp.dest('./html'))
    .pipe(browserSync.stream());
  
  gulp.src(['./pages-2/*.html'])
    .pipe(flatten())
    .pipe(fileinclude({
      prefix: '@@',
      basepath: './templates/',
    }))
    .pipe(gulp.dest('./html'))
    .pipe(browserSync.stream());
  
  gulp.src(['./pages-3/*.html'])
    .pipe(flatten())
      .pipe(fileinclude({
        prefix: '@@',
        basepath: './templates/',
      }))
      .pipe(gulp.dest('./html'))
      .pipe(browserSync.stream());
});

// ### Clean
// `gulp clean` - Deletes the build folder entirely.
gulp.task('clean', require('del').bind(null, [path.dist, './html']));

// ### Clean Scripts & Styles
// `gulp cleanSS` - Deletes the build folder entirely.
gulp.task('cleanSS', require('del').bind(null, [path.dist + 'scripts', path.dist + 'styles']));

// ### Watch
// `gulp watch` - Use BrowserSync to proxy your dev server and synchronize code
// changes across devices. Specify the hostname of your dev server at
// `manifest.config.devUrl`. When a modification is made to an asset, run the
// build step for that asset and inject the changes into the page.
// See: http://www.browsersync.io
gulp.task('watch', function() {
  browserSync.init({
    server: {
      baseDir: "./",
    },
    open: false
  });
  gulp.watch([path.source + 'styles/**/*'], gulp.series('styles'));
  gulp.watch([path.source + 'scripts/**/*'], gulp.series('scripts'));
  gulp.watch([path.source + 'fonts/**/*'], gulp.series('fonts'));
  gulp.watch([path.source + 'images/**/*'], gulp.series('images'));
  gulp.watch(['./pages-1/*.html', './pages-2/*.html', './pages-3/*.html', './templates/**/*'], gulp.series('fileinclude'));
  gulp.watch(['assets/manifest.json'], gulp.series('manifest'));
});

// ### manifest
// `gulp manifest` - Run all the manifest tasks.
gulp.task(
  'manifest',
  gulp.series('cleanSS', 'styles', 'scripts')
);

// ### Build
// `gulp build` - Run all the build tasks but don't clean up beforehand.
// Generally you should be running `gulp` instead of `gulp build`.
gulp.task(
  'build',
  gulp.series('styles', 'scripts', gulp.parallel('fonts', 'images', 'fileinclude'))
);

// ### Gulp
// `gulp` - Run a complete build. To compile for production run `gulp --production`.
gulp.task('default', gulp.series('clean', 'build'));
