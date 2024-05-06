/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Constructable, IRegistry } from '@aurelia/kernel';
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
    assertHtml('div', '<!--au-start--><p id="package"></p><!--au-end-->');
    component.open = false;
    assertHtml('div', '');
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
          assert.equal(
            childrenQuerySelector(comp.localDiv, '.divdiv'),
            comp.divdiv,
            'comp.localDiv should have contained .divdiv (3)'
          );

          comp.target = null;
          assert.equal(
            childrenQuerySelector(ctx.doc.body, '.divdiv'),
            comp.divdiv,
            'when .target=null, divdiv shoulda gone back to body (4)'
          );

          comp.target = comp.localDiv;
          assert.equal(
            childrenQuerySelector(comp.localDiv, '.divdiv'),
            comp.divdiv,
            'comp.localDiv should have contained .divdiv (5)'
          );

          comp.target = undefined;
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
          assert.strictEqual(comp.divdiv.parentElement.id, 'mock-1-1');

          comp.target = null;
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
          assert.strictEqual(comp.divdiv.parentElement.id, 'mock-1-0');

          comp.target = null;
          assert.strictEqual(comp.divdiv.parentElement, ctx.doc.body);

          comp.target = '.mock-target';
          // still not #mock-1-1 yet, because render context is unclear, so #mock-1-0 comes first for .mock-target
          assert.strictEqual(comp.divdiv.parentElement.id, 'mock-1-0');

          comp.renderContext = host.querySelector('#mock-render-context');
          assert.strictEqual(comp.divdiv.parentElement.id, 'mock-1-1');

          comp.renderContext = undefined;
          assert.strictEqual(comp.divdiv.parentElement.id, 'mock-1-0');

          comp.renderContext = null;
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
