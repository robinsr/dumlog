declare const ANSI: Record<string, string>;
type ColorName = keyof typeof ANSI;
type ColorFn = (msg: string) => string;
type ColorFnMap = Record<ColorName, ColorFn>;
type Combiner = (...fns: ColorFn[]) => (msg: any) => string;

declare const levels: readonly ["off", "metric", "fatal", "error", "warn", "info", "debug", "trace"];
type Levels = typeof levels[number];
type PlainLevels = Exclude<Levels, 'metric'>;
type LogFn = (init: LogCallback | any, ...msg: any[]) => void;
type LevelMethods = {
    [K in PlainLevels]: LogFn;
};
type Unit = 'ms' | 's' | 'n' | 'dec' | 'cent' | 'mil';
type LogCallback = () => string;
type LogConfig = {
    pattern: string;
    level: Levels;
};
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
type ILogger = LevelMethods & MetricLogger & ColorLogger & ConditionalLogger;
type LogWriter = Pick<Console, 'error' | 'warn' | 'info' | 'debug' | 'trace'>;

declare const options: {
    layout: string;
    fallbackLevel: PlainLevels;
    debug: boolean;
    out: LogWriter;
};
type Options = Partial<typeof options>;
type CreateLogger = (logStream: string) => ILogger;
declare function configure(configPath: string, opts?: Options): Promise<CreateLogger>;

declare function configureSync(configs: LogConfig[], opts?: Options): CreateLogger;

export { configure, configureSync, configure as default };
