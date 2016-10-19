{Promise} = require 'es6-promise';
{spy} = require 'sinon'

re = /one|two|three/g

dict =
  one:   'un'
  two:   'deux'
  three: 'trois'

translate = (content) ->
  content.replace(re, (match) -> dict[match])

exports.stringFn = ->
  spy (content) ->
    translate(content)

exports.bufferFn = ->
  spy (content) ->
    Buffer.concat([content, content])

exports.asyncFn = ->
  spy (content) ->
    return Promise.resolve(translate(content))
