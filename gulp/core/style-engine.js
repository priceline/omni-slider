import gulp from 'gulp';
import { stylesToConcat, componentName } from '../gulp-config';
import { gulpModules } from './modules';

class StyleEngine {
  static buildStyle() {
    return gulp.src(stylesToConcat)
      .pipe(gulpModules.concat(`${componentName}.css`))
      .pipe(gulpModules.sass().on('error', gulpModules.sass.logError))
      .pipe(gulpModules.autoprefixer())
      .pipe(gulp.dest('./'))
      .pipe(gulp.dest('./demo'))
      .pipe(gulpModules.rename(`${componentName}.min.css`))
      .pipe(gulpModules.cssnano())
      .pipe(gulp.dest('./'));
  }
}

export default StyleEngine;
