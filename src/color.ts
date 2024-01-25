import type { LayoutType } from './types.ts';

export const ANSI: Record<string, string> = {
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
  bgRed: '\x1b[41m\x1b[30m',
};

export type ColorName = keyof typeof ANSI;
export type ColorFn = (msg: string) => string;
export type ColorFnMap = Record<ColorName, ColorFn>;
export type Combiner = (...fns: ColorFn[]) => (msg: any) => string;

const colorFns = (l: LayoutType): ColorFnMap => {
  return l === 'color' ?
    Object.keys(ANSI).reduce((acc, key) => ({
      ...acc, [key as ColorName]: (msg: any) => `${ANSI[key]}${msg}${ANSI.reset}`
    }), {} as ColorFnMap) :
    Object.keys(ANSI).reduce((acc, key) => ({
      ...acc, [key as ColorName]: (msg: any) => msg
    }), {} as ColorFnMap);
}

export const combine: Combiner = (...fns) => (msg: any) => fns.reduce((acc, fn) => fn(acc), msg);

export default colorFns;
