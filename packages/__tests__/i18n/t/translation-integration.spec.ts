import { I18nConfiguration, TranslationAttributePattern, TranslationBindingCommand } from '@aurelia/i18n';
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia, customElement, DOM, INode } from '@aurelia/runtime';
import { assert } from '@aurelia/testing';

describe.only('translation-integration', function () {
  afterEach(function () {
    TranslationBindingCommand.aliases = ['t'];
    TranslationAttributePattern.aliases = ['t'];
  });
  async function setup(host: INode, component: unknown, aliases?: string[]) {
    const translation = {
      simple: {
        text: 'simple text',
        attr: 'simple attribute'
      },
      status: 'status is unknown',
      status_dispatched: 'dispatched on {{date}}',
      status_delivered: 'delivered on {{date}}',
      custom_interpolation_brace: 'delivered on {date}',
      custom_interpolation_es6_syntax: 'delivered on ${date}',

      itemWithCount: '{{count}} item',
      itemWithCount_plural: '{{count}} items',

      html: 'this is a <i>HTML</i> content',
      pretest: 'Mr. ',
      'post-test': ' Sky',

      imgPath: 'foo.jpg'
    };
    await new Aurelia()
      .register(
        BasicConfiguration,
        I18nConfiguration.customize((config) => {
          config.initOptions = { resources: { en: { translation } } };
          config.translationAttributeAliases = aliases;
        }))
      .app({ host, component })
      .start()
      .wait();
    return translation;
  }
  function assertTextContent(host: INode, selector: string, translation: string) {
    assert.equal((host as Element).querySelector(selector).textContent, translation);
  }

  it('works for simple string literal key', async function () {

    @customElement({ name: 'app', template: `<span t='simple.text'></span>` })
    class App { }

    const host = DOM.createElement('app');
    const translation = await setup(host, new App());
    assertTextContent(host, 'span', translation.simple.text);
  });

  it('works with aliases', async function () {

    @customElement({ name: 'app', template: `<span id='t' t='simple.text'></span><span id='i18n' i18n='simple.text'></span>` })
    class App { }

    const host = DOM.createElement('app');
    const translation = await setup(host, new App(), ['t', 'i18n']);
    assertTextContent(host, 'span#t', translation.simple.text);
    assertTextContent(host, 'span#i18n', translation.simple.text);
  });

  it('works for bound key', async function () {

    @customElement({ name: 'app', template: `<span t.bind='obj.key'></span>` })
    class App {
      private obj = { key: 'simple.text' };
    }

    const host = DOM.createElement('app');
    const translation = await setup(host, new App());
    assertTextContent(host, 'span', translation.simple.text);
  });

  describe('translation can be manipulated by using t-params', function () {
    async function suiteSetup() {
      @customElement({
        name: 'app', template: `
      <span id="i18n-ctx-vm" t="status" t-params.bind="tParams"></span><br>
      <span id="i18n-ctx-dispatched" t="status" t-params.bind="{context: 'dispatched', date: dispatchedOn}"></span><br>
      <span id="i18n-ctx-delivered" t="status" t-params.bind="{context: 'delivered', date: deliveredOn}"></span><br>

      <span id="i18n-interpolation" t="status_delivered" t-params.bind="{date: deliveredOn}"></span>
      <span id="i18n-interpolation-custom" t="custom_interpolation_brace" t-params.bind="{date: deliveredOn, interpolation: { prefix: '{', suffix: '}' }}"></span>
      <span id="i18n-interpolation-es6" t="custom_interpolation_es6_syntax" t-params.bind="{date: deliveredOn, interpolation: { prefix: '\${', suffix: '}' }}"></span>

      <span id="i18n-items-plural-0"  t="itemWithCount" t-params.bind="{count: 0}"></span>
      <span id="i18n-items-plural-1"  t="itemWithCount" t-params.bind="{count: 1}"></span>
      <span id="i18n-items-plural-10" t="itemWithCount" t-params.bind="{count: 10}"></span>`
      })
      class App {
        public dispatchedOn = new Date(2020, 1, 10, 5, 15);
        public deliveredOn = new Date(2021, 1, 10, 5, 15);
        public tParams = { context: 'dispatched', date: this.dispatchedOn };
      }
      const host = DOM.createElement('app');
      const app = new App();
      const translation = await setup(host, app);
      return { host, translation, app };
    }

    it('works when a vm property is bound as t-params', async function () {
      const { host, translation, app } = await suiteSetup();
      assertTextContent(host, '#i18n-ctx-vm', translation.status_dispatched.replace('{{date}}', app.dispatchedOn.toString()));
    });

    it('works for context-sensitive translations', async function () {
      const { host, translation, app } = await suiteSetup();
      assertTextContent(host, '#i18n-ctx-dispatched', translation.status_dispatched.replace('{{date}}', app.dispatchedOn.toString()));
      assertTextContent(host, '#i18n-ctx-delivered', translation.status_delivered.replace('{{date}}', app.deliveredOn.toString()));
    });

    it('works for interpolation, including custom marker for interpolation placeholder', async function () {
      const { host, translation, app } = await suiteSetup();
      assertTextContent(host, '#i18n-interpolation', translation.status_delivered.replace('{{date}}', app.deliveredOn.toString()));
      assertTextContent(host, '#i18n-interpolation-custom', translation.custom_interpolation_brace.replace('{date}', app.deliveredOn.toString()));
      assertTextContent(host, '#i18n-interpolation-es6', translation.custom_interpolation_es6_syntax.replace('${date}', app.deliveredOn.toString()));
    });

    it('works for pluralization', async function () {
      const { host } = await suiteSetup();
      assertTextContent(host, '#i18n-items-plural-0', '0 items');
      assertTextContent(host, '#i18n-items-plural-1', '1 item');
      assertTextContent(host, '#i18n-items-plural-10', '10 items');
    });
  });

  it('`src` attribute of img element is translated by default', async function () {

    @customElement({ name: 'app', template: `<img t='imgPath'></img>` })
    class App { }

    const host = DOM.createElement('app');
    const translation = await setup(host, new App());
    assert.equal((host as Element).querySelector('img').src.endsWith(translation.imgPath), true);
  });

  it('can translate attributes - t=\'[title]simple.attr\'', async function () {

    @customElement({ name: 'app', template: `<span t='[title]simple.attr'></span>` })
    class App { }

    const host = DOM.createElement('app');
    const translation = await setup(host, new App());
    assertTextContent(host, `span[title='${translation.simple.attr}']`, '');
  });

  it('works for a mixture of attribute targeted key and textContent targeted key - t=\'[title]simple.attr;simple.text\'', async function () {

    @customElement({ name: 'app', template: `<span t='[title]simple.attr;simple.text'></span>` })
    class App { }

    const host = DOM.createElement('app');
    const translation = await setup(host, new App());
    assertTextContent(host, `span[title='${translation.simple.attr}']`, translation.simple.text);
  });

  it('works when multiple attributes are targeted by the same key - `t="[title,data-foo]simple.attr;simple.text"`', async function () {

    @customElement({ name: 'app', template: `<span t='[title,data-foo]simple.attr;simple.text'></span>` })
    class App { }

    const host = DOM.createElement('app');
    const translation = await setup(host, new App());
    assertTextContent(host, `span[title='${translation.simple.attr}'][data-foo='${translation.simple.attr}']`, translation.simple.text);
  });

  it('works for interpolated keys are used - t="\${obj.key1}"', async function () {

    @customElement({
      name: 'app', template: `
    <span id='a' t='\${obj.key1}'></span>
    <span id='b' t='[title]\${obj.key2};simple.text'></span>
    <span id='c' t='[title]\${obj.key2};\${obj.key1}'></span>
    <span id='d' t='status_\${status}'></span>
    ` })
    class App {
      private obj = { key1: 'simple.text', key2: 'simple.attr' };
      private status = 'dispatched'
    }

    const host = DOM.createElement('app');
    const translation = await setup(host, new App());
    assertTextContent(host, `span#a`, translation.simple.text);
    assertTextContent(host, `span#b[title='${translation.simple.attr}']`, translation.simple.text);
    assertTextContent(host, `span#c[title='${translation.simple.attr}']`, translation.simple.text);
    assertTextContent(host, `span#d`, 'dispatched on ');
  });

  it('works nested key - t="$t(simple.text) $t(simple.attr)"', async function () {

    @customElement({ name: 'app', template: `<span t="$t(simple.text) $t(simple.attr)"></span>` })
    class App { }

    const host = DOM.createElement('app');
    const translation = await setup(host, new App());
    assertTextContent(host, `span`, `${translation.simple.text} ${translation.simple.attr}`);
  });

  it('works for explicit concatenation expression as key - `t.bind="string+string"`', async function () {

    @customElement({
      name: 'app', template: `
    <span id='a' t.bind='"simple."+"text"'></span>
    <span id='b' t.bind='"simple."+part'></span>
    ` })
    class App {
      private part = 'text';
    }

    const host = DOM.createElement('app');
    const translation = await setup(host, new App());
    assertTextContent(host, `span#a`, translation.simple.text);
    assertTextContent(host, `span#b`, translation.simple.text);
  });
});
