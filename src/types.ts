import type { ColorFnMap, Combiner } from './color.ts';

export const levels = ['off', 'fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;

export type LEVELS = typeof levels[number];

export type LogConfig = {
  pattern: string;
  level: LEVELS;
};

const layouts = [ 'color', 'basic' ];

export type LayoutType = typeof layouts[number];

export interface ILogger {
  fatal: (...msg: any[]) => void;
  error: (...msg: any[]) => void;
  warn: (...msg: any[]) => void;
  info: (...msg: any[]) => void;
  debug: (...msg: any[]) => void;
  trace: (...msg: any[]) => void;
  isEnable: (level: LEVELS) => Promise<void>;
  color: ColorFnMap;
  combine: Combiner;
}