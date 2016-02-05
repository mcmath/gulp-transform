'use strict';

var resolve = require('path').resolve;


var FIXTURES = resolve(__dirname, '../fixtures');

exports.SRC = resolve(FIXTURES, 'src');
exports.DEST = resolve(FIXTURES, 'dest');
exports.EXP = resolve(FIXTURES, 'expected');
