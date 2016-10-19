chai = require 'chai'
sinonChai = require 'sinon-chai'
{match: {any, instanceOf}} = require 'sinon'
{File: {isVinyl}, PluginError} = require 'gulp-util'
{wait} = require 'event-stream'
{buffer, string} = require './fixtures/content'
{buffered, streaming} = require './fixtures/file'
{bufferFn, stringFn, asyncFn} = require './fixtures/fn'
err = require './helpers/err'
transform = require '../src'

before ->
  chai.use(sinonChai)
  chai.should()

describe 'plugin: gulp-transform', ->

  it 'exports a function', ->
    transform.should.be.a 'function'

  describe 'param: transformFn', ->

    context 'undefined', ->

      it 'throws PluginError', ->
        err -> transform()

    context 'not a function', ->

      it 'throws PluginError', ->
        err -> transform 42

    context 'returns null or undefined', ->

      it 'emits PluginError', (done) ->
        stream = transform((content) -> null)
        stream.write buffered()
        stream.on 'error', (err) ->
          err.should.be.instanceOf PluginError
          done()

    context 'returns a Buffer or string', ->
      [fn, file] = [null, null]

      beforeEach ->
        file = buffered()
        fn = bufferFn()
        transform(fn).write file

      it 'is called once per file', ->
        fn.should.have.been.calledOnce

      it 'is called with contents as first argument', ->
        fn.should.have.been.calledWith instanceOf(Buffer)

      it 'is called with vinyl File as second argument', ->
        fn.should.have.been.calledWith any, file

    context 'returns a Promise that resolves to a string or Buffer', ->
      [fn, file] = [null, null]

      beforeEach ->
        file = buffered()
        fn = asyncFn()
        transform(fn, {encoding: 'utf8'}).write(file)

      it 'is called once per file', ->
        fn.should.have.been.calledOnce

      it 'is called with contents as first argument', ->
        fn.should.have.been.calledWith string

      it 'is called with vinyl File as second argument', ->
        fn.should.have.been.calledWith any, file

  describe 'param: options', ->

    context 'not an object', ->

      it 'throws PluginError', ->
        err -> transform bufferFn(), 42

    describe 'option: encoding', ->

      it 'sets encoding of content passed to transformFn', ->
        transform(fn = stringFn(), encoding: 'utf8').write buffered()
        fn.should.have.been.calledWith string

      it 'defaults to Buffer', ->
        transform(fn = bufferFn()).write buffered()
        fn.should.have.been.calledWith instanceOf(Buffer)

    describe 'option: thisArg', ->

      it 'sets context within transformFn', ->
        transform(fn = bufferFn(), thisArg: 42).write buffered()
        fn.should.have.been.calledOn 42

      it 'defaults to undefined', ->
        transform(fn = bufferFn()).write buffered()
        fn.should.have.been.calledOn undefined

    describe 'mode: buffer', ->

      context 'synchronous', ->
        file = null

        beforeEach (done) ->
          transform(bufferFn()).once('data', (_file) ->
            file = _file
            done()
          ).write buffered()

        it 'returns a stream of vinyl Files', ->
          isVinyl(file).should.be.true

        it 'files are in buffer mode', ->
          file.isBuffer().should.be.true;

        it 'transforms file contents', ->
          file.contents.should.deep.equal Buffer.concat([buffer, buffer])

      context 'async', ->
        file = null

        beforeEach (done) ->
          transform(asyncFn(), {encoding: 'utf8'}).once('data', (_file) ->
            file = _file
            done()
          ).write buffered()

        it 'returns a stream of vinyl Files', ->
          isVinyl(file).should.be.true

        it 'files are in buffer mode', ->
          file.isBuffer().should.be.true;

        it 'transforms file contents', ->
          file.contents.should.deep.equal new Buffer('un deux trois')

    describe 'mode: streaming', ->

      context 'synchronous', ->
        file = null

        beforeEach (done) ->
          transform(stringFn(), {encoding: 'utf8'}).once('data', (_file) ->
            file = _file
            done()
          ).write streaming()

        it 'returns a stream of vinyl Files', ->
          isVinyl(file).should.be.true

        it 'files are in streaming mode', ->
          file.isStream().should.be.true

        it 'transforms file contents', (done) ->
          file.pipe(wait((err, data) ->
            data.should.deep.equal new Buffer('un deux trois')
            done()
          ))

      context 'async', ->
        file = null

        beforeEach (done) ->
          transform(asyncFn(), {encoding: 'utf8'}).once('data', (_file) ->
            file = _file
            done()
          ).write streaming()

        it 'returns a stream of vinyl Files', ->
          isVinyl(file).should.be.true

        it 'files are in streaming mode', ->
          file.isStream().should.be.true

        it 'transforms file contents', (done) ->
          file.pipe(wait((err, data) ->
            data.should.deep.equal new Buffer('un deux trois')
            done()
          ))
