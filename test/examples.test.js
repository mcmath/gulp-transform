'use strict';

var fs = require('fs');
var resolve = require('path').resolve;
var exec = require('child_process').exec;
var expect = require('chai').use(require('sinon-chai')).expect;
var gulp = require('gulp');
var rimraf = require('rimraf');
var paths = require('./fixtures/paths');



describe('readme:examples', function() {

  describe('example:simple', function() {

    before(function(done) {
      require('./fixtures/tasks/quadruple');
      gulp.start('quadruple', done);
    });

    it('repeats contents four times and joins with newline', function() {
      var expected = fs.readFileSync(resolve(paths.EXP, 'caesar.txt'), 'utf8');
      var contents = fs.readFileSync(resolve(paths.DEST, 'caesar.txt'), 'utf8');
      expect(contents).to.equal(expected);
    });
  });

  describe('example:cheerio', function() {

    before(function(done) {
      require('./fixtures/tasks/cheerio');
      gulp.start('cheerio', done);
    });

    it('adds role="main" to <main> tag', function() {
      var expected = fs.readFileSync(resolve(paths.EXP, 'index.html'), 'utf8');
      var contents = fs.readFileSync(resolve(paths.DEST, 'index.html'), 'utf8');
      expect(contents).to.equal(expected);
    });
  });

  after(function(done) {
    rimraf(paths.DEST, done);
  });
});
