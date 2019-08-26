import { I18N, I18nConfiguration, TranslationAttributePattern, TranslationBindAttributePattern, TranslationBindBindingCommand, TranslationBindingCommand } from '@aurelia/i18n';
import { IRegistration } from '@aurelia/kernel';
import { Aurelia, bindable, customElement, DOM, INode, LifecycleFlags } from '@aurelia/runtime';
import { assert, TestContext } from '@aurelia/testing';

describe('translation-integration', function () {
  afterEach(function () {
    TranslationBindingCommand.aliases = ['t'];
    TranslationAttributePattern.aliases = ['t'];
    TranslationBindBindingCommand.aliases = ['t'];
    TranslationBindAttributePattern.aliases = ['t'];
  });
  @customElement({ name: 'custom-message', template: `<div>\${message}</div>` })
  class CustomMessage {
    @bindable public message: string;
  }

  async function setup(host: INode, component: unknown, aliases?: string[], skipTranslationOnMissingKey = false) {
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
      pre: 'tic ',
      mid: 'tac',
      midHtml: '<i>tac</i>',
      post: ' toe',

      imgPath: 'foo.jpg'
    };
    const deTranslation = {
      simple: {
        text: 'Einfacher Text',
        attr: 'Einfaches Attribut'
      },

      status: 'Status ist unbekannt',
      status_dispatched: 'Versand am {{date}}',
      status_delivered: 'geliefert am {{date}}',
      custom_interpolation_brace: 'geliefert am {date}',
      custom_interpolation_es6_syntax: 'geliefert am ${date}',

      itemWithCount: '{{count}} Artikel',
      itemWithCount_plural: '{{count}} Artikel',
      itemWithCount_interval: '(0)$t(itemWithCount_plural);(1)$t(itemWithCount);(2-7)$t(itemWithCount_plural);(7-inf){viele Artikel};',

      html: 'Dies ist ein <i>HTML</i> Inhalt',
      pre: 'Tic ',
      mid: 'Tac',
      midHtml: '<i>Tac</i>',
      post: ' Toe',

      imgPath: 'bar.jpg'
    };
    const ctx = TestContext.createHTMLTestContext();
    const au = new Aurelia(ctx.container);
    await au.register(
      I18nConfiguration.customize((config) => {
        config.initOptions = {
          resources: { en: { translation }, de: { translation: deTranslation } },
          skipTranslationOnMissingKey
        };
        config.translationAttributeAliases = aliases;
      }))
      .register(CustomMessage as unknown as IRegistration)
      .app({ host, component })
      .start()
      .wait();
    const i18n = au.container.get(I18N);
    return { en: translation, de: deTranslation, container: au.container, i18n, ctx };
  }
  function assertTextContent(host: INode, selector: string, translation: string) {
    assert.equal((host as Element).querySelector(selector).textContent, translation);
  }

  it('works for simple string literal key', async function () {

    @customElement({ name: 'app', template: `<span t='simple.text'></span>` })
    class App { }

    const host = DOM.createElement('app');
    const { en: translation } = await setup(host, new App());
    assertTextContent(host, 'span', translation.simple.text);
  });

  it('works with aliases', async function () {

    @customElement({
      name: 'app', template: `
    <span id='t' t='simple.text'></span>
    <span id='i18n' i18n='simple.text'></span>
    <span id='i18n-bind' i18n.bind='key'></span>
    ` })
    class App { private readonly key = 'simple.text'; }

    const host = DOM.createElement('app');
    const { en: translation } = await setup(host, new App(), ['t', 'i18n']);
    assertTextContent(host, 'span#t', translation.simple.text);
    assertTextContent(host, 'span#i18n', translation.simple.text);
    assertTextContent(host, 'span#i18n-bind', translation.simple.text);
  });

  it('works for bound key', async function () {

    @customElement({ name: 'app', template: `<span t.bind='obj.key'></span>` })
    class App {
      private readonly obj = { key: 'simple.text' };
    }

    const host = DOM.createElement('app');
    const { en: translation } = await setup(host, new App());
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
      const { en: translation } = await setup(host, app);
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
    const { en: translation } = await setup(host, new App());
    assert.equal((host as Element).querySelector('img').src.endsWith(translation.imgPath), true);
  });

  it('can translate attributes - t=\'[title]simple.attr\'', async function () {

    @customElement({ name: 'app', template: `<span t='[title]simple.attr'></span>` })
    class App { }

    const host = DOM.createElement('app');
    const { en: translation } = await setup(host, new App());
    assertTextContent(host, `span[title='${translation.simple.attr}']`, '');
  });

  it('works for a mixture of attribute targeted key and textContent targeted key - t=\'[title]simple.attr;simple.text\'', async function () {

    @customElement({ name: 'app', template: `<span t='[title]simple.attr;simple.text'></span>` })
    class App { }

    const host = DOM.createElement('app');
    const { en: translation } = await setup(host, new App());
    assertTextContent(host, `span[title='${translation.simple.attr}']`, translation.simple.text);
  });

  it('works when multiple attributes are targeted by the same key - `t="[title,data-foo]simple.attr;simple.text"`', async function () {

    @customElement({ name: 'app', template: `<span t='[title,data-foo]simple.attr;simple.text'></span>` })
    class App { }

    const host = DOM.createElement('app');
    const { en: translation } = await setup(host, new App());
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
      private readonly obj = { key1: 'simple.text', key2: 'simple.attr' };
      private readonly status = 'dispatched'
    }

    const host = DOM.createElement('app');
    const { en: translation } = await setup(host, new App());
    assertTextContent(host, `span#a`, translation.simple.text);
    assertTextContent(host, `span#b[title='${translation.simple.attr}']`, translation.simple.text);
    assertTextContent(host, `span#c[title='${translation.simple.attr}']`, translation.simple.text);
    assertTextContent(host, `span#d`, 'dispatched on ');
  });

  it('works nested key - t="$t(simple.text) $t(simple.attr)"', async function () {

    @customElement({ name: 'app', template: `<span t="$t(simple.text) $t(simple.attr)"></span>` })
    class App { }

    const host = DOM.createElement('app');
    const { en: translation } = await setup(host, new App());
    assertTextContent(host, `span`, `${translation.simple.text} ${translation.simple.attr}`);
  });

  it('works for explicit concatenation expression as key - `t.bind="string+string"`', async function () {

    @customElement({
      name: 'app', template: `
    <span id='a' t.bind='"simple."+"text"'></span>
    <span id='b' t.bind='"simple."+part'></span>
    ` })
    class App {
      private readonly part = 'text';
    }

    const host = DOM.createElement('app');
    const { en: translation } = await setup(host, new App());
    assertTextContent(host, `span#a`, translation.simple.text);
    assertTextContent(host, `span#b`, translation.simple.text);
  });

  it('works for textContent replacement with explicit [text] attribute - `t="[text]key"`', async function () {

    @customElement({
      name: 'app', template: `<span id='a' t='[text]simple.text'></span>`
    })
    class App { }

    const host = DOM.createElement('app');
    const { en } = await setup(host, new App());

    assertTextContent(host, 'span', en.simple.text);
  });

  it('works for innerHTML replacement - `t="[html]key"`', async function () {

    @customElement({
      name: 'app', template: `<span id='a' t='[html]html'></span>`
    })
    class App { }

    const host = DOM.createElement('app');
    const { en: translation } = await setup(host, new App());

    assert.equal((host as Element).querySelector('span').innerHTML, translation.html);
  });

  describe('prepends/appends the translated value to the element content - `t="[prepend]key1;[append]key2"`', function () {
    it('works for [prepend] only', async function () {

      @customElement({
        name: 'app', template: `<span t='[prepend]pre'>tac</span>`
      })
      class App { }

      const host = DOM.createElement('app');
      await setup(host, new App());

      assertTextContent(host, 'span', 'tic tac');
    });
    it('works for [prepend] + textContent', async function () {

      @customElement({
        name: 'app', template: `<span t='[prepend]pre;mid'></span>`
      })
      class App { }

      const host = DOM.createElement('app');
      await setup(host, new App());

      assertTextContent(host, 'span', 'tic tac');
    });
    it('works for [prepend] + html', async function () {

      @customElement({
        name: 'app', template: `<span t='[prepend]pre;[html]midHtml'></span>`
      })
      class App { }

      const host = DOM.createElement('app');
      await setup(host, new App());

      assert.equal((host as Element).querySelector('span').innerHTML, 'tic <i>tac</i>');
    });

    it('works for [append] only', async function () {

      @customElement({
        name: 'app', template: `<span t='[append]post'>tac</span>`
      })
      class App { }

      const host = DOM.createElement('app');
      await setup(host, new App());

      assertTextContent(host, 'span', 'tac toe');
    });
    it('works for [append] + textContent', async function () {

      @customElement({
        name: 'app', template: `<span t='[append]post;mid'></span>`
      })
      class App { }

      const host = DOM.createElement('app');
      await setup(host, new App());

      assertTextContent(host, 'span', 'tac toe');
    });
    it('works for [append] + html', async function () {

      @customElement({
        name: 'app', template: `<span t='[append]post;[html]midHtml'></span>`
      })
      class App { }

      const host = DOM.createElement('app');
      await setup(host, new App());

      assert.equal((host as Element).querySelector('span').innerHTML, '<i>tac</i> toe');
    });

    it('works for [prepend] and [append]', async function () {

      @customElement({
        name: 'app', template: `<span t='[prepend]pre;[append]post'>tac</span>`
      })
      class App { }

      const host = DOM.createElement('app');
      await setup(host, new App());

      assertTextContent(host, 'span', 'tic tac toe');
    });
    it('works for [prepend] + [append] + textContent', async function () {

      @customElement({
        name: 'app', template: `<span t='[prepend]pre;[append]post;mid'></span>`
      })
      class App { }

      const host = DOM.createElement('app');
      await setup(host, new App());

      assertTextContent(host, 'span', 'tic tac toe');
    });
    it('works for [prepend] + [append] + innerHtml', async function () {

      @customElement({
        name: 'app', template: `<span t='[prepend]pre;[append]post;[html]midHtml'></span>`
      })
      class App { }

      const host = DOM.createElement('app');
      await setup(host, new App());

      assert.equal((host as Element).querySelector('span').innerHTML, 'tic <i>tac</i> toe');
    });
  });

  describe('updates translation', function () {

    it('when the key expression changed - interpolation', async function () {

      @customElement({
        name: 'app', template: `<span t='\${obj.key}'></span>`
      })
      class App {
        public obj = { key: 'simple.text' };
      }

      const host = DOM.createElement('app');
      const app = new App();
      const { en: translation } = await setup(host, app);
      app.obj.key = 'simple.attr';
      assertTextContent(host, `span`, translation.simple.attr);
    });

    it('when the key expression changed - multi-interpolation', async function () {

      @customElement({
        name: 'app', template: `<span t='\${obj.base}\${obj.key}'></span>`
      })
      class App {
        public obj = { base: 'simple.', key: 'text' };
      }

      const host = DOM.createElement('app');
      const app = new App();
      const { en: translation } = await setup(host, app);
      assertTextContent(host, `span`, translation.simple.text);
      app.obj.base = 'simple';
      app.obj.key = '.attr';
      assertTextContent(host, `span`, translation.simple.attr);
    });

    it('when the key expression changed - access-member', async function () {

      @customElement({
        name: 'app', template: `<span t.bind='obj.key'></span>`
      })
      class App {
        public obj = { key: 'simple.text' };
      }

      const host = DOM.createElement('app');
      const app = new App();
      const { en: translation } = await setup(host, app);
      app.obj.key = 'simple.attr';
      assertTextContent(host, `span`, translation.simple.attr);
    });

    it('when the translation parameters changed', async function () {

      @customElement({
        name: 'app', template: `<span t="status" t-params.bind="params"></span>`
      })
      class App {
        public deliveredOn = new Date(2021, 1, 10, 5, 15);
        public params = { context: 'delivered', date: this.deliveredOn };
      }

      const host = DOM.createElement('app');
      const app = new App();
      const { en: translation } = await setup(host, app);
      app.params = { ...app.params, context: 'dispatched' };
      assertTextContent(host, `span`, translation.status_dispatched.replace('{{date}}', app.deliveredOn.toString()));
    });

    it('when the locale is changed', async function () {

      @customElement({
        name: 'app', template: `<span id='a' t='simple.text'></span>`
      })
      class App { }

      const host = DOM.createElement('app');
      const { de, container } = await setup(host, new App());
      const i18n = container.get(I18N);
      await i18n.setLocale('de');
      assertTextContent(host, 'span', de.simple.text);
    });
  });

  describe('works with custom elements', function () {
    it('can bind to custom elements attributes', async function () {
      @customElement({
        name: 'app', template: `<custom-message t="[message]simple.text"></custom-message>`
      })
      class App { }

      const host = DOM.createElement('app');
      const { en } = await setup(host, new App());
      assertTextContent(host, 'custom-message div', en.simple.text);
    });

    it('should support params', async function () {
      @customElement({
        name: 'app', template: `<custom-message t="[message]itemWithCount" t-params.bind="{count: 0}">`
      })
      class App { }

      const host = DOM.createElement('app');
      const { en } = await setup(host, new App());
      assertTextContent(host, 'custom-message div', en.itemWithCount_plural.replace('{{count}}', '0'));
    });

    it('should support locale changes', async function () {
      @customElement({
        name: 'app', template: `<custom-message t="[message]simple.text"></custom-message>`
      })
      class App { }

      const host = DOM.createElement('app');
      const { de, container, ctx } = await setup(host, new App());
      const i18n = container.get(I18N);
      await i18n.setLocale('de');
      ctx.lifecycle.processRAFQueue(LifecycleFlags.none);

      assertTextContent(host, 'custom-message div', de.simple.text);
    });
  });

  describe('`t` value-converter works for', function () {
    it('key as string literal', async function () {

      @customElement({ name: 'app', template: `<span>\${'simple.text' | t}</span>` })
      class App { }

      const host = DOM.createElement('app');
      const { en: translation } = await setup(host, new App());
      assertTextContent(host, 'span', translation.simple.text);
    });
    it('key bound from vm property', async function () {

      @customElement({ name: 'app', template: `<span>\${key | t}</span>` })
      class App { key = 'simple.text'; }

      const host = DOM.createElement('app');
      const { en: translation } = await setup(host, new App());
      assertTextContent(host, 'span', translation.simple.text);
    });
    it('with `t-params`', async function () {

      @customElement({ name: 'app', template: `<span>\${'itemWithCount' | t: {count:10}}</span>` })
      class App { }

      const host = DOM.createElement('app');
      const { en: translation } = await setup(host, new App());
      assertTextContent(host, 'span', translation.itemWithCount_plural.replace('{{count}}', '10'));
    });
    it('attribute translation', async function () {

      @customElement({
        name: 'app', template: `
      <span id="a" title.bind="'simple.text' | t">t-vc-attr-target</span>
      <span id="b" title="\${'simple.text' | t}">t-vc-attr-target</span>
      <span id="c" title.bind="'itemWithCount' | t : {count:10}">t-vc-attr-target</span>
      ` })
      class App { }

      const host = DOM.createElement('app');
      const { en: translation } = await setup(host, new App());
      assertTextContent(host, `span#a[title='${translation.simple.text}']`, 't-vc-attr-target');
      assertTextContent(host, `span#b[title='${translation.simple.text}']`, 't-vc-attr-target');
      assertTextContent(host, `span#c[title='${translation.itemWithCount_plural.replace('{{count}}', '10')}']`, 't-vc-attr-target');
    });
    it('change of locale', async function () {

      @customElement({ name: 'app', template: `<span>\${'simple.text' | t}</span>` })
      class App { }

      const host = DOM.createElement('app');
      const { i18n, de, ctx } = await setup(host, new App());

      await i18n.setLocale('de');
      ctx.lifecycle.processRAFQueue(LifecycleFlags.none);
      assertTextContent(host, 'span', de.simple.text);
    });
  });

  describe('`t` binding-behavior works for', function () {
    it('key as string literal', async function () {

      @customElement({ name: 'app', template: `<span>\${'simple.text' & t}</span>` })
      class App { }

      const host = DOM.createElement('app');
      const { en: translation } = await setup(host, new App());
      assertTextContent(host, 'span', translation.simple.text);
    });
    it('key bound from vm property', async function () {

      @customElement({ name: 'app', template: `<span>\${key & t}</span>` })
      class App { key = 'simple.text'; }

      const host = DOM.createElement('app');
      const { en: translation } = await setup(host, new App());
      assertTextContent(host, 'span', translation.simple.text);
    });
    it('with `t-params`', async function () {

      @customElement({ name: 'app', template: `<span>\${'itemWithCount' & t : {count:10}}</span>` })
      class App { }

      const host = DOM.createElement('app');
      const { en: translation } = await setup(host, new App());
      assertTextContent(host, 'span', translation.itemWithCount_plural.replace('{{count}}', '10'));
    });
    it('attribute translation', async function () {

      @customElement({
        name: 'app', template: `
      <span id="a" title.bind="'simple.text' & t">t-vc-attr-target</span>
      <span id="b" title="\${'simple.text' & t}">t-vc-attr-target</span>
      <span id="c" title.bind="'itemWithCount' & t : {count:10}">t-vc-attr-target</span>
      ` })
      class App { }

      const host = DOM.createElement('app');
      const { en: translation } = await setup(host, new App());
      assertTextContent(host, `span#a[title='${translation.simple.text}']`, 't-vc-attr-target');
      assertTextContent(host, `span#b[title='${translation.simple.text}']`, 't-vc-attr-target');
      assertTextContent(host, `span#c[title='${translation.itemWithCount_plural.replace('{{count}}', '10')}']`, 't-vc-attr-target');
    });
    it('change of locale', async function () {

      @customElement({ name: 'app', template: `<span>\${'simple.text' & t}</span>` })
      class App { }

      const host = DOM.createElement('app');
      const { i18n, de, ctx } = await setup(host, new App());

      await i18n.setLocale('de');
      ctx.lifecycle.processRAFQueue(LifecycleFlags.none);

      assertTextContent(host, 'span', de.simple.text);
    });
  });

  describe('`df` value-converter', function () {
    const cases = [
      { name: 'works for date object', input: new Date(2019, 7, 20), output: '8/20/2019' },
      { name: 'works for ISO 8601 date string', input: new Date(2019, 7, 20).toISOString(), output: '8/20/2019' },
      { name: 'works for integer', input: 0, output: '1/1/1970' },
      { name: 'works for integer string', input: '0', output: '1/1/1970' },
      { name: 'returns undefined for undefined', input: undefined, output: 'undefined' },
      { name: 'returns null for null', input: null, output: 'null' },
      { name: 'returns empty string for empty string', input: '', output: '' },
      { name: 'returns whitespace for whitespace', input: '  ', output: '  ' },
      { name: 'returns `invalidValueForDate` for `invalidValueForDate`', input: 'invalidValueForDate', output: 'invalidValueForDate' },
    ];
    for (const { name, input, output } of cases) {
      it(name, async function () {
        @customElement({ name: 'app', template: `<span>\${ dt | df }</span>` })
        class App { private readonly dt = input; }

        const host = DOM.createElement('app');
        await setup(host, new App());
        assertTextContent(host, 'span', output);
      });
    }

    it('respects provided locale and formatting options', async function () {
      @customElement({ name: 'app', template: `<span>\${ dt | df : {year:'2-digit', month:'2-digit', day:'2-digit'} : 'de' }</span>` })
      class App { private readonly dt = new Date(2019, 7, 20); }

      const host = DOM.createElement('app');
      await setup(host, new App());
      assertTextContent(host, 'span', '20.08.19');
    });

    it('works for change of locale', async function () {

      @customElement({ name: 'app', template: `<span>\${ dt | df }</span>` })
      class App { private readonly dt = new Date(2019, 7, 20); }

      const host = DOM.createElement('app');
      const { i18n, ctx } = await setup(host, new App());

      await i18n.setLocale('de');
      ctx.lifecycle.processRAFQueue(LifecycleFlags.none);
      assertTextContent(host, 'span', '20.8.2019');
    });
  });

  describe('`df` binding-behavior', function () {
    const cases = [
      { name: 'works for date object', input: new Date(2019, 7, 20), output: '8/20/2019' },
      { name: 'works for ISO 8601 date string', input: new Date(2019, 7, 20).toISOString(), output: '8/20/2019' },
      { name: 'works for integer', input: 0, output: '1/1/1970' },
      { name: 'works for integer string', input: '0', output: '1/1/1970' },
      { name: 'returns undefined for undefined', input: undefined, output: 'undefined' },
      { name: 'returns null for null', input: null, output: 'null' },
      { name: 'returns empty string for empty string', input: '', output: '' },
      { name: 'returns whitespace for whitespace', input: '  ', output: '  ' },
      { name: 'returns `invalidValueForDate` for `invalidValueForDate`', input: 'invalidValueForDate', output: 'invalidValueForDate' },
    ];
    for (const { name, input, output } of cases) {
      it(name, async function () {
        @customElement({ name: 'app', template: `<span>\${ dt & df }</span>` })
        class App { private readonly dt = input; }

        const host = DOM.createElement('app');
        await setup(host, new App());
        assertTextContent(host, 'span', output);
      });
    }

    it('respects provided locale and formatting options', async function () {
      @customElement({ name: 'app', template: `<span>\${ dt & df : {year:'2-digit', month:'2-digit', day:'2-digit'} : 'de' }</span>` })
      class App { private readonly dt = new Date(2019, 7, 20); }

      const host = DOM.createElement('app');
      await setup(host, new App());
      assertTextContent(host, 'span', '20.08.19');
    });

    it('works for change of locale', async function () {

      @customElement({ name: 'app', template: `<span>\${ dt & df }</span>` })
      class App { private readonly dt = new Date(2019, 7, 20); }

      const host = DOM.createElement('app');
      const { i18n, ctx } = await setup(host, new App());

      await i18n.setLocale('de');
      ctx.lifecycle.processRAFQueue(LifecycleFlags.none);
      assertTextContent(host, 'span', '20.8.2019');
    });
  });

  describe('`nf` value-converter', function () {

    for (const value of [undefined, null, 'chaos', new Date(), true]) {
      it(`returns the value itself if the value is not a number, for example: ${value}`, async function () {
        @customElement({ name: 'app', template: `<span>\${ num | nf }</span>` })
        class App { private readonly num = value; }

        const host = DOM.createElement('app');
        await setup(host, new App());
        assertTextContent(host, 'span', `${value}`);
      });
    }

    it('formats number by default as per current locale and default formatting options', async function () {
      @customElement({ name: 'app', template: `<span>\${ num | nf }</span>` })
      class App { private readonly num = 123456789.12; }

      const host = DOM.createElement('app');
      await setup(host, new App());
      assertTextContent(host, 'span', '123,456,789.12');
    });

    it('formats a given number as per given formatting options', async function () {
      @customElement({ name: 'app', template: `<span>\${ num | nf : { style: 'currency', currency: 'EUR' } }</span>` })
      class App { private readonly num = 123456789.12; }

      const host = DOM.createElement('app');
      await setup(host, new App());
      assertTextContent(host, 'span', '€123,456,789.12');
    });

    it('formats a given number as per given locale', async function () {
      @customElement({ name: 'app', template: `<span>\${ num | nf : undefined : 'de' }</span>` })
      class App { private readonly num = 123456789.12; }

      const host = DOM.createElement('app');
      await setup(host, new App());
      assertTextContent(host, 'span', '123.456.789,12');
    });

    it('formats a given number as per given locale and formating options', async function () {
      @customElement({ name: 'app', template: `<span>\${ num | nf : { style: 'currency', currency: 'EUR' } : 'de' }</span>` })
      class App { private readonly num = 123456789.12; }

      const host = DOM.createElement('app');
      await setup(host, new App());
      assertTextContent(host, 'span', '123.456.789,12\u00A0€');
    });

    it('works for change of locale', async function () {
      @customElement({ name: 'app', template: `<span>\${ num | nf }</span>` })
      class App { private readonly num = 123456789.12; }

      const host = DOM.createElement('app');
      const { ctx, i18n } = await setup(host, new App());
      await i18n.setLocale('de');
      ctx.lifecycle.processRAFQueue(LifecycleFlags.none);

      assertTextContent(host, 'span', '123.456.789,12');
    });
  });

  describe('`nf` binding-behavior', function () {

    for (const value of [undefined, null, 'chaos', new Date(), true]) {
      it(`returns the value itself if the value is not a number, for example: ${value}`, async function () {
        @customElement({ name: 'app', template: `<span>\${ num & nf }</span>` })
        class App { private readonly num = value; }

        const host = DOM.createElement('app');
        await setup(host, new App());
        assertTextContent(host, 'span', `${value}`);
      });
    }

    it('formats number by default as per current locale and default formatting options', async function () {
      @customElement({ name: 'app', template: `<span>\${ num & nf }</span>` })
      class App { private readonly num = 123456789.12; }

      const host = DOM.createElement('app');
      await setup(host, new App());
      assertTextContent(host, 'span', '123,456,789.12');
    });

    it('formats a given number as per given formatting options', async function () {
      @customElement({ name: 'app', template: `<span>\${ num & nf : { style: 'currency', currency: 'EUR' } }</span>` })
      class App { private readonly num = 123456789.12; }

      const host = DOM.createElement('app');
      await setup(host, new App());
      assertTextContent(host, 'span', '€123,456,789.12');
    });

    it('formats a given number as per given locale', async function () {
      @customElement({ name: 'app', template: `<span>\${ num & nf : undefined : 'de' }</span>` })
      class App { private readonly num = 123456789.12; }

      const host = DOM.createElement('app');
      await setup(host, new App());
      assertTextContent(host, 'span', '123.456.789,12');
    });

    it('formats a given number as per given locale and formating options', async function () {
      @customElement({ name: 'app', template: `<span>\${ num & nf : { style: 'currency', currency: 'EUR' } : 'de' }</span>` })
      class App { private readonly num = 123456789.12; }

      const host = DOM.createElement('app');
      await setup(host, new App());
      assertTextContent(host, 'span', '123.456.789,12\u00A0€');
    });

    it('works for change of locale', async function () {
      @customElement({ name: 'app', template: `<span>\${ num & nf }</span>` })
      class App { private readonly num = 123456789.12; }

      const host = DOM.createElement('app');
      const { ctx, i18n } = await setup(host, new App());
      await i18n.setLocale('de');
      ctx.lifecycle.processRAFQueue(LifecycleFlags.none);

      assertTextContent(host, 'span', '123.456.789,12');
    });
  });

  describe('`rt` value-converter', function () {

    for (const value of [undefined, null, 'chaos', 123, true]) {
      it(`returns the value itself if the value is not a number, for example: ${value}`, async function () {
        @customElement({ name: 'app', template: `<span>\${ dt | rt }</span>` })
        class App { private readonly dt = value; }

        const host = DOM.createElement('app');
        await setup(host, new App());
        assertTextContent(host, 'span', `${value}`);
      });
    }

    it('formats date by default as per current locale and default formatting options', async function () {
      @customElement({ name: 'app', template: `<span>\${ dt | rt }</span>` })
      class App {
        private readonly dt: Date;
        constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }

      const host = DOM.createElement('app');
      await setup(host, new App());
      assertTextContent(host, 'span', '2 hours ago');
    });

    it('formats a given number as per given locale', async function () {
      @customElement({ name: 'app', template: `<span>\${ dt | rt : undefined : 'de' }</span>` })
      class App {
        private readonly dt: Date;
        constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }

      const host = DOM.createElement('app');
      await setup(host, new App());
      assertTextContent(host, 'span', 'vor 2 Stunden');
    });

    it('formats a given number as per given locale and formating options', async function () {
      @customElement({ name: 'app', template: `<span>\${ dt | rt : { style: 'short' } : 'de' }</span>` })
      class App {
        private readonly dt: Date;
        constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }

      const host = DOM.createElement('app');
      await setup(host, new App());
      assertTextContent(host, 'span', 'vor 2 Std.');
    });

    it('works for change of locale', async function () {
      @customElement({ name: 'app', template: `<span>\${ dt | rt }</span>` })
      class App {
        private readonly dt: Date;
        constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }

      const host = DOM.createElement('app');
      const { i18n, ctx } = await setup(host, new App());
      await i18n.setLocale('de');
      ctx.lifecycle.processRAFQueue(LifecycleFlags.none);

      assertTextContent(host, 'span', 'vor 2 Stunden');
    });
  });

  describe('`rt` binding-behavior', function () {

    for (const value of [undefined, null, 'chaos', 123, true]) {
      it(`returns the value itself if the value is not a number, for example: ${value}`, async function () {
        @customElement({ name: 'app', template: `<span>\${ dt & rt }</span>` })
        class App { private readonly dt = value; }

        const host = DOM.createElement('app');
        await setup(host, new App());
        assertTextContent(host, 'span', `${value}`);
      });
    }

    it('formats date by default as per current locale and default formatting options', async function () {
      @customElement({ name: 'app', template: `<span>\${ dt & rt }</span>` })
      class App {
        private readonly dt: Date;
        constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }

      const host = DOM.createElement('app');
      await setup(host, new App());
      assertTextContent(host, 'span', '2 hours ago');
    });

    it('formats a given number as per given locale', async function () {
      @customElement({ name: 'app', template: `<span>\${ dt & rt : undefined : 'de' }</span>` })
      class App {
        private readonly dt: Date;
        constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }

      const host = DOM.createElement('app');
      await setup(host, new App());
      assertTextContent(host, 'span', 'vor 2 Stunden');
    });

    it('formats a given number as per given locale and formating options', async function () {
      @customElement({ name: 'app', template: `<span>\${ dt & rt : { style: 'short' } : 'de' }</span>` })
      class App {
        private readonly dt: Date;
        constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }

      const host = DOM.createElement('app');
      await setup(host, new App());
      assertTextContent(host, 'span', 'vor 2 Std.');
    });

    it('works for change of locale', async function () {
      @customElement({ name: 'app', template: `<span>\${ dt & rt }</span>` })
      class App {
        private readonly dt: Date;
        constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }

      const host = DOM.createElement('app');
      const { i18n, ctx } = await setup(host, new App());
      await i18n.setLocale('de');
      ctx.lifecycle.processRAFQueue(LifecycleFlags.none);

      assertTextContent(host, 'span', 'vor 2 Stunden');
    });
  });

  describe('`skipTranslationOnMissingKey`', function () {
    it('is disabled by default, and the given key is rendered if the key is missing from i18next resource', async function () {
      const key = 'lost-in-translation';
      @customElement({ name: 'app', template: `<span t='${key}'></span>` })
      class App { }

      const host = DOM.createElement('app');
      await setup(host, new App());
      assertTextContent(host, 'span', key);
    });

    it('enables skipping translation when set', async function () {
      const key = 'lost-in-translation', text = 'untranslated text';
      @customElement({ name: 'app', template: `<span t='${key}'>${text}</span>` })
      class App { }

      const host = DOM.createElement('app');
      await setup(host, new App(), undefined, true);
      assertTextContent(host, 'span', text);
    });
  });
});
