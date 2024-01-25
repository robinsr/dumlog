export function isString(msg) {
    return typeof msg === 'string';
}
export function isFunction(functionToCheck) {
    return typeof functionToCheck === 'function';
}
export function isLogCallback(cb) {
    return isFunction(cb);
}
