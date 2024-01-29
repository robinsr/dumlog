"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  configure: () => configure,
  configureSync: () => configureSync,
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_yaml = __toESM(require("yaml"), 1);
var import_node_fs = require("fs");
var import_node_path = require("path");

// src/types.ts
var levels = ["off", "metric", "fatal", "error", "warn", "info", "debug", "trace"];
var levelColors = {
  off: "grey",
  metric: "green",
  fatal: "bgRed",
  error: "red",
  warn: "yellow",
  info: "blue",
  debug: "cyan",
  trace: "magenta"
};

// src/check.ts
function isString(msg) {
  return typeof msg === "string";
}
function isFunction(functionToCheck) {
  return typeof functionToCheck === "function";
}
function isLogCallback(cb) {
  return isFunction(cb);
}

// src/color.ts
var ANSI = {
  reset: "\x1B[0m",
  bright: "\x1B[1m",
  black: "\x1B[30m",
  red: "\x1B[31m",
  green: "\x1B[38;5;82m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[38;5;205m",
  purple: "\x1B[35m",
  cyan: "\x1B[36m",
  white: "\x1B[37m",
  grey: "\x1B[90m",
  gray: "\x1B[90m",
  bold: "\x1B[1m",
  italic: "\x1B[3m",
  underline: "\x1B[4m",
  blink: "\x1B[5m",
  inverse: "\x1B[7m",
  hidden: "\x1B[8m",
  strike: "\x1B[9m",
  bgRed: "\x1B[41m\x1B[30m"
};
var colorFns = (l) => {
  return l === "color" ? Object.keys(ANSI).reduce((acc, key) => ({
    ...acc,
    [key]: (msg) => `${ANSI[key]}${msg}${ANSI.reset}`
  }), {}) : Object.keys(ANSI).reduce((acc, key) => ({
    ...acc,
    [key]: (msg) => msg
  }), {});
};
var combine = (...fns) => (msg) => fns.reduce((acc, fn) => fn(acc), msg);
var color_default = colorFns;

// src/logger.ts
var import_util = require("util");
var inspectOpts = {
  colors: true,
  depth: 6
};
var time = () => {
  return (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
};
var debugMapper = (msg) => {
  return msg.map((m) => isString(m) ? m : (0, import_util.inspect)(m, inspectOpts));
};
var logCallbackMapper = (msg) => {
  if (msg.length === 1 && isLogCallback(msg[0])) {
    return [msg[0]()];
  } else {
    return msg;
  }
};
var Logger = class {
  constructor(writer, logstream, level, color) {
    this.mark = (level, ansi) => {
      const { color, logstream } = this;
      const levelMarker = color[ansi || levelColors[level]](`[${level}]`);
      const timestamp = color.grey(time());
      return `${timestamp} ${levelMarker} (${logstream}) -`;
    };
    this.check = (level) => {
      return levels.indexOf(this.level) >= levels.indexOf(level);
    };
    this.off = (...msg) => {
    };
    this.fatal = (...msg) => {
      const { check, writer, mark } = this;
      check("fatal") && writer.error(mark("fatal"), ...logCallbackMapper(msg));
    };
    this.error = (...msg) => {
      const { check, writer, mark } = this;
      check("error") && writer.error(mark("error"), ...logCallbackMapper(msg));
    };
    this.warn = (...msg) => {
      const { check, writer, mark } = this;
      check("warn") && writer.warn(mark("warn"), ...logCallbackMapper(msg));
    };
    this.info = (...msg) => {
      const { check, writer, mark } = this;
      check("info") && writer.info(mark("info"), ...logCallbackMapper(logCallbackMapper(msg)));
    };
    this.debug = (...msg) => {
      const { check, writer, mark } = this;
      check("debug") && writer.debug(mark("debug"), ...debugMapper(msg));
    };
    this.trace = (...msg) => {
      const { check, writer, mark } = this;
      check("trace") && writer.trace(mark("trace"), ...logCallbackMapper(msg));
    };
    this.metric = (metric, value, unit) => {
      const { check, writer, mark } = this;
      const metricName = isString(metric) ? metric : Object.entries(metric).map(([k, v]) => `${k}=${v}`).join(",");
      const metricLine = [metricName, value, unit].filter(Boolean).join("|");
      writer.info(mark("metric"), metricLine);
    };
    /**
     * Create one-off custom loggers by passing in a customizer customizer is an
     * array of [ level, ansi, console function ] 
     * 
     * e.g. ['debug', 'grey', 'debug']
     */
    this.custom = (custom) => {
      const [level, ansi, fn] = custom;
      return (...msg) => {
        if (this.check(level)) {
          const mark = this.mark(level, ansi);
          console[fn].call(console, mark, ...msg);
        }
      };
    };
    this.combine = (...fns) => combine(...fns);
    this.writer = writer;
    this.logstream = logstream;
    this.level = level;
    this.color = color;
  }
  ifEnabled(level, cb) {
    this.check(level) && this[level](cb());
  }
};

// src/index.ts
var dLogPrefix = "[@dumlog]";
var options = {
  layout: "color",
  fallbackLevel: "off",
  debug: false,
  out: console
};
async function configure(configPath, opts = options) {
  const { debug, out } = { ...options, ...opts };
  const dLog = debugLog(debug, out);
  const { debug: dLogDebug } = dLog;
  dLogDebug("configPath", configPath);
  if (!(0, import_node_path.isAbsolute)(configPath)) {
    throw new Error(`${dLogPrefix} Log config file path must be absolute: ${configPath}`);
  }
  if (!(0, import_node_fs.existsSync)(configPath)) {
    throw new Error(`${dLogPrefix} Log config file not found: ${configPath}`);
  }
  try {
    const config = await configparser(dLog)(configPath);
    return configureSync(config, opts);
  } catch (e) {
    throw new Error(`${dLogPrefix} Log config file failed to parse: ${configPath}`);
  }
}
var src_default = configure;
function configureSync(configs, opts = options) {
  const { layout, fallbackLevel, debug, out } = { ...options, ...opts };
  const dLog = debugLog(debug, out);
  const { debug: dLogDebug, fmt } = dLog;
  const fallback = {
    pattern: ".*",
    level: fallbackLevel
  };
  const logConfig = [...configs, fallback].map(({ pattern, level }) => ({
    pattern: new RegExp(pattern),
    level
  }));
  dLogDebug(fmt.bm("log config:"), logConfig);
  const colors = color_default(layout);
  const loggers = {};
  return function createLogger(logStream) {
    if (!loggers[logStream]) {
      const match = logConfig.find((l) => l.pattern.test(logStream));
      dLogDebug("match", match);
      const level = match ? match.level : fallbackLevel;
      loggers[logStream] = new Logger(out, logStream, level, colors);
      dLogDebug([
        "Match => LogStream",
        fmt.bm(fmt.qt(logStream)),
        "to pattern",
        fmt.bc(match.pattern),
        fmt.ifc(level, level)
      ]);
    }
    return loggers[logStream];
  };
}
var debugLog = (enabled, out) => {
  const dLog = new Logger(
    out,
    "@dumlog",
    enabled ? "debug" : "off",
    color_default("color")
  );
  const bm = combine(dLog.color.bold, dLog.color.magenta);
  const bc = combine(dLog.color.bold, dLog.color.cyan);
  const gg = combine(dLog.color.grey, dLog.color.grey);
  const qt = (msg) => `"${msg}"`;
  const ifc = (lev, msg) => {
    return levelColors[lev] ? dLog.color[levelColors[lev]](msg) : msg;
  };
  const fmt = { bm, bc, qt, gg, ifc };
  const grayLevel = dLog.custom(["debug", "grey", "debug"]);
  const debug = (msg, ...msgs) => {
    if (Array.isArray(msg)) {
      grayLevel(msg.map((m) => isString(m) && !m.startsWith("\x1B") ? fmt.gg(m) : m).join(" "));
    } else {
      grayLevel(msg, ...msgs);
    }
  };
  return { dLog, debug, fmt };
};
var configparser = ({ debug, fmt }) => (confPath) => {
  debug("Parsing config file:", fmt.bm(confPath));
  try {
    const configs = import_yaml.default.parse((0, import_node_fs.readFileSync)(confPath, "utf8"));
    if (!configs["streams"]) {
      throw new Error(`${dLogPrefix} Log config file missing "streams" property: ${confPath}`);
    }
    configs.streams.forEach((stream) => {
      if (!stream["pattern"] || !stream["level"]) {
        throw new Error(`${dLogPrefix} Log config file missing required "pattern" or "level" property: ${confPath}`);
      }
    });
    return configs["streams"];
  } catch (e) {
    throw new Error(`${dLogPrefix} Log config file failed to parse: ${confPath}`);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  configure,
  configureSync
});
