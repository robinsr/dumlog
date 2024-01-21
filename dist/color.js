export const ANSI = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[38;5;82m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1B[38;5;205m',
    purple: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    grey: '\x1b[90m',
    gray: '\x1b[90m',
    bold: '\x1b[1m',
    italic: '\x1b[3m',
    underline: '\x1b[4m',
    blink: '\x1b[5m',
    inverse: '\x1b[7m',
    hidden: '\x1b[8m',
    strike: '\x1b[9m',
};
const colorFns = (l) => {
    return l === 'color' ?
        Object.keys(ANSI).reduce((acc, key) => ({
            ...acc, [key]: (msg) => `${ANSI[key]}${msg}${ANSI.reset}`
        }), {}) :
        Object.keys(ANSI).reduce((acc, key) => ({
            ...acc, [key]: (msg) => msg
        }), {});
};
export const combine = (...fns) => (msg) => fns.reduce((acc, fn) => fn(acc), msg);
export default colorFns;
