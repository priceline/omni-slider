import gulp from 'gulp';
import concat from 'gulp-concat';
import iife from 'gulp-iife';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import plumber from 'gulp-plumber';
import runSequence from 'run-sequence';
import jshint from 'gulp-jshint';
import babel from 'gulp-babel';
import eslint from 'gulp-eslint';
import del from 'del';
import tests from './test';
import {
  componentName,
  tempDirectory,
  sourceDirectory,
  libDirectory,
  testDirectory,
  scriptSourceFiles,
  styleSourceFiles,
  lintFiles,
  stylesToConcat,
  scriptsToConcat,
} from './gulp-config';
import StyleEngine from './core/style-engine';

gulp.task('clean', function(done) {
  return del(tempDirectory);
});

gulp.task('move', function(done) {
  done();
});

gulp.task('build-src-scripts', function() {
  return gulp.src(scriptSourceFiles)
    .pipe(plumber())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('src-bundle.js'))
    .pipe(gulp.dest('tmp'));
});

gulp.task('concat-scripts', function() {
  return gulp.src(scriptsToConcat)
    .pipe(plumber())
    .pipe(iife({ useStrict: false }))
    .pipe(concat(`${componentName}.js`))
    .pipe(gulp.dest('./'))
    .pipe(gulp.dest('./demo'))
    .pipe(uglify())
    .pipe(rename(`${componentName}.min.js`))
    .pipe(gulp.dest('./'));
});

gulp.task('build-styles', () => {
  StyleEngine.buildStyle();
});

gulp.task('process-scripts', function(done) {
  runSequence('lint', 'test', 'build-src-scripts', 'concat-scripts', done);
});

gulp.task('build', function(done) {
  runSequence('process-scripts', 'build-styles', done);
});

gulp.task('watch', function () {

  // watch JavaScript files
  gulp.watch(scriptSourceFiles, ['process-scripts']);

  // watch test files and re-run unit tests when changed
  gulp.watch('test/**/*.js', ['test']);

  // watch main scss file
  gulp.watch(styleSourceFiles, ['build-styles']);

});

gulp.task('lint', function () {
  return gulp.src(lintFiles)
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});
