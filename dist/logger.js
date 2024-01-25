import { isString, isLogCallback } from './check.js';
import { levels, levelColors } from './types.js';
import { combine } from './color.js';
// TODO - do you want to take on this dependency? Will work in Deno/Bun/Browser?
import { inspect } from 'util';
const inspectOpts = {
    colors: true,
    depth: 6,
};
const time = () => {
    return new Date().toTimeString().split(' ')[0];
};
const debugMapper = (msg) => {
    return msg.map((m) => isString(m) ? m : inspect(m, inspectOpts));
};
const logCallbackMapper = (msg) => {
    if (msg.length === 1 && isLogCallback(msg[0])) {
        return [msg[0]()];
    }
    else {
        return msg;
    }
};
export default class Logger {
    constructor(writer, logstream, level, color) {
        this.mark = (level, ansi) => {
            const { color, logstream } = this;
            const levelMarker = color[ansi || levelColors[level]](`[${level}]`);
            const timestamp = color.grey(time());
            return `${timestamp} ${levelMarker} (${logstream}) -`;
        };
        this.check = (level) => {
            return levels.indexOf(this.level) >= levels.indexOf(level);
        };
        this.off = (...msg) => { };
        this.fatal = (...msg) => {
            const { check, writer, mark } = this;
            check('fatal') && writer.error(mark('fatal'), ...logCallbackMapper(msg));
        };
        this.error = (...msg) => {
            const { check, writer, mark } = this;
            check('error') && writer.error(mark('error'), ...logCallbackMapper(msg));
        };
        this.warn = (...msg) => {
            const { check, writer, mark } = this;
            check('warn') && writer.warn(mark('warn'), ...logCallbackMapper(msg));
        };
        this.info = (...msg) => {
            const { check, writer, mark } = this;
            check('info') && writer.info(mark('info'), ...logCallbackMapper(logCallbackMapper(msg)));
        };
        this.debug = (...msg) => {
            const { check, writer, mark } = this;
            check('debug') && writer.debug(mark('debug'), ...debugMapper(msg));
        };
        this.trace = (...msg) => {
            const { check, writer, mark } = this;
            check('trace') && writer.trace(mark('trace'), ...logCallbackMapper(msg));
        };
        this.metric = (metric, value, unit) => {
            const { check, writer, mark } = this;
            const metricName = isString(metric) ? metric : (Object.entries(metric).map(([k, v]) => `${k}=${v}`).join(','));
            const metricLine = [metricName, value, unit].filter(Boolean).join('|');
            writer.info(mark('metric'), metricLine);
        };
        /**
         * Create one-off custom loggers by passing in a customizer customizer is an
         * array of [ level, ansi, console function ]
         *
         * e.g. ['debug', 'grey', 'debug']
         */
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
        this.writer = writer;
        this.logstream = logstream;
        this.level = level;
        this.color = color;
    }
    ifEnabled(level, cb) {
        this.check(level) && this[level](cb());
    }
}
