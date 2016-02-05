'use strict';

var resolve = require('path').resolve;
var gulp = require('gulp');
var cheerio = require('cheerio');
var paths = require('../../config/paths');
var transform = require('../../..');


function transformFn(contents) {
  var $ = cheerio.load(contents);
  $('main').attr('role', 'main');
  return $.html();
}

gulp.task('cheerio', function() {
  return gulp.src(resolve(paths.SRC, 'index.html'))
    .pipe(transform(transformFn, {encoding: 'utf8'}))
    .pipe(gulp.dest(paths.DEST));
});
