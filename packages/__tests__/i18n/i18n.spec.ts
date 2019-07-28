import { I18nConfigurationOptions, I18nModule, I18nService } from '@aurelia/i18n';
import { assert } from '@aurelia/testing';
import i18next from 'i18next';
import { Spy } from './Spy';

const translation = {
  simple: {
    text: 'simple text',
    attr: 'simple attribute'
  }
};

describe.only('I18N', function () {
  async function setup(options: I18nConfigurationOptions = {}) {
    let sut: I18nService, mockContext: Spy;
    mockContext = new Spy();
    sut = new I18nService({ i18next: mockContext.getMock(i18next) }, options);
    await sut['task'].wait();
    return { mockContext, sut };
  }

  it('initializes i18next with default options on instantiation', async function () {
    const { mockContext } = await setup();

    mockContext.methodCalledOnceWith('init', [{
      lng: 'en',
      fallbackLng: ['en'],
      debug: false,
      plugins: [],
      attributes: ['t', 'i18n'],
      skipTranslationOnMissingKey: false,
    }]);
  });

  it('respects user-defined config options', async function () {
    const customization = { lng: 'de', attributes: ['foo'] };
    const { mockContext } = await setup(customization);

    mockContext.methodCalledOnceWith('init', [{
      lng: customization.lng,
      fallbackLng: ['en'],
      debug: false,
      plugins: [],
      attributes: customization.attributes,
      skipTranslationOnMissingKey: false,
    }]);
  });

  it('registers external plugins provided by user-defined options', async function () {
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
      ] as I18nModule[]
    };
    const { mockContext } = await setup(customization);

    mockContext.methodCalledNthTimeWith('use', 1, [customization.plugins[0]]);
    mockContext.methodCalledNthTimeWith('use', 2, [customization.plugins[1]]);
  });

  [
    { input: 'simple.text', output: [{ attributes: [], value: translation.simple.text }] },
    { input: '[foo]simple.text', output: [{ attributes: ['foo'], value: translation.simple.text }] },
    { input: '[foo,bar]simple.text', output: [{ attributes: ['foo', 'bar'], value: translation.simple.text }] },
    { input: '[foo,bar]simple.text;[baz]simple.attr', output: [{ attributes: ['foo', 'bar'], value: translation.simple.text }, { attributes: ['baz'], value: translation.simple.attr }] },
  ].forEach(({ input, output }) =>
    it(`'evaluate' resolves key expression ${input} to ${JSON.stringify(output)}`, async function () {
      const customization = {
        resources: {
          en: { translation }
        }
      };
      const { sut } = await setup(customization);

      const result = sut.evaluate(input);
      assert.deepEqual(result, output);
    }));
});
