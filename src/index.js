import {isNil, isFunction, isObject} from 'lodash';
import {PluginStream} from './plugin-stream';
import {err} from './err';

export default function gulpTransform(transformFn, options) {
  if (isNil(transformFn)) {
    err('transformFn must be defined');

  } else if (!isFunction(transformFn)) {
    err('transformFn must be a function');

  } else if (!isNil(options) && !isObject(options)) {
    err('options must be an object');

  } else {
    return new PluginStream(transformFn, options);
  }
}
