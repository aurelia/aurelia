import { I18N, I18nConfiguration, Signals } from '@aurelia/i18n';
import { Class, IContainer } from '@aurelia/kernel';
import { ISignaler, Aurelia, bindable, customElement, INode, IPlatform } from '@aurelia/runtime-html';
import { queueAsyncTask, runTasks, tasksSettled } from '@aurelia/runtime';
import { assert, PLATFORM, TestContext } from '@aurelia/testing';
import { createSpecFunction, TestExecutionContext, TestFunction } from '../../util.js';

describe('i18n/t/translation-integration.spec.ts', function () {
  @customElement({ name: 'custom-message', template: `<div>\${message}</div>` })
  class CustomMessage {
    @bindable public message: string;
  }
  @customElement({ name: 'camel-ce', template: `<div>\${someMessage}</div>` })
  class CeWithCamelCaseBindable {
    @bindable public someMessage: string;
  }
  @customElement({ name: 'foo-bar', template: `<au-slot><span t="status" t-params.bind="{context: status, date: date}"></span></au-slot>` })
  class FooBar {
    @bindable public status: string;
    @bindable public date: string;
  }

  interface TestSetupContext<TApp> {
    component: Class<TApp>;
    aliases?: string[];
    skipTranslationOnMissingKey?: boolean;
  }
  class I18nIntegrationTestContext<TApp> implements TestExecutionContext<TApp> {
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

  async function runTest<TApp>(
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
      itemWithCount_other: '{{count}} items',

      html: 'this is a <i>HTML</i> content',
      pre: 'tic ',
      preHtml: '<b>tic</b><span>foo</span> ',
      mid: 'tac',
      midHtml: '<i>tac</i>',
      post: ' toe',
      postHtml: ' <b>toe</b><span>bar</span>',

      imgPath: 'foo.jpg',

      projectedContent: 'content',

      firstandMore: '{{firstItem}} and {{restCount}} more',
    };
    const deTranslation = {
      simple: {
        text: 'Einfacher Text',
        attr: 'Einfaches Attribut'
      },

      status: 'Status ist unbekannt',
      status_dispatched: 'Versand am {{datetime}}',
      status_delivered: 'geliefert am {{date}}',
      custom_interpolation_brace: 'geliefert am {date}',
      custom_interpolation_es6_syntax: `geliefert am \${date}`,

      interpolation_greeting: 'Hallo {{name}}',

      itemWithCount: '{{count}} Artikel',
      itemWithCount_other: '{{count}} Artikel',
      itemWithCount_interval: '(0)$t(itemWithCount_other);(1)$t(itemWithCount);(2-7)$t(itemWithCount_other);(7-inf){viele Artikel};',

      html: 'Dies ist ein <i>HTML</i> Inhalt',
      pre: 'Tic ',
      mid: 'Tac',
      midHtml: '<i>Tac</i>',
      post: ' Toe',

      imgPath: 'bar.jpg',

      projectedContent: 'Inhalt',
      firstandMore: '{{firstItem}} und {{restCount}} mehr',
    };
    const ctx = TestContext.create();
    const host = PLATFORM.document.createElement('app');
    const au = new Aurelia(ctx.container).register(
      I18nConfiguration.customize((config) => {
        config.initOptions = {
          resources: { en: { translation }, de: { translation: deTranslation } },
          skipTranslationOnMissingKey,
        };
        config.translationAttributeAliases = aliases;
      }));
    const i18n = au.container.get(I18N);
    let error: Error | null = null;
    try {
      await au
        .register(CustomMessage, CeWithCamelCaseBindable, FooBar)
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
    @customElement({ name: 'app', template: `<span t='simple.text'></span>` })
    class App { }

    $it('works for simple string literal key', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
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
    })
    class App {
      private readonly nullul: null = null;
      private readonly undef: undefined = undefined;
      // private readonly zero: 0 = 0;
    }
    $it('works for null/undefined bound values', async function ({ host }: I18nIntegrationTestContext<App>) {
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
    })
    class App {
      private readonly nullul: null = null;
      private readonly undef: undefined = undefined;
      // private readonly zero: 0 = 0;
    }

    $it('works for null/undefined bound values - default value', async function ({ host }: I18nIntegrationTestContext<App>) {
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
    })
    class App {
      private nullul: string | null = 'simple.text';
      private undef: string | undefined = 'simple.text';

      public changeKey() {
        this.nullul = null;
        this.undef = undefined;
      }
    }

    $it('works if the keyExpression is changed to null/undefined', async function ({ host, app }: I18nIntegrationTestContext<App>) {
      app.changeKey();
      assertTextContent(host, '#undefined', 'simple text', 'changeKey(), before flush');
      assertTextContent(host, '#null', 'simple text', 'changeKey, before flush');
      await tasksSettled();
      assertTextContent(host, '#undefined', '', 'changeKey() & flush');
      assertTextContent(host, '#null', '', 'changeKey() & flush');
      await tasksSettled();
      assertTextContent(host, '#undefined', '', 'changeKey() & 2nd flush');
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
    })
    class App {
      private nullul: string | null = 'simple.text';
      private undef: string | undefined = 'simple.text';

      public changeKey() {
        this.nullul = null;
        this.undef = undefined;
      }
    }
    $it('works if the keyExpression is changed to null/undefined - default value', async function ({ host, app }: I18nIntegrationTestContext<App>) {
      app.changeKey();
      assertTextContent(host, '#undefined', 'simple text', 'changeKey(), before flush');
      assertTextContent(host, '#null', 'simple text', 'changeKey, before flush');
      await tasksSettled();
      assertTextContent(host, '#undefined', 'foo');
      assertTextContent(host, '#null', 'bar');
    }, { component: App });
  }

  for (const value of [true, false, 0]) {
    @customElement({ name: 'app', template: `<p t.bind="key" id="undefined"></p>` })
    class App { private readonly key: boolean | number = value; }
    $it(`throws error if the key expression is evaluated to ${value}`, async function ({ error }: I18nIntegrationTestContext<App>) {
      assert.match(error?.message, /AUR4002/);
    }, { component: App });
  }

  for (const value of [true, false, 0]) {
    @customElement({
      name: 'app',
      template: `<p t.bind="key" id="undefined"></p>`,
    })
    class App {
      private key: any = 'simple.text';

      public changeKey() {
        this.key = value;
      }
    }
    $it(`throws error if the key expression is changed to ${value}`, async function ({ app }: I18nIntegrationTestContext<App>) {
      try {
        app.changeKey();
      } catch (e) {
        assert.match(e.message, /AUR4002/);
      }
    }, { component: App });
  }

  {
    @customElement({ name: 'app', template: `<span t='simple.text' t='simple.attr'></span>` })
    class App { }

    $it('with multiple `t` attribute only the first one is considered', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
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
    $it('works with aliases', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, 'span#t', translation.simple.text);
      assertTextContent(host, 'span#i18n', translation.simple.text);
      assertTextContent(host, 'span#i18n-bind', translation.simple.text);
    }, { component: App, aliases: ['t', 'i18n'] });
  }
  {
    @customElement({ name: 'app', template: `<span t.bind='obj.key'></span>` })
    class App {
      private readonly obj: { key: string } = { key: 'simple.text' };
    }
    $it('works for bound key', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, 'span', translation.simple.text);
    }, { component: App });
  }
  {
    @customElement({ name: 'app', template: `<span if.bind='obj.condition'><span t.bind='obj.key'></span></span>` })
    class App {
      public obj: { key: string; condition: boolean } = { key: 'simple.text', condition: true };

      public changeCondition() {
        this.obj = { key: 'simple.text', condition: false };
      }
    }
    $it('does not throw AUR0203 when handleChange is called after unbind in if.bind/t.bind scenario', function ({ host, app, ctx, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, 'span > span', translation.simple.text, 'initial rendering');
      assert.doesNotThrow(() => {
        app.changeCondition();
        runTasks();
        app.obj.key = 'simple.attr';
        runTasks();
      }, 'AUR0203 error should not be thrown');
      assert.equal((host as Element).querySelector('span > span'), null, 'inner span removed after unbind');
      app.obj.condition = true;
      runTasks();
      assertTextContent(host, 'span > span', translation.simple.attr, 'final rendering');
    }, { component: App });
  }

  describe('translation can be manipulated by using t-params', function () {
    {
      @customElement({ name: 'app', template: `<span t-params.bind="{context: 'dispatched'}"></span>` })
      class App { }
      $it('throws error if used without `t` attribute', async function ({ error }: I18nIntegrationTestContext<App>) {
        assert.includes(error?.message, 'AUR4000');
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

      $it('works when a vm property is bound as t-params', async function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, '#i18n-ctx-vm', translation.status_dispatched.replace('{{date}}', app.dispatchedOn.toString()));
      }, { component: App });

      $it('works when a vm property is bound as t-params and changes', async function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        const currDate = app.dispatchedOn;
        assertTextContent(host, '#i18n-ctx-vm', translation.status_dispatched.replace('{{date}}', currDate.toString()), 'before change t-params');
        app.tParams = { context: 'dispatched', date: new Date(2020, 2, 10, 5, 15) };
        assertTextContent(host, '#i18n-ctx-vm', translation.status_dispatched.replace('{{date}}', currDate.toString()), 'after change t-params, before flush');
        await tasksSettled();
        assertTextContent(host, '#i18n-ctx-vm', translation.status_dispatched.replace('{{date}}', app.tParams.date.toString()), 'after change t-params & flush');
      }, { component: App });

      $it('works for context-sensitive translations', async function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, '#i18n-ctx-dispatched', translation.status_dispatched.replace('{{date}}', app.dispatchedOn.toString()));
        assertTextContent(host, '#i18n-ctx-delivered', translation.status_delivered.replace('{{date}}', app.deliveredOn.toString()));
      }, { component: App });

      $it('works for interpolation, including custom marker for interpolation placeholder', async function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, '#i18n-interpolation', translation.status_delivered.replace('{{date}}', app.deliveredOn.toString()));
        assertTextContent(host, '#i18n-interpolation-custom', translation.custom_interpolation_brace.replace('{date}', app.deliveredOn.toString()));
        assertTextContent(host, '#i18n-interpolation-es6', translation.custom_interpolation_es6_syntax.replace(`\${date}`, app.deliveredOn.toString()));
      }, { component: App });

      $it('works for interpolation when the interpolation changes', async function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        const currDate = app.deliveredOn;
        assertTextContent(host, '#i18n-interpolation', translation.status_delivered.replace('{{date}}', currDate.toString()), 'before change');
        app.deliveredOn = new Date(2022, 1, 10, 5, 15);
        assertTextContent(host, '#i18n-interpolation', translation.status_delivered.replace('{{date}}', currDate.toString()), 'after change, before flush');
        await tasksSettled();
        assertTextContent(host, '#i18n-interpolation', translation.status_delivered.replace('{{date}}', app.deliveredOn.toString()));
      }, { component: App });

      $it('works for interpolation when a string changes', async function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, '#i18n-interpolation-string-direct', translation.interpolation_greeting.replace('{{name}}', app.name));
        assertTextContent(host, '#i18n-interpolation-string-obj', translation.interpolation_greeting.replace('{{name}}', app.name));
        const currName = app.name;
        app.name = 'Jane';
        app.nameParams = { name: 'Jane' };
        assertTextContent(host, '#i18n-interpolation-string-direct', translation.interpolation_greeting.replace('{{name}}', currName));
        assertTextContent(host, '#i18n-interpolation-string-obj', translation.interpolation_greeting.replace('{{name}}', currName));
        await tasksSettled();
        assertTextContent(host, '#i18n-interpolation-string-direct', translation.interpolation_greeting.replace('{{name}}', 'Jane'));
        assertTextContent(host, '#i18n-interpolation-string-obj', translation.interpolation_greeting.replace('{{name}}', 'Jane'));
      }, { component: App });

      $it('works for pluralization', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, '#i18n-items-plural-0', '0 items');
        assertTextContent(host, '#i18n-items-plural-1', '1 item');
        assertTextContent(host, '#i18n-items-plural-10', '10 items');
      }, { component: App });
    }
  });
  {
    @customElement({ name: 'app', template: `<img t='imgPath'></img>` })
    class App { }
    $it('`src` attribute of img element is translated by default', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assert.equal((host as Element).querySelector('img').src.endsWith(translation.imgPath), true);
    }, { component: App });
  }
  {
    @customElement({ name: 'app', template: `<span t='[title]simple.attr'></span>` })
    class App { }
    $it('can translate attributes - t=\'[title]simple.attr\'', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, `span[title='${translation.simple.attr}']`, '');
    }, { component: App });
  }

  {
    @customElement({ name: 'app', template: `<span t='[title]simple.attr;[title]simple.text'></span>` })
    class App { }
    $it('value of last key takes effect if multiple keys target same attribute - t=\'[title]simple.attr;[title]simple.text\'', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, `span[title='${translation.simple.text}']`, '');
    }, { component: App });
  }

  {
    @customElement({ name: 'app', template: `<span t='[title]simple.attr;simple.text'></span>` })
    class App { }
    $it('works for a mixture of attribute targeted key and textContent targeted key - t=\'[title]simple.attr;simple.text\'', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, `span[title='${translation.simple.attr}']`, translation.simple.text);
    }, { component: App });
  }

  {
    @customElement({ name: 'app', template: `<span t='[title,data-foo]simple.attr;simple.text'></span>` })
    class App { }
    $it('works when multiple attributes are targeted by the same key - `t="[title,data-foo]simple.attr;simple.text"`', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
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
    $it(`works for interpolated keys are used - t="\${obj.key1}"`, async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, `span#a`, translation.simple.text);
      assertTextContent(host, `span#b[title='${translation.simple.attr}']`, translation.simple.text);
      assertTextContent(host, `span#c[title='${translation.simple.attr}']`, translation.simple.text);
      // v20 and before of i18next, non existing params will be relaced with empty string
      // though it seems v21+ is leaving it as is
      // so the next assertion works with before, now it doesn't
      //
      // assertTextContent(host, `span#d`, 'dispatched on ');
      assertTextContent(host, `span#d`, 'dispatched on {{date}}');
    }, { component: App });
  }
  {
    @customElement({ name: 'app', template: `<span t="$t(simple.text) $t(simple.attr)"></span>` })
    class App { }
    $it('works nested key - t="$t(simple.text) $t(simple.attr)"', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
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
    $it('works for explicit concatenation expression as key - `t.bind="string+string"`', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, `span#a`, translation.simple.text);
      assertTextContent(host, `span#b`, translation.simple.text);
    }, { component: App });
  }
  {
    @customElement({
      name: 'app', template: `<span id='a' t='[text]simple.text'></span>`
    })
    class App { }

    $it('works for textContent replacement with explicit [text] attribute - `t="[text]key"`', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assertTextContent(host, 'span', translation.simple.text);
    }, { component: App });
  }
  {
    @customElement({
      name: 'app', template: `<span id='a' t='[html]html'></span>`
    })
    class App { }

    $it('works for innerHTML replacement - `t="[html]key"`', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
      assert.equal((host as Element).querySelector('span').innerHTML, translation.html);
    }, { component: App });
  }

  describe('prepends/appends the translated value to the element content - `t="[prepend]key1;[append]key2"`', function () {
    {
      @customElement({
        name: 'app', template: `<span t='[prepend]pre'>tac</span>`
      })
      class App { }
      $it('works for [prepend] only', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', 'tic tac');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[prepend]pre;mid'></span>`
      })
      class App { }
      $it('works for [prepend] + textContent', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', 'tic tac');
      }, { component: App });
    }

    {
      @customElement({
        name: 'app', template: `<span t='[prepend]pre;[html]midHtml'></span>`
      })
      class App { }
      $it('works for [prepend] + html', async function ({ host }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, 'tic <i>tac</i>');
      }, { component: App });
    }

    {
      @customElement({
        name: 'app', template: `<span t='[prepend]preHtml;[html]mid'></span>`
      })
      class App { }
      $it('works for html content for [prepend] + textContent', async function ({ host }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac');
      }, { component: App });
    }

    {
      @customElement({
        name: 'app', template: `<span t='[prepend]preHtml;[html]midHtml'></span>`
      })
      class App { }
      $it('works for html content for [prepend] + innerHtml', async function ({ host }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> <i>tac</i>');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[append]post'>tac</span>`
      })
      class App { }
      $it('works for [append] only', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', 'tac toe');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[append]post;mid'></span>`
      })
      class App { }
      $it('works for [append] + textContent', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', 'tac toe');
      }, { component: App });
    }

    {
      @customElement({
        name: 'app', template: `<span t='[append]post;[html]midHtml'></span>`
      })
      class App { }
      $it('works for [append] + html', async function ({ host }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, '<i>tac</i> toe');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[append]postHtml;[html]mid'></span>`
      })
      class App { }
      $it('works for html content for [append] + textContent', async function ({ host }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, 'tac <b>toe</b><span>bar</span>');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[append]postHtml;[html]midHtml'></span>`
      })
      class App { }
      $it('works for html content for [append]', async function ({ host }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, '<i>tac</i> <b>toe</b><span>bar</span>');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[prepend]pre;[append]post'>tac</span>`
      })
      class App { }
      $it('works for [prepend] and [append]', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', 'tic tac toe');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[prepend]pre;[append]post;mid'></span>`
      })
      class App { }
      $it('works for [prepend] + [append] + textContent', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', 'tic tac toe');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[prepend]pre;[append]post;[html]midHtml'></span>`
      })
      class App { }
      $it('works for [prepend] + [append] + innerHtml', async function ({ host }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, 'tic <i>tac</i> toe');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[prepend]preHtml;[append]postHtml;mid'></span>`
      })
      class App { }
      $it('works for html resource for [prepend] and [append] + textContent', async function ({ host }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t='[prepend]preHtml;[append]postHtml;[html]midHtml'></span>`
      })
      class App { }
      $it('works for html resource for [prepend] and [append] + innerHtml', async function ({ host }: I18nIntegrationTestContext<App>) {
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
      $it('works correctly for html with the change of both [prepend], and [append] - textContent', async function ({ host, app }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');

        app.keyExpr = '[prepend]pre;[append]post';
        await tasksSettled();
        assert.equal((host as Element).querySelector('span').innerHTML, 'tic tac toe');

        app.keyExpr = '[prepend]preHtml;[append]postHtml';
        await tasksSettled();
        assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
      }, { component: App });
    }

    {
      @customElement({
        name: 'app', template: `<span t.bind='keyExpr'>tac</span>`
      })
      class App {
        public keyExpr: string = '[prepend]pre;[append]post';
      }
      $it('works correctly with the change of both [prepend], and [append] - textContent', async function ({ host, app }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, 'tic tac toe');
        app.keyExpr = '[prepend]preHtml;[append]postHtml';

        await tasksSettled();

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

      $it('works correctly with the removal of [append]', async function ({ host, app }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
        app.keyExpr = '[prepend]preHtml';

        await tasksSettled();

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
      $it('works correctly with the removal of [prepend]', async function ({ host, app }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
        app.keyExpr = '[append]postHtml';

        await tasksSettled();

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

      $it('works correctly with the removal of both [prepend] and [append]', async function ({ host, app }: I18nIntegrationTestContext<App>) {
        assert.equal((host as Element).querySelector('span').innerHTML, '<b>tic</b><span>foo</span> tac <b>toe</b><span>bar</span>');
        app.keyExpr = '[html]midHtml';

        await tasksSettled();

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
      $it('when the key expression changed - interpolation', async function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        app.obj.key = 'simple.attr';
        await tasksSettled();
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
      $it('when the key expression changed - multi-interpolation', async function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        const currText = translation.simple.text;
        assertTextContent(host, `span`, currText);
        app.obj.base = 'simple';
        app.obj.key = '.attr';
        await tasksSettled();
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
      $it('when the key expression changed - access-member', async function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        app.obj.key = 'simple.attr';
        await tasksSettled();
        assertTextContent(host, `span`, translation.simple.attr);
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t.bind='key'></span>`
      })
      class App {
        public key = 'simple.text';
      }
      $it('when the key expression changed - property', async function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        app.key = 'simple.attr';
        await tasksSettled();
        assertTextContent(host, `span`, translation.simple.attr);

        app.key = 'simple.text';
        await tasksSettled();
        assertTextContent(host, `span`, translation.simple.text);

        app.key = 'simple.attr';
        await tasksSettled();
        assertTextContent(host, `span`, translation.simple.attr);
      }, { component: App });
    }
    {
      @customElement({ name: 'my-ce', template: '${value}' })
      class MyCe {
        @bindable public value: string;
      }
      @customElement({
        name: 'app',
        template: `<my-ce t.bind='"[value]"+key'></my-ce>`,
        dependencies: [MyCe]
      })
      class App {
        public key = 'simple.text';
      }
      $it('when the key expression changed - property - custom element', async function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        app.key = 'simple.attr';
        await tasksSettled();
        assertTextContent(host, `my-ce`, translation.simple.attr);

        app.key = 'simple.text';
        await tasksSettled();
        assertTextContent(host, `my-ce`, translation.simple.text);

        app.key = 'simple.attr';
        await tasksSettled();
        assertTextContent(host, `my-ce`, translation.simple.attr);
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t.bind='"[data-foo]"+key'></span>`
      })
      class App {
        public key = 'simple.text';
      }
      $it('when the key expression changed - property - DOM Element attribute', async function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        const span = host.querySelector('span');
        assert.strictEqual(span.dataset.foo, translation.simple.text);

        app.key = 'simple.attr';
        await tasksSettled();
        assert.strictEqual(span.dataset.foo, translation.simple.attr);

        app.key = 'simple.text';
        await tasksSettled();
        assert.strictEqual(span.dataset.foo, translation.simple.text);

        app.key = 'simple.attr';
        await tasksSettled();
        assert.strictEqual(span.dataset.foo, translation.simple.attr);
      }, { component: App });
    }
    {
      @customElement({ name: 'my-ce', template: '${foo} ${bar}' })
      class MyCe {
        @bindable public foo: string;
        @bindable public bar: string;
      }
      @customElement({
        name: 'app',
        template: `<my-ce t.bind='"[foo]"+key1+";[bar]"+key2'></my-ce>`,
        dependencies: [MyCe]
      })
      class App {
        public key1 = 'simple.text';
        public key2 = 'simple.attr';
      }
      $it('when the key expression changed - property - custom element - multiple bindables', async function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        const r = translation.simple;
        assertTextContent(host, `my-ce`, `${r.text} ${r.attr}`);

        app.key1 = 'simple.attr';
        await tasksSettled();
        assertTextContent(host, `my-ce`, `${r.attr} ${r.attr}`);

        app.key2 = 'simple.text';
        await tasksSettled();
        assertTextContent(host, `my-ce`, `${r.attr} ${r.text}`);

        app.key1 = 'simple.text';
        await tasksSettled();
        assertTextContent(host, `my-ce`, `${r.text} ${r.text}`);
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<span t.bind='"[data-foo]"+key1+";[bar]"+key2'></span>`
      })
      class App {
        public key1 = 'simple.text';
        public key2 = 'simple.attr';
      }
      $it('when the key expression changed - property - multiple DOM Element attributes', async function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        const r = translation.simple;

        const span = host.querySelector<HTMLSpanElement & { bar: string }>('span');
        assert.strictEqual(span.dataset.foo, r.text);
        assert.strictEqual(span.bar, r.attr);

        app.key1 = 'simple.attr';
        await tasksSettled();
        assert.strictEqual(span.dataset.foo, r.attr);
        assert.strictEqual(span.bar, r.attr);

        app.key2 = 'simple.text';
        await tasksSettled();
        assert.strictEqual(span.dataset.foo, r.attr);
        assert.strictEqual(span.bar, r.text);

        app.key1 = 'simple.text';
        await tasksSettled();
        assert.strictEqual(span.dataset.foo, translation.simple.text);
        assert.strictEqual(span.bar, r.text);
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

      $it('when the translation parameters changed', async function ({ host, en: translation, app }: I18nIntegrationTestContext<App>) {
        app.params = { ...app.params, context: 'dispatched' };
        await tasksSettled();
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
        await tasksSettled();
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

      $it('can bind to custom elements attributes', async function ({ host, en }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'custom-message div', en.simple.text);
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<custom-message component.ref="cm" t="[message]itemWithCount" t-params.bind="{count}">`
      })
      class App { public count: number = 0; public cm: CustomMessage; }
      $it('should support params', async function ({ app, host, en }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'custom-message div', en.itemWithCount_other.replace('{{count}}', '0'));
        app.count = 10;
        assert.strictEqual(app.cm.message, en.itemWithCount_other.replace('{{count}}', '0'), '<CustomMessage/> message prop should not yet have been updated immediately');
        assertTextContent(host, 'custom-message div', en.itemWithCount_other.replace('{{count}}', '0'));
        await tasksSettled();
        assert.strictEqual(app.cm.message, en.itemWithCount_other.replace('{{count}}', '10'), '<CustomMessage/> message prop have been updated');
        assertTextContent(host, 'custom-message div', en.itemWithCount_other.replace('{{count}}', '10'));
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<custom-message t="[message]simple.text"></custom-message>`
      })
      class App { }
      $it('should support locale changes', async function ({ host, de, i18n }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        await tasksSettled();

        assertTextContent(host, 'custom-message div', de.simple.text);
      }, { component: App });
    }

    {
      @customElement({
        name: 'app', template: `<camel-ce some-message="ignored" t="[some-message]simple.text"></camel-ce>`
      })
      class App { }

      $it('can bind to custom elements attributes with camelCased bindable', async function ({ host, en }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'camel-ce div', en.simple.text);
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<camel-ce component.ref="cm" t="[some-message]itemWithCount" t-params.bind="{count}">`
      })
      class App { public count: number = 0; public cm: CeWithCamelCaseBindable; }
      $it('should support params', async function ({ app, host, en }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'camel-ce div', en.itemWithCount_other.replace('{{count}}', '0'));
        app.count = 10;
        assert.strictEqual(app.cm.someMessage, en.itemWithCount_other.replace('{{count}}', '0'), '<camel-ce/> message prop should not yet have been updated');
        assertTextContent(host, 'camel-ce div', en.itemWithCount_other.replace('{{count}}', '0'));
        await tasksSettled();
        assert.strictEqual(app.cm.someMessage, en.itemWithCount_other.replace('{{count}}', '10'), '<camel-ce/> message prop should have been updated');
        assertTextContent(host, 'camel-ce div', en.itemWithCount_other.replace('{{count}}', '10'));
      }, { component: App });
    }
    {
      @customElement({
        name: 'app', template: `<camel-ce some-message="ignored" t="[some-message]simple.text"></camel-ce>`
      })
      class App { }
      $it('should support locale changes with camelCased bindable', async function ({ host, de, i18n }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        await tasksSettled();

        assertTextContent(host, 'camel-ce div', de.simple.text);
      }, { component: App });
    }
  });

  describe('`t` value-converter works for', function () {
    {
      @customElement({ name: 'app', template: `<span>\${'simple.text' | t}</span>` })
      class App { }
      $it('key as string literal', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', translation.simple.text);
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${key | t}</span>` })
      class App { public key: string = 'simple.text'; }
      $it('key bound from vm property', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', translation.simple.text);
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${'itemWithCount' | t: {count:10}}</span>` })
      class App { }
      $it('with `t-params`', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', translation.itemWithCount_other.replace('{{count}}', '10'));
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
      $it('attribute translation', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, `span#a[title='${translation.simple.text}']`, 't-vc-attr-target');
        assertTextContent(host, `span#b[title='${translation.simple.text}']`, 't-vc-attr-target');
        assertTextContent(host, `span#c[title='${translation.itemWithCount_other.replace('{{count}}', '10')}']`, 't-vc-attr-target');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${'simple.text' | t}</span>` })
      class App { }

      $it('change of locale', async function ({ host, de, i18n }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        await tasksSettled();
        assertTextContent(host, 'span', de.simple.text);
      }, { component: App });
    }
  });

  describe('`t` binding-behavior works for', function () {
    {
      @customElement({ name: 'app', template: `<span>\${'simple.text' & t}</span>` })
      class App { }
      $it('key as string literal', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', translation.simple.text);
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${key & t}</span>` })
      class App { public key: string = 'simple.text'; }
      $it('key bound from vm property', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', translation.simple.text);
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${'itemWithCount' & t : {count:10}}</span>` })
      class App { }
      $it('with `t-params`', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', translation.itemWithCount_other.replace('{{count}}', '10'));
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
      $it('attribute translation', async function ({ host, en: translation }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, `span#a[title='${translation.simple.text}']`, 't-vc-attr-target');
        assertTextContent(host, `span#b[title='${translation.simple.text}']`, 't-vc-attr-target');
        assertTextContent(host, `span#c[title='${translation.itemWithCount_other.replace('{{count}}', '10')}']`, 't-vc-attr-target');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${'simple.text' & t}</span>` })
      class App { }

      $it('change of locale', async function ({ host, de, i18n }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        await tasksSettled();

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
      const baseDef = { name: `app`, template: `<span>\${ dt | df }</span>` };
      @customElement(baseDef)
      class App { private readonly dt: string | number | Date = input; }
      $it(`${name} STRICT`, async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', `${output ?? ''}`);
      }, { component: App });

      @customElement({ ...baseDef })
      class App1 { private readonly dt: string | number | Date = input; }
      $it(name, async function ({ host }: I18nIntegrationTestContext<App1>) {
        assertTextContent(host, 'span', (output ?? '').toString());
      }, { component: App1 });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ dt | df : {year:'2-digit', month:'2-digit', day:'2-digit'} : 'de' }</span>` })
      class App { private readonly dt: Date = new Date(2019, 7, 20); }
      $it('respects provided locale and formatting options', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '20.08.19');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ dt | df }</span>` })
      class App { public dt: Date = new Date(2019, 7, 20); }

      $it('works for change of locale', async function ({ host, i18n }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        await tasksSettled();
        assertTextContent(host, 'span', '20.8.2019');
      }, { component: App });

      $it('works for change of source value', async function ({ host, app }: I18nIntegrationTestContext<App>) {
        app.dt = new Date(2019, 7, 21);
        await tasksSettled();
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
      const baseDef = { name: 'app', template: `<span>\${ dt & df }</span>` };
      @customElement(baseDef)
      class App { private readonly dt: string | number | Date = input; }
      $it(`${name} STRICT`, async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', `${output ?? ''}`);
      }, { component: App });

      @customElement({ ...baseDef })
      class App1 { private readonly dt: string | number | Date = input; }
      $it(name, async function ({ host }: I18nIntegrationTestContext<App1>) {
        assertTextContent(host, 'span', (output ?? '').toString());
      }, { component: App1 });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ dt & df : {year:'2-digit', month:'2-digit', day:'2-digit'} : 'de' }</span>` })
      class App { private readonly dt: Date = new Date(2019, 7, 20); }
      $it('respects provided locale and formatting options', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '20.08.19');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ dt & df }</span>` })
      class App { private readonly dt: Date = new Date(2019, 7, 20); }

      $it('works for change of locale', async function ({ host, i18n }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        await tasksSettled();
        assertTextContent(host, 'span', '20.8.2019');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ dt & df }</span>` })
      class App { public dt: Date = new Date(2019, 7, 20); }

      $it('works for change of source value', async function ({ host, app }: I18nIntegrationTestContext<App>) {
        app.dt = new Date(2019, 7, 21);
        await tasksSettled();
        assertTextContent(host, 'span', '8/21/2019');
      }, { component: App });
    }
  });

  describe('`nf` value-converter', function () {

    const def = { name: 'app', template: `<span>\${ num | nf }</span>` };
    const strictDef = { ...def };
    for (const value of [undefined, null, 'chaos', new Date(), true]) {
      @customElement(strictDef)
      class App { private readonly num: string | boolean | Date = value; }

      $it(`returns the value itself if the value is not a number STRICT binding, for example: ${value}`, async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', `${value ?? ''}`);
      }, { component: App });

      @customElement(def)
      class App1 { private readonly num: string | boolean | Date = value; }
      $it(`returns the value itself if the value is not a number, for example: ${value}`, async function ({ host }: I18nIntegrationTestContext<App1>) {
        assertTextContent(host, 'span', `${value ?? ''}`);
      }, { component: App1 });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num | nf }</span>` })
      class App { public num: number = 123456789.12; }
      $it('formats number by default as per current locale and default formatting options', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '123,456,789.12');
      }, { component: App });

      $it('works for change of locale', async function ({ host, i18n }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        await tasksSettled();

        assertTextContent(host, 'span', '123.456.789,12');
      }, { component: App });

      $it('works for change of source value', async function ({ host, app }: I18nIntegrationTestContext<App>) {
        app.num = 123456789.21;
        await tasksSettled();

        assertTextContent(host, 'span', '123,456,789.21');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num | nf : { style: 'currency', currency: 'EUR' } }</span>` })
      class App { private readonly num: number = 123456789.12; }
      $it('formats a given number as per given formatting options', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '€123,456,789.12');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num | nf : undefined : 'de' }</span>` })
      class App { private readonly num: number = 123456789.12; }
      $it('formats a given number as per given locale', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '123.456.789,12');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num | nf : { style: 'currency', currency: 'EUR' } : 'de' }</span>` })
      class App { private readonly num: number = 123456789.12; }
      $it('formats a given number as per given locale and formatting options', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '123.456.789,12\u00A0€');
      }, { component: App });
    }
  });

  describe('`nf` binding-behavior', function () {

    const def = { name: 'app', template: `<span>\${ num & nf }</span>` };
    const strictDef = { ...def };
    for (const value of [undefined, null, 'chaos', new Date(), true]) {
      @customElement(strictDef)
      class App { private readonly num: string | boolean | Date = value; }
      $it(`returns the value itself if the value is not a number STRICT binding, for example: ${value}`, async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', `${value ?? ''}`);
      }, { component: App });

      @customElement(def)
      class App1 { private readonly num: string | boolean | Date = value; }
      $it(`returns the value itself if the value is not a number, for example: ${value}`, async function ({ host }: I18nIntegrationTestContext<App1>) {
        assertTextContent(host, 'span', `${value ?? ''}`);
      }, { component: App1 });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num & nf }</span>` })
      class App { private readonly num: number = 123456789.12; }
      $it('formats number by default as per current locale and default formatting options', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '123,456,789.12');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num & nf : { style: 'currency', currency: 'EUR' } }</span>` })
      class App { private readonly num: number = 123456789.12; }
      $it('formats a given number as per given formatting options', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '€123,456,789.12');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num & nf : undefined : 'de' }</span>` })
      class App { private readonly num: number = 123456789.12; }
      $it('formats a given number as per given locale', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '123.456.789,12');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num & nf : { style: 'currency', currency: 'EUR' } : 'de' }</span>` })
      class App { private readonly num: number = 123456789.12; }
      $it('formats a given number as per given locale and formating options', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', '123.456.789,12\u00A0€');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num & nf }</span>` })
      class App { private readonly num: number = 123456789.12; }

      $it('works for change of locale', async function ({ host, i18n }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        await tasksSettled();
        assertTextContent(host, 'span', '123.456.789,12');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<span>\${ num & nf }</span>` })
      class App { public num: number = 123456789.12; }

      $it('works for change of source value', async function ({ host, app }: I18nIntegrationTestContext<App>) {
        app.num = 123456789.21;
        await tasksSettled();

        assertTextContent(host, 'span', '123,456,789.21');
      }, { component: App });
    }
  });

  describe('`rt` value-converter', function () {

    for (const value of [undefined, null, 'chaos', 123, true]) {
      const def = { name: 'app', template: `<span>\${ dt | rt }</span>` };
      const strictDef = { ...def };
      @customElement(strictDef)
      class App { private readonly dt: string | number | boolean = value; }
      $it(`returns the value itself if the value is not a number STRICT, for example: ${value}`, async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', `${value ?? ''}`);
      }, { component: App });

      @customElement(def)
      class App1 { private readonly dt: string | number | boolean = value; }
      $it(`returns the value itself if the value is not a number, for example: ${value}`, async function ({ host }: I18nIntegrationTestContext<App1>) {
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
      $it('formats date by default as per current locale and default formatting options', async function ({ host }: I18nIntegrationTestContext<App>) {
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
      $it('formats a given number as per given locale', async function ({ host }: I18nIntegrationTestContext<App>) {
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
      $it('formats a given number as per given locale and formating options', async function ({ host }: I18nIntegrationTestContext<App>) {
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

      $it('works for change of locale', async function ({ host, i18n }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        await tasksSettled();

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

      $it('works for change of source value', async function ({ host, app }: I18nIntegrationTestContext<App>) {
        app.dt = new Date(app.dt.setHours(app.dt.getHours() - 3));

        await tasksSettled();

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
        async function ({ host, container }) {
          await queueAsyncTask(async () => {
            container.get<ISignaler>(ISignaler).dispatchSignal(Signals.RT_SIGNAL);
            await Promise.resolve();
            assertTextContent(host, 'span', `${Math.round((1000 + offset) / 1000)} seconds ago`);
          }, { delay: 1000 }).result;
        },
        { component: App });
    });
  });

  describe('`rt` binding-behavior', function () {

    const def = { name: 'app', template: `<span>\${ dt & rt }</span>` };
    const strictDef = { ...def };

    for (const value of [undefined, null, 'chaos', 123, true]) {
      @customElement(strictDef)
      class App { private readonly dt: string | number | boolean = value; }
      $it(`returns the value itself if the value is not a number STRICT binding, for example: ${value}`, async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', `${value ?? ''}`);
      }, { component: App });

      @customElement(def)
      class App1 { private readonly dt: string | number | boolean = value; }
      $it(`returns the value itself if the value is not a number, for example: ${value}`, async function ({ host }: I18nIntegrationTestContext<App1>) {
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
      $it('formats date by default as per current locale and default formatting options', async function ({ host }: I18nIntegrationTestContext<App>) {
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
      $it('formats a given number as per given locale', async function ({ host }: I18nIntegrationTestContext<App>) {
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
      $it('formats a given number as per given locale and formating options', async function ({ host }: I18nIntegrationTestContext<App>) {
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

      $it('works for change of locale', async function ({ host, i18n }: I18nIntegrationTestContext<App>) {
        await i18n.setLocale('de');
        await tasksSettled();

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

      $it('works for change of source value', async function ({ host, app }: I18nIntegrationTestContext<App>) {
        app.dt = new Date(app.dt.setHours(app.dt.getHours() - 3));

        await tasksSettled();

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
        async function ({ host, container }: I18nIntegrationTestContext<App>) {
          await queueAsyncTask(async () => {
            container.get<ISignaler>(ISignaler).dispatchSignal(Signals.RT_SIGNAL);
            await Promise.resolve();
            assertTextContent(host, 'span', `${Math.round((1000 + offset) / 1000)} seconds ago`);
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
      $it('is disabled by default, and the given key is rendered if the key is missing from i18next resource', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', key);
      }, { component: App });
    }
    {
      const key = 'lost-in-translation', text = 'untranslated text';
      @customElement({ name: 'app', template: `<span t='${key}'>${text}</span>` })
      class App { }
      $it('enables skipping translation when set', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', text);
      }, { component: App, skipTranslationOnMissingKey: true });
    }
  });

  describe('works with au-slot', function () {
    {
      @customElement({ name: 'app', template: `<foo-bar status="delivered" date="1971-12-25"></foo-bar>` })
      class App { }
      $it('w/o projection', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'span', 'delivered on 1971-12-25');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<foo-bar status="delivered" date="1971-12-25"><div au-slot t="status" t-params.bind="{context: status, date: date}"></div></foo-bar>` })
      class App {
        private readonly status: string = 'dispatched';
        private readonly date: string = '1972-12-26';
      }
      $it('with projection', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'div', 'dispatched on 1972-12-26');
      }, { component: App });
    }
    {
      @customElement({ name: 'app', template: `<foo-bar status="delivered" date="1971-12-25"><div au-slot t="status" t-params.bind="{context: status, date: $host.date}"></div></foo-bar>` })
      class App {
        private readonly status: string = 'dispatched';
        private readonly date: string = '1972-12-26';
      }
      $it('with projection - mixed', async function ({ host }: I18nIntegrationTestContext<App>) {
        assertTextContent(host, 'div', 'dispatched on 1971-12-25');
      }, { component: App });
    }
    {

      @customElement({ name: 'ce-1', template: '<au-slot></au-slot>' })
      class Ce1 { }

      @customElement({ name: 'ce-2', template: '${value}' })
      class Ce2 {
        @bindable value: string;
      }

      @customElement({
        name: 'app',
        template: `<ce-1 if.bind="show">
        <ce-2 au-slot value="foo" t="[value]projectedContent"></ce-2>
      </ce-1>`,
        dependencies: [Ce1, Ce2]
      })
      class App {
        public show: boolean = false;
      }
      $it('with projection - if.bind on host', async function ({ host, app, i18n }: I18nIntegrationTestContext<App>) {
        assert.strictEqual(host.querySelector('ce-1'), null, 'ce-1 should not be rendered');

        app.show = true;
        await tasksSettled();

        assert.html.textContent(host, 'content', 'round #1');

        // change locale
        await i18n.setLocale('de');
        await tasksSettled();
        assert.html.textContent(host, 'Inhalt', 'round #2');

        // toggle visibility
        app.show = false;
        await tasksSettled();
        assert.strictEqual(host.querySelector('ce-1'), null, 'ce-1 should not be rendered');

        // toggle visibility
        app.show = true;
        await tasksSettled();
        assert.html.textContent(host, 'Inhalt', 'round #3');

        // change locale
        await i18n.setLocale('en');
        await tasksSettled();
        assert.html.textContent(host, 'content', 'round #4');
      }, { component: App });
    }
    {

      @customElement({ name: 'ce-1', template: '<au-slot></au-slot>' })
      class Ce1 { }

      @customElement({ name: 'ce-2', template: '${value}' })
      class Ce2 {
        @bindable value: string;
      }

      @customElement({
        name: 'app',
        template: `<ce-1>
        <ce-2 au-slot if.bind="show" value="foo" t="[value]projectedContent"></ce-2>
      </ce-1>`,
        dependencies: [Ce1, Ce2]
      })
      class App {
        public show: boolean = false;
      }
      $it('with projection - if.bind on content', async function ({ host, app, i18n }: I18nIntegrationTestContext<App>) {
        assert.strictEqual(host.querySelector('ce-2'), null, 'ce-2 should not be rendered');

        app.show = true;
        await tasksSettled();

        assert.html.textContent(host, 'content', 'round #1');

        // change locale
        await i18n.setLocale('de');
        await tasksSettled();
        assert.html.textContent(host, 'Inhalt', 'round #2');

        // toggle visibility
        app.show = false;
        await tasksSettled();
        assert.strictEqual(host.querySelector('ce-2'), null, 'ce-2 should not be rendered');

        // toggle visibility
        app.show = true;
        await tasksSettled();
        assert.html.textContent(host, 'Inhalt', 'round #3');

        // change locale
        await i18n.setLocale('en');
        await tasksSettled();
        assert.html.textContent(host, 'content', 'round #4');
      }, { component: App });
    }

    {

      @customElement({ name: 'ce-1', template: '<au-slot></au-slot>' })
      class Ce1 { }

      @customElement({ name: 'ce-2', template: '${value}' })
      class Ce2 {
        @bindable value: string;
      }

      @customElement({
        name: 'app',
        template: `<ce-1 if.bind="show">
        <ce-2 au-slot value="foo" t="[value]firstandMore" t-params.bind="{firstItem, restCount}"></ce-2>
      </ce-1>`,
        dependencies: [Ce1, Ce2]
      })
      class App {
        public show: boolean = false;
        public restCount = 1;
        public firstItem = 'foo';
      }
      $it('with projection - if.bind on host - changes in t-params', async function ({ host, app, i18n }: I18nIntegrationTestContext<App>) {
        assert.strictEqual(host.querySelector('ce-1'), null, 'ce-1 should not be rendered');

        app.show = true;
        await tasksSettled();

        assert.html.textContent(host, 'foo and 1 more', 'round #1');

        // change locale
        await i18n.setLocale('de');
        await tasksSettled();
        assert.html.textContent(host, 'foo und 1 mehr', 'round #2');

        // toggle visibility
        app.show = false;
        await tasksSettled();
        assert.strictEqual(host.querySelector('ce-1'), null, 'ce-1 should not be rendered');

        // toggle visibility
        app.firstItem = 'bar';
        app.restCount = 2;
        app.show = true;
        await tasksSettled();
        assert.html.textContent(host, 'bar und 2 mehr', 'round #3');

        // change locale
        await i18n.setLocale('en');
        await tasksSettled();
        assert.html.textContent(host, 'bar and 2 more', 'round #4');
      }, { component: App });
    }
    {

      @customElement({ name: 'ce-1', template: '<au-slot></au-slot>' })
      class Ce1 { }

      @customElement({ name: 'ce-2', template: '${value}' })
      class Ce2 {
        @bindable value: string;
      }

      @customElement({
        name: 'app',
        template: `<ce-1>
        <ce-2 au-slot if.bind="show" value="foo" t="[value]firstandMore" t-params.bind="{firstItem, restCount}"></ce-2>
      </ce-1>`,
        dependencies: [Ce1, Ce2]
      })
      class App {
        public show: boolean = false;
        public restCount = 1;
        public firstItem = 'foo';
      }
      $it('with projection - if.bind on content - changes in t-params', async function ({ host, app, i18n }: I18nIntegrationTestContext<App>) {
        assert.strictEqual(host.querySelector('ce-2'), null, 'ce-2 should not be rendered');

        app.show = true;
        await tasksSettled();

        assert.html.textContent(host, 'foo and 1 more', 'round #1');

        // change locale
        await i18n.setLocale('de');
        await tasksSettled();
        assert.html.textContent(host, 'foo und 1 mehr', 'round #2');

        // toggle visibility
        app.show = false;
        await tasksSettled();
        assert.strictEqual(host.querySelector('ce-2'), null, 'ce-2 should not be rendered');

        // toggle visibility
        app.firstItem = 'bar';
        app.restCount = 2;
        app.show = true;
        await tasksSettled();
        assert.html.textContent(host, 'bar und 2 mehr', 'round #3');

        // change locale
        await i18n.setLocale('en');
        await tasksSettled();
        assert.html.textContent(host, 'bar and 2 more', 'round #4');
      }, { component: App });
    }
  });

  // This test doubles down as the containerization of the attribute patterns; that is not global registry of patterns other than the container.
  it('different aliases can be used for different apps', async function () {
    @customElement({ name: 'app-one', template: `<span t="\${key11}"></span><span t.bind="key12"></span>` })
    class AppOne {
      public key11: string = 'key11';
      public key12: string = 'key12';
    }

    @customElement({ name: 'app-two', template: `<span i18n="\${key21}"></span><span i18n.bind="key22"></span>` })
    class AppTwo {
      public key21: string = 'key21';
      public key22: string = 'key22';
    }

    const translation = {
      key11: 'a',
      key12: 'b',
      key21: 'c',
      key22: 'd',

      key13: 'e',
      key14: 'f',
      key23: 'g',
      key24: 'h',
    };

    const i18nInitOptions = {
      fallbackLng: 'en',
      fallbackNS: 'translation',
      resources: { en: { translation } },
    };
    let checkPoint1 = false;
    let checkPoint2 = false;
    async function createAppOne() {
      const ctx = TestContext.create();
      const host = PLATFORM.document.createElement('app-one');
      const au = new Aurelia(ctx.container);
      au.register(
        I18nConfiguration.customize((opt) => {
          opt.translationAttributeAliases = ['t'];
          opt.initOptions = i18nInitOptions;
        })
      );
      checkPoint1 = true;

      while (!checkPoint2) {
        await new Promise((res) => setTimeout(res, 1));
      }

      au.app({ host, component: AppOne });
      await au.start();

      return { au, host, vm: au.root.controller.viewModel as AppOne };
    }

    async function createAppTwo() {
      while (!checkPoint1) {
        await new Promise((res) => setTimeout(res, 1));
      }

      const ctx = TestContext.create();
      const host = PLATFORM.document.createElement('app-two');
      const au = new Aurelia(ctx.container);
      au.register(
        I18nConfiguration.customize((opt) => {
          opt.translationAttributeAliases = ['i18n'];
          opt.initOptions = i18nInitOptions;
        })
      );
      checkPoint2 = true;

      au.app({ host, component: AppTwo });
      await au.start();
      return { au, host, vm: au.root.controller.viewModel as AppTwo };
    }

    const [
      { au: au1, host: host1, vm: appOne },
      { au: au2, host: host2, vm: appTwo },
    ] = await Promise.all([createAppOne(), createAppTwo()]);

    assert.html.textContent(host1, 'ab');
    assert.html.textContent(host2, 'cd');

    appOne.key11 = 'key13';
    appOne.key12 = 'key14';
    await tasksSettled();

    appTwo.key21 = 'key23';
    appTwo.key22 = 'key24';
    await tasksSettled();

    assert.html.textContent(host1, 'ef');
    assert.html.textContent(host2, 'gh');

    await Promise.all([au1.stop(), au2.stop()]);
  });
});
