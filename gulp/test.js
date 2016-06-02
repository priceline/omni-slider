import gulp from 'gulp';
import jasmine from 'gulp-jasmine';
import { testFiles } from './gulp-config';

gulp.task('test', function () {
  return gulp.src(testFiles)
    .pipe(jasmine());
});
