/// <reference types="node" resolution-mode="require"/>
import type { LEVELS, LogCallback, ILogger, Unit } from './types.ts';
import { type ColorName, type ColorFnMap, type ColorFn } from './color.ts';
type consoleFns = Console;
type Customizer = [
    LEVELS,
    ColorName,
    keyof consoleFns
];
export default class Logger implements ILogger {
    logstream: string;
    level: LEVELS;
    color: ColorFnMap;
    constructor(logstream: string, level: LEVELS, color: ColorFnMap);
    private mark;
    private check;
    off: (...msg: any[]) => void;
    fatal: (...msg: any[]) => void;
    error: (...msg: any[]) => void;
    warn: (...msg: any[]) => void;
    info: (...msg: any[]) => void;
    debug: (...msg: any[]) => void;
    trace: (...msg: any[]) => void;
    metric: (metric: string | object, value: number, unit?: Unit) => void;
    ifEnabled: (level: LEVELS, cb: LogCallback) => false | void;
    custom: (custom: Customizer) => (...msg: any[]) => void;
    combine: (...fns: ColorFn[]) => (msg: any) => string;
}
export {};
