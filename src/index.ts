import YAML from 'yaml';
import { readFileSync, existsSync, watchFile } from 'node:fs';
import type { ILogger, LayoutType, Levels, LogConfig, LogWriter } from './types.ts';
import { levelColors } from './types.ts';
import Logger from './logger.ts';
import colorFns, { combine } from './color.ts';

const pref = '[@dumlog]';

const options = {
  layout: 'color' as LayoutType,
  defaultLevel: 'warn' as Levels,
  fallbackLevel: 'off' as Levels,
  debug: false,
  out: console as LogWriter,
}

type Options = Required<typeof options>;
type OptionOverrides = Partial<typeof options>;
type CreateLogger = (logStream: string) => ILogger;

export default async function configure(
  configs: string | LogConfig[],
  opts: OptionOverrides = options
): Promise<CreateLogger> {
  const { layout, defaultLevel, fallbackLevel, debug, out } = { ...options, ...opts }
  
  const { dLog, ...col } = debugLog(debug, out);

  const parseConfFile = async (confPath: string) => {
    const configs = await YAML.parse(readFileSync(confPath, 'utf8'));
    dLog('log config file:', col.bm(confPath));
    return configs['streams'] as LogConfig[];
  }

  if (typeof configs === 'string') {
    if (!existsSync(configs)) {
      throw new Error(`${pref} Log config file not found: ${configs}`);
    }
    configs = await parseConfFile(configs);
  }

  const fallback = {
    pattern: '.*', level: fallbackLevel
  }

  const logConfig = [ ...configs, fallback ].map(({ pattern, level }) => ({
    pattern: new RegExp(pattern),
    level,
  }));

  dLog(col.bm('log config:'), logConfig);

  const colors = colorFns(layout);
  const loggers: Record<string, ILogger> = {};

  return function createLogger(logStream: string): ILogger {
    if (!loggers[logStream]) {
      const match = logConfig.find((l) => l.pattern.test(logStream))!;
      const level = match ? match.level : defaultLevel;
      loggers[logStream] = new Logger(out, logStream, level, colors);

      dLog(`Match => LogStream ${col.bm(col.qt(logStream))} to pattern ${col.bc(match.pattern)} (${col.ifc(level, level)})`);
    }

    return loggers[logStream];
  };
}

/**
 * Work in progress
 */
async function configureAndWatch(
  configs: string | LogConfig[],
  opts: OptionOverrides = options
): Promise<CreateLogger> {
  const createLogger = await configure(configs, opts);

  // if (typeof configs === 'string') {
  //   watchFile(configs, async () => {
  //     const newConfigs = await parseConfFile(configs);
  //     createLogger(newConfigs);
  //   });
  // }

  return createLogger;
}


const debugLog = (enabled: boolean, out: LogWriter) => {
  const dumlog = new Logger(
    out, '@dumlog', enabled ? 'debug' : 'off', colorFns('color')
  );

  const bm = combine(dumlog.color.bold, dumlog.color.magenta);
  const bc = combine(dumlog.color.bold, dumlog.color.cyan);
  
  const qt = (msg: string) => `"${msg}"`;
  
  const ifc = (lev: Levels, msg: string) => {
    levelColors[lev] ? dumlog.color[levelColors[lev]](msg) : msg;
  }

  const dLog = dumlog.custom([ 'debug', 'grey', 'debug' ]);

  return { dLog, bm, bc, qt, ifc };
}