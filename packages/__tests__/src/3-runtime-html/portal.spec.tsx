/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Constructable, IRegistry } from '@aurelia/kernel';
import { runTasks } from '@aurelia/runtime';
import { CustomElement, Aurelia } from '@aurelia/runtime-html';
import {
  assert,
  eachCartesianJoin,
  hJsx, // deepscan-disable-line UNUSED_IMPORT
  TestContext,
  createFixture,
} from '@aurelia/testing';

describe('3-runtime-html/portal.spec.tsx', function () {

  it('portals to "beforebegin" position 🚪-🔁-🚪', function () {
    const { assertHtml } = createFixture(
      <>
        <div id="d1">hello</div>
        <button portal="target: #d1; position: beforebegin">click me</button>
      </>
    );
    assertHtml('<!--au-start--><button>click me</button><!--au-end--><div id="d1">hello</div><!--au-start--><!--au-end-->');
  });

  it('portals to "afterbegin" position', function () {
    const { assertHtml } = createFixture(
      <>
        <div id="d1">hello</div>
        <button portal="target: #d1; position: afterbegin">click me</button>
      </>
    );
    assertHtml('<div id="d1"><!--au-start--><button>click me</button><!--au-end-->hello</div><!--au-start--><!--au-end-->');
  });

  it('portals to "beforeend" position', function () {
    const { assertHtml } = createFixture(
      <>
        <div id="d1">hello</div>
        <button portal="target: #d1; position: beforeend">click me</button>
      </>
    );
    assertHtml('<div id="d1">hello<!--au-start--><button>click me</button><!--au-end--></div><!--au-start--><!--au-end-->');
  });

  it('portals to "afterend" position', function () {
    const { assertHtml } = createFixture(
      <>
        <div id="d1">hello</div>
        <button portal="target: #d1; position: afterend">click me</button>
      </>
    );
    assertHtml('<div id="d1">hello</div><!--au-start--><button>click me</button><!--au-end--><!--au-start--><!--au-end-->');
  });

  it('moves view when position change beforeend -> afterend', function () {
    const { component, assertHtml } = createFixture(
      <>
        <div id="d1">hello</div>
        <button portal="target: #d1; position.bind: position">click me</button>
      </>,
      { position: 'beforeend' }
    );
    component.position = 'afterend';
    runTasks();
    assertHtml('<div id="d1">hello</div><!--au-start--><button>click me</button><!--au-end--><!--au-start--><!--au-end-->');
  });

  it('moves view when position change afterend -> beforebegin', function () {
    const { component, assertHtml } = createFixture(
      <>
        <div id="d1">hello</div>
        <button portal="target: #d1; position.bind: position">click me</button>
      </>,
      { position: 'beforeend' }
    );
    component.position = 'beforebegin';
    runTasks();
    assertHtml('<!--au-start--><button>click me</button><!--au-end--><div id="d1">hello</div><!--au-start--><!--au-end-->');
  });

  it('removes location marker when portal is deactivated', function () {
    const { component, assertHtml } = createFixture(
      <>
        <div id="dest"></div>
        <p id="package" if$bind="open" portal="#dest"></p>
      </>,
      { open: false }
    );

    assertHtml('div', '');
    component.open = true;
    runTasks();
    assertHtml('div', '<!--au-start--><p id="package"></p><!--au-end-->');
    component.open = false;
    runTasks();
    assertHtml('div', '');
  });

  describe('target changes and lifecycle callbacks', function () {
    const callbacks = 'activating.bind: activating; activated.bind: activated; deactivating.bind: deactivating; deactivated.bind: deactivated';
    const targets = '<div id="a"></div><div id="b"></div><div id="c"></div>';

    // Records each callback with the id of the target it received. Callbacks named in `async`
    // return a promise that stays pending until `settle()` resolves it.
    class CallbackLog {
      public target: string | Element = '#a';
      public position: InsertPosition = 'beforeend';
      public log: string[] = [];
      public async = new Set<string>();
      public pending: (() => void)[] = [];
      public activating = (target: Element) => this.record('activating', target);
      public activated = (target: Element) => this.record('activated', target);
      public deactivating = (target: Element) => this.record('deactivating', target);
      public deactivated = (target: Element) => this.record('deactivated', target);

      public record(name: string, target: Element): void | Promise<void> {
        this.log.push(`${name}:${target.id}`);
        if (this.async.has(name)) {
          return new Promise<void>(r => this.pending.push(r));
        }
      }

      // Resolves the newest pending callbacks first, to expose ordering bugs.
      public async settle(): Promise<void> {
        while (this.pending.length > 0) {
          this.pending.splice(0).reverse().forEach(resolve => resolve());
          await new Promise(r => setTimeout(r));
        }
      }
    }

    it('passes the previous target to deactivating and deactivated', function () {
      const { component, appHost } = createFixture(
        `${targets}<span class="p" portal="target.bind: target; ${callbacks}">x</span>`,
        CallbackLog,
      );
      component.target = '#b';

      assert.deepStrictEqual(component.log, [
        'activating:a', 'activated:a',
        'deactivating:a', 'deactivated:a', 'activating:b', 'activated:b',
      ]);
      assert.notEqual(appHost.querySelector('#b > .p'), null);
    });

    it('applies rapid target changes in order when callbacks are async', async function () {
      const { component, appHost, tearDown } = createFixture(
        `${targets}<span class="p" portal="target.bind: target; ${callbacks}">x</span>`,
        CallbackLog,
      );
      component.async.add('deactivating');
      component.target = '#b';
      component.target = '#c';
      await component.settle();
      component.async.clear();

      assert.strictEqual(appHost.querySelector('#a').innerHTML, '');
      assert.strictEqual(appHost.querySelector('#b').innerHTML, '');
      assert.strictEqual(appHost.querySelector('#c').innerHTML, '<!--au-start--><span class="p">x</span><!--au-end-->');
      assert.deepStrictEqual(component.log, [
        'activating:a', 'activated:a',
        'deactivating:a', 'deactivated:a', 'activating:b', 'activated:b',
        'deactivating:b', 'deactivated:b', 'activating:c', 'activated:c',
      ]);

      await tearDown();
    });

    it('applies a target change made while an async activating callback is pending', async function () {
      const { component, appHost, started, tearDown } = createFixture(
        `${targets}<span class="p" portal="target.bind: target; ${callbacks}">x</span>`,
        class extends CallbackLog {
          public async = new Set(['activating']);
        },
      );
      component.target = '#b';
      component.async.clear();
      await component.settle();
      await started;

      assert.strictEqual(appHost.querySelector('#a').innerHTML, '');
      assert.strictEqual(appHost.querySelector('#b').innerHTML, '<!--au-start--><span class="p">x</span><!--au-end-->');
      assert.deepStrictEqual(component.log, [
        'activating:a', 'activated:a',
        'deactivating:a', 'deactivated:a', 'activating:b', 'activated:b',
      ]);

      await tearDown();
    });

    for (const [name, leaving] of [['activating', false], ['activated', false], ['deactivating', true], ['deactivated', true]] as const) {
      it(`applies a target change made by a synchronous ${name} callback after the running move`, async function () {
        const { component, appHost, tearDown } = createFixture(
          `${targets}<span class="p" portal="target.bind: target; ${callbacks}">x</span>`,
          class extends CallbackLog {
            public [name] = (target: Element) => {
              const ret = this.record(name, target);
              if (target.id === (leaving ? 'a' : 'b')) {
                this.target = '#c';
              }
              return ret;
            };
          },
        );
        component.target = '#b';
        await new Promise(r => setTimeout(r));

        assert.strictEqual(appHost.querySelector('#a').innerHTML, '');
        assert.strictEqual(appHost.querySelector('#b').innerHTML, '');
        assert.strictEqual(appHost.querySelector('#c').innerHTML, '<!--au-start--><span class="p">x</span><!--au-end-->');
        assert.deepStrictEqual(component.log, [
          'activating:a', 'activated:a',
          'deactivating:a', 'deactivated:a', 'activating:b', 'activated:b',
          'deactivating:b', 'deactivated:b', 'activating:c', 'activated:c',
        ]);

        await tearDown();
      });
    }

    it('waits for a change made by a callback even when the running move rejects', async function () {
      const reasons: unknown[] = [];
      let dispose: () => void;
      if (typeof process !== 'undefined' && typeof process.on === 'function') {
        const handler = (reason: unknown) => { reasons.push(reason); };
        process.on('unhandledRejection', handler);
        dispose = () => { process.off('unhandledRejection', handler); };
      } else {
        const handler = (ev: PromiseRejectionEvent) => { reasons.push(ev.reason); ev.preventDefault(); };
        addEventListener('unhandledrejection', handler);
        dispose = () => { removeEventListener('unhandledrejection', handler); };
      }
      try {
        const { component, appHost, tearDown } = createFixture(
          `${targets}<span class="p" portal="target.bind: target; ${callbacks}">x</span>`,
          class extends CallbackLog {
            public rejected = false;
            public deactivating = (target: Element) => {
              const ret = this.record('deactivating', target);
              if (!this.rejected) {
                this.rejected = true;
                this.target = '#c';
                return Promise.reject(new Error('deactivating failed'));
              }
              return ret;
            };
          },
        );
        component.async.add('activating');
        component.target = '#b';
        await new Promise(r => setTimeout(r));
        // the move to #c is waiting on activating, so this change has to wait for it
        component.target = '#b';
        component.async.clear();
        await component.settle();

        assert.strictEqual(appHost.querySelector('#a').innerHTML, '');
        assert.strictEqual(appHost.querySelector('#b').innerHTML, '<!--au-start--><span class="p">x</span><!--au-end-->');
        assert.strictEqual(appHost.querySelector('#c').innerHTML, '');
        assert.deepStrictEqual(component.log, [
          'activating:a', 'activated:a',
          'deactivating:a',
          'deactivating:a', 'deactivated:a', 'activating:c', 'activated:c',
          'deactivating:c', 'deactivated:c', 'activating:b', 'activated:b',
        ]);
        // mocha re-emits unhandled rejections to other listeners, so the same error can show up twice
        assert.deepStrictEqual([...new Set(reasons)].map(r => (r as Error).message), ['deactivating failed']);

        await tearDown();
      } finally {
        dispose();
      }
    });

    it('finishes a pending move before deactivating', async function () {
      const { component, appHost, platform, tearDown } = createFixture(
        `${targets}<span class="p" portal="target.bind: target; ${callbacks}">x</span>`,
        CallbackLog,
      );
      const [a, b] = [appHost.querySelector('#a'), appHost.querySelector('#b')];
      component.async.add('deactivating');
      component.target = '#b';
      const stopped = tearDown();
      await component.settle();
      await stopped;

      assert.strictEqual(platform.document.querySelectorAll('.p').length, 0);
      assert.strictEqual(a.innerHTML, '');
      assert.strictEqual(b.innerHTML, '');
      assert.deepStrictEqual(component.log, [
        'activating:a', 'activated:a',
        'deactivating:a', 'deactivated:a', 'activating:b', 'activated:b',
        'deactivating:b', 'deactivated:b',
      ]);
    });

    for (const position of ['beforebegin', 'afterend'] as const) {
      it(`throws AUR0830 when attaching "${position}" a target without a parent`, async function () {
        const ctx = TestContext.create();
        const detached = ctx.doc.createElement('div');
        await assert.rejects(
          async () => {
            await createFixture(
              `<span portal="target.bind: target; position: ${position}">x</span>`,
              { target: detached },
              [],
              true,
              ctx,
            ).started;
          },
          /AUR0830/,
        );
      });

      it(`throws AUR0830 and keeps the content in place when moving "${position}" a target without a parent`, function () {
        const { component, appHost, platform } = createFixture(
          `${targets}<span class="p" portal="target.bind: target; position.bind: position">x</span>`,
          CallbackLog,
        );
        const detached = platform.document.createElement('div');
        component.position = position;
        assert.throws(() => component.target = detached, /AUR0830/);
        assert.strictEqual(appHost.querySelector('.p')?.parentNode, appHost.querySelector('#a').parentNode);
      });
    }
  });

  describe('basic', function () {

    const basicTestCases: IPortalTestCase<IPortalTestRootVm>[] = [
      {
        title: 'basic usage',
        rootVm: CustomElement.define(
          {
            name: 'app',
            template: <template><div portal class='portaled'></div></template>
          },
          class App {
            public message = 'Aurelia';
            public items: any[];
          }
        ),
        assertionFn: (ctx, host, _component) => {
          assert.equal(host.childElementCount, 0, 'It should have been empty.');
          assert.notEqual(
            childrenQuerySelector(ctx.doc.body, '.portaled'),
            null,
            '<div".portaled"/> should have been portaled'
          );
        }
      },
      {
        title: 'Portal custom elements',
        rootVm: CustomElement.define(
          {
            name: 'app',
            template: <template><c-e portal></c-e></template>,
            dependencies: [
              CustomElement.define(
                {
                  name: 'c-e',
                  template: <template>C-E</template>
                }
              )
            ]
          },
          class App {
            public message = 'Aurelia';
            public items: any[];
          }
        ),
        assertionFn: (ctx, host, _comp) => {

          assert.equal(host.childElementCount, 0, 'It should have been empty.');
          assert.notEqual(
            childrenQuerySelector(ctx.doc.body, 'c-e'),
            null,
            '<c-e/> should have been portaled'
          );
        },
      },
      {
        title: 'portals nested template controller',
        rootVm: CustomElement.define(
          {
            name: 'app',
            template: <template><div portal if$='showCe' class='divdiv'>{'${message}'}</div></template>
          },
          class App {
            public message = 'Aurelia';
            public showCe = true;
            public items: any[];
          }
        ),
        assertionFn: (ctx, host, _comp) => {
          assert.equal(host.childElementCount, 0, 'It should have been empty.');
          assert.notEqual(
            childrenQuerySelector(ctx.doc.body, '.divdiv'),
            null,
            '<div.divdiv> should have been portaled'
          );
          assert.equal(
            ctx.doc.body.querySelector('.divdiv').textContent,
            'Aurelia',
            'It shoulda rendered ${message}'
          );
        }
      },
      {
        title: 'portals when nested inside template controller',
        rootVm: CustomElement.define(
          {
            name: 'app',
            template: <template><div if$='showCe' portal class='divdiv'>{'${message}'}</div></template>
          },
          class App {
            public message = 'Aurelia';
            public showCe = true;
            public items: any[];
          }
        ),
        assertionFn: (ctx, host, _comp) => {
          assert.equal(host.childElementCount, 0, 'It should have been empty.');
          assert.notEqual(
            childrenQuerySelector(ctx.doc.body, '.divdiv'),
            null,
            '<div.divdiv> should have been portaled'/* message when failed */
          );
          assert.equal(
            childrenQuerySelector(ctx.doc.body, '.divdiv').textContent,
            'Aurelia',
            'It shoulda rendered ${message}'
          );
        }
      },
      {
        title: 'works with repeat',
        rootVm: CustomElement.define(
          {
            name: 'app',
            template: <template><div portal repeat$for='item of items' class='divdiv'>{'${message}'}</div></template>
          },
          class App {
            public message = 'Aurelia';
            public showCe = true;
            public items = Array.from({ length: 5 }, (_, idx) => ({ idx }));
          }
        ),
        assertionFn: (ctx, host) => {
          assert.equal(host.childElementCount, 0, 'It should have been empty.');
          assert.equal(
            childrenQuerySelectorAll(ctx.doc.body, '.divdiv').length,
            5,
            'There shoulda been 5 of <div.divdiv>'
          );
          assert.equal(
            ctx.doc.body.textContent.includes('Aurelia'.repeat(5)),
            true,
            'It shoulda rendered ${message}'
          );
        }
      },
      {
        title: 'removes portaled target after torndown',
        rootVm: CustomElement.define(
          {
            name: 'app',
            template: <div portal class='divdiv'>{'${message}'}</div>
          },
          class App { public items: any[]; }
        ),
        assertionFn: (ctx, host) => {
          assert.equal(host.childElementCount, 0, 'It should have been empty.');
          assert.notEqual(
            childrenQuerySelector(ctx.doc.body, '.divdiv'),
            null,
            'There shoulda been 1 <div.divdiv>'
          );
        },
        postTeardownAssertionFn: (ctx, _host) => {
          assert.equal(
            childrenQuerySelector(ctx.doc.body, '.divdiv'),
            null,
            'There shoulda been no <div.divdiv>'
          );
        }
      },
      {
        title: 'it understand render context 1 (render context available before binding)',
        rootVm: CustomElement.define(
          {
            name: 'app',
            template: <template>
              <div ref='localDiv'></div>
              <div portal='target.bind: localDiv' class='divdiv'>{'${message}'}</div>
            </template>
          },
          class App {
            public localDiv: HTMLElement;
            public items: any[];
          }
        ),
        assertionFn: (_ctx, _host, comp) => {
          // should work, or should work after a small waiting time for binding to update
          assert.notEqual(
            childrenQuerySelector(comp.localDiv, '.divdiv'),
            null,
            'comp.localDiv should have contained .divdiv directly'
          );
        }
      },
      {
        title: 'it understand render context 2 (render context available after binding)',
        rootVm: CustomElement.define(
          {
            name: 'app',
            template: <template>
              <div portal='target.bind: localDiv' class='divdiv'>{'${message}'}</div>
              <div ref='localDiv'></div>
            </template>
          },
          class App {
            public localDiv: HTMLElement;
            public items: any[];
          }
        ),
        assertionFn: (_ctx, _host, comp) => {
          runTasks();
          assert.notEqual(
            childrenQuerySelector(comp.localDiv, '.divdiv'),
            null,
            'comp.localDiv should have contained .divdiv'
          );
        },
        postTeardownAssertionFn: (ctx, _host, _comp) => {
          assert.equal(
            childrenQuerySelectorAll(ctx.doc.body, '.divdiv').length,
            0,
            'all .divdiv should have been removed'
          );
        }
      },
      {
        title: 'it works with funny movement',
        rootVm: CustomElement.define(
          {
            name: 'app',
            template: <>
              <div ref='divdiv' portal='target.bind: target' class='divdiv'>{'${message}'}</div>
              <div ref='localDiv'></div>
            </>
          },
          class App {
            public localDiv: HTMLElement;
            public items: any[];
            public $if: boolean;
          }
        ),
        assertionFn: (ctx, _host, comp: IPortalTestRootVm & { target: any; divdiv: HTMLDivElement }) => {
          assert.equal(
            childrenQuerySelector(comp.localDiv, '.divdiv'),
            null,
            'comp.localDiv should not have contained .divdiv (1)'
          );
          assert.equal(
            childrenQuerySelector(ctx.doc.body, '.divdiv'),
            comp.divdiv,
            'body shoulda contained .divdiv (2)'
          );

          comp.target = comp.localDiv;
          runTasks();
          assert.equal(
            childrenQuerySelector(comp.localDiv, '.divdiv'),
            comp.divdiv,
            'comp.localDiv should have contained .divdiv (3)'
          );

          comp.target = null;
          runTasks();
          assert.equal(
            childrenQuerySelector(ctx.doc.body, '.divdiv'),
            comp.divdiv,
            'when .target=null, divdiv shoulda gone back to body (4)'
          );

          comp.target = comp.localDiv;
          runTasks();
          assert.equal(
            childrenQuerySelector(comp.localDiv, '.divdiv'),
            comp.divdiv,
            'comp.localDiv should have contained .divdiv (5)'
          );

          comp.target = undefined;
          runTasks();
          assert.equal(
            childrenQuerySelector(ctx.doc.body, '.divdiv'),
            comp.divdiv,
            'when .target = undefined, .divdiv shoulda gone back to body (6)'
          );
        }
      },
      {
        title: 'it works with funny movement, with render context string',
        rootVm: CustomElement.define(
          {
            name: 'app',
            template: <template>
              <div ref='divdiv' portal='target.bind: target; render-context: #mock-render-context' class='divdiv'>{'${message}'}</div>
              <div ref='localDiv'></div>
              <div id="mock-render-context0">
                <div id="mock-1-0" class="mock-target"></div>
                <div id="mock-2-0" class="mock-target"></div>
                <div id="mock-3-0" class="mock-target"></div>
              </div>
              <div id="mock-render-context">
                <div id="mock-1-1" class="mock-target"></div>
                <div id="mock-2-1" class="mock-target"></div>
                <div id="mock-3-1" class="mock-target"></div>
              </div>
            </template>
          },
          class App {
            public localDiv: HTMLElement;
            public items: any[];
            public $if: boolean;
          }
        ),
        assertionFn: (ctx, _host, comp: { target: any; divdiv: HTMLDivElement }) => {
          assert.notStrictEqual(
            childrenQuerySelector(ctx.doc.body, '.divdiv'),
            null,
            'it should have been moved to body'
          );

          comp.target = '.mock-target';
          runTasks();
          assert.strictEqual(comp.divdiv.parentElement.id, 'mock-1-1');

          comp.target = null;
          runTasks();
          assert.strictEqual(comp.divdiv.parentElement, ctx.doc.body);
        }
      },
      {
        title: 'it works with funny movement, with render context element',
        rootVm: CustomElement.define(
          {
            name: 'app',
            template: <template>
              <div ref='divdiv' portal='target.bind: target; render-context.bind: renderContext' class='divdiv'>{'${message}'}</div>
              <div ref='localDiv'></div>
              <div id="mock-render-context0">
                <div id="mock-1-0" class="mock-target"></div>
                <div id="mock-2-0" class="mock-target"></div>
                <div id="mock-3-0" class="mock-target"></div>
              </div>
              <div id="mock-render-context">
                <div id="mock-1-1" class="mock-target"></div>
                <div id="mock-2-1" class="mock-target"></div>
                <div id="mock-3-1" class="mock-target"></div>
              </div>
            </template>
          },
          class App {
            public localDiv: HTMLElement;
            public items: any[];
            public renderContext: HTMLElement;
          }
        ),
        assertionFn: (ctx, host, comp: { target: any; divdiv: HTMLDivElement; renderContext: HTMLElement }) => {
          assert.notStrictEqual(
            childrenQuerySelector(ctx.doc.body, '.divdiv'),
            null,
            'it should have been moved to body'
          );

          comp.target = '.mock-target';
          runTasks();
          assert.strictEqual(comp.divdiv.parentElement.id, 'mock-1-0');

          comp.target = null;
          runTasks();
          assert.strictEqual(comp.divdiv.parentElement, ctx.doc.body);

          comp.target = '.mock-target';
          runTasks();
          // still not #mock-1-1 yet, because render context is unclear, so #mock-1-0 comes first for .mock-target
          assert.strictEqual(comp.divdiv.parentElement.id, 'mock-1-0');

          comp.renderContext = host.querySelector('#mock-render-context');
          runTasks();
          assert.strictEqual(comp.divdiv.parentElement.id, 'mock-1-1');

          comp.renderContext = undefined;
          runTasks();
          assert.strictEqual(comp.divdiv.parentElement.id, 'mock-1-0');

          comp.renderContext = null;
          runTasks();
          assert.strictEqual(comp.divdiv.parentElement.id, 'mock-1-0');
        }
      },
      // todo: add activating/deactivating + async + timing tests
    ];

    eachCartesianJoin(
      [basicTestCases],
      (testCase) => {
        const {
          only,
          title,
          rootVm,
          assertionFn,
          postTeardownAssertionFn
        } = testCase;

        async function testFn() {
          const { ctx, component, host, dispose } = $setup({ root: rootVm });

          await assertionFn(ctx, host, component);

          await dispose();

          if (postTeardownAssertionFn) {
            await postTeardownAssertionFn(ctx, host, component);
          }
        }

        only
          // eslint-disable-next-line mocha/no-exclusive-tests
          ? it.only(typeof title === 'string' ? title : title(), testFn)
          : it(typeof title === 'string' ? title : title(), testFn);
      }
    );
  });

  interface IPortalTestCase<K> {
    only?: boolean;
    title: string | (() => string);
    rootVm: Constructable<K>;
    deps?: any[];
    assertionFn(ctx: TestContext, host: HTMLElement, component: K): void | Promise<void>;
    postTeardownAssertionFn?(ctx: TestContext, host: HTMLElement, component: K): void | Promise<void>;
  }

  interface IPortalTestRootVm {
    items?: any[];
    localDiv?: HTMLElement;
    renderContext?: HTMLElement;
  }

  function $setup<T extends object>(options: { root: Constructable<T>; resources?: IRegistry[] }) {
    const { root: Root, resources = []} = options;
    const ctx = TestContext.create();
    ctx.container.register(...resources);

    const au = new Aurelia(ctx.container);
    const host = ctx.doc.body.appendChild(ctx.createElement('app'));
    const component = new Root();

    au.app({ host, component });
    void au.start();

    return {
      ctx,
      component,
      host,
      dispose: async () => {
        await au.stop();
        host.remove();

        au.dispose();
      }
    };
  }

  const childrenQuerySelector = (node: HTMLElement, selector: string): HTMLElement => {
    return Array
      .from(node.children)
      .find(el => el.matches(selector)) as HTMLElement || null;
  };

  const childrenQuerySelectorAll = (node: HTMLElement, selector: string): HTMLElement[] => {
    return Array
      .from(node.children)
      .filter(el => el.matches(selector)) as HTMLElement[];
  };
});
