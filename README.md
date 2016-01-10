# gulp-transform

[![Version][Version badge]][NPM link]
[![License][License badge]][License link]
[![Build][Build badge]][Build link]
[![Coverage][Coverage badge]][Coverage link]
[![Dependencies][Dependencies badge]][Dependencies link]


[Gulp][Gulp link] plugin for applying arbitrary transformations to
file contents. Useful for incorporating non-gulp functions and modules into
your pipeline. Files may be in streaming mode or buffer mode.

## Install

Install via [npm][NPM link]:

```sh
npm install --save-dev gulp-transform
```

## Example

Source file (caesar.txt):

```
I am constant as the northern star...
```

Transform task:

```js
const gulp = require('gulp');
const transform = require('gulp-transform');

// Repeat contents three times and prepend filename.
function transformFn(contents, file) {
  return [file.basename, contents, contents, contents].join('\n');
}

gulp.task('silly-task', function() {
  return gulp.src('/path/to/src/**/*.txt')
    .pipe(transform(transformFn)) // Apply transform
    .pipe(gulp.dest('/path/to/dest'));
});
```

Destination file:

```
caesar.txt
I am constant as the northern star...
I am constant as the northern star...
I am constant as the northern star...
```

## API

The package exports a single plugin function that takes a callback and an
optional options object. The callback is invoked once per file. The
contents of the file are passed to the callback and replaced by the return
value.

##### Usage

##### `transform(transformFn, [options])`

<table>
  <thead>
    <tr>
      <th>
        Param
      </th>
      <th align="center">
        Type
      </th>
      <th>
        Details
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        transformFn
      </td>
      <td align="center">
        <code>Function</code>
      </td>
      <td>
        Function that transforms the contents of each file. Invoked with the
        following arguments:
        <ul>
          <li>
            <strong>contents</strong> (<code>Buffer</code>|<code>String</code>) The contents of
            the file. Will be a Buffer unless otherwise specified.
          </li>
          <li>
            <strong>file</strong> (<code>File</code>)
            The <a href="https://github.com/gulpjs/vinyl">vinyl file</a> object
            whose contents are to be transformed. Useful for getting metadata
            about the file, such as its name or path.
          </li>
        </ul>
        The return value will replace the file's contents and must be either
        a String or a Buffer.
      </td>
    </tr>
    <tr>
      <td>
        options
        <sup>(optional)</sup>
      </td>
      <td align="center">
        <code>Object</code>
      </td>
      <td>
        Options to modify the behavior of the plugin.
        <ul>
          <li>
            <strong>encoding</strong> (<code>String</code>) Casts contents to
            a string with the specified
            <a href="https://nodejs.org/docs/latest/api/buffer.html#buffer_buffers_and_character_encodings">encoding</a>
            before it is passed to transformFn. If no encoding is specified,
            contents will be passed as a Buffer.
          </li>
          <li>
            <strong>thisArg</strong> (<code>&#42;</code>) Determines the value of
            <code>this</code> within transformFn. Defaults to
            <code>undefined</code>.
          </li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

## License

Copyright &copy; 2016 Akim McMath. Licensed under the [MIT License][License link].

[Gulp link]: http://gulpjs.com/
[NPM link]: https://npmjs.org/package/gulp-transform
[Version badge]: https://img.shields.io/npm/v/gulp-transform.svg?style=flat-square
[License badge]: https://img.shields.io/npm/l/gulp-transform.svg?style=flat-square
[License link]: LICENSE.txt
[Build badge]: https://img.shields.io/travis/akim-mcmath/gulp-transform/master.svg?style=flat-square
[Build link]: https://travis-ci.org/akim-mcmath/gulp-transform
[Coverage badge]: https://img.shields.io/coveralls/akim-mcmath/gulp-transform/master.svg?style=flat-square&service=github
[Coverage link]: https://coveralls.io/github/akim-mcmath/gulp-transform?branch=master
[Dependencies badge]: https://img.shields.io/gemnasium/akim-mcmath/gulp-transform.svg?style=flat-square
[Dependencies link]: https://gemnasium.com/akim-mcmath/gulp-transform
