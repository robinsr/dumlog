/// <reference types="node" resolution-mode="require"/>
import type { Levels, LogCallback, LogWriter, ILogger, Unit, PlainLevels } from './types.js';
import type { ColorName, ColorFnMap, ColorFn } from './color.js';
type consoleFns = Console;
type Customizer = [
    Levels,
    ColorName,
    keyof consoleFns
];
export default class Logger implements ILogger {
    private writer;
    logstream: string;
    level: Levels;
    color: ColorFnMap;
    constructor(writer: LogWriter, logstream: string, level: Levels, color: ColorFnMap);
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
    ifEnabled(level: PlainLevels, cb: LogCallback): void;
    /**
     * Create one-off custom loggers by passing in a customizer customizer is an
     * array of [ level, ansi, console function ]
     *
     * e.g. ['debug', 'grey', 'debug']
     */
    custom: (custom: Customizer) => (...msg: any[]) => void;
    combine: (...fns: ColorFn[]) => (msg: any) => string;
}
export {};
