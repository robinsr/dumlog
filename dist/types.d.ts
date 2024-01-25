/// <reference types="node" resolution-mode="require"/>
import type { ColorFnMap, ColorName, Combiner } from './color.ts';
export declare const levels: readonly ["off", "metric", "fatal", "error", "warn", "info", "debug", "trace"];
export type Levels = typeof levels[number];
export type PlainLevels = Exclude<Levels, 'metric'>;
export type LogFn = (init: LogCallback | any, ...msg: any[]) => void;
type LevelMethods = {
    [K in PlainLevels]: LogFn;
};
export declare const levelColors: Record<Levels, ColorName>;
export type Unit = 'ms' | 's' | 'n' | 'dec' | 'cent' | 'mil';
export type LogCallback = () => string;
export type LogConfig = {
    pattern: string;
    level: Levels;
};
declare const layouts: string[];
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
export type LogWriter = Pick<Console, 'error' | 'warn' | 'info' | 'debug' | 'trace'>;
export {};
