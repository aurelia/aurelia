// This is to test for some intrinsic properties of enhance which is otherwise difficult to test in Data-driven tests parallel to `.app`
import { Constructable, DI, IContainer, Registration } from '@aurelia/kernel';
import { CustomElement, ICustomElementViewModel, IPlatform, Aurelia, customElement, bindable, BrowserPlatform, StandardConfiguration } from '@aurelia/runtime-html';
import { assert, TestContext, eachCartesianJoin } from '@aurelia/testing';
import { createSpecFunction, TestExecutionContext, TestFunction } from '../util.js';

describe('3-runtime/enhance.spec.ts', function () {
  interface TestSetupContext {
    getComponent: () => Constructable | ICustomElementViewModel;
    template: string;
    childIndex: number;
    beforeHydration: (host: HTMLElement, child: ChildNode | null) => void;
  }
  class EnhanceTestExecutionContext implements TestExecutionContext<any> {
    private _scheduler: IPlatform;
    public constructor(
      public ctx: TestContext,
      public container: IContainer,
      public host: HTMLElement,
      public app: any,
      public childNode: ChildNode | null,
    ) { }
    public get platform(): IPlatform { return this._scheduler ?? (this._scheduler = this.container.get(IPlatform)); }
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
    const ctx = TestContext.create();

    const host = ctx.doc.createElement('div');
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
    await au.start();

    const app = au.root.controller.viewModel;
    await testFunction(new EnhanceTestExecutionContext(ctx, container, host, app, child));

    await au.stop();
    ctx.doc.body.removeChild(host);
    au.dispose();
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
      function ({ host, platform }) {
        handled = false;
        host.querySelector('span').click();
        platform.domReadQueue.flush();
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

        public async attaching() {
          await this.enhance(this.r1);
        }

        private async enhance(host = this.r2) {
          await new Aurelia(TestContext.create().container)
            .enhance({ host: host.querySelector('div'), component: { message } })
            .start();
        }
      }
      const ctx = TestContext.create();

      const host = ctx.doc.createElement('div');
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
      await au.start();

      assert.html.textContent('div', message, 'div', host);

      host.querySelector('button').click();
      ctx.platform.domReadQueue.flush();

      assert.html.textContent('div:nth-of-type(2)', message, 'div:nth-of-type(2)', host);

      await au.stop();
      ctx.doc.body.removeChild(host);
      au.dispose();
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

          public async attaching() {
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
                .start();
            } catch (e) {
              this.message = e.message;
            }
          }
        }
        const ctx = TestContext.create();

        const host = ctx.doc.createElement('div');
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
        await au.start();

        assert.equal((au.root.controller.viewModel as App2).message, 'An instance of Aurelia is already registered with the container or an ancestor of it.');

        await au.stop();
        ctx.doc.body.removeChild(host);
        au.dispose();
      });
    }
  );

  it(`respects the hooks in raw object component`, async function () {
    const ctx = TestContext.create();

    const host = ctx.doc.createElement('div');
    host.innerHTML = '<span></span>';
    ctx.doc.body.appendChild(host);

    const component = {
      eventLog: [],
      define() { this.eventLog.push('define'); },
      hydrating() { this.eventLog.push('hydrating'); },
      hydrated() { this.eventLog.push('hydrated'); },
      created() { this.eventLog.push('created'); },
      binding() { this.eventLog.push('binding'); },
      bound() { this.eventLog.push('bound'); },
      attaching() { this.eventLog.push('attaching'); },
      attached() { this.eventLog.push('attached'); },
    };
    const container = ctx.container;
    const au = new Aurelia(container);
    au.enhance({ host, component });
    await au.start();

    await au.stop();
    ctx.doc.body.removeChild(host);

    assert.deepStrictEqual(component.eventLog, [
      'define',
      'hydrating',
      'hydrated',
      'created',
      'binding',
      'bound',
      'attaching',
      'attached',
    ]);
    au.dispose();
  });

  it(`enhance is idempotent`, async function () {
    const ctx = TestContext.create();

    const host = ctx.doc.createElement('div');
    host.innerHTML = `<span>\${foo}</span>`;
    ctx.doc.body.appendChild(host);

    const component = { foo: 'Bar' };
    const container = ctx.container;
    const au = new Aurelia(container);
    au.enhance({ host, component });

    // round #1
    await au.start();
    assert.html.textContent('span', 'Bar', 'span.text - 1', host);
    await au.stop();

    // round #2
    await au.start();
    assert.html.textContent('span', 'Bar', 'span.text - 2', host);
    await au.stop();

    // round #3
    component.foo = 'Fiz';
    await au.start();
    assert.html.textContent('span', 'Fiz', 'span.text - 3', host);
    await au.stop();
    ctx.doc.body.removeChild(host);
    au.dispose();
  });

  it(`enhance works on detached node`, async function () {
    // eslint-disable-next-line no-template-curly-in-string
    @customElement({ name: 'my-element', template: '<span>${value}</span>' })
    class MyElement {
      @bindable public value: string;
    }
    @customElement({
      name: 'app',
      isStrictBinding: true,
      template: '<div ref="container" id="container"></div>'
    })
    class App {
      private enhancedHost: HTMLElement;
      private enhanceAu: Aurelia;
      private readonly container!: HTMLDivElement;

      public async bound() {
        const _host = this.enhancedHost = new ctx.DOMParser().parseFromString('<div><my-element value.bind="42.toString()"></my-element></div>', 'text/html').body.firstElementChild as HTMLElement;
        // this.container.appendChild(this.enhancedHost);
        const _au = this.enhanceAu = new Aurelia(
          DI.createContainer()
            .register(
              Registration.instance(IPlatform, BrowserPlatform.getOrCreate(globalThis)),
              StandardConfiguration,
            )
        );
        await _au
          .register(MyElement) // in real app, there should be more
          .enhance({ host: _host, component: CustomElement.define({ name: 'enhance' }, class EnhanceRoot { }) })
          .start();

        assert.html.innerEqual(_host, '<my-element class="au"><span>42</span></my-element>', 'enhanced.innerHtml');
        assert.html.innerEqual(this.container, '', 'container.innerHtml - before attach');
      }

      public attaching() {
        this.container.appendChild(this.enhancedHost);
      }

      // The inverse order of the stop and detaching is intentional
      public async detaching() {
        await this.enhanceAu.stop();
        assert.html.innerEqual(this.enhancedHost, '<my-element class="au"></my-element>', 'enhanced.innerHtml');
        assert.html.innerEqual(this.container, '<div><my-element class="au"></my-element></div>', 'enhanced.innerHtml');
      }

      public unbinding() {
        this.enhancedHost.remove();
      }
    }

    const ctx = TestContext.create();
    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);

    const container = ctx.container;
    const au = new Aurelia(container);
    await au
      .app({ host, component: App })
      .start();

    assert.html.innerEqual(host.querySelector('#container'), '<div><my-element class="au"><span>42</span></my-element></div>', 'container.innerHTML - after attach');

    await au.stop();

    assert.html.innerEqual(host, '', 'post-stop host.innerHTML');

    ctx.doc.body.removeChild(host);
    au.dispose();
  });
});
