import YAML from 'yaml';
import { readFileSync, existsSync } from 'node:fs';
import { isAbsolute } from 'node:path';
import type { ILogger, LayoutType, Levels, LogConfig, LogWriter, PlainLevels } from './types.js';
import { levelColors } from './types.js';
import Logger from './logger.js';
import colorFns, { combine } from './color.js';
import { isString } from './check.js';

const dLogPrefix = '[@dumlog]';

const options = {
  layout: 'color' as LayoutType,
  fallbackLevel: 'off' as PlainLevels,
  debug: false,
  out: console as LogWriter,
}

type Options = Partial<typeof options>;
type CreateLogger = (logStream: string) => ILogger;

export async function configure(configPath: string, opts: Options = options): Promise<CreateLogger> {
  const { debug, out } = { ...options, ...opts }
  const dLog = debugLog(debug, out);
  const { debug: dLogDebug } = dLog;

  dLogDebug('configPath', configPath);

  if (!isAbsolute(configPath)) {
    throw new Error(`${dLogPrefix} Log config file path must be absolute: ${configPath}`);
  }

  if (!existsSync(configPath)) {
    throw new Error(`${dLogPrefix} Log config file not found: ${configPath}`);
  }

  try {
    const config = await configparser(dLog)(configPath);
    return configureSync(config, opts);
  } catch (e) {
    throw new Error(`${dLogPrefix} Log config file failed to parse: ${configPath}`);
  }
}

export default configure;

export function configureSync(configs: LogConfig[], opts: Options = options): CreateLogger {
  const { layout, fallbackLevel, debug, out } = { ...options, ...opts }
  
  const dLog = debugLog(debug, out);
  const { debug: dLogDebug, fmt } = dLog;

  const fallback = {
    pattern: '.*', level: fallbackLevel
  }

  const logConfig = [ ...configs, fallback ].map(({ pattern, level }) => ({
    pattern: new RegExp(pattern),
    level,
  }));

  dLogDebug(fmt.bm('log config:'), logConfig);

  const colors = colorFns(layout);
  const loggers: Record<string, ILogger> = {};

  return function createLogger(logStream: string): ILogger {
    if (!loggers[logStream]) {
      const match = logConfig.find((l) => l.pattern.test(logStream))!;
      dLogDebug('match', match);
      const level = match ? match.level : fallbackLevel;
      loggers[logStream] = new Logger(out, logStream, level, colors);

      dLogDebug([
        'Match => LogStream',
        fmt.bm(fmt.qt(logStream)),
        'to pattern', 
        fmt.bc(match.pattern),
        fmt.ifc(level, level),
      ]);
    }

    return loggers[logStream];
  };
}

/**
 * Work in progress
 */
// async function configureAndWatch(
//   configs: string | LogConfig[],
//   opts: Options = options
// ): Promise<CreateLogger> {
//   const createLogger = configure(configs, opts);

//   if (typeof configs === 'string') {
//     watchFile(configs, async () => {
//       const newConfigs = await parseConfFile(configs);
//       createLogger(newConfigs);
//     });
//   }

//   return createLogger;
// }



type DebugLogger = ReturnType<typeof debugLog>;

const debugLog = (enabled: boolean, out: LogWriter) => {
  const dLog = new Logger(
    out, '@dumlog', enabled ? 'debug' : 'off', colorFns('color')
  );

  const bm = combine(dLog.color.bold, dLog.color.magenta);
  const bc = combine(dLog.color.bold, dLog.color.cyan);
  const gg = combine(dLog.color.grey, dLog.color.grey);
  
  const qt = (msg: string) => `"${msg}"`;
  
  const ifc = (lev: Levels, msg: string) => {
    return levelColors[lev] ? dLog.color[levelColors[lev]](msg) : msg;
  }

  const fmt = { bm, bc, qt, gg, ifc }

  const grayLevel = dLog.custom([ 'debug', 'grey', 'debug' ]);

  const debug = (msg: any, ...msgs: any[]) => {
    if (Array.isArray(msg)) {
      grayLevel(msg.map((m) => isString(m) && !m.startsWith('\x1B') ? fmt.gg(m) : m).join(' '))
    } else {
      grayLevel(msg, ...msgs);
    }
  }

  return { dLog, debug, fmt };
}

const configparser = ({ debug, fmt }: DebugLogger) => (confPath: string) => {
  debug('Parsing config file:', fmt.bm(confPath));
  
  try {
    const configs = YAML.parse(readFileSync(confPath, 'utf8'));

    if (!configs['streams']) {
      throw new Error(`${dLogPrefix} Log config file missing "streams" property: ${confPath}`);
    }

    configs.streams.forEach((stream: any) => {
      if (!stream['pattern'] || !stream['level']) {
        throw new Error(`${dLogPrefix} Log config file missing required "pattern" or "level" property: ${confPath}`);
      }
    });

    return configs['streams'] as LogConfig[];
  } catch (e) {
    throw new Error(`${dLogPrefix} Log config file failed to parse: ${confPath}`);
  }
}