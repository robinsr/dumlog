import YAML from 'yaml';
import { readFileSync, existsSync } from 'node:fs';
import { levelColors } from './types.js';
import Logger from './logger.js';
import colorFns, { combine } from './color.js';
import { isString } from './check.js';
const dLogPrefix = '[@dumlog]';
const options = {
    layout: 'color',
    fallbackLevel: 'off',
    debug: false,
    out: console,
};
export default async function configure(configs, opts = options) {
    const { layout, fallbackLevel, debug, out } = { ...options, ...opts };
    const dLog = debugLog(debug, out);
    const { debug: dLogDebug, fmt } = dLog;
    const parseFSConfig = configparser(dLog);
    if (typeof configs === 'string') {
        if (!existsSync(configs)) {
            throw new Error(`${dLogPrefix} Log config file not found: ${configs}`);
        }
        configs = await parseFSConfig(configs);
    }
    const fallback = {
        pattern: '.*', level: fallbackLevel
    };
    const logConfig = [...configs, fallback].map(({ pattern, level }) => ({
        pattern: new RegExp(pattern),
        level,
    }));
    dLogDebug(fmt.bm('log config:'), logConfig);
    const colors = colorFns(layout);
    const loggers = {};
    return function createLogger(logStream) {
        if (!loggers[logStream]) {
            const match = logConfig.find((l) => l.pattern.test(logStream));
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
async function configureAndWatch(configs, opts = options) {
    const createLogger = await configure(configs, opts);
    // if (typeof configs === 'string') {
    //   watchFile(configs, async () => {
    //     const newConfigs = await parseConfFile(configs);
    //     createLogger(newConfigs);
    //   });
    // }
    return createLogger;
}
const debugLog = (enabled, out) => {
    const dLog = new Logger(out, '@dumlog', enabled ? 'debug' : 'off', colorFns('color'));
    const bm = combine(dLog.color.bold, dLog.color.magenta);
    const bc = combine(dLog.color.bold, dLog.color.cyan);
    const gg = combine(dLog.color.grey, dLog.color.grey);
    const qt = (msg) => `"${msg}"`;
    const ifc = (lev, msg) => {
        return levelColors[lev] ? dLog.color[levelColors[lev]](msg) : msg;
    };
    const fmt = { bm, bc, qt, gg, ifc };
    const grayLevel = dLog.custom(['debug', 'grey', 'debug']);
    const debug = (msg, ...msgs) => {
        if (Array.isArray(msg)) {
            grayLevel(msg.map((m) => isString(m) && !m.startsWith('\x1B') ? fmt.gg(m) : m).join(' '));
        }
        else {
            grayLevel(msg, ...msgs);
        }
    };
    return { dLog, debug, fmt };
};
const configparser = ({ debug, fmt }) => async (confPath) => {
    debug('Parsing config file:', fmt.bm(confPath));
    try {
        const configs = await YAML.parse(readFileSync(confPath, 'utf8'));
        if (!configs['streams']) {
            throw new Error(`${dLogPrefix} Log config file missing "streams" property: ${confPath}`);
        }
        configs.streams.forEach((stream) => {
            if (!stream['pattern'] || !stream['level']) {
                throw new Error(`${dLogPrefix} Log config file missing required "pattern" or "level" property: ${confPath}`);
            }
        });
        return configs['streams'];
    }
    catch (e) {
        throw new Error(`${dLogPrefix} Log config file failed to parse: ${confPath}`);
    }
};
