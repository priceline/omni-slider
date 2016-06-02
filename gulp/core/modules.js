/**
 * Use gulp-load-plugins for these benefits:
 *   - less declarations of requiring modules into variables at top
 *   - modules being lazy loaded on demand
 *     https://www.npmjs.com/package/gulp-load-plugins#lazy-loading
 * */

import gulpLoadPlugins from 'gulp-load-plugins';

export const gulpModules = gulpLoadPlugins({

  pattern: ['gulp-*', 'gulp.*'],
  replaceString: /^gulp(-|\.)/,
  lazy: true

});
