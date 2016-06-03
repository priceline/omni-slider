import gulp from 'gulp';
import ghPages from 'gulp-gh-pages';
 
gulp.task('deploy', function() {
  return gulp.src('./**/*')
    .pipe(ghPages({'push': true}));
});
