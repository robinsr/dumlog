import type { LogCallback } from './types.js';

export function isString(msg: any): msg is string {
  return typeof msg === 'string';
}

export function isFunction(functionToCheck: any): functionToCheck is Function {
  return typeof functionToCheck === 'function';
}

export function isLogCallback(cb: any): cb is LogCallback {
  return isFunction(cb);
}
