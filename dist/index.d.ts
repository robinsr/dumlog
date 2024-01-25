import type { ILogger, LogConfig, LogWriter, PlainLevels } from './types.ts';
declare const options: {
    layout: string;
    defaultLevel: PlainLevels;
    fallbackLevel: PlainLevels;
    debug: boolean;
    out: LogWriter;
};
type Options = Partial<typeof options>;
type CreateLogger = (logStream: string) => ILogger;
export default function configure(configs: string | LogConfig[], opts?: Options): Promise<CreateLogger>;
export {};
