import {
  IConsoleLike,
  LoggerConfiguration,
  DI,
  ILogger,
  LogLevel,
  ColorOptions,
} from '@aurelia/kernel';
import { assert, eachCartesianJoin } from '@aurelia/testing';

class ConsoleMock implements IConsoleLike {
  public readonly calls: [keyof ConsoleMock, unknown[]][] = [];

  public debug(...args: unknown[]): void {
    this.calls.push(['debug', args]);
    console.debug(...args);
  }

  public info(...args: unknown[]): void {
    this.calls.push(['info', args]);
    console.info(...args);
  }

  public warn(...args: unknown[]): void {
    this.calls.push(['warn', args]);
    console.warn(...args);
  }

  public error(...args: unknown[]): void {
    this.calls.push(['error', args]);
    console.error(...args);
  }
}

const levels = [
  [
    LogLevel.trace,
    'trace',
    'debug',
    'TRC',
  ] as const,
  [
    LogLevel.debug,
    'debug',
    'debug',
    'DBG',
  ] as const,
  [
    LogLevel.info,
    'info',
    'info',
    'INF',
  ] as const,
  [
    LogLevel.warn,
    'warn',
    'warn',
    'WRN',
  ] as const,
  [
    LogLevel.error,
    'error',
    'error',
    'ERR',
  ] as const,
  [
    LogLevel.fatal,
    'fatal',
    'error',
    'FTL',
  ] as const,
  [
    LogLevel.none,
    'none',
    '',
    '',
  ] as const,
] as const;

describe('Logger', function () {
  function createFixture(level: LogLevel, colorOpts: ColorOptions, scopeTo: string[]) {
    const container = DI.createContainer();
    const mock = new ConsoleMock();
    container.register(LoggerConfiguration.create(mock, level, colorOpts));

    let sut = container.get(ILogger);
    for (let i = 0; i < scopeTo.length; ++i) {
      sut = sut.scopeTo(scopeTo[i]);
    }

    return { sut, mock, container };
  }

  eachCartesianJoin(
    [
      levels.slice(0, -1),
      levels.slice(),
      [
        ColorOptions.noColors,
        ColorOptions.colors,
      ],
      [
        [
          'test',
        ],
        [
          () => 'test',
        ],
        [
          'test',
          {},
        ],
        [
          () => 'test',
          {},
        ],
      ],
      [
        [],
        ['foo'],
        ['foo', 'bar'],
      ]
    ],
    function (
      [methodLevel, loggerMethodName, consoleMethodName, abbrev],
      [configLevel, configName],
      colorOpts,
      [msgOrGetMsg, ...optionalParams],
      scopeTo,
    ) {
      const colorRE = colorOpts === ColorOptions.colors ? '\\u001b\\[\\d{1,2}m' : '';
      const timestampRE = `${colorRE}\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z${colorRE}`;

      const scopeRE = scopeTo.length === 0
        ? ''
        : ` ${scopeTo.map(x => `${colorRE}${x}${colorRE}`).join('\\.')}`;
      const abbrevRE = `\\[${colorRE}${abbrev}${colorRE}${scopeRE}\\]`;

      describe(`with configured level=${configName}, colors=${colorOpts}, msgOrGetMsg=${msgOrGetMsg}, optionalParams=${optionalParams}, scopeTo=${scopeTo}`, function () {
        if (methodLevel >= configLevel) {
          it(`logs ${loggerMethodName}`, function () {
            const { sut, mock } = createFixture(configLevel, colorOpts, scopeTo);

            sut[loggerMethodName](msgOrGetMsg, ...optionalParams);

            assert.strictEqual(mock.calls.length, 1, `mock.calls.length`);

            const [method, args] = mock.calls[0];
            assert.strictEqual(method, consoleMethodName, `method`);
            assert.strictEqual(args.length, optionalParams.length + 1, `args.length`);
            assert.match(args[0], new RegExp(`${timestampRE} ${abbrevRE} test`));
            if (optionalParams.length > 0) {
              assert.deepStrictEqual(args.slice(1), optionalParams);
            }
          });
        } else {
          it(`does NOT log ${loggerMethodName}`, function () {
            const { sut, mock } = createFixture(configLevel, colorOpts, scopeTo);

            sut[loggerMethodName](msgOrGetMsg, ...optionalParams);

            assert.strictEqual(mock.calls.length, 0, `mock.calls.length`);
          });

          it(`can change the level after instantiation`, function () {
            const { sut, mock } = createFixture(configLevel, colorOpts, scopeTo);

            sut.config.level = methodLevel;

            sut[loggerMethodName](msgOrGetMsg, ...optionalParams);

            assert.strictEqual(mock.calls.length, 1, `mock.calls.length`);

            const [method, args] = mock.calls[0];
            assert.strictEqual(method, consoleMethodName, `method`);
            assert.strictEqual(args.length, optionalParams.length + 1, `args.length`);
            assert.match(args[0], new RegExp(`${timestampRE} ${abbrevRE} test`));
            if (optionalParams.length > 0) {
              assert.deepStrictEqual(args.slice(1), optionalParams);
            }
          });
        }
      });
    }
  );
});
