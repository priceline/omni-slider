import gulp from 'gulp';
import runSequence from 'run-sequence';
import buildTasks from './gulp/build';
import testTasks from './gulp/test';
import deployTasks from './gulp/deploy';

gulp.task('default', function(done) {
  runSequence('clean', 'move', 'build', 'watch', done);
});

gulp.task('deploy', function() {
  runSequence('gh-publish');
});
