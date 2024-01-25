import type { ILogger, LogConfig } from './types.ts';
declare const options: {
    layout: string;
    defaultLevel: "off" | "metric" | "fatal" | "error" | "warn" | "info" | "debug" | "trace";
    fallbackLevel: "off" | "metric" | "fatal" | "error" | "warn" | "info" | "debug" | "trace";
    debug: boolean;
};
type OptionOverrides = Partial<typeof options>;
type CreateLogger = (logStream: string) => ILogger;
export default function configure(configs: string | LogConfig[], opts?: OptionOverrides): Promise<CreateLogger>;
export {};
