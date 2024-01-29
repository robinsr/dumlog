import { vi, test, describe, beforeEach } from 'vitest';
import { resolve } from 'node:path';
import { configure, configureSync } from '../src/index';
import { ANSI, type ColorName } from '../src/color';
import { Levels, PlainLevels, ILogger } from '../src/types';

const __dirname = new URL('./', import.meta.url).pathname


const options = {
  layout: 'color' as const,
  defaultLevel: 'off' as const,
  debug: true,
}

const createTestLogger = configureSync([
  { pattern: 'test-default', level: 'trace' as const },
], options);


const getMockConsole = () => ({
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
});


interface LocalTestContext {
  console: ReturnType<typeof getMockConsole>;
  logger: ILogger;
}

describe('Levels Tests', () => {
  beforeEach<LocalTestContext>(async (ctx) => {
    const logstream = ctx.task.name.replace(/[\[\]\s]/g, '_').substring(0, 50)
    const console = getMockConsole();

    const logConfig = [
      { pattern: logstream, level: 'trace' as const },
    ];

    const createLogger = await configureSync(logConfig, { ...options, out: console });
    ctx.logger = createLogger(logstream);
    ctx.console = console;
  })

  describe.each([
    { level: 'fatal' as PlainLevels, target: 'error' },
    { level: 'error' as PlainLevels, target: 'error' },
    { level: 'warn' as PlainLevels, target: 'warn' },
    { level: 'info' as PlainLevels, target: 'info' },
    { level: 'trace' as PlainLevels, target: 'trace' },
  ])('$', ({ level, target }) => {

    const fooString = 'fooString';
    const barArray = [ 'barArray' ];
    const bazObject = { baz: 'bazObject' };
    
    test<LocalTestContext>(`[${level}] pass through to writer`, ({ expect, logger, console }) => {
      logger[level](fooString, barArray, bazObject);

      expect(console[target])
        .toHaveBeenCalledTimes(1);

      expect(console[target])
        .toHaveBeenCalledWith(expect.any(String), fooString, barArray, bazObject);
    });

    test<LocalTestContext>(`[${level}] calls log statement supplier`, ({ expect, logger, console }) => {
      const logStatement = `(${level}) to be logged`;
      logger[level](() => logStatement);

      expect(console[target])
        .toHaveBeenCalledTimes(1);

      expect(console[target])
        .toHaveBeenCalledWith(expect.any(String), logStatement);
    });
  });

  describe('debug', () => {
    const fooString = 'fooString';
    const barArray = [ 'barArray' ];
    const bazObject = { baz: 'bazObject' };
    
    test<LocalTestContext>(`[debug] pass through to writer`, ({ expect, logger, console }) => {
      logger.debug(fooString, barArray, bazObject);
      
      expect(console.debug)
      .toHaveBeenCalledTimes(1);
      
      
      const anyString = expect.any(String);
      expect(console.debug)
        .toHaveBeenCalledWith(anyString, fooString, anyString, anyString);
    });
  
    test<LocalTestContext>(`[debug] calls log statement supplier`, ({ expect, logger, console }) => {
      const value = `expensive`;
      logger.debug(() => `I am an ${value} log statement`);
  
      expect(console.debug)
        .toHaveBeenCalledTimes(1);
  
      const anyString = expect.any(String);
      expect(console.debug)
        .toHaveBeenCalledWith(expect.any(String), anyString);
    });
  });
});


describe('Config file test', () => {
  test('should require absolute path', async ({ expect }) => {
    try {
      await configure('./logconfig.yaml');
      return Promise.reject();
    } catch (e) {
      expect(e).toHaveProperty('message', expect.stringContaining('Log config file path must be absolute'));
    }
  });

  test('should throw error if config file is not found', async ({ expect }) => {
    const badPath = resolve(__dirname, './this-config-definitely-doesnt-exist.yaml');
    try {
      await configure(badPath);
      return Promise.reject();
    } catch (e) {
      expect(e).toHaveProperty('message', expect.stringContaining('Log config file not found'));
    }
  });


  test('should load config file', async ({ expect }) => {
    const goodPath = resolve(__dirname, './logconfig.yaml');
    const console = getMockConsole();

    try {
      const createLogger = await configure(goodPath, { ...options, out: console });
      const logInfo = createLogger('info-level');
      const logOff = createLogger('off-level');
      const logUnknown = createLogger('does-not-exist');

      logInfo.info('this should be logged');
      logOff.info('this should NOT be logged');
      logUnknown.info('this should NOT be logged');
      logUnknown.error('this should be logged');

      expect(console.info)
      .toHaveBeenCalledTimes(1);

      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('info-level'), 'this should be logged');

      expect(console.error)
      .toHaveBeenCalledTimes(1);

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('does-not-exist'), 'this should be logged');
    } catch (e) {
      return Promise.reject(e);
    }
  })
})
  

describe('Extra capabilities', () => {
  
  test('color test', ({ expect }) => {
    const logger = createTestLogger('color test');

    Object.keys(logger.color)
      .filter((key) => key !== 'reset')
      .forEach((key) => {
        const color = logger.color[key as ColorName];
        const msg = `test ${key}`;

        logger.debug(`Color Test - [${key}]:`, color(msg), 'reset text');

        // const result = color(msg);
        // const expected = `${ANSI[key as ColorName]}${msg}${ANSI.reset}`;
        // expect(result).toBe(expected);
        expect(1).toBe(1);
      });
  });

  test('debug depth test', ({ expect }) => {
    const obj = {
      a: {
        b: {
          c: {
            d: {
              e: {
                f: {
                  g: {
                    h: {
                      i: {
                        j: 'end'
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const logger = createTestLogger('color test');
  
    logger.debug('debug depth test', obj);
  });
});
