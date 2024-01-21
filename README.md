dumlog
======

A dumb lil' logger for people who dont overthink things

## Features

* Just a console logger, no other output options atm
* Configure with `LogConfig[]` in code, or YAML
* `debug` proxies to `util.inspect` with deeper levels logged
* basic color/text-formatting support


## Usage

```js
import configure from 'dumlog';

const logConfigs = [
  { pattern: 'lib/.*', level: 'off' },
  { pattern: 'pages/*', level: 'debug' },
];

const createLogger = await configure(logConfigs, {
  layout: layoutType,
  defaultLevel: 'info',
  fallbackLevel: 'error',
  debug: false,
});

export default function getLogger(logStream: string) {
  return createLogger(logStream);
}

// elsewhere...
import getLogger from 'mylogger';

const log = getLogger('pages/home');
log.info('User logged in');


const log = getLogger('lib/thing');
log.info('API response...') // no output

const log = getLogger('pages/ignoreme');
log.info('Here;s some boring info to see'); // you wont
log.error('You need to see this!'); //  you will

```