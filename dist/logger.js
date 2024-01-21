import { levels } from './types.ts';
import { combine } from './color.ts';
// TODO - do you want to take on this dependency? Will work in Deno/Bun/Browser?
import { inspect } from 'util';
const inspectOpts = {
    colors: true,
    depth: 6,
};
const time = () => {
    return new Date().toTimeString().split(' ')[0];
};
const isString = (msg) => typeof msg === 'string';
const debugMapper = (msg) => msg.map((m) => isString(m) ? m : inspect(m, inspectOpts));
export default class Logger {
    constructor(logstream, level, color) {
        this.mark = (level, ansi) => {
            const { color, logstream } = this;
            return color.grey(time()) + ' ' + color[ansi](`[${level}] ${logstream}`) + ' -';
        };
        this.check = (level) => {
            return levels.indexOf(this.level) >= levels.indexOf(level);
        };
        this.fatal = (...msg) => {
            this.check('fatal') && console.error(this.mark('FATAL', 'red'), ...msg);
        };
        this.error = (...msg) => {
            this.check('error') && console.error(this.mark('ERROR', 'red'), ...msg);
        };
        this.warn = (...msg) => {
            this.check('warn') && console.warn(this.mark('WARN', 'yellow'), ...msg);
        };
        this.info = (...msg) => {
            this.check('info') && console.info(this.mark('INFO', 'blue'), ...msg);
        };
        this.debug = (...msg) => {
            this.check('debug') && console.debug(this.mark('DEBUG', 'cyan'), ...debugMapper(msg));
        };
        this.trace = (...msg) => {
            this.check('trace') && console.trace(this.mark('TRACE', 'white'), ...msg);
        };
        this.isEnable = (level) => this.check(level) ? Promise.resolve() : Promise.reject();
        // Create one-off custom loggers by passing in a customizer
        // customizer is an array of [ level, ansi, console function ]
        // e.g. ['debug', 'grey', 'debug']
        this.custom = (custom) => {
            const [level, ansi, fn] = custom;
            return (...msg) => {
                if (this.check(level)) {
                    const mark = this.mark(level, ansi);
                    // @ts-ignore
                    console[fn].call(console, mark, ...msg);
                }
            };
        };
        this.combine = (...fns) => combine(...fns);
        this.logstream = logstream;
        this.level = level || 'warn';
        this.color = color;
    }
}
