import { levels, type LEVELS, type ILogger } from './types.ts';
import { combine, type ColorName, type ColorFnMap, type ColorFn } from './color.ts';

// TODO - do you want to take on this dependency? Will work in Deno/Bun/Browser?
import { inspect } from 'util';

type consoleFns = Console;

type Customizer = [
  // level of the customizer
  LEVELS,
  // ansi color of the customizer
  ColorName,
  // console function to use
  keyof consoleFns,
];

const inspectOpts = {
  colors: true,
  depth: 6,
};

const time = () => {
  return new Date().toTimeString().split(' ')[0];
};

const isString = (msg: any) => typeof msg === 'string';

const debugMapper = (msg: any[]) => msg.map((m) => isString(m) ? m : inspect(m, inspectOpts));

export default class Logger implements ILogger {
  logstream: string;
  level: LEVELS;
  color: ColorFnMap;

  constructor(logstream: string, level: LEVELS, color: ColorFnMap) {
    this.logstream = logstream;
    this.level = level || 'warn';
    this.color = color
  }

  private mark = (level: string, ansi: ColorName) => {
    const { color, logstream } = this;
    return color.grey(time()) + ' ' + color[ansi](`[${level}] ${logstream}`) + ' -';
  };

  private check = (level: LEVELS) => {
    return levels.indexOf(this.level) >= levels.indexOf(level);
  };

  fatal = (...msg: any[]) => {
    this.check('fatal') && console.error(this.mark('FATAL', 'red'), ...msg);
  };
  error = (...msg: any[]) => {
    this.check('error') && console.error(this.mark('ERROR', 'red'), ...msg);
  };
  warn = (...msg: any[]) => {
    this.check('warn') && console.warn(this.mark('WARN', 'yellow'), ...msg);
  };
  info = (...msg: any[]) => {
    this.check('info') && console.info(this.mark('INFO', 'blue'), ...msg);
  };
  debug = (...msg: any[]) => {
    this.check('debug') && console.debug(this.mark('DEBUG', 'cyan'), ...debugMapper(msg));
  };
  trace = (...msg: any[]) => {
    this.check('trace') && console.trace(this.mark('TRACE', 'white'), ...msg);
  };

  isEnable = (level: LEVELS) => this.check(level) ? Promise.resolve() : Promise.reject();

  // Create one-off custom loggers by passing in a customizer
  // customizer is an array of [ level, ansi, console function ]
  // e.g. ['debug', 'grey', 'debug']
  custom = (custom: Customizer) => {
    const [level, ansi, fn] = custom;

    return (...msg: any[]) => {
      if (this.check(level)) {
        const mark = this.mark(level, ansi);
        // @ts-ignore
        console[fn].call(console, mark, ...msg);
      }
    };
  };

  combine = (...fns: ColorFn[]) => combine(...fns);
}
