/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { I18N, I18nConfiguration, Signals } from '@aurelia/i18n';
import { Class, IContainer } from '@aurelia/kernel';
import { Aurelia, bindable, customElement, INode, IPlatform, ISignaler } from '@aurelia/runtime-html';
import { assert, PLATFORM, TestContext } from '@aurelia/testing';
import { createSpecFunction, TestExecutionContext, TestFunction } from '../../util.js';

describe('translation-integration', function () {
  @customElement({ name: 'custom-message', template: `<div>\${message}</div>`, isStrictBinding: true })
  class CustomMessage {
    @bindable public message: string;
  }
  @customElement({ name: 'foo-bar', template: `<au-slot><span t="status" t-params.bind="{context: status, date: date}"></span></au-slot>`, isStrictBinding: true })
  class FooBar {
    @bindable public status: string;
    @bindable public date: string;
  }

  interface TestSetupContext<TApp extends any> {
    component: Class<TApp>;
    aliases?: string[];
    skipTranslationOnMissingKey?: boolean;
  }
  class I18nIntegrationTestContext<TApp extends any> implements TestExecutionContext<TApp> {
    public readonly container: IContainer;
    public constructor(
      public readonly en: Record<string, any>,
      public readonly de: Record<string, any>,
      public readonly ctx: TestContext,
      public readonly au: Aurelia,
      public readonly i18n: I18N,
      public readonly host: HTMLElement,
      public readonly error: Error | null,
    ) {
      this.container = au.container;
    }

    public get app(): TApp {
      return this.au.root.controller.viewModel as TApp;
    }

    public get platform(): IPlatform {
      return this.container.get(IPlatform);
    }

    public async teardown() {
      if (this.error === null) {
        await this.au.stop();
      }
    }
  }

  async function runTest<TApp extends any>(
    testFunction: TestFunction<I18nIntegrationTestContext<TApp>>,
    { component, aliases, skipTranslationOnMissingKey = false }: TestSetupContext<TApp>,
  ) {
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
    const ctx = TestContext.create();
    const host = PLATFORM.document.createElement('app');
    const au = new Aurelia(ctx.container).register(
      I18nConfiguration.customize((config) => {
        config.initOptions = {
          resources: { en: { translation }, de: { translation: deTranslation } },
          skipTranslationOnMissingKey
        };
        config.translationAttributeAliases = aliases;
      }));
    const i18n = au.container.get(I18N);
    let error: Error | null = null;
    try {
      await au
        .register(CustomMessage, FooBar)
        .app({ host, component })
        .start();

      await i18n.setLocale('en');
    } catch (e) {
      error = e;
    }

    const testContext = new I18nIntegrationTestContext<TApp>(translation, deTranslation, ctx, au, i18n, host as HTMLElement, error);
    await testFunction(testContext);

    await testContext.teardown();
  }

  const $it = createSpecFunction(runTest);

  function assertTextContent(host: INode, selector: string, translation: string, message?: string) {
    assert.equal((host as Element).querySelector(selector).textContent, translation, message);
  }
  {
    @customElement({ name: 'app', template: `<span t='simple.text'></span>`, isStrictBinding: true })
    class App { }

    $it('works for simple string literal key', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, 'span', translation.simple.text);
    }, { component: App });
  }
  {
    @customElement({
      name: 'app',
      template: `<p t.bind="undef" id="undefined">
        Undefined value
      </p>
      <p t.bind="nullul" id="null">
        Null value
      </p>`,
      isStrictBinding: true
    })
    class App {
      private readonly nullul: null = null;
      private readonly undef: undefined = undefined;
      // private readonly zero: 0 = 0;
    }
    $it('works for null/undefined bound values', function ({ host }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, '#undefined', '');
      assertTextContent(host, '#null', '');
    }, { component: App });
  }
  {

    @customElement({
      name: 'app',
      template: `<p t.bind="undef" id="undefined" t-params.bind="{defaultValue:'foo'}">
      Undefined value
    </p>
    <p t.bind="nullul" id="null" t-params.bind="{defaultValue:'bar'}">
      Null value
    </p>`,
      isStrictBinding: true
    })
    class App {
      private readonly nullul: null = null;
      private readonly undef: undefined = undefined;
      // private readonly zero: 0 = 0;
    }

    $it('works for null/undefined bound values - default value', function ({ host }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, '#undefined', 'foo');
      assertTextContent(host, '#null', 'bar');
    }, { component: App });
  }
  {
    @customElement({
      name: 'app',
      template: `<p t.bind="undef" id="undefined">
      Undefined value
    </p>
    <p t.bind="nullul" id="null">
      Null value
    </p>`,
      isStrictBinding: true
    })
    class App {
      private nullul: string | null = 'simple.text';
      private undef: string | undefined = 'simple.text';

      public changeKey() {
        this.nullul = null;
        this.undef = undefined;
      }
    }

    $it('works if the keyExpression is changed to null/undefined', function ({ host, app, ctx }: I18nIntegrationTestContext<App>) {
      app.changeKey();
      assertTextContent(host, '#undefined', 'simple text', 'changeKey(), before flush');
      assertTextContent(host, '#null', 'simple text', 'changeKey, before flush');
      ctx.platform.domWriteQueue.flush();
      assertTextContent(host, '#undefined', '', 'changeKey() & flush');
      assertTextContent(host, '#null', '', 'changeKey() & flush');
      ctx.platform.domWriteQueue.flush();
      assertTextContent(host, '#undefined', '',  'changeKey() & 2nd flush');
      assertTextContent(host, '#null', '', 'changeKey() & 2nd flush');
    }, { component: App });
  }
  {
    @customElement({
      name: 'app',
      template: `<p t.bind="undef" id="undefined" t-params.bind="{defaultValue:'foo'}">
        Undefined value
      </p>
      <p t.bind="nullul" id="null" t-params.bind="{defaultValue:'bar'}">
        Null value
      </p>`,
      isStrictBinding: true
    })
    class App {
      private nullul: string | null = 'simple.text';
      private undef: string | undefined = 'simple.text';

      public changeKey() {
        this.nullul = null;
        this.undef = undefined;
      }
    }
    $it('works if the keyExpression is changed to null/undefined - default value', function ({ host, app }: I18nIntegrationTestContext<App>) {
      app.changeKey();
      assertTextContent(host, '#undefined', 'foo');
      assertTextContent(host, '#null', 'bar');
    }, { component: App });
  }

  for (const value of [true, false, 0]) {
    @customElement({ name: 'app', template: `<p t.bind="key" id="undefined"></p>`, isStrictBinding: true })
    class App { private readonly key: boolean | number = value; }
    $it(`throws error if the key expression is evaluated to ${value}`, function ({ error }: I18nIntegrationTestContext<App>) {
      assert.match(error?.message, new RegExp(`Expected the i18n key to be a string, but got ${value} of type (boolean|number)`));
    }, { component: App });
  }

  for (const value of [true, false, 0]) {
    @customElement({
      name: 'app',
      template: `<p t.bind="key" id="undefined"></p>`,
      isStrictBinding: true
    })
    class App {
      private key: any = 'simple.text';

      public changeKey() {
        this.key = value;
      }
    }
    $it(`throws error if the key expression is changed to ${value}`, function ({ app }: I18nIntegrationTestContext<App>) {
      try {
        app.changeKey();
      } catch (e) {
        assert.match(e.message, new RegExp(`Expected the i18n key to be a string, but got ${value} of type (boolean|number)`));
      }
    }, { component: App });
  }

  {
    @customElement({ name: 'app', template: `<span t='simple.text' t='simple.attr'></span>`, isStrictBinding: true })
    class App { }

    $it('with multiple `t` attribute only the first one is considered', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, 'span', translation.simple.text);
    }, { component: App });
  }

  {
    @customElement({
      name: 'app', template: `
    <span id='t' t='simple.text'></span>
    <span id='i18n' i18n='simple.text'></span>
    <span id='i18n-bind' i18n.bind='key'></span>
    ` })
    class App { private readonly key: string = 'simple.text'; }
    $it('works with aliases', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, 'span#t', translation.simple.text);
      assertTextContent(host, 'span#i18n', translation.simple.text);
      assertTextContent(host, 'span#i18n-bind', translation.simple.text);
    }, { component: App, aliases: ['t', 'i18n'] });
  }
  {
    @customElement({ name: 'app', template: `<span t.bind='obj.key'></span>`, isStrictBinding: true })
    class App {
      private readonly obj: { key: string } = { key: 'simple.text' };
    }
    $it('works for bound key', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, 'span', translation.simple.text);
    }, { component: App });
  }

  describe('translation can be manipulated by using t-params', function () {
    {
      @customElement({ name: 'app', template: `<span t-params.bind="{context: 'dispatched'}"></span>` })
      class App { }
      $it('throws error if used without `t` attribute', function ({ error }: I18nIntegrationTestContext<App>) {
        assert.equal(error?.message, 'key expression is missing');
      }, { component: App });
    }
    {
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
        public dispatchedOn: Date = new Date(2020, 1, 10, 5, 15);
        public deliveredOn: Date = new Date(2021, 1, 10, 5, 15);
        public tParams: any = { context: 'dispatched', date: this.dispatchedOn };
        public name: string = 'john';
        public nameParams: any = { name: this.name };
      }

      $it('works when a vm property is bound as t-params', function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, '#i18n-ctx-vm', translation.status_dispatched.replace('{{date}}', app.dispatchedOn.toString()));
      }, { component: App });

      $it('works when a vm property is bound as t-params and changes', function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, '#i18n-ctx-vm', translation.status_dispatched.replace('{{date}}', app.dispatchedOn.toString()));
        app.tParams = { context: 'dispatched', date: new Date(2020, 2, 10, 5, 15) };
        assertTextContent(host, '#i18n-ctx-vm', translation.status_dispatched.replace('{{date}}', app.tParams.date.toString()));
      }, { component: App });

      $it('works for context-sensitive translations', function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, '#i18n-ctx-dispatched', translation.status_dispatched.replace('{{date}}', app.dispatchedOn.toString()));
        assertTextContent(host, '#i18n-ctx-delivered', translation.status_delivered.replace('{{date}}', app.deliveredOn.toString()));
      }, { component: App });

      $it('works for interpolation, including custom marker for interpolation placeholder', function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, '#i18n-interpolation', translation.status_delivered.replace('{{date}}', app.deliveredOn.toString()));
        assertTextContent(host, '#i18n-interpolation-custom', translation.custom_interpolation_brace.replace('{date}', app.deliveredOn.toString()));
        assertTextContent(host, '#i18n-interpolation-es6', translation.custom_interpolation_es6_syntax.replace(`\${date}`, app.deliveredOn.toString()));
      }, { component: App });

      $it('works for interpolation when the interpolation changes', function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, '#i18n-interpolation', translation.status_delivered.replace('{{date}}', app.deliveredOn.toString()));
        app.deliveredOn = new Date(2022, 1, 10, 5, 15);
        assertTextContent(host, '#i18n-interpolation', translation.status_delivered.replace('{{date}}', app.deliveredOn.toString()));
      }, { component: App });

      $it('works for interpolation when a string changes', function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, '#i18n-interpolation-string-direct', translation.interpolation_greeting.replace('{{name}}', app.name));
        assertTextContent(host, '#i18n-interpolation-string-obj', translation.interpolation_greeting.replace('{{name}}', app.name));
        app.name = 'Jane';
        app.nameParams = { name: 'Jane' };
        assertTextContent(host, '#i18n-interpolation-string-direct', translation.interpolation_greeting.replace('{{name}}', app.name));
        assertTextContent(host, '#i18n-interpolation-string-obj', translation.interpolation_greeting.replace('{{name}}', app.name));
      }, { component: App });

      $it('works for pluralization', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, '#i18n-items-plural-0', '0 items');
        assertTextContent(host, '#i18n-items-plural-1', '1 item');
        assertTextContent(host, '#i18n-items-plural-10', '10 items');
      }, { component: App });
    }
  });
  {
    @customElement({ name: 'app', template: `<img t='imgPath'></img>` })
    class App { }
    $it('`src` attribute of img element is translated by default', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assert.equal((host as Element).querySelector('img').src.endsWith(translation.imgPath), true);
    }, { component: App });
  }
  {
    @customElement({ name: 'app', template: `<span t='[title]simple.attr'></span>` })
    class App { }
    $it('can translate attributes - t=\'[title]simple.attr\'', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, `span[title='${translation.simple.attr}']`, '');
    }, { component: App });
  }

  {
    @customElement({ name: 'app', template: `<span t='[title]simple.attr;[title]simple.text'></span>` })
    class App { }
    $it('value of last key takes effect if multiple keys target same attribute - t=\'[title]simple.attr;[title]simple.text\'', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, `span[title='${translation.simple.text}']`, '');
    }, { component: App });
  }

  {
    @customElement({ name: 'app', template: `<span t='[title]simple.attr;simple.text'></span>` })
    class App { }
    $it('works for a mixture of attribute targeted key and textContent targeted key - t=\'[title]simple.attr;simple.text\'', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, `span[title='${translation.simple.attr}']`, translation.simple.text);
    }, { component: App });
  }

  {
    @customElement({ name: 'app', template: `<span t='[title,data-foo]simple.attr;simple.text'></span>` })
    class App { }
    $it('works when multiple attributes are targeted by the same key - `t="[title,data-foo]simple.attr;simple.text"`', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, `span[title='${translation.simple.attr}'][data-foo='${translation.simple.attr}']`, translation.simple.text);
    }, { component: App });
  }
  {
    @customElement({
      name: 'app', template: `
    <span id='a' t='\${obj.key1}'></span>
    <span id='b' t='[title]\${obj.key2};simple.text'></span>
    <span id='c' t='[title]\${obj.key2};\${obj.key1}'></span>
    <span id='d' t='status_\${status}'></span>
    ` })
    class App {
      private readonly obj: { key1: string; key2: string } = { key1: 'simple.text', key2: 'simple.attr' };
      private readonly status: string = 'dispatched';
    }
    $it(`works for interpolated keys are used - t="\${obj.key1}"`, function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, `span#a`, translation.simple.text);
      assertTextContent(host, `span#b[title='${translation.simple.attr}']`, translation.simple.text);
      assertTextContent(host, `span#c[title='${translation.simple.attr}']`, translation.simple.text);
      assertTextContent(host, `span#d`, 'dispatched on ');
    }, { component: App });
  }
  {
    @customElement({ name: 'app', template: `<span t="$t(simple.text) $t(simple.attr)"></span>` })
    class App { }
    $it('works nested key - t="$t(simple.text) $t(simple.attr)"', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, `span`, `${translation.simple.text} ${translation.simple.attr}`);
    }, { component: App });
  }
  {
    @customElement({
      name: 'app', template: `
    <span id='a' t.bind='"simple."+"text"'></span>
    <span id='b' t.bind='"simple."+part'></span>
    ` })
    class App {
      private readonly part: string = 'text';
    }
    $it('works for explicit concatenation expression as key - `t.bind="string+string"`', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, `span#a`, translation.simple.text);
      assertTextContent(host, `span#b`, translation.simple.text);
    }, { component: App });
  }
  {
    @customElement({
      name: 'app', template: `<span id='a' t='[text]simple.text'></span>`
    })
    class App { }

    $it('works for textContent replacement with explicit [text] attribute - `t="[text]key"`', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, 'span', translation.simple.text);
    }, { component: App });
  }
  {
    @customElement({
      name: 'app', template: `<span id='a' t='[html]html'></span>`
    })
    class App { }

    $it('works for innerHTML replacement - `t="[html]key"`', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assert.equal((host as Element).querySelector('span').innerHTML, translation.html);
    }, { component: App });
  }

  describe('prepends/appends the translated value to the element content - `t="[prepend]key1;[append]key2"`', function () {
    {
      @customElement({
        name: 'app', template: `<span t='[prepend]pre'>tac</span>`
      })
      class App { }
      $it('works for [prepend] only', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', 'tic tac');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[prepend]pre;mid'></span>`
      })
      class App { }
      $it('works for [prepend] + textContent', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', 'tic tac');
      }, { component: App });
    }

    {
      @customElement({
        name: 'app', template: `<span t='[prepend]pre;[html]midHtml'></span>`
      })
      class App { }
      $it('works for [prepend] + html', function ({ host }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, 'tic <i>tac</i>');
      }, { component: App });
    }

    {
      @customElement({
        name: 'app', template: `<span t='[prepend]preHtml;[html]mid'></span>`
      })
      class App { }
      $it('works for html content for [prepend] + textContent', function ({ host }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac');
      }, { component: App });
    }

    {
      @customElement({
        name: 'app', template: `<span t='[prepend]preHtml;[html]midHtml'></span>`
      })
      class App { }
      $it('works for html content for [prepend] + innerHtml', function ({ host }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> <i>tac</i>');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[append]post'>tac</span>`
      })
      class App { }
      $it('works for [append] only', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', 'tac toe');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[append]post;mid'></span>`
      })
      class App { }
      $it('works for [append] + textContent', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', 'tac toe');
      }, { component: App });
    }

    {
      @customElement({
        name: 'app', template: `<span t='[append]post;[html]midHtml'></span>`
      })
      class App { }
      $it('works for [append] + html', function ({ host }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, '<i>tac</i> toe');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[append]postHtml;[html]mid'></span>`
      })
      class App { }
      $it('works for html content for [append] + textContent', function ({ host }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, 'tac <b>toe</b><span>bar</span>');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[append]postHtml;[html]midHtml'></span>`
      })
      class App { }
      $it('works for html content for [append]', function ({ host }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, '<i>tac</i> <b>toe</b><span>bar</span>');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[prepend]pre;[append]post'>tac</span>`
      })
      class App { }
      $it('works for [prepend] and [append]', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', 'tic tac toe');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[prepend]pre;[append]post;mid'></span>`
      })
      class App { }
      $it('works for [prepend] + [append] + textContent', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', 'tic tac toe');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[prepend]pre;[append]post;[html]midHtml'></span>`
      })
      class App { }
      $it('works for [prepend] + [append] + innerHtml', function ({ host }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, 'tic <i>tac</i> toe');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[prepend]preHtml;[append]postHtml;mid'></span>`
      })
      class App { }
      $it('works for html resource for [prepend] and [append] + textContent', function ({ host }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[prepend]preHtml;[append]postHtml;[html]midHtml'></span>`
      })
      class App { }
      $it('works for html resource for [prepend] and [append] + innerHtml', function ({ host }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> <i>tac</i> <b>toe</b><span>bar</span>');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t.bind='keyExpr'>tac</span>`
      })
      class App {
        public keyExpr: string = '[prepend]preHtml;[append]postHtml';
      }
      $it('works correctly for html with the change of both [prepend], and [append] - textContent', function ({ host, app, platform }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
        app.keyExpr = '[prepend]pre;[append]post';

        platform.domWriteQueue.flush();

        assert.equal((host as Element).querySelector('span').innerHTML, 'tic tac toe');
      }, { component: App });
    }

    {
      @customElement({
        name: 'app', template: `<span t.bind='keyExpr'>tac</span>`
      })
      class App {
        public keyExpr: string = '[prepend]pre;[append]post';
      }
      $it('works correctly with the change of both [prepend], and [append] - textContent', function ({ host, app, platform }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, 'tic tac toe');
        app.keyExpr = '[prepend]preHtml;[append]postHtml';

        platform.domWriteQueue.flush();

        assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t.bind='keyExpr'>tac</span>`
      })
      class App {
        public keyExpr: string = '[prepend]preHtml;[append]postHtml';
      }

      $it('works correctly with the removal of [append]', function ({ host, app, platform }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
        app.keyExpr = '[prepend]preHtml';

        platform.domWriteQueue.flush();

        assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t.bind='keyExpr'>tac</span>`
      })
      class App {
        public keyExpr: string = '[prepend]preHtml;[append]postHtml';
      }
      $it('works correctly with the removal of [prepend]', function ({ host, app, platform }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
        app.keyExpr = '[append]postHtml';

        platform.domWriteQueue.flush();

        assert.equal((host as Element).querySelector('span').innerHTML, 'tac <b>toe</b><span>bar</span>');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t.bind='keyExpr'>tac</span>`
      })
      class App {
        public keyExpr: string = '[prepend]preHtml;[append]postHtml';
      }

      $it('works correctly with the removal of both [prepend] and [append]', function ({ host, app, platform }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
        app.keyExpr = '[html]midHtml';

        platform.domWriteQueue.flush();

        assert.equal((host as Element).querySelector('span').innerHTML, '<i>tac</i>');
      }, { component: App });
    }
  });

  describe('updates translation', function () {
    {
      @customElement({
        name: 'app', template: `<span t='\${obj.key}'></span>`
      })
      class App {
        public obj: { key: string } = { key: 'simple.text' };
      }
      $it('when the key expression changed - interpolation', function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        app.obj.key = 'simple.attr';
        assertTextContent(host, `span`, translation.simple.attr);
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='\${obj.base}\${obj.key}'></span>`
      })
      class App {
        public obj: { base: string; key: string } = { base: 'simple.', key: 'text' };
      }
      $it('when the key expression changed - multi-interpolation', function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, `span`, translation.simple.text);
        app.obj.base = 'simple';
        app.obj.key = '.attr';
        assertTextContent(host, `span`, translation.simple.attr);
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t.bind='obj.key'></span>`
      })
      class App {
        public obj: { key: string } = { key: 'simple.text' };
      }
      $it('when the key expression changed - access-member', function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        app.obj.key = 'simple.attr';
        assertTextContent(host, `span`, translation.simple.attr);
      }, { component: App });
    }

    {
      @customElement({
        name: 'app', template: `<span t="status" t-params.bind="params"></span>`
      })
      class App {
        public deliveredOn: Date = new Date(2021, 1, 10, 5, 15);
        public params: { context: string; date: Date } = { context: 'delivered', date: this.deliveredOn };
      }

      $it('when the translation parameters changed', function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        app.params = { ...app.params, context: 'dispatched' };
        assertTextContent(host, `span`, translation.status_dispatched.replace('{{date}}', app.deliveredOn.toString()));
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span id='a' t='simple.text'></span>`
      })
      class App { }
      $it('when the locale is changed', async function ({ host, de, i18n }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        assertTextContent(host, 'span', de.simple.text);
      }, { component: App });
    }
  });

  describe('works with custom elements', function () {
    {
      @customElement({
        name: 'app', template: `<custom-message t="[message]simple.text"></custom-message>`
      })
      class App { }

      $it('can bind to custom elements attributes', function ({ host, en }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'custom-message div', en.simple.text);
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<custom-message t="[message]itemWithCount" t-params.bind="{count: 0}">`
      })
      class App { }
      $it('should support params', function ({ host, en }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'custom-message div', en.itemWithCount_plural.replace('{{count}}', '0'));
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<custom-message t="[message]simple.text"></custom-message>`
      })
      class App { }
      $it('should support locale changes', async function ({ host, de, i18n, platform }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        platform.domWriteQueue.flush();

        assertTextContent(host, 'custom-message div', de.simple.text);
      }, { component: App });
    }
  });

  describe('`t` value-converter works for', function () {
    {
      @customElement({ name: 'app', template: `<span>\${'simple.text' | t}</span>` })
      class App { }
      $it('key as string literal', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', translation.simple.text);
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${key | t}</span>` })
      class App { public key: string = 'simple.text'; }
      $it('key bound from vm property', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', translation.simple.text);
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${'itemWithCount' | t: {count:10}}</span>` })
      class App { }
      $it('with `t-params`', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', translation.itemWithCount_plural.replace('{{count}}', '10'));
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `
      <span id="a" title.bind="'simple.text' | t">t-vc-attr-target</span>
      <span id="b" title="\${'simple.text' | t}">t-vc-attr-target</span>
      <span id="c" title.bind="'itemWithCount' | t : {count:10}">t-vc-attr-target</span>
      ` })
      class App { }
      $it('attribute translation', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, `span#a[title='${translation.simple.text}']`, 't-vc-attr-target');
        assertTextContent(host, `span#b[title='${translation.simple.text}']`, 't-vc-attr-target');
        assertTextContent(host, `span#c[title='${translation.itemWithCount_plural.replace('{{count}}', '10')}']`, 't-vc-attr-target');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${'simple.text' | t}</span>` })
      class App { }

      $it('change of locale', async function ({ host, de, platform, i18n }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        platform.domWriteQueue.flush();
        assertTextContent(host, 'span', de.simple.text);
      }, { component: App });
    }
  });

  describe('`t` binding-behavior works for', function () {
    {
      @customElement({ name: 'app', template: `<span>\${'simple.text' & t}</span>` })
      class App { }
      $it('key as string literal', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', translation.simple.text);
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${key & t}</span>` })
      class App { public key: string = 'simple.text'; }
      $it('key bound from vm property', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', translation.simple.text);
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${'itemWithCount' & t : {count:10}}</span>` })
      class App { }
      $it('with `t-params`', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', translation.itemWithCount_plural.replace('{{count}}', '10'));
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `
      <span id="a" title.bind="'simple.text' & t">t-vc-attr-target</span>
      <span id="b" title="\${'simple.text' & t}">t-vc-attr-target</span>
      <span id="c" title.bind="'itemWithCount' & t : {count:10}">t-vc-attr-target</span>
      ` })
      class App { }
      $it('attribute translation', function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, `span#a[title='${translation.simple.text}']`, 't-vc-attr-target');
        assertTextContent(host, `span#b[title='${translation.simple.text}']`, 't-vc-attr-target');
        assertTextContent(host, `span#c[title='${translation.itemWithCount_plural.replace('{{count}}', '10')}']`, 't-vc-attr-target');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${'simple.text' & t}</span>` })
      class App { }

      $it('change of locale', async function ({ host, de, platform, i18n }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        platform.domWriteQueue.flush();

        assertTextContent(host, 'span', de.simple.text);
      }, { component: App });
    }
  });

  describe('`df` value-converter', function () {
    const cases = [
      { name: 'works for date object', input: new Date(2019, 7, 20), output: new Date('8/20/2019').toLocaleDateString('en') },
      { name: 'works for ISO 8601 date string', input: new Date(2019, 7, 20).toISOString(), output: new Date('8/20/2019').toLocaleDateString('en') },
      { name: 'works for integer', input: 0, output: new Date(0).toLocaleDateString('en') },
      { name: 'works for integer string', input: '0', output: new Date(0).toLocaleDateString('en') },
      { name: 'returns undefined for undefined', input: undefined, output: undefined },
      { name: 'returns null for null', input: null, output: null },
      { name: 'returns empty string for empty string', input: '', output: '' },
      { name: 'returns whitespace for whitespace', input: '  ', output: '  ' },
      { name: 'returns `invalidValueForDate` for `invalidValueForDate`', input: 'invalidValueForDate', output: 'invalidValueForDate' },
    ];
    for (const { name, input, output } of cases) {
      const baseDef = { name: `app`, template: `<span>\${ dt | df }</span>`, isStrictBinding: true };
      @customElement(baseDef)
      class App { private readonly dt: string | number | Date = input; }
      $it(`${name} STRICT`, function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', `${output}`);
      }, { component: App });

      @customElement({ ...baseDef, isStrictBinding: false })
      class App1 { private readonly dt: string | number | Date = input; }
      $it(name, function ({ host }: I18nIntegrationTestContext<App1>) {
        assertTextContent(host, 'span', (output ?? '').toString());
      }, { component: App1 });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ dt | df : {year:'2-digit', month:'2-digit', day:'2-digit'} : 'de' }</span>` })
      class App { private readonly dt: Date = new Date(2019, 7, 20); }
      $it('respects provided locale and formatting options', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '20.08.19');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ dt | df }</span>` })
      class App { public dt: Date = new Date(2019, 7, 20); }

      $it('works for change of locale', async function ({ host, i18n, platform }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        platform.domWriteQueue.flush();
        assertTextContent(host, 'span', '20.8.2019');
      }, { component: App });

      $it('works for change of source value', function ({ host, platform, app }: I18nIntegrationTestContext<App>) {
        app.dt = new Date(2019, 7, 21);
        platform.domWriteQueue.flush();
        assertTextContent(host, 'span', '8/21/2019');
      }, { component: App });
    }
  });

  describe('`df` binding-behavior', function () {
    const cases = [
      { name: 'works for date object', input: new Date(2019, 7, 20), output: new Date('8/20/2019').toLocaleDateString('en') },
      { name: 'works for ISO 8601 date string', input: new Date(2019, 7, 20).toISOString(), output: new Date('8/20/2019').toLocaleDateString('en') },
      { name: 'works for integer', input: 0, output: new Date(0).toLocaleDateString('en') },
      { name: 'works for integer string', input: '0', output: new Date(0).toLocaleDateString('en') },
      { name: 'returns undefined for undefined', input: undefined, output: undefined },
      { name: 'returns null for null', input: null, output: null },
      { name: 'returns empty string for empty string', input: '', output: '' },
      { name: 'returns whitespace for whitespace', input: '  ', output: '  ' },
      { name: 'returns `invalidValueForDate` for `invalidValueForDate`', input: 'invalidValueForDate', output: 'invalidValueForDate' },
    ];
    for (const { name, input, output } of cases) {
      const baseDef = { name: 'app', template: `<span>\${ dt & df }</span>`, isStrictBinding: true };
      @customElement(baseDef)
      class App { private readonly dt: string | number | Date = input; }
      $it(`${name} STRICT`, function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', `${output}`);
      }, { component: App });

      @customElement({ ...baseDef, isStrictBinding: false })
      class App1 { private readonly dt: string | number | Date = input; }
      $it(name, function ({ host }: I18nIntegrationTestContext<App1>) {
        assertTextContent(host, 'span', (output ?? '').toString());
      }, { component: App1 });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ dt & df : {year:'2-digit', month:'2-digit', day:'2-digit'} : 'de' }</span>` })
      class App { private readonly dt: Date = new Date(2019, 7, 20); }
      $it('respects provided locale and formatting options', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '20.08.19');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ dt & df }</span>` })
      class App { private readonly dt: Date = new Date(2019, 7, 20); }

      $it('works for change of locale', async function ({ host, i18n, platform }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        platform.domWriteQueue.flush();
        assertTextContent(host, 'span', '20.8.2019');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ dt & df }</span>` })
      class App { public dt: Date = new Date(2019, 7, 20); }

      $it('works for change of source value', function ({ host, platform, app }: I18nIntegrationTestContext<App>) {
        app.dt = new Date(2019, 7, 21);
        platform.domWriteQueue.flush();
        assertTextContent(host, 'span', '8/21/2019');
      }, { component: App });
    }
  });

  describe('`nf` value-converter', function () {

    const def = { name: 'app', template: `<span>\${ num | nf }</span>` };
    const strictDef = { ...def, isStrictBinding: true };
    for (const value of [undefined, null, 'chaos', new Date(), true]) {
      @customElement(strictDef)
      class App { private readonly num: string | boolean | Date = value; }

      $it(`returns the value itself if the value is not a number STRICT binding, for example: ${value}`, function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', `${value}`);
      }, { component: App });

      @customElement(def)
      class App1 { private readonly num: string | boolean | Date = value; }
      $it(`returns the value itself if the value is not a number, for example: ${value}`, function ({ host }: I18nIntegrationTestContext<App1>) {
        assertTextContent(host, 'span', `${value ?? ''}`);
      }, { component: App1 });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num | nf }</span>` })
      class App { public num: number = 123456789.12; }
      $it('formats number by default as per current locale and default formatting options', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '123,456,789.12');
      }, { component: App });

      $it('works for change of locale', async function ({ host, i18n, platform }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        platform.domWriteQueue.flush();

        assertTextContent(host, 'span', '123.456.789,12');
      }, { component: App });

      $it('works for change of source value', function ({ host, platform, app }: I18nIntegrationTestContext<App>) {
        app.num = 123456789.21;
        platform.domWriteQueue.flush();

        assertTextContent(host, 'span', '123,456,789.21');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num | nf : { style: 'currency', currency: 'EUR' } }</span>` })
      class App { private readonly num: number = 123456789.12; }
      $it('formats a given number as per given formatting options', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '€123,456,789.12');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num | nf : undefined : 'de' }</span>` })
      class App { private readonly num: number = 123456789.12; }
      $it('formats a given number as per given locale', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '123.456.789,12');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num | nf : { style: 'currency', currency: 'EUR' } : 'de' }</span>` })
      class App { private readonly num: number = 123456789.12; }
      $it('formats a given number as per given locale and formatting options', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '123.456.789,12\u00A0€');
      }, { component: App });
    }
  });

  describe('`nf` binding-behavior', function () {

    const def = { name: 'app', template: `<span>\${ num & nf }</span>` };
    const strictDef = { ...def, isStrictBinding: true };
    for (const value of [undefined, null, 'chaos', new Date(), true]) {
      @customElement(strictDef)
      class App { private readonly num: string | boolean | Date = value; }
      $it(`returns the value itself if the value is not a number STRICT binding, for example: ${value}`, function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', `${value}`);
      }, { component: App });

      @customElement(def)
      class App1 { private readonly num: string | boolean | Date = value; }
      $it(`returns the value itself if the value is not a number, for example: ${value}`, function ({ host }: I18nIntegrationTestContext<App1>) {
        assertTextContent(host, 'span', `${value ?? ''}`);
      }, { component: App1 });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num & nf }</span>` })
      class App { private readonly num: number = 123456789.12; }
      $it('formats number by default as per current locale and default formatting options', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '123,456,789.12');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num & nf : { style: 'currency', currency: 'EUR' } }</span>` })
      class App { private readonly num: number = 123456789.12; }
      $it('formats a given number as per given formatting options', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '€123,456,789.12');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num & nf : undefined : 'de' }</span>` })
      class App { private readonly num: number = 123456789.12; }
      $it('formats a given number as per given locale', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '123.456.789,12');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num & nf : { style: 'currency', currency: 'EUR' } : 'de' }</span>` })
      class App { private readonly num: number = 123456789.12; }
      $it('formats a given number as per given locale and formating options', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '123.456.789,12\u00A0€');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num & nf }</span>` })
      class App { private readonly num: number = 123456789.12; }

      $it('works for change of locale', async function ({ host, i18n, platform }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        platform.domWriteQueue.flush();
        assertTextContent(host, 'span', '123.456.789,12');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num & nf }</span>` })
      class App { public num: number = 123456789.12; }

      $it('works for change of source value', function ({ host, app, platform }: I18nIntegrationTestContext<App>) {
        app.num = 123456789.21;
        platform.domWriteQueue.flush();

        assertTextContent(host, 'span', '123,456,789.21');
      }, { component: App });
    }
  });

  describe('`rt` value-converter', function () {

    for (const value of [undefined, null, 'chaos', 123, true]) {
      const def = { name: 'app', template: `<span>\${ dt | rt }</span>` };
      const strictDef = { ...def, isStrictBinding: true };
      @customElement(strictDef)
      class App { private readonly dt: string | number | boolean = value; }
      $it(`returns the value itself if the value is not a number STRICT, for example: ${value}`, function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', `${value}`);
      }, { component: App });

      @customElement(def)
      class App1 { private readonly dt: string | number | boolean = value; }
      $it(`returns the value itself if the value is not a number, for example: ${value}`, function ({ host }: I18nIntegrationTestContext<App1>) {
        assertTextContent(host, 'span', `${value ?? ''}`);
      }, { component: App1 });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ dt | rt }</span>` })
      class App {
        private readonly dt: Date;
        public constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }
      $it('formats date by default as per current locale and default formatting options', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '2 hours ago');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ dt | rt : undefined : 'de' }</span>` })
      class App {
        private readonly dt: Date;
        public constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }
      $it('formats a given number as per given locale', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', 'vor 2 Stunden');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ dt | rt : { style: 'short' } : 'de' }</span>` })
      class App {
        private readonly dt: Date;
        public constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }
      $it('formats a given number as per given locale and formating options', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', 'vor 2 Std.');
      }, { component: App });
    }

    {
      @customElement({ name: 'app', template: `<span>\${ dt | rt }</span>` })
      class App {
        private readonly dt: Date;
        public constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }

      $it('works for change of locale', async function ({ host, i18n, platform }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        platform.domWriteQueue.flush();

        assertTextContent(host, 'span', 'vor 2 Stunden');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ dt | rt }</span>` })
      class App {
        public dt: Date;
        public constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }

      $it('works for change of source value', function ({ host, platform, app }: I18nIntegrationTestContext<App>) {
        app.dt = new Date(app.dt.setHours(app.dt.getHours() - 3));

        platform.domWriteQueue.flush();

        assertTextContent(host, 'span', '5 hours ago');
      }, { component: App });
    }

    it('updates formatted value if rt_signal', async function () {
      this.timeout(10000);
      const offset = 2000; // reduce the amount of time the test takes to run

      @customElement({ name: 'app', template: `<span>\${ dt | rt }</span>` })
      class App {
        public dt: Date = new Date(Date.now() - offset);
      }

      await runTest(
        async function ({ platform, host, container }) {
          await platform.taskQueue.queueTask(delta => {
            container.get<ISignaler>(ISignaler).dispatchSignal(Signals.RT_SIGNAL);
            platform.domWriteQueue.flush();
            assertTextContent(host, 'span', `${Math.round((delta + offset) / 1000)} seconds ago`);
          }, { delay: 1000 }).result;
        },
        { component: App });
    });
  });

  describe('`rt` binding-behavior', function () {

    const def = { name: 'app', template: `<span>\${ dt & rt }</span>` };
    const strictDef = { ...def, isStrictBinding: true };

    for (const value of [undefined, null, 'chaos', 123, true]) {
      @customElement(strictDef)
      class App { private readonly dt: string | number | boolean = value; }
      $it(`returns the value itself if the value is not a number STRICT binding, for example: ${value}`, function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', `${value}`);
      }, { component: App });

      @customElement(def)
      class App1 { private readonly dt: string | number | boolean = value; }
      $it(`returns the value itself if the value is not a number, for example: ${value}`, function ({ host }: I18nIntegrationTestContext<App1>) {
        assertTextContent(host, 'span', `${value ?? ''}`);
      }, { component: App1 });
    }
    {
      @customElement(def)
      class App {
        private readonly dt: Date;
        public constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }
      $it('formats date by default as per current locale and default formatting options', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '2 hours ago');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ dt & rt : undefined : 'de' }</span>` })
      class App {
        private readonly dt: Date;
        public constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }
      $it('formats a given number as per given locale', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', 'vor 2 Stunden');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ dt & rt : { style: 'short' } : 'de' }</span>` })
      class App {
        private readonly dt: Date;
        public constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }
      $it('formats a given number as per given locale and formating options', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', 'vor 2 Std.');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ dt & rt }</span>` })
      class App {
        private readonly dt: Date;
        public constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }

      $it('works for change of locale', async function ({ host, i18n, platform }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        platform.domWriteQueue.flush();

        assertTextContent(host, 'span', 'vor 2 Stunden');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ dt & rt }</span>` })
      class App {
        public dt: Date;
        public constructor() {
          this.dt = new Date();
          this.dt.setHours(this.dt.getHours() - 2);
        }
      }

      $it('works for change of source value', function ({ host, platform, app }: I18nIntegrationTestContext<App>) {
        app.dt = new Date(app.dt.setHours(app.dt.getHours() - 3));

        platform.domWriteQueue.flush();

        assertTextContent(host, 'span', '5 hours ago');
      }, { component: App });
    }

    it('updates formatted value if rt_signal', async function () {
      this.timeout(10000);
      const offset = 2000; // reduce the amount of time the test takes to run

      @customElement({ name: 'app', template: `<span>\${ dt & rt }</span>` })
      class App {
        public dt: Date = new Date(Date.now() - offset);
      }

      await runTest(
        async function ({ host, platform, container }: I18nIntegrationTestContext<App>) {
          await platform.taskQueue.queueTask(delta => {
            container.get<ISignaler>(ISignaler).dispatchSignal(Signals.RT_SIGNAL);
            platform.domWriteQueue.flush();
            assertTextContent(host, 'span', `${Math.round((delta + offset) / 1000)} seconds ago`);
          }, { delay: 1000 }).result;
        },
        { component: App });
    });
  });

  describe('`skipTranslationOnMissingKey`', function () {
    {
      const key = 'lost-in-translation';
      @customElement({ name: 'app', template: `<span t='${key}'></span>` })
      class App { }
      $it('is disabled by default, and the given key is rendered if the key is missing from i18next resource', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', key);
      }, { component: App });
    }
    {
      const key = 'lost-in-translation', text = 'untranslated text';
      @customElement({ name: 'app', template: `<span t='${key}'>${text}</span>` })
      class App { }
      $it('enables skipping translation when set', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', text);
      }, { component: App, skipTranslationOnMissingKey: true });
    }
  });

  describe('works with au-slot', function () {
    {
      @customElement({ name: 'app', template: `<foo-bar status="delivered" date="1971-12-25"></foo-bar>`, isStrictBinding: true })
      class App { }
      $it('w/o projection', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', 'delivered on 1971-12-25');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<foo-bar status="delivered" date="1971-12-25"><div au-slot t="status" t-params.bind="{context: status, date: date}"></div></foo-bar>`, isStrictBinding: true })
      class App {
        private readonly status: string = 'dispatched';
        private readonly date: string = '1972-12-26';
      }
      $it('with projection', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'div', 'dispatched on 1972-12-26');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<foo-bar status="delivered" date="1971-12-25"><div au-slot t="status" t-params.bind="{context: status, date: $host.date}"></div></foo-bar>`, isStrictBinding: true })
      class App {
        private readonly status: string = 'dispatched';
        private readonly date: string = '1972-12-26';
      }
      $it('with projection - mixed', function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'div', 'dispatched on 1971-12-25');
      }, { component: App });
    }

  });
});
