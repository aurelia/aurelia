import { Class } from '@aurelia/kernel';
import { Aurelia, containerless, customElement, IPlatform } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { TestExecutionContext, TestFunction, $TestSetupContext, createSpecFunction } from '../util.js';

describe('containerless', function () {

  interface TestSetupContext<TApp> extends $TestSetupContext {
    appType: Class<TApp>;
    registrations?: any[];
  }

  async function runTest<TApp>(
    testFunction: TestFunction<TestExecutionContext<TApp>>,
    { appType, registrations = [] }: TestSetupContext<TApp>,
  ) {
    const ctx = TestContext.create();
    const container = ctx.container;
    const host = ctx.doc.createElement('app');
    ctx.doc.body.appendChild(host);
    const au = new Aurelia(container);
    await au
      .register(
        registrations
      )
      .app({ host, component: appType })
      .start();

    const app = au.root.controller.viewModel as TApp;
    await testFunction({ app, host, container, platform: container.get(IPlatform), ctx });

    await au.stop();
    ctx.doc.body.removeChild(host);

    au.dispose();
  }

  const $it = createSpecFunction(runTest);

  {
    @containerless()
    @customElement({
      name: 'ce-foo',
      template: 'ce-foo content'
    })
    class CeFoo { }

    @customElement({
      name: 'app',
      template: '<ce-foo></ce-foo>',
    })
    class App {
      public readonly message: string = 'Hello World!';
    }
    $it('execution order: customElement -> containerless', function ({ host }) {
      assert.html.textContent(host, 'ce-foo content');
      assert.strictEqual(host.querySelector('ce-foo'), null);
    }, { appType: App, registrations: [CeFoo] });
  }

  {
    @customElement({
      name: 'ce-foo',
      template: 'ce-foo content'
    })
    @containerless()
    class CeFoo { }

    @customElement({
      name: 'app',
      template: '<ce-foo></ce-foo>',
    })
    class App {
      public readonly message: string = 'Hello World!';
    }
    $it('execution order: containerless -> customElement', function ({ host }) {
      assert.html.textContent(host, 'ce-foo content');
      assert.strictEqual(host.querySelector('ce-foo'), null);
    }, { appType: App, registrations: [CeFoo] });
  }
});
