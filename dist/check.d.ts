import type { LogCallback } from './types.js';
export declare function isString(msg: any): msg is string;
export declare function isFunction(functionToCheck: any): functionToCheck is Function;
export declare function isLogCallback(cb: any): cb is LogCallback;
