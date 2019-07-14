import { I18N, I18nConfigurationOptions } from '@aurelia/i18n';
import { ContinuationTask } from '@aurelia/runtime';
import { assert } from '@aurelia/testing';
import i18next from 'i18next';

interface I18nextSpy {
  mock: i18next.i18n;
  callRecords: Map<string, any[][]>;
  clearCallRecords(): void;
  methodCalledTimes(methodName: string, times: number): void;
  methodCalledOnceWith(methodName: string, ...expectedArgs: any[]): void;
  methodCalledNthTimeWith(methodName: string, n: number, ...expectedArgs: any[]): void;
}
function mockI18next(): I18nextSpy {
  const callRecords = new Map<string, any[][]>();
  const setCallRecord = (methodName: string, args: any[]) => {
    let record = callRecords.get(methodName);
    if (record) {
      record.push(args);
    } else {
      record = [args];
    }
    callRecords.set(methodName, record);
  };
  const clearCallRecords = () => { callRecords.clear(); };
  const methodCalledTimes = (methodName: string, times: number) => {
    const calls = callRecords.get(methodName);
    assert.equal(!!calls, true);
    assert.equal(calls.length, times);
  };
  const methodCalledOnceWith = (methodName: string, expectedArgs: any[]) => {
    methodCalledTimes(methodName, 1);
    methodCalledNthTimeWith(methodName, 1, expectedArgs);
  };
  const methodCalledNthTimeWith = (methodName: string, n: number, expectedArgs: any[]) => {
    const calls = callRecords.get(methodName);
    assert.equal(JSON.stringify(calls[n - 1]), JSON.stringify(expectedArgs));
  };

  return {
    callRecords,
    clearCallRecords,
    methodCalledOnceWith,
    methodCalledTimes,
    methodCalledNthTimeWith,
    mock: new Proxy(i18next, {
      get(target: i18next.i18n, propertyKey: string, _receiver) {
        const original = target[propertyKey];
        return typeof original !== 'function'
          ? original
          : function (...args: any[]) {
            setCallRecord(propertyKey, args);
            return original.apply(this, args);
          };
      }
    }),
  };
}

export function i18nTests() {
  describe('I18N', () => {
    let sut: I18N, mockContext: I18nextSpy;
    const arrange = (options: I18nConfigurationOptions = {}) => {
      mockContext = mockI18next();
      sut = new I18N(mockContext.mock, options, undefined);
    };

    it('initializes i18next with default options on instantiation', async () => {
      await new ContinuationTask(
        (async () => { arrange(); })(),
        () => {
          mockContext.methodCalledOnceWith('init', [{
            lng: 'en',
            fallbackLng: ['en'],
            debug: false,
            plugins: [],
            attributes: ['t', 'i18n'],
            skipTranslationOnMissingKey: false,
          }]);
        },
        undefined)
        .wait();
    });

    it('respects user-defined config options', async () => {
      const customization = { lng: 'de', attributes: ['foo'] };
      await new ContinuationTask(
        (async () => { arrange(customization); })(),
        () => {
          mockContext.methodCalledOnceWith('init', [{
            lng: customization.lng,
            fallbackLng: ['en'],
            debug: false,
            plugins: [],
            attributes: customization.attributes,
            skipTranslationOnMissingKey: false,
          }]);
        },
        undefined)
        .wait();
    });

    it('registers external plugins provided by user-defined options', async () => {
      const customization = {
        plugins: [
          {
            type: 'postProcessor',
            name: 'custom1',
            process: function (value) { return value; }
          },
          {
            type: 'postProcessor',
            name: 'custom2',
            process: function (value) { return value; }
          }
        ]
      };
      await new ContinuationTask(
        (async () => { arrange(customization); })(),
        () => {
          mockContext.methodCalledNthTimeWith('use', 1, [customization.plugins[0]]);
          mockContext.methodCalledNthTimeWith('use', 2, [customization.plugins[1]]);
        },
        undefined)
        .wait();
    });
  });
}
