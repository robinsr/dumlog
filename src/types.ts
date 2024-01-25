import type { ColorFnMap, ColorName, Combiner } from './color.ts';

export const levels = ['off', 'metric', 'fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;

export type Levels = typeof levels[number];

export type PlainLevels = Exclude<Levels, 'metric'>;

export type LogFn = (init: LogCallback | any, ...msg: any[]) => void;

type LevelMethods = {
  [K in PlainLevels]: LogFn;
}

export const levelColors: Record<Levels, ColorName> = {
  off: 'grey',
  metric: 'green',
  fatal: 'bgRed',
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  debug: 'cyan',
  trace: 'magenta',
};

export type Unit = 'ms' | 's' | 'n' | 'dec' | 'cent' | 'mil';

export type LogCallback = () => string;

export type LogConfig = {
  pattern: string;
  level: Levels;
};

const layouts = [ 'color', 'basic' ];

export type LayoutType = typeof layouts[number];

interface MetricLogger {
  metric: (metric: string | object, value: number, unit?: Unit) => void;
}

interface ColorLogger {
  color: ColorFnMap;
  combine: Combiner;
}

interface ConditionalLogger {
  ifEnabled: (level: PlainLevels, cb: LogCallback) => void;
}

export type ILogger = LevelMethods & MetricLogger & ColorLogger & ConditionalLogger;

export type LogWriter = Pick<Console, 'error' | 'warn' | 'info' | 'debug' | 'trace'>
