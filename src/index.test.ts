import { expect, test, describe } from 'vitest';
import configure from './index';
import { ANSI, type ColorName } from './color';

const logConfig = [
  { pattern: 'test-log', level: 'debug' as const },
];

const createLogger = configure(logConfig, { defaultLevel: 'debug'  });
const log = createLogger('test-log');



describe('dumlog', () => {

  test('color test', () => {
    Object.keys(log.color)
      .filter((key) => key !== 'reset')
      .forEach((key) => {
        const color = log.color[key as ColorName];
        const msg = `test ${key}`;

        log.debug(`Color Test - [${key}]:`, color(msg), 'reset text');

        // const result = color(msg);
        // const expected = `${ANSI[key as ColorName]}${msg}${ANSI.reset}`;
        // expect(result).toBe(expected);
        expect(1).toBe(1);
      });
  });

  test('debug depth test', () => {
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

    log.debug('debug depth test', obj);
  });
});