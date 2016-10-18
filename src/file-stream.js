import {Transform} from 'stream';
import {transform} from './transform';

export class FileStream extends Transform {

  constructor(transformFn, file, options) {
    super();

    this.fn = transformFn;
    this.file = file;
    this.opts = options;
    this.data = [];
  }

  _transform(chunk, encoding, next) {
    this.data.push(chunk);
    next();
  }

  _flush(done) {
    let contents = Buffer.concat(this.data);
    transform(this.fn, contents, this.file, this.opts)
      .then(function(contents) {
        this.push(contents);
        done();
      })
      .catch(function(error) {
        done(error)
      })
  }

}
