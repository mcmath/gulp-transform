# gulp-transform

[![version][versionBadge]][npm]
[![build][buildBadge]][build]
[![coverage][coverageBadge]][coverage]
[![dependencies][dependenciesBadge]][dependencies]

A [Gulp][gulp] plugin for applying custom transformations to the contents of
files.

## Install

Install via [npm][npm]:

```sh
npm install --save-dev gulp gulp-transform
```

## Usage

### Synchronous usage

This example adds a timestamp to the beginning of each source file. The comment
format is inferred from the file extension. Files with unrecognized extensions
are not modified.

#### gulpfile.js

```js
const gulp = require('gulp');
const transform = require('gulp-transform');
const path = require('path');

const TIMESTAMP = Date();

gulp.task('timestamp', () => {
  return gulp.src('src/**/*')
    .pipe(transform('utf8', timestamp))
    .pipe(gulp.dest('out'));
});

function timestamp(content, file) {
  switch (path.extname(file.path)) {
    case '.js':
    case '.ts':
      return `// ${TIMESTAMP}\n\n${content}`;
    case '.coffee':
      return `# ${TIMESTAMP}\n\n${content}`;
    default:
      return content;
  }
}
```

#### src/hello.js

```js
console.log('Hello, world.');
```

#### out/hello.js

```js
// Thu Jul 27 2017 15:56:14 GMT-0700 (PDT)

console.log('Hello, world.');
```

### Asynchronous usage

This example uses [xml2js][xml2js] to convert XML to JSON. The callback
returns a [Promise][promise] since the operation is asynchronous.

#### gulpfile.js

```js
const gulp = require('gulp');
const transform = require('gulp-transform');
const rename = require('gulp-rename');
const xml2js = require('xml2js');

gulp.task('xml-to-json', () => {
  return gulp.src('src/**/*.xml')
    .pipe(transform('utf8', xmlToJson))
    .pipe(rename({ extname: '.json' }))
    .pipe(gulp.dest('out'));
});

function xmlToJson(content) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(content, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.stringify(data, null, 2));
      }
    });
  });
}
```

#### src/cities.xml

```xml
<cities>
  <city>Amsterdam</city>
  <city>Rotterdam</city>
  <city>The Hague</city>
</cities>
```

#### out/cities.json

```json
{
  "cities": {
    "city": [
      "Amsterdam",
      "Rotterdam",
      "The Hague"
    ]
  }
}
```

## API

### transform([options], callback)

Creates a stream that transforms the contents of [File][vinylFile] objects.
Files in both streaming and buffer mode are accepted.

To transform contents as a string, a [character encoding][encoding] must be
specified; otherwise, contents will be passed to the callback as a
[Buffer][nodeBuffer].

The contents of each File are replaced with the return value of the callback.
Or, to perform an asynchronous transformation, a [Promise][promise] may be
returned.

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="left">
        <strong>[options]</strong>
      </td>
      <td align="center">
        <p><code>object</code></p>
        <p><code>string</code></p>
        <p><code>null</code></p>
      </td>
      <td align="left">
        <p>
          An optional options object or a value indicating an encoding. If
          passed as an object, the following properties are are accepted as
          options:
        </p>
        <ul>
          <li>
            <strong>encoding</strong> - <code>string</code> | <code>null</code> - An
            <a href="https://nodejs.org/dist/latest/docs/api/buffer.html#buffer_buffers_and_character_encodings">
            encoding</a> supported by Node.js or <code>null</code> to indicate
            no encoding. Defaults to <code>null</code>.
          </li>
          <li>
            <strong>thisArg</strong> - <code>any</code> - The value of
            <code>this</code> within <em>callback</em>. Defaults to
            <code>undefined</code>.
          </li>
        </ul>
        <p>
          If passed as a string or <code>null</code>, it is interpreted as the
          <em>encoding</em> option.
        </p>
        <p>
          If no encoding is given, <em>callback</em> is called with a
          <code>Buffer</code> object containing the contents of the file.
          Otherwise, it is called with a string created with
          <a href="https://nodejs.org/dist/latest/docs/api/buffer.html#buffer_buf_tostring_encoding_start_end">
          <code><em>buffer</em>.toString(<em>encoding</em>)</code></a>.
        </p>
      </td>
    </tr>
    <tr>
      <td align="left">
        <strong>callback</strong>
      </td>
      <td align="center">
        <code>function</code>
      </td>
      <td align="left">
        <p>
          A function that transforms the contents of each file. It is invoked
          with two arguments:
        </p>
        <ul>
          <li>
            <strong>contents</strong> - <code>Buffer</code> | <code>string</code> - The
            contents of the file. If no encoding is given, <em>contents</em>
            will be a <code>Buffer</code>; otherwise, it will be a string.
          </li>
          <li>
            <strong>file</strong> - <code>File</code> - The
            <a href="https://github.com/gulpjs/vinyl#instance-methods">
            <code>File</code></a> object whose contents are being transformed.
            Use this to access metadata about the file, e.g., its filename.
          </li>
        </ul>
        <p>
          The contents of the file are replaced with the return value of the
          callback. For asynchronous transformations, a
          <a href="https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise">
          <code>Promise</code></a> may be returned. The return or completion
          value must have the same type as <em>contents</em>.
        </p>
        <p>
          The value of <code>this</code> within the callback may be set with the
          <em>thisArg</em> option; otherwise, <code>this</code> will be
          <code>undefined</code>.
        </p>
      </td>
    </tr>
  </tbody>
</table>

## TypeScript

[TypeScript][typescript] declarations are included in the package.

```sh
npm i -D typescript ts-node gulp @types/gulp gulp-transform
```

#### gulpfile.ts

```ts
import gulp = require("gulp");
import transform = require("gulp-transform");

gulp.task("build", () => {
  gulp.src("src/**/*")
    .pipe(transform("utf8", () => { /* transform contents */ }))
    .pipe(gulp.dest("out"));
});
```

## License

Copyright &copy; 2016&ndash;2017 Akim McMath. Licensed under the [MIT License][license].

[gulp]: http://gulpjs.com/
[npm]: https://npmjs.org/package/gulp-transform
[versionBadge]: https://img.shields.io/npm/v/gulp-transform.svg?style=flat-square
[license]: LICENSE
[buildBadge]: https://img.shields.io/travis/mcmath/gulp-transform/master.svg?style=flat-square
[build]: https://travis-ci.org/mcmath/gulp-transform
[coverageBadge]: https://img.shields.io/coveralls/mcmath/gulp-transform/master.svg?style=flat-square&service=github
[coverage]: https://coveralls.io/github/mcmath/gulp-transform?branch=master
[dependenciesBadge]: https://img.shields.io/gemnasium/mcmath/gulp-transform.svg?style=flat-square
[dependencies]: https://gemnasium.com/mcmath/gulp-transform
[xml2js]: https://github.com/Leonidas-from-XIV/node-xml2js
[vinylFile]: https://github.com/gulpjs/vinyl#instance-methods
[encoding]: https://nodejs.org/dist/latest/docs/api/buffer.html#buffer_buffers_and_character_encodings
[nodeBuffer]: https://nodejs.org/dist/latest-v8.x/docs/api/buffer.html
[promise]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
[typescript]: https://www.typescriptlang.org/
