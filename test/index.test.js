'use strict';

var expect = require('chai').use(require('sinon-chai')).expect;
var sinon = require('sinon');
var es = require('event-stream');
var gutil = require('gulp-util');
var fixt = require('./fixtures/fixtures');



describe('plugin:gulpTransform()', function() {

  var transform;
  before(function() {
    transform = require('../index');
  });

  it('is the main module', function() {
    expect(transform).to.equal(require('..'));
  });

  it('exports gulpTransform()', function() {
    expect(transform).to.be.instanceof(Function);
    expect(transform).to.have.property('name', 'gulpTransform');
  });

  describe('param:transformFn', function() {

    var fn, file;
    beforeEach(function() {
      file = fixt.file.buffered();
      fn = fixt.fn.transform();
      transform(fn).write(file);
    });

    it('throws PluginError if undefined', function() {
      expect(transform).to.throw(gutil.PluginError);
    });

    it('throws PluginError if not a Function', function() {
      expect(transform.bind(null, 'paralysis')).to.throw(gutil.PluginError);
    });

    it('throws PluginError if return value is not a String or Buffer', function() {
      expect(function() {
        transform(fixt.fn.bufferReturn()).write(fixt.file.buffered());
      }).not.to.throw(gutil.PluginError);
      expect(function() {
        transform(fixt.fn.noReturn()).write(fixt.file.buffered());
      }).to.throw(gutil.PluginError);
    });

    it('is called once per file', function() {
      expect(fn).to.have.been.calledOnce;
    });

    it('is called with contents as first argument', function() {
      expect(fn).to.have.been.calledWith(fixt.data.buffer);
    });

    it('is called with file as second argument', function() {
      expect(fn).to.have.been.calledWith(sinon.match.any, file);
    });
  });

  describe('param:options', function() {

    var fn, file;
    beforeEach(function() {
      file = fixt.file.buffered();
      fn = fixt.fn.transform();
    });

    it('throws a PluginError if defined but not an Object', function() {
      expect(transform.bind(null, fn, 42)).to.throw(gutil.PluginError);
    });

    describe('option:encoding', function() {
      it('determines encoding of contents passed to transformFn', function() {
        transform(fn, {encoding: 'utf8'}).write(file);
        expect(fn).to.have.been.calledWith(fixt.data.string);
      });

      it('contents passed as a Buffer if undefined', function() {
        transform(fn).write(file);
        expect(fn).to.have.been.calledWith(fixt.data.buffer);
      });
    });

    describe('option:thisArg', function() {
      it('determines value of this in transformFn', function() {
        transform(fn, {thisArg: 42}).write(file);
        expect(fn).to.have.been.calledOn(42);
      });

      it('this is undefined if thisArg is undefined', function() {
        transform(fn).write(file);
        expect(fn).to.have.been.calledOn(undefined);
      });
    });
  });

  describe('mode:buffer', function() {

    var file;
    beforeEach(function(done) {
      transform(fixt.fn.transform()).once('data', function(_file) {
        file = _file;
        done();
      }).write(fixt.file.buffered());
    });

    it('returns a stream of vinyl files', function() {
      expect(gutil.File.isVinyl(file)).to.be.true;
    });

    it('files are in buffer mode', function() {
      expect(file.isBuffer()).to.be.true;
    });

    it('transforms file contents', function() {
      expect(file).property('contents').to.deep.equal(fixt.expected.buffer);
    });
  });

  describe('mode:streaming', function() {

    var file;
    beforeEach(function(done) {
      transform(fixt.fn.transform()).once('data', function(_file) {
        file = _file;
        done();
      }).write(fixt.file.streaming());
    });

    it('returns a stream of vinyl files', function() {
      expect(gutil.File.isVinyl(file)).to.be.true;
    });

    it('files are in streaming mode', function() {
      expect(file.isStream()).to.be.true;
    });

    it('transforms file contents', function(done) {
      file.pipe(es.wait(function(err, data) {
        expect(data).to.deep.equal(fixt.expected.buffer);
        done();
      }));
    });
  });
});
