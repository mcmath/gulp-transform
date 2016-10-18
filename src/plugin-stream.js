import {Transform} from 'stream';
import {FileStream} from './file-stream';
import {transform} from './transform';

export class PluginStream extends Transform {

  constructor(transformFn, options={}) {
    super({objectMode: true});

    this.fn = transformFn;
    this.opts = options;
  }

  _transform(file, encoding, next) {
    let {fn, opts} = this;

    if (file.isBuffer()) {
      transform(fn, file.contents, file, opts)
        .then(function(contents) {
          file.contents = contents;
          next(null, file)
        })
        .catch(function(error) {
          next(error);
        })
    } else if (file.isStream()) {
      file.contents = file.contents.pipe(new FileStream(fn, file, opts));
      next(null, file);
    }
  }
}
