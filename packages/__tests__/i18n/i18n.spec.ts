import { I18nInitOptions, I18nService, Signals } from '@aurelia/i18n';
import { EventAggregator } from '@aurelia/kernel';
import { assert, MockSignaler } from '@aurelia/testing';
import i18next from 'i18next';
import { Spy } from '../Spy.js';

const translation = {
  simple: {
    text: 'simple text',
    attr: 'simple attribute'
  }
};

describe('I18N', function () {
  async function createFixture(options: I18nInitOptions = {}) {
    const i18nextSpy = new Spy();
    const eaSpy: Spy = new Spy();
    const mockSignaler = new MockSignaler();
    const sut = new I18nService(
      { i18next: i18nextSpy.getMock(i18next) },
      options,
      eaSpy.getMock(new EventAggregator()),
      mockSignaler
    );
    await sut.initPromise;
    await sut.setLocale('en');
    return { i18nextSpy, sut, eaSpy, mockSignaler };
  }

  it('initializes i18next with default options on instantiation', async function () {
    const { i18nextSpy } = await createFixture();

    i18nextSpy.methodCalledOnceWith('init', [{
      lng: 'en',
      fallbackLng: ['en'],
      debug: false,
      plugins: [],
      rtEpsilon: 0.01,
      skipTranslationOnMissingKey: false,
    }]);
  });

  it('respects user-defined config options', async function () {
    const customization = { lng: 'de', rtEpsilon: 0.001 };
    const { i18nextSpy } = await createFixture(customization);

    i18nextSpy.methodCalledOnceWith('init', [{
      lng: customization.lng,
      fallbackLng: ['en'],
      debug: false,
      plugins: [],
      rtEpsilon: customization.rtEpsilon,
      skipTranslationOnMissingKey: false,
    }]);
  });

  it('registers external plugins provided by user-defined options', async function () {
    const customization = {
      plugins: [
        {
          type: 'postProcessor',
          name: 'custom1',
          process: function (value: string, _key: string, _options: any, _translator: any) { return value; }
        },
        {
          type: 'postProcessor',
          name: 'custom2',
          process: function (value: string, _key: string, _options: any, _translator: any) { return value; }
        }
      ] as i18next.PostProcessorModule[]
    };
    const { i18nextSpy } = await createFixture(customization);

    i18nextSpy.methodCalledNthTimeWith('use', 1, [customization.plugins[0]]);
    i18nextSpy.methodCalledNthTimeWith('use', 2, [customization.plugins[1]]);
  });

  [
    { input: 'simple.text', output: [{ attributes: [], value: translation.simple.text, key: 'simple.text' }] },
    { input: '[foo]simple.text', output: [{ attributes: ['foo'], value: translation.simple.text, key: 'simple.text' }] },
    { input: '[foo,bar]simple.text', output: [{ attributes: ['foo', 'bar'], value: translation.simple.text, key: 'simple.text' }] },
    { input: '[foo,bar]simple.text;[baz]simple.attr', output: [{ attributes: ['foo', 'bar'], value: translation.simple.text, key: 'simple.text' }, { attributes: ['baz'], value: translation.simple.attr, key: 'simple.attr' }] },
    { input: 'non.existent.key', output: [{ attributes: [], value: 'non.existent.key', key: 'non.existent.key' }] },
    { input: 'non.existent.key', skipTranslationOnMissingKey: true, output: [], key: 'non.existent.key' },
    { input: '[foo,bar]non.existent.key;[baz]simple.attr', skipTranslationOnMissingKey: true, output: [{ attributes: ['baz'], value: translation.simple.attr, key: 'simple.attr' }] },
  ].forEach(({ input, skipTranslationOnMissingKey, output }) =>
    it(`'evaluate' resolves key expression ${input} to ${JSON.stringify(output)}`, async function () {
      const customization = {
        resources: {
          en: { translation }
        },
        skipTranslationOnMissingKey
      };
      const { sut } = await createFixture(customization);

      const result = sut.evaluate(input);
      assert.deepEqual(result, output);
    }));

  it('getLocale returns the active language of i18next', async function () {
    const { sut } = await createFixture();
    assert.equal(sut.getLocale(), 'en');
  });

  it('setLocale changes the active language of i18next', async function () {
    const { sut, eaSpy, mockSignaler } = await createFixture();
    eaSpy.clearCallRecords();
    mockSignaler.calls.splice(0);

    await sut.setLocale('de');

    eaSpy.methodCalledOnceWith('publish', [Signals.I18N_EA_CHANNEL, { newLocale: 'de', oldLocale: 'en' }]);
    const dispatchCall = mockSignaler.calls.find((call) => call[0] === 'dispatchSignal');
    assert.notEqual(dispatchCall, undefined);
    const [, args] = dispatchCall;
    assert.deepEqual(args, Signals.I18N_SIGNAL);
    assert.equal(sut.getLocale(), 'de');
  });

  describe('createNumberFormat', function () {
    it('returns Intl.NumberFormat with the active locale', async function () {
      const { sut } = await createFixture();

      const nf = sut.createNumberFormat();
      assert.instanceOf(nf, Intl.NumberFormat);
      assert.equal(nf.resolvedOptions().locale, 'en');
    });
    it('returns Intl.NumberFormat with the given locale', async function () {
      const { sut } = await createFixture();

      const nf = sut.createNumberFormat(undefined, 'de');
      assert.instanceOf(nf, Intl.NumberFormat);
      assert.equal(nf.resolvedOptions().locale, 'de');
    });
    it('returns Intl.NumberFormat with the given NumberFormatOptions', async function () {
      const { sut } = await createFixture();

      const nf = sut.createNumberFormat({ currency: 'EUR', style: 'currency' });
      assert.instanceOf(nf, Intl.NumberFormat);
      const options = nf.resolvedOptions();
      assert.equal(options.currency, 'EUR');
      assert.equal(options.style, 'currency');
    });
  });

  describe('nf', function () {
    it('formats a given number as per default formatting options', async function () {
      const { sut } = await createFixture();

      assert.equal(sut.nf(123456789.12), '123,456,789.12');
    });

    it('formats a given number as per given formatting options', async function () {
      const { sut } = await createFixture();

      assert.equal(sut.nf(123456789.12, { style: 'currency', currency: 'EUR' }), '€123,456,789.12');
    });

    it('formats a given number as per given locale', async function () {
      const { sut } = await createFixture();

      assert.equal(sut.nf(123456789.12, undefined, 'de'), '123.456.789,12');
    });

    it('formats a given number as per given locale and formating options', async function () {
      const { sut } = await createFixture();

      assert.equal(sut.nf(123456789.12, { style: 'currency', currency: 'EUR' }, 'de'), '123.456.789,12\u00A0€');
    });
  });

  describe('createDateTimeFormat', function () {
    it('returns Intl.DateTimeFormat with the active locale', async function () {
      const { sut } = await createFixture();

      const nf = sut.createDateTimeFormat();
      assert.instanceOf(nf, Intl.DateTimeFormat);
      assert.equal(nf.resolvedOptions().locale, 'en');
    });
    it('returns Intl.DateTimeFormat with the given locale', async function () {
      const { sut } = await createFixture();

      const nf = sut.createDateTimeFormat(undefined, 'de');
      assert.instanceOf(nf, Intl.DateTimeFormat);
      assert.equal(nf.resolvedOptions().locale, 'de');
    });
    it('returns Intl.DateTimeFormat with the given DateTimeFormatOptions', async function () {
      const { sut } = await createFixture();

      const nf = sut.createDateTimeFormat({ month: 'short', timeZoneName: 'long' });
      assert.instanceOf(nf, Intl.DateTimeFormat);
      const options = nf.resolvedOptions();
      assert.equal(options.month, 'short');
      assert.equal(options.timeZoneName, 'long');
    });
  });

  describe('df', function () {
    it('formats a given date as per default formatting options', async function () {
      const { sut } = await createFixture();

      assert.equal(sut.df(new Date(2020, 1, 10)), '2/10/2020');
    });

    it('formats a given date as per given formatting options', async function () {
      const { sut } = await createFixture();

      assert.equal(sut.df(new Date(2020, 1, 10), { month: '2-digit', day: 'numeric', year: 'numeric' }), '02/10/2020');
    });

    it('formats a given date as per given locale', async function () {
      const { sut } = await createFixture();

      assert.equal(sut.df(new Date(2020, 1, 10), undefined, 'de'), '10.2.2020');
    });

    it('formats a given date as per given locale and formating options', async function () {
      const { sut } = await createFixture();

      assert.equal(sut.df(new Date(2020, 1, 10), { month: '2-digit', day: 'numeric', year: 'numeric' }, 'de'), '10.02.2020');
    });

    it('formats a given number considering it as UNIX timestamp', async function () {
      const { sut } = await createFixture();

      assert.equal(sut.df(0), new Date(0).toLocaleDateString('en'));
    });
  });

  describe('rt', function () {

    for (const multiplier of [1, -1]) {
      for (const value of [1, 5]) {
        it(`works for time difference in seconds - ${multiplier > 0 ? 'future' : 'past'} - ${value > 1 ? 'plural' : 'singular'}`, async function () {
          const { sut } = await createFixture();
          const input = new Date();
          input.setSeconds(input.getSeconds() + multiplier * value);
          assert.equal(
            sut.rt(input),
            value > 1
              ? multiplier > 0 ? 'in 5 seconds' : '5 seconds ago'
              : multiplier > 0 ? 'in 1 second' : '1 second ago'
          );
        });

        it(`works for time difference in minutes - ${multiplier > 0 ? 'future' : 'past'} - ${value > 1 ? 'plural' : 'singular'}`, async function () {
          const { sut } = await createFixture();
          const input = new Date();
          input.setMinutes(input.getMinutes() + multiplier * value);
          assert.equal(
            sut.rt(input),
            value > 1
              ? multiplier > 0 ? 'in 5 minutes' : '5 minutes ago'
              : multiplier > 0 ? 'in 1 minute' : '1 minute ago'
          );
        });

        it(`works for time difference in hours - ${multiplier > 0 ? 'future' : 'past'} - ${value > 1 ? 'plural' : 'singular'}`, async function () {
          const { sut } = await createFixture();
          const input = new Date();
          input.setHours(input.getHours() + multiplier * value);
          assert.equal(
            sut.rt(input),
            value > 1
              ? multiplier > 0 ? 'in 5 hours' : '5 hours ago'
              : multiplier > 0 ? 'in 1 hour' : '1 hour ago'
          );
        });

        it(`works for time difference in days - ${multiplier > 0 ? 'future' : 'past'} - ${value > 1 ? 'plural' : 'singular'}`, async function () {
          const { sut } = await createFixture();
          const input = new Date();
          input.setDate(input.getDate() + multiplier * value);
          assert.equal(
            sut.rt(input),
            value > 1
              ? multiplier > 0 ? 'in 5 days' : '5 days ago'
              : multiplier > 0 ? 'in 1 day' : '1 day ago'
          );
        });

        it(`works for time difference in months - ${multiplier > 0 ? 'future' : 'past'} - ${value > 1 ? 'plural' : 'singular'}`, async function () {
          const { sut } = await createFixture();
          const input = new Date();
          // month time span for rt is of 30 days, therefore for February, forcing this to be January. We play fair for other months :)
          if (input.getMonth() === 1 && multiplier > 0 && value === 1) {
            input.setMonth(0);
            input.setDate(31);
            sut['now'] = () => new Date(input.getFullYear(), 0, 1).getTime();
          } else if (input.getMonth() === 2 && multiplier < 0 && value === 1) {
            input.setMonth(0);
            input.setDate(1);
            input.setHours(0);
            input.setMinutes(0);
            sut['now'] = () => new Date(input.getFullYear(), 0, 31, 23, 59).getTime();
          } else {
            input.setMonth(input.getMonth() + multiplier * value);
          }
          assert.equal(
            sut.rt(input),
            value > 1
              ? multiplier > 0 ? 'in 5 months' : '5 months ago'
              : multiplier > 0 ? 'in 1 month' : '1 month ago'
          );
        });

        it(`works for time difference in years - ${multiplier > 0 ? 'future' : 'past'} - ${value > 1 ? 'plural' : 'singular'}`, async function () {
          const { sut } = await createFixture();
          const input = new Date();
          input.setFullYear(input.getFullYear() + multiplier * value);
          assert.equal(
            sut.rt(input),
            value > 1
              ? multiplier > 0 ? 'in 5 years' : '5 years ago'
              : multiplier > 0 ? 'in 1 year' : '1 year ago'
          );
        });
      }
    }

    for (const multiplier of [1, -1]) {
      for (const value of [7, 14]) {
        it(`works for time difference in weeks - ${multiplier > 0 ? 'future' : 'past'} - ${value > 7 ? 'plural' : 'singular'}`, async function () {
          const { sut } = await createFixture();
          const input = new Date();
          input.setDate(input.getDate() + multiplier * value);
          assert.equal(
            sut.rt(input),
            value > 7
              ? multiplier > 0 ? 'in 2 weeks' : '2 weeks ago'
              : multiplier > 0 ? 'in 1 week' : '1 week ago'
          );
        });
      }
    }

    it(`respects given locale`, async function () {
      const { sut } = await createFixture();
      const input = new Date();
      input.setSeconds(input.getSeconds() - 5);
      assert.equal(sut.rt(input, undefined, 'de'), 'vor 5 Sekunden');
    });

    it(`respects given options`, async function () {
      const { sut } = await createFixture();
      const input = new Date();
      input.setSeconds(input.getSeconds() - 5);
      assert.equal(sut.rt(input, { style: 'short' }, 'de'), 'vor 5 Sek.');
    });
  });

  describe('uf', function () {
    const cases = [
      { input: '123,456,789.12' },
      { input: '123.456.789,12', locale: 'de' },
      { input: '$ 123,456,789.12' },
      { input: '123,456,789.12 foo bar' },
      { input: '- 123,456,789.12' },
    ];
    for (const { input, locale } of cases) {
      it(`returns 123456789.12 given ${input}${locale ? ` - ${locale}` : ''}`, async function () {
        const { sut } = await createFixture();
        assert.equal(
          sut.uf(input, locale),
          input.startsWith('-') ? -123456789.12 : 123456789.12);
      });
    }
  });
});
