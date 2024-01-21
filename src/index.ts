import YAML from 'yaml';
import { readFileSync } from 'node:fs';
import type { ILogger, LayoutType, LEVELS, LogConfig } from './types.ts';
import Logger from './logger.ts';
import colorFns, { combine } from './color.ts';

const debugLog = (enabled: boolean) => {
  const dumlog = new Logger('@dumlog', enabled ? 'debug' : 'off', colorFns('color'));
  const bm = combine(dumlog.color.bold, dumlog.color.magenta);
  const bc = combine(dumlog.color.bold, dumlog.color.cyan);
  const dLog = dumlog.custom([ 'debug', 'grey', 'debug' ]);
  return { bm, bc, dLog };
}

const options = {
  layout: 'color' as LayoutType,
  defaultLevel: 'warn' as LEVELS,
  fallbackLevel: 'off' as LEVELS,
  debug: false,
}

type Options = Required<typeof options>;
type Overide = Partial<Options>;



export default async function configure(configs: string | LogConfig[], opts: Overide = options) {
  const { layout, defaultLevel, fallbackLevel, debug } = { ...options, ...opts }
  const { bm, bc, dLog } = debugLog(debug);

  const parseConfFile = async (confPath: string) => {
    const configs = await YAML.parse(readFileSync(confPath, 'utf8'));
    dLog('log config file:', bm(confPath));
    return configs['streams'] as LogConfig[];
  }

  if (typeof configs === 'string') {
    configs = await parseConfFile(configs);
  }

  const fallback = {
    pattern: '.*', level: fallbackLevel
  }

  const logConfig = [ ...configs, fallback ].map(({ pattern, level }) => ({
    pattern: new RegExp(pattern),
    level,
  }));

  dLog(bm('log config:'), logConfig);

  const colors = colorFns(layout);
  const loggers: Record<string, ILogger> = {};

  return function createLogger(logStream: string): ILogger {
    if (!loggers[logStream]) {
      const match = logConfig.find((l) => l.pattern.test(logStream))!;
      const level = match ? match.level : defaultLevel;
      loggers[logStream] = new Logger(logStream, level, colors);

      dLog(`logStream ${bm(logStream)} matched with config ${bc(match.pattern)}`);
    }

    return loggers[logStream];
  };
}


