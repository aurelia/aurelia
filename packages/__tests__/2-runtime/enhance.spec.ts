// This is to test for some intrinsic properties of enhance which is otherwise difficult to test in Data-driven tests parallel to `.app`
import { Constructable, IContainer } from '@aurelia/kernel';
import { Aurelia, CustomElement, ICustomElementViewModel, IScheduler } from '@aurelia/runtime';
import { assert, HTMLTestContext, TestContext, eachCartesianJoin } from '@aurelia/testing';
import { createSpecFunction, TestExecutionContext, TestFunction } from '../util';

describe('enhance', function () {
  interface TestSetupContext {
    getComponent: () => Constructable | ICustomElementViewModel<any>;
    template: string;
    childIndex: number;
    beforeHydration: (host: HTMLElement, child: ChildNode | null) => void;
  }
  class EnhanceTestExecutionContext implements TestExecutionContext<any> {
    private _scheduler: IScheduler;
    public constructor(
      public ctx: HTMLTestContext,
      public container: IContainer,
      public host: HTMLElement,
      public app: any,
      public childNode: ChildNode | null,
    ) { }
    public get scheduler(): IScheduler { return this._scheduler ?? (this._scheduler = this.container.get(IScheduler)); }
  }
  async function testEnhance(
    testFunction: TestFunction<EnhanceTestExecutionContext>,
    {
      getComponent,
      template,
      childIndex,
      beforeHydration
    }: Partial<TestSetupContext> = {}
  ) {
    const ctx = TestContext.createHTMLTestContext();

    const host = ctx.dom.createElement('div');
    host.innerHTML = template;
    ctx.doc.body.appendChild(host);
    const child = childIndex !== void 0
      ? host.childNodes.item(childIndex)
      : null;

    if (typeof beforeHydration === 'function') {
      beforeHydration(host, child);
    }

    const container = ctx.container;
    const au = new Aurelia(container);
    au.enhance({ host, component: getComponent() });
    await au.start().wait();

    const app = au.root.viewModel;
    await testFunction(new EnhanceTestExecutionContext(ctx, container, host, app, child));

    await au.stop().wait();
    ctx.doc.body.removeChild(host);
  }

  const $it = createSpecFunction(testEnhance);

  class App1 {
    public foo: string = 'Bar';
  }
  for (const { text, getComponent } of [
    { text: 'class', getComponent: () => CustomElement.define("app", App1) },
    { text: 'instance', getComponent: () => new App1() },
    { text: 'raw object', getComponent: () => ({ foo: 'Bar' }) },
  ]) {
    $it(`hydrates the root - ${text}`, function ({ host }) {
      assert.html.textContent('span', 'Bar', 'span.text', host);
    }, { getComponent, template: `<span>\${foo}</span>` });

    let handled = false;
    $it(`preserves the element reference - ${text}`,
      function ({ host, scheduler }) {
        handled = false;
        host.querySelector('span').click();
        scheduler.getPostRenderTaskQueue().flush();
        assert.equal(handled, true);
      },
      {
        getComponent,
        template: `<span>\${foo}</span>`,
        childIndex: 0,
        beforeHydration(host, child) {
          child.addEventListener('click', function () { handled = true; });
        }
      });
  }

  for (const initialMethod of ['app', 'enhance']) {

    it(`can be applied on an unhydrated inner node after initial hydration - ${initialMethod} - new container`, async function () {
      const message = "Awesome Possum";
      const template = `
    <button click.delegate="enhance()"></button>
    <div ref="r1" innerhtml.bind="'<div>\${message}</div>'"></div>
    <div ref="r2" innerhtml.bind="'<div>\${message}</div>'"></div>
    `;

      class App2 {
        private readonly r1!: HTMLDivElement;
        private readonly r2!: HTMLDivElement;
        public constructor(
          @IContainer public container: IContainer
        ) { }

        public async afterAttach() {
          await this.enhance(this.r1);
        }

        private async enhance(host = this.r2) {
          await new Aurelia(TestContext.createHTMLTestContext().container)
            .enhance({ host: host.querySelector('div'), component: { message } })
            .start()
            .wait();
        }
      }
      const ctx = TestContext.createHTMLTestContext();

      const host = ctx.dom.createElement('div');
      ctx.doc.body.appendChild(host);

      const container = ctx.container;
      const au = new Aurelia(container);
      let component;
      if (initialMethod === 'app') {
        component = CustomElement.define({ name: 'app', template }, App2);
      } else {
        host.innerHTML = template;
        component = CustomElement.define('app', App2);
      }
      au[initialMethod]({ host, component });
      await au.start().wait();

      assert.html.textContent('div', message, 'div', host);

      host.querySelector('button').click();
      const scheduler = container.get(IScheduler);
      scheduler.getPostRenderTaskQueue().flush();

      assert.html.textContent('div:nth-of-type(2)', message, 'div:nth-of-type(2)', host);

      await au.stop().wait();
      ctx.doc.body.removeChild(host);
    });
  }

  const enum ContainerType {
    same = "same",
    child = "child",
  }

  eachCartesianJoin(
    [
      ['app', 'enhance'],
      [ContainerType.same, ContainerType.child]
    ],
    function (initialMethod, containerType) {

      it(`throws error ${containerType} container is used for enhance - ${initialMethod}`, async function () {
        const message = "Awesome Possum";
        const template = `<div ref="r1" innerhtml.bind="'<div>\${message}</div>'"></div>`;

        class App2 {
          private readonly r1!: HTMLDivElement;
          public message: string | undefined;
          public constructor(
            @IContainer public container: IContainer
          ) { }

          public async afterAttach() {
            await this.enhance(this.r1);
          }

          private async enhance(host: HTMLElement) {
            let container: IContainer;
            switch (containerType) {
              case ContainerType.same:
                container = this.container;
                break;
              case ContainerType.child:
                container = this.container.createChild();
                break;
            }
            try {
              await new Aurelia(container)
                .enhance({ host: host.querySelector('div'), component: { message } })
                .start()
                .wait();
            } catch (e) {
              this.message = e.message;
            }
          }
        }
        const ctx = TestContext.createHTMLTestContext();

        const host = ctx.dom.createElement('div');
        ctx.doc.body.appendChild(host);

        const container = ctx.container;
        const au = new Aurelia(container);
        let component;
        if (initialMethod === 'app') {
          component = CustomElement.define({ name: 'app', template }, App2);
        } else {
          host.innerHTML = template;
          component = CustomElement.define('app', App2);
        }
        au[initialMethod]({ host, component });
        await au.start().wait();

        assert.equal((au.root.viewModel as App2).message, 'An instance of Aurelia is already registered with the container or an ancestor of it.');

        await au.stop().wait();
        ctx.doc.body.removeChild(host);
      });
    }
  );

  it(`respects the hooks in raw object component`, async function () {
    const ctx = TestContext.createHTMLTestContext();

    const host = ctx.dom.createElement('div');
    host.innerHTML = '<span></span>';
    ctx.doc.body.appendChild(host);

    const component = {
      eventLog: [],
      create() { this.eventLog.push('create'); },
      beforeCompile() { this.eventLog.push('beforeCompile'); },
      afterCompile() { this.eventLog.push('afterCompile'); },
      afterCompileChildren() { this.eventLog.push('afterCompileChildren'); },
      beforeBind() { this.eventLog.push('beforeBind'); },
      afterBind() { this.eventLog.push('afterBind'); },
      beforeAttach() { this.eventLog.push('beforeAttach'); },
      afterAttach() { this.eventLog.push('afterAttach'); },
    };
    const container = ctx.container;
    const au = new Aurelia(container);
    au.enhance({ host, component });
    await au.start().wait();

    await au.stop().wait();
    ctx.doc.body.removeChild(host);

    assert.deepStrictEqual(component.eventLog, [
      'create',
      'beforeCompile',
      'afterCompile',
      'afterCompileChildren',
      'beforeBind',
      'afterBind',
      'beforeAttach',
      'afterAttach',
    ]);
  });
});
