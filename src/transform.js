import {Promise} from 'es6-promise';
import {isBuffer} from 'lodash';
import {err} from './err';

export function transform(fn, contents, file, {encoding, thisArg}) {
  let decoded = encoding ? contents.toString(encoding) : contents;
  let transformed = fn.call(thisArg, decoded, file);

  return Promise.resolve(transformed).then(toBuffer);
}

function toBuffer(contents) {
  if (isBuffer(contents)) {
    return contents;
  } else if (contents != null) {
    return new Buffer(String(contents));
  } else {
    err('transformFn may not return or resolve to null or undefined');
  }
}
