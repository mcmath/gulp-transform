import {isBuffer, isString} from 'lodash';
import {err} from './err';

export function transform(fn, contents, file, opts) {
  let encoded = opts.encoding ? contents.toString(opts.encoding) : contents;
  return Promise.resolve(fn.call(opts.thisArg, encoded, file))
    .then(function(transformed) {
      return isBuffer(transformed) ? transformed :
        isString(transformed) ? new Buffer(transformed) :
        err('transformFn must return a string or a Buffer');
    })
}
