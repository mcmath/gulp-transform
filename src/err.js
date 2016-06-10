import {PluginError} from 'gulp-util';

export function err(msg) {
  throw new PluginError('gulp-transform', msg);
}
