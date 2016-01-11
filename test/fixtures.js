'use strict';

var path = require('path');
var File = require('gulp-util').File;
var es = require('event-stream');
var sinon = require('sinon');



var dataString =
'I know that I shall meet my fate'  +
'Somewhere among the clouds above;' +
'Those that I fight I do not hate'  +
'Those that I guard I do not love;' ;

var dataBuffer = new Buffer(dataString);
var dataArray = dataString.split(/(\n)/);


var filepath = '/path/to/kiltartan/yeats.txt';
var directory = path.dirname(filepath);


function transform(contents, file) {
  return file.path + contents;
}

function noReturn(contents, file) {
  file.path = 'ataxia';
}

function bufferReturn(contents, file) {
  return new Buffer(file.path + contents);
}



exports.data = {
  string: dataString,
  buffer: dataBuffer
};


exports.file = {

  buffered: function() {
    return new File({
      cwd: directory,
      path: filepath,
      contents: dataBuffer
    });
  },

  streaming: function() {
    return new File({
      cwd: directory,
      path: filepath,
      contents: es.readArray(dataArray)
    });
  }
};


exports.fn = {
  transform: function() {
    return sinon.spy(transform);
  },
  bufferReturn: function() {
    return sinon.spy(bufferReturn);
  },
  noReturn: function() {
    return sinon.spy(noReturn);
  }
};


exports.expected = {
  string: filepath + dataString,
  buffer: new Buffer(filepath + dataString)
};
