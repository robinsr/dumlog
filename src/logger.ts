import type { Levels, LogCallback, LogWriter, ILogger, Unit, PlainLevels } from './types.ts';
import { levels, levelColors } from './types.ts';
import { combine, type ColorName, type ColorFnMap, type ColorFn } from './color.ts';

// TODO - do you want to take on this dependency? Will work in Deno/Bun/Browser?
import { inspect } from 'util';

type consoleFns = Console;

type Customizer = [
  // level of the customizer
  Levels,
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

const debugMapper = (msg: any[]) => {
  return msg.map((m) => isString(m) ? m : inspect(m, inspectOpts));
}

const logCallbackMapper = (msg: any[]) => {
  if (msg.length === 1 && isLogCallback(msg[0])) {
    return [msg[0]()];
  } else {
    return msg;
  }
}

export default class Logger implements ILogger {
  private writer: LogWriter;
  logstream: string;
  level: Levels;
  color: ColorFnMap;

  constructor(writer: LogWriter, logstream: string, level: Levels, color: ColorFnMap) {
    this.writer = writer;
    this.logstream = logstream;
    this.level = level;
    this.color = color;
  }

  private mark = (level: Levels, ansi?: ColorName) => {
    const { color, logstream } = this;
    const levelMarker = color[ansi || levelColors[level]](`[${level}]`);
    const timestamp = color.grey(time());
    return `${timestamp} ${levelMarker} (${logstream}) -`;
  };

  private check = (level: Levels) => {
    return levels.indexOf(this.level) >= levels.indexOf(level);
  };

  off = (...msg: any[]) => {};

  fatal = (...msg: any[]) => {
    const { check, writer, mark } = this;
    check('fatal') && writer.error(mark('fatal'), ...logCallbackMapper(msg));
  };

  error = (...msg: any[]) => {
    const { check, writer, mark } = this;
    check('error') && writer.error(mark('error'), ...logCallbackMapper(msg));
  };

  warn = (...msg: any[]) => {
    const { check, writer, mark } = this;
    check('warn') && writer.warn(mark('warn'), ...logCallbackMapper(msg));
  };

  info = (...msg: any[]) => {
    const { check, writer, mark } = this;
    check('info') && writer.info(mark('info'), ...logCallbackMapper(logCallbackMapper(msg)));
  };

  debug = (...msg: any[]) => {
    const { check, writer, mark } = this;
    check('debug') && writer.debug(mark('debug'), ...debugMapper(msg));
  };

  trace = (...msg: any[]) => {
    const { check, writer, mark } = this;
    check('trace') && writer.trace(mark('trace'), ...logCallbackMapper(msg));
  };

  metric = (metric: string | object, value: number, unit?: Unit) => {
    const { check, writer, mark } = this;
    const metricName = str(metric) ? metric : (
      Object.entries(metric).map(([k, v]) => `${k}=${v}`).join(',')
    );
    const metricLine = [metricName, value, unit].filter(Boolean).join('|');

    writer.info(mark('metric'), metricLine);
  }

  ifEnabled(level: PlainLevels, cb: LogCallback){
    this.check(level) && this[level](cb());
  }

  /**
   * Create one-off custom loggers by passing in a customizer customizer is an
   * array of [ level, ansi, console function ] 
   * 
   * e.g. ['debug', 'grey', 'debug']
   */
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

const str = (msg: any) => typeof msg === 'string';

function isFunction(functionToCheck: any): functionToCheck is Function {
  return typeof functionToCheck === 'function';
}

function isLogCallback(cb: any): cb is LogCallback {
  return isFunction(cb);
}
