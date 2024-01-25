import type { ColorFnMap, ColorName, Combiner } from './color.ts';
export declare const levels: readonly ["off", "metric", "fatal", "error", "warn", "info", "debug", "trace"];
export type LEVELS = typeof levels[number];
export type LogFn = (...msg: any[]) => void;
type LevelMethods = {
    [K in LEVELS]: LogFn;
};
export declare const levelColors: Record<LEVELS, ColorName>;
export type Unit = 'ms' | 's' | 'n' | 'dec' | 'cent' | 'mil';
export type LogCallback = (log: LogFn) => void;
export type LogConfig = {
    pattern: string;
    level: LEVELS;
};
declare const layouts: string[];
export type LayoutType = typeof layouts[number];
interface LoggerMethods {
    ifEnabled: (level: LEVELS, cb: LogCallback) => void;
    color: ColorFnMap;
    combine: Combiner;
    metric: (metric: string | object, value: number, unit?: Unit) => void;
}
export type ILogger = LoggerMethods & LevelMethods;
export {};
