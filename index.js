'use strict';

var inherits = require('util').inherits;
var Transform = require('stream').Transform;
var PluginError = require('gulp-util').PluginError;



function gulpTransform(transformFn, options) {
  if (isNone(transformFn)) {
    throwPluginError('transformFn must be defined');
  } else if (typeof transformFn !== 'function') {
    throwPluginError('transformFn must be a function');
  } else if (!isNone(options) && !/^(function|object)$/.test(typeof options)) {
    throwPluginError('options must be an object if defined');
  } else {
    return new GulpTransformStream(transformFn, options);
  }
}



function GulpTransformStream(transformFn, options) {
  Transform.call(this, {objectMode: true});
  this.transformFn = transformFn;
  this.options = options || {};
}

inherits(GulpTransformStream, Transform);

GulpTransformStream.prototype._transform = function(file, encoding, next) {
  if (file.isBuffer()) {
    file.contents = transformContents(this.transformFn, file.contents, file, this.options);
  }

  if (file.isStream()) {
    file.contents = file.contents.pipe(new FileStream(this.transformFn, file, this.options));
  }

  next(null, file);
};



function FileStream(transformFn, file, options) {
  Transform.call(this);
  this.transformFn = transformFn;
  this.file = file;
  this.options = options;
  this.data = [];
}

inherits(FileStream, Transform);

FileStream.prototype._transform = function(chunk, encoding, next) {
  this.data.push(chunk);
  next();
};

FileStream.prototype._flush = function(done) {
  var contents = Buffer.concat(this.data);
  this.push(transformContents(this.transformFn, contents, this.file, this.options));
  done();
};



function transformContents(transformFn, contents, file, options) {
  contents = options.encoding ? contents.toString(options.encoding) : contents;
  contents = transformFn.call(options.thisArg, contents, file);

  if (Buffer.isBuffer(contents)) {
    return contents;
  } else if (typeof contents === 'string' || contents instanceof String) {
    return new Buffer(contents);
  } else {
    throwPluginError('transformFn must return a string or a Buffer');
  }
}



function throwPluginError(message) {
  throw new PluginError('gulp-transform', message);
}

function isNone(value) {
  return value === undefined || value === null;
}



module.exports = gulpTransform;
