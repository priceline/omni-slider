import gulp from 'gulp';
import ghPages from 'gulp-gh-pages';
 
gulp.task('gh-publish', function() {
  return gulp.src('./demo/*')
    .pipe(ghPages({'push': true}));
});
