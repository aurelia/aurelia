import { I18N, I18nConfiguration, TranslationAttributePattern, TranslationBindAttributePattern, TranslationBindBindingCommand, TranslationBindingCommand, Signals } from '@aurelia/i18n';
import { IRegistration } from '@aurelia/kernel';
import { Aurelia, bindable, customElement, DOM, INode, LifecycleFlags, ISignaler, CustomElement } from '@aurelia/runtime';
import { assert, TestContext } from '@aurelia/testing';

describe('translation-integration', function () {
  // eslint-disable-next-line mocha/no-hooks
  afterEach(function () {
    TranslationBindingCommand.aliases = ['t'];
    TranslationAttributePattern.aliases = ['t'];
    TranslationBindBindingCommand.aliases = ['t'];
    TranslationBindAttributePattern.aliases = ['t'];
  });
  @customElement({ name: 'custom-message', template: `<div>\${message}</div>`, isStrictBinding: true })
  class CustomMessage {
    @bindable public message: string;
  }

  async function setup(host: INode, component: unknown, aliases?: string[], skipTranslationOnMissingKey = false) {
    /* eslint-disable @typescript-eslint/camelcase */
    const translation = {
      simple: {
        text: 'simple text',
        attr: 'simple attribute'
      },
      status: 'status is unknown',
      status_dispatched: 'dispatched on {{date}}',
      status_delivered: 'delivered on {{date}}',
      custom_interpolation_brace: 'delivered on {date}',
      custom_interpolation_es6_syntax: `delivered on \${date}`,

      interpolation_greeting: 'hello {{name}}',

      itemWithCount: '{{count}} item',
      itemWithCount_plural: '{{count}} items',

      html: 'this is a <i>HTML</i> content',
      pre: 'tic ',
      preHtml: '<b>tic</b><span>foo</span> ',
      mid: 'tac',
      midHtml: '<i>tac</i>',
      post: ' toe',
      postHtml: ' <b>toe</b><span>bar</span>',

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
      custom_interpolation_es6_syntax: `geliefert am \${date}`,

      interpolation_greeting: 'Hallo {{name}}',

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
    /* eslint-enable @typescript-eslint/camelcase */
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

    return {
      en: translation, de: deTranslation, container: au.container, i18n, ctx, tearDown: async () => {
        await au.stop().wait();
      }
    };
  }
  function assertTextContent(host: INode, selector: string, translation: string) {
    assert.equal((host as Element).querySelector(selector).textContent, translation);
  }

  it('left the content as-is if empty value is used for translation attribute', async function () {

    @customElement({ name: 'app', template: `<span t=''>The Intouchables</span>`, isStrictBinding: true })
    class App { }

    const host = DOM.createElement('app');
    await setup(host, new App());
    assertTextContent(host, 'span', 'The Intouchables');
  });

  it('works for simple string literal key', async function () {

    @customElement({ name: 'app', template: `<span t='simple.text'></span>`, isStrictBinding: true })
    class App { }

    const host = DOM.createElement('app');
    const { en: translation } = await setup(host, new App());
    assertTextContent(host, 'span', translation.simple.text);
  });

  it('with multiple `t` attribute only the first one is considered', async function () {

    @customElement({ name: 'app', template: `<span t='simple.text' t='simple.attr'></span>`, isStrictBinding: true })
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

    @customElement({ name: 'app', template: `<span t.bind='obj.key'></span>`, isStrictBinding: true })
    class App {
      private readonly obj = { key: 'simple.text' };
    }

    const host = DOM.createElement('app');
    const { en: translation } = await setup(host, new App());
    assertTextContent(host, 'span', translation.simple.text);
  });

  describe('translation can be manipulated by using t-params', function () {
    it('throws error if used without `t` attribute', async function () {

      @customElement({ name: 'app', template: `<span t-params.bind="{context: 'dispatched'}"></span>` })
      class App { }

      const host = DOM.createElement('app');
      try {
        await setup(host, new App());
      } catch (e) {
        assert.equal(e.message, 'key expression is missing');
      }
    });

    async function suiteSetup() {
      @customElement({
        name: 'app', template: `
      <span id="i18n-ctx-vm" t="status" t-params.bind="tParams"></span><br>
      <span id="i18n-ctx-dispatched" t="status" t-params.bind="{context: 'dispatched', date: dispatchedOn}"></span><br>
      <span id="i18n-ctx-delivered" t="status" t-params.bind="{context: 'delivered', date: deliveredOn}"></span><br>

      <span id="i18n-interpolation" t="status_delivered" t-params.bind="{date: deliveredOn}"></span>
      <span id="i18n-interpolation-custom" t="custom_interpolation_brace" t-params.bind="{date: deliveredOn, interpolation: { prefix: '{', suffix: '}' }}"></span>
      <span id="i18n-interpolation-es6" t="custom_interpolation_es6_syntax" t-params.bind="{date: deliveredOn, interpolation: { prefix: '\${', suffix: '}' }}"></span>
      <span id="i18n-interpolation-string-direct" t="interpolation_greeting" t-params.bind="nameParams"></span>
      <span id="i18n-interpolation-string-obj" t="interpolation_greeting" t-params.bind="{name: name}"></span>

      <span id="i18n-items-plural-0"  t="itemWithCount" t-params.bind="{count: 0}"></span>
      <span id="i18n-items-plural-1"  t="itemWithCount" t-params.bind="{count: 1}"></span>
      <span id="i18n-items-plural-10" t="itemWithCount" t-params.bind="{count: 10}"></span>`

      })
      class App {
        public dispatchedOn = new Date(2020, 1, 10, 5, 15);
        public deliveredOn = new Date(2021, 1, 10, 5, 15);
        public tParams = { context: 'dispatched', date: this.dispatchedOn };
        public name = 'john';
        public nameParams = { name: this.name };
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

    it('works when a vm property is bound as t-params and changes', async function () {
      const { host, translation, app } = await suiteSetup();
      assertTextContent(host, '#i18n-ctx-vm', translation.status_dispatched.replace('{{date}}', app.dispatchedOn.toString()));
      app.tParams = { context: 'dispatched', date: new Date(2020, 2, 10, 5, 15) };
      assertTextContent(host, '#i18n-ctx-vm', translation.status_dispatched.replace('{{date}}', app.tParams.date.toString()));
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
      assertTextContent(host, '#i18n-interpolation-es6', translation.custom_interpolation_es6_syntax.replace(`\${date}`, app.deliveredOn.toString()));
    });

    it('works for interpolation when the interpolation changes', async function () {
      const { host, translation, app } = await suiteSetup();
      assertTextContent(host, '#i18n-interpolation', translation.status_delivered.replace('{{date}}', app.deliveredOn.toString()));
      app.deliveredOn = new Date(2022, 1, 10, 5, 15);
      assertTextContent(host, '#i18n-interpolation', translation.status_delivered.replace('{{date}}', app.deliveredOn.toString()));
    });

    it('works for interpolation when a string changes', async function () {
      const { host, translation, app } = await suiteSetup();
      assertTextContent(host, '#i18n-interpolation-string-direct', translation.interpolation_greeting.replace('{{name}}', app.name));
      assertTextContent(host, '#i18n-interpolation-string-obj', translation.interpolation_greeting.replace('{{name}}', app.name));
      app.name = 'Jane';
      app.nameParams = { name: 'Jane' };
      assertTextContent(host, '#i18n-interpolation-string-direct', translation.interpolation_greeting.replace('{{name}}', app.name));
      assertTextContent(host, '#i18n-interpolation-string-obj', translation.interpolation_greeting.replace('{{name}}', app.name));
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

  it('value of last key takes effect if multiple keys target same attribute - t=\'[title]simple.attr;[title]simple.text\'', async function () {

    @customElement({ name: 'app', template: `<span t='[title]simple.attr;[title]simple.text'></span>` })
    class App { }

    const host = DOM.createElement('app');
    const { en: translation } = await setup(host, new App());
    assertTextContent(host, `span[title='${translation.simple.text}']`, '');
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

  it(`works for interpolated keys are used - t="\${obj.key1}"`, async function () {

    @customElement({
      name: 'app', template: `
    <span id='a' t='\${obj.key1}'></span>
    <span id='b' t='[title]\${obj.key2};simple.text'></span>
    <span id='c' t='[title]\${obj.key2};\${obj.key1}'></span>
    <span id='d' t='status_\${status}'></span>
    ` })
    class App {
      private readonly obj = { key1: 'simple.text', key2: 'simple.attr' };
      private readonly status = 'dispatched';
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
    it('works for html content for [prepend] + textContent', async function () {

      @customElement({
        name: 'app', template: `<span t='[prepend]preHtml;[html]mid'></span>`
      })
      class App { }

      const host = DOM.createElement('app');
      await setup(host, new App());

      assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac');
    });
    it('works for html content for [prepend] + innerHtml', async function () {

      @customElement({
        name: 'app', template: `<span t='[prepend]preHtml;[html]midHtml'></span>`
      })
      class App { }

      const host = DOM.createElement('app');
      await setup(host, new App());

      assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> <i>tac</i>');
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
    it('works for html content for [append] + textContent', async function () {

      @customElement({
        name: 'app', template: `<span t='[append]postHtml;[html]mid'></span>`
      })
      class App { }

      const host = DOM.createElement('app');
      await setup(host, new App());

      assert.equal((host as Element).querySelector('span').innerHTML, 'tac <b>toe</b><span>bar</span>');
    });
    it('works for html content for [append]', async function () {

      @customElement({
        name: 'app', template: `<span t='[append]postHtml;[html]midHtml'></span>`
      })
      class App { }

      const host = DOM.createElement('app');
      await setup(host, new App());

      assert.equal((host as Element).querySelector('span').innerHTML, '<i>tac</i> <b>toe</b><span>bar</span>');
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
    it('works for html resource for [prepend] and [append] + textContent', async function () {

      @customElement({
        name: 'app', template: `<span t='[prepend]preHtml;[append]postHtml;mid'></span>`
      })
      class App { }

      const host = DOM.createElement('app');
      await setup(host, new App());

      assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
    });
    it('works for html resource for [prepend] and [append] + innerHtml', async function () {

      @customElement({
        name: 'app', template: `<span t='[prepend]preHtml;[append]postHtml;[html]midHtml'></span>`
      })
      class App { }

      const host = DOM.createElement('app');
      await setup(host, new App());

      assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> <i>tac</i> <b>toe</b><span>bar</span>');
    });

    it('works correctly for html with the change of both [prepend], and [append] - textContent', async function () {

      @customElement({
        name: 'app', template: `<span t.bind='keyExpr'>tac</span>`
      })
      class App {
        public keyExpr: string = '[prepend]preHtml;[append]postHtml';
      }

      const host = DOM.createElement('app');
      const app = new App();
      const { ctx } = await setup(host, app);

      assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
      app.keyExpr = '[prepend]pre;[append]post';

      ctx.scheduler.getRenderTaskQueue().flush();

      assert.equal((host as Element).querySelector('span').innerHTML, 'tic tac toe');
    });
    it('works correctly with the change of both [prepend], and [append] - textContent', async function () {

      @customElement({
        name: 'app', template: `<span t.bind='keyExpr'>tac</span>`
      })
      class App {
        public keyExpr: string = '[prepend]pre;[append]post';
      }

      const host = DOM.createElement('app');
      const app = new App();
      const { ctx } = await setup(host, app);

      assert.equal((host as Element).querySelector('span').innerHTML, 'tic tac toe');
      app.keyExpr = '[prepend]preHtml;[append]postHtml';

      ctx.scheduler.getRenderTaskQueue().flush();

      assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
    });
    it('works correctly with the removal of [append]', async function () {

      @customElement({
        name: 'app', template: `<span t.bind='keyExpr'>tac</span>`
      })
      class App {
        public keyExpr: string = '[prepend]preHtml;[append]postHtml';
      }

      const host = DOM.createElement('app');
      const app = new App();
      const { ctx } = await setup(host, app);

      assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
      app.keyExpr = '[prepend]preHtml';

      ctx.scheduler.getRenderTaskQueue().flush();

      assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac');
    });
    it('works correctly with the removal of [prepend]', async function () {

      @customElement({
        name: 'app', template: `<span t.bind='keyExpr'>tac</span>`
      })
      class App {
        public keyExpr: string = '[prepend]preHtml;[append]postHtml';
      }

      const host = DOM.createElement('app');
      const app = new App();
      const { ctx } = await setup(host, app);

      assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
      app.keyExpr = '[append]postHtml';

      ctx.scheduler.getRenderTaskQueue().flush();

      assert.equal((host as Element).querySelector('span').innerHTML, 'tac <b>toe</b><span>bar</span>');
    });
    it('works correctly with the removal of both [prepend] and [append]', async function () {

      @customElement({
        name: 'app', template: `<span t.bind='keyExpr'>tac</span>`
      })
      class App {
        public keyExpr: string = '[prepend]preHtml;[append]postHtml';
      }

      const host = DOM.createElement('app');
      const app = new App();
      const { ctx } = await setup(host, app);

      assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
      app.keyExpr = '[html]midHtml';

      ctx.scheduler.getRenderTaskQueue().flush();

      assert.equal((host as Element).querySelector('span').innerHTML, '<i>tac</i>');
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
      ctx.scheduler.getRenderTaskQueue().flush();

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
      class App { public key = 'simple.text'; }

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
      ctx.scheduler.getRenderTaskQueue().flush();
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
      class App { public key = 'simple.text'; }

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
      ctx.scheduler.getRenderTaskQueue().flush();

      assertTextContent(host, 'span', de.simple.text);
    });
  });

  describe('`df` value-converter', function () {
    const cases = [
      { name: 'works for date object', input: new Date(2019, 7, 20), output: new Date('8/20/2019').toLocaleDateString() },
      { name: 'works for ISO 8601 date string', input: new Date(2019, 7, 20).toISOString(), output: new Date('8/20/2019').toLocaleDateString() },
      { name: 'works for integer', input: 0, output: new Date(0).toLocaleDateString() },
      { name: 'works for integer string', input: '0', output: new Date(0).toLocaleDateString() },
      { name: 'returns undefined for undefined', input: undefined, output: undefined },
      { name: 'returns null for null', input: null, output: null },
      { name: 'returns empty string for empty string', input: '', output: '' },
      { name: 'returns whitespace for whitespace', input: '  ', output: '  ' },
      { name: 'returns `invalidValueForDate` for `invalidValueForDate`', input: 'invalidValueForDate', output: 'invalidValueForDate' },
    ];
    for (const { name, input, output } of cases) {
      it(`${name} STRICT`, async function () {
        @customElement({ name: `app`, template: `<span>\${ dt | df }</span>`, isStrictBinding: true })
        class App { private readonly dt = input; }

        const host = DOM.createElement('app');
        await setup(host, new App());
        assertTextContent(host, 'span', `${output}`);
      });

      it(name, async function () {
        @customElement({ name: 'app', template: `<span>\${ dt | df }</span>` })
        class App { private readonly dt = input; }

        const host = DOM.createElement('app');
        await setup(host, new App());
        assertTextContent(host, 'span', (output || '').toString());
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
      ctx.scheduler.getRenderTaskQueue().flush();
      assertTextContent(host, 'span', '20.8.2019');
    });

    it('works for change of source value', async function () {

      @customElement({ name: 'app', template: `<span>\${ dt | df }</span>` })
      class App { public dt = new Date(2019, 7, 20); }

      const host = DOM.createElement('app');
      const app = new App();
      const { ctx } = await setup(host, app);

      app.dt = new Date(2019, 7, 21);
      ctx.scheduler.getRenderTaskQueue().flush();
      assertTextContent(host, 'span', '8/21/2019');
    });
  });

  describe('`df` binding-behavior', function () {
    const cases = [
      { name: 'works for date object', input: new Date(2019, 7, 20), output: new Date('8/20/2019').toLocaleDateString() },
      { name: 'works for ISO 8601 date string', input: new Date(2019, 7, 20).toISOString(), output: new Date('8/20/2019').toLocaleDateString() },
      { name: 'works for integer', input: 0, output: new Date(0).toLocaleDateString() },
      { name: 'works for integer string', input: '0', output: new Date(0).toLocaleDateString() },
      { name: 'returns undefined for undefined', input: undefined, output: undefined },
      { name: 'returns null for null', input: null, output: null },
      { name: 'returns empty string for empty string', input: '', output: '' },
      { name: 'returns whitespace for whitespace', input: '  ', output: '  ' },
      { name: 'returns `invalidValueForDate` for `invalidValueForDate`', input: 'invalidValueForDate', output: 'invalidValueForDate' },
    ];
    for (const { name, input, output } of cases) {
      it(`${name} STRICT`, async function () {
        @customElement({ name: 'app', template: `<span>\${ dt & df }</span>`, isStrictBinding: true })
        class App { private readonly dt = input; }

        const host = DOM.createElement('app');
        await setup(host, new App());
        assertTextContent(host, 'span', `${output}`);
      });

      it(name, async function () {
        @customElement({ name: 'app', template: `<span>\${ dt & df }</span>` })
        class App { private readonly dt = input; }

        const host = DOM.createElement('app');
        await setup(host, new App());
        assertTextContent(host, 'span', (output || '').toString());
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
      ctx.scheduler.getRenderTaskQueue().flush();
      assertTextContent(host, 'span', '20.8.2019');
    });

    it('works for change of source value', async function () {

      @customElement({ name: 'app', template: `<span>\${ dt & df }</span>` })
      class App { public dt = new Date(2019, 7, 20); }

      const host = DOM.createElement('app');
      const app = new App();
      const { ctx } = await setup(host, app);

      app.dt = new Date(2019, 7, 21);
      ctx.scheduler.getRenderTaskQueue().flush();
      assertTextContent(host, 'span', '8/21/2019');
    });
  });

  describe('`nf` value-converter', function () {

    for (const value of [undefined, null, 'chaos', new Date(), true]) {
      it(`returns the value itself if the value is not a number STRICT binding, for example: ${value}`, async function () {
        @customElement({ name: 'app', template: `<span>\${ num | nf }</span>`, isStrictBinding: true })
        class App { private readonly num = value; }

        const host = DOM.createElement('app');
        await setup(host, new App());
        assertTextContent(host, 'span', `${value}`);
      });

      it(`returns the value itself if the value is not a number, for example: ${value}`, async function () {
        @customElement({ name: 'app', template: `<span>\${ num | nf }</span>` })
        class App { private readonly num = value; }

        const host = DOM.createElement('app');
        await setup(host, new App());
        assertTextContent(host, 'span', `${value || ''}`);
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
      ctx.scheduler.getRenderTaskQueue().flush();

      assertTextContent(host, 'span', '123.456.789,12');
    });

    it('works for change of source value', async function () {
      @customElement({ name: 'app', template: `<span>\${ num | nf }</span>` })
      class App { public num = 123456789.12; }

      const host = DOM.createElement('app');
      const app = new App();
      const { ctx } = await setup(host, app);
      app.num = 123456789.21;
      ctx.scheduler.getRenderTaskQueue().flush();

      assertTextContent(host, 'span', '123,456,789.21');
    });
  });

  describe('`nf` binding-behavior', function () {

    for (const value of [undefined, null, 'chaos', new Date(), true]) {
      it(`returns the value itself if the value is not a number STRICT binding, for example: ${value}`, async function () {
        @customElement({ name: 'app', template: `<span>\${ num & nf }</span>`, isStrictBinding: true })
        class App { private readonly num = value; }

        const host = DOM.createElement('app');
        await setup(host, new App());
        assertTextContent(host, 'span', `${value}`);
      });

      it(`returns the value itself if the value is not a number, for example: ${value}`, async function () {
        @customElement({ name: 'app', template: `<span>\${ num & nf }</span>` })
        class App { private readonly num = value; }

        const host = DOM.createElement('app');
        await setup(host, new App());
        assertTextContent(host, 'span', `${value || ''}`);
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
      ctx.scheduler.getRenderTaskQueue().flush();

      assertTextContent(host, 'span', '123.456.789,12');
    });

    it('works for change of source value', async function () {
      @customElement({ name: 'app', template: `<span>\${ num & nf }</span>` })
      class App { public num = 123456789.12; }

      const host = DOM.createElement('app');
      const app = new App();
      const { ctx } = await setup(host, app);
      app.num = 123456789.21;
      ctx.scheduler.getRenderTaskQueue().flush();

      assertTextContent(host, 'span', '123,456,789.21');
    });
  });

  describe('`rt` value-converter', function () {

    for (const value of [undefined, null, 'chaos', 123, true]) {
      it(`returns the value itself if the value is not a number STRICT, for example: ${value}`, async function () {
        @customElement({ name: 'app', template: `<span>\${ dt | rt }</span>`, isStrictBinding: true })
        class App { private readonly dt = value; }

        const host = DOM.createElement('app');
        await setup(host, new App());
        assertTextContent(host, 'span', `${value}`);
      });

      it(`returns the value itself if the value is not a number, for example: ${value}`, async function () {
        @customElement({ name: 'app', template: `<span>\${ dt | rt }</span>` })
        class App { private readonly dt = value; }

        const host = DOM.createElement('app');
        await setup(host, new App());
        assertTextContent(host, 'span', `${value || ''}`);
      });
    }

    it('formats date by default as per current locale and default formatting options', async function () {
      @customElement({ name: 'app', template: `<span>\${ dt | rt }</span>` })
      class App {
        private readonly dt: Date;
        public constructor() {
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
        public constructor() {
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
        public constructor() {
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
        public constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }

      const host = DOM.createElement('app');
      const { i18n, ctx } = await setup(host, new App());
      await i18n.setLocale('de');
      ctx.scheduler.getRenderTaskQueue().flush();

      assertTextContent(host, 'span', 'vor 2 Stunden');
    });

    it('works for change of source value', async function () {
      @customElement({ name: 'app', template: `<span>\${ dt | rt }</span>` })
      class App {
        public dt: Date;
        public constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }

      const host = DOM.createElement('app');
      const app = new App();
      const { ctx } = await setup(host, app);
      app.dt = new Date(app.dt.setHours(app.dt.getHours() - 3));

      ctx.scheduler.getRenderTaskQueue().flush();

      assertTextContent(host, 'span', '5 hours ago');
    });

    it('updates formatted value if rt_signal', async function () {
      this.timeout(10000);

      @customElement({ name: 'app', template: `<span>\${ dt | rt }</span>` })
      class App {
        public dt: Date = new Date();
      }

      const host = DOM.createElement('app');
      const app = new App();
      const { ctx } = await setup(host, app);

      await ctx.scheduler.queueMacroTask(delta => {
        ctx.container.get<ISignaler>(ISignaler).dispatchSignal(Signals.RT_SIGNAL);
        ctx.scheduler.getRenderTaskQueue().flush();
        assertTextContent(host, 'span', `${Math.round(delta / 1000)} seconds ago`);
      }, { delay: 3000 }).result;
    });
  });

  describe('`rt` binding-behavior', function () {

    for (const value of [undefined, null, 'chaos', 123, true]) {
      it(`returns the value itself if the value is not a number STRICT binding, for example: ${value}`, async function () {
        const App = CustomElement.define({ name: 'app', template: `<span>\${ dt & rt }</span>`, isStrictBinding: true }, class App { private readonly dt = value; });
        const host = DOM.createElement('app');
        await setup(host, new App());
        assertTextContent(host, 'span', `${value}`);
      });
      it(`returns the value itself if the value is not a number, for example: ${value}`, async function () {
        const App = CustomElement.define({ name: 'app', template: `<span>\${ dt & rt }</span>` }, class App { private readonly dt = value; });
        const host = DOM.createElement('app');
        await setup(host, new App());
        assertTextContent(host, 'span', `${value || ''}`);
      });
    }

    it('formats date by default as per current locale and default formatting options', async function () {
      @customElement({ name: 'app', template: `<span>\${ dt & rt }</span>` })
      class App {
        private readonly dt: Date;
        public constructor() {
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
        public constructor() {
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
        public constructor() {
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
        public constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }

      const host = DOM.createElement('app');
      const { i18n, ctx } = await setup(host, new App());
      await i18n.setLocale('de');
      ctx.scheduler.getRenderTaskQueue().flush();

      assertTextContent(host, 'span', 'vor 2 Stunden');
    });

    it('works for change of source value', async function () {
      @customElement({ name: 'app', template: `<span>\${ dt & rt }</span>` })
      class App {
        public dt: Date;
        public constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }

      const host = DOM.createElement('app');
      const app = new App();
      const { ctx } = await setup(host, app);
      app.dt = new Date(app.dt.setHours(app.dt.getHours() - 3));

      ctx.scheduler.getRenderTaskQueue().flush();

      assertTextContent(host, 'span', '5 hours ago');
    });

    it('updates formatted value if rt_signal', async function () {
      this.timeout(10000);

      @customElement({ name: 'app', template: `<span>\${ dt & rt }</span>` })
      class App {
        public dt: Date = new Date();
      }

      const host = DOM.createElement('app');
      const app = new App();
      const { ctx } = await setup(host, app);

      await ctx.scheduler.queueMacroTask(delta => {
        ctx.container.get<ISignaler>(ISignaler).dispatchSignal(Signals.RT_SIGNAL);
        ctx.scheduler.getRenderTaskQueue().flush();
        assertTextContent(host, 'span', `${Math.round(delta / 1000)} seconds ago`);
      }, { delay: 3000 }).result;
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
