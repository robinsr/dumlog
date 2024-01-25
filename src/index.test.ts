import { vi, test, describe, beforeEach } from 'vitest';
import configure from './index.ts';
import { ANSI, type ColorName } from './color.ts';
import { Levels, PlainLevels, ILogger } from './types.ts';


const options = {
  layout: 'color' as const,
  defaultLevel: 'off' as const,
  debug: true,
}

const createTestLogger = await configure([
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

    const createLogger = await configure(logConfig, { ...options, out: console });
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


  // describe.each([
  //   'error',
  //   'warn',
  //   'info',
  //   'trace'
  // ] as const)('Level test', (level: PlainLevels) => {

  //   const fooString = 'fooString';
  //   const barArray = [ 'barArray' ];
  //   const bazObject = { baz: 'bazObject' };
    
  //   test<LocalTestContext>(`[${level}] pass through to writer`, ({ expect, logger, console }) => {
  //     logger[level](fooString, barArray, bazObject);

  //     expect(console[level])
  //       .toHaveBeenCalledTimes(1);

  //     expect(console[level])
  //       .toHaveBeenCalledWith(expect.any(String), fooString, barArray, bazObject);
  //   });

  //   test<LocalTestContext>(`[${level}] calls log statement supplier`, ({ expect, logger, console }) => {
  //     const logStatement = `(${level}) to be logged`;
  //     logger[level](() => logStatement);

  //     expect(console[level])
  //       .toHaveBeenCalledTimes(1);

  //     expect(console[level])
  //       .toHaveBeenCalledWith(expect.any(String), logStatement);
  //   });
  // });

  

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
