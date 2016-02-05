'use strict';

var resolve = require('path').resolve;
var gulp = require('gulp');
var paths = require('../../config/paths');
var transform = require('../../..');



gulp.task('quadruple', function() {
  return gulp.src(resolve(paths.SRC, 'caesar.txt'))
    .pipe(transform(function(contents) {
      var arr = [];
      for (var i = 0; i < 4; i++) {
        arr.push(contents);
      }
      return arr.join('\n');
    }))
    .pipe(gulp.dest(paths.DEST));
});
