import {
  Constructable, resolve,
} from '@aurelia/kernel';
import {
  assert,
  TestContext,
} from '@aurelia/testing';
import {
  bindable,
  bindingBehavior,
  valueConverter,
  customAttribute,
  CustomElement,
  INode,
  CustomAttribute,
  Aurelia,
  ValueConverter,
  BindingMode,
} from '@aurelia/runtime-html';
import { isNode } from '../util.js';
import { runTasks } from '@aurelia/runtime';

describe('3-runtime-html/template-compiler.primary-bindable.spec.ts', function () {

  interface IPrimaryBindableTestCase {
    title: string;
    template: string | HTMLElement;
    root?: Constructable;
    only?: boolean;
    resources?: any[];
    browserOnly?: boolean;
    testWillThrow?: boolean;
    attrResources?: any[] | (() => any[]);
    assertFn: (ctx: TestContext, host: HTMLElement, comp: any, attrResources: any[]) => void | Promise<void>;
  }

  const testCases: IPrimaryBindableTestCase[] = [
    {
      title: '(1) works in basic scenario with explicit defaultProperty',
      template: '<div square="red"></div>',
      attrResources: () => {
        @customAttribute({ name: 'square', defaultProperty: 'color' })
        class Square {
          @bindable()
          public color: string;

          private readonly el: INode<HTMLElement> = resolve(INode) as INode<HTMLElement>;

          public binding() {
            this.el.style.background = this.color;
          }
        }

        return [Square];
      },
      assertFn: (_ctx, host, _comp, _attrs) => {
        assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
      }
    },
    {
      title: '(2) works with defaultProperty specifying a non-first bindable',
      template: '<div square="red"></div>',
      attrResources: () => {
        @customAttribute({ name: 'square', defaultProperty: 'color' })
        class Square {
          @bindable()
          public diameter: number;

          @bindable()
          public color: string;

          private readonly el: INode<HTMLElement> = resolve(INode) as INode<HTMLElement>;

          public binding() {
            this.el.style.background = this.color;
            assert.strictEqual(this.diameter, undefined, 'diameter === undefined');
          }
        }

        return [Square];
      },
      assertFn: (_ctx, host, _comp, _attrs) => {
        assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
      }
    },
    {
      title: '(3) works with defaultProperty specifying first bindable explicitly',
      template: '<div square="red"></div>',
      attrResources: () => {
        @customAttribute({ name: 'square', defaultProperty: 'color' })
        class Square {
          @bindable()
          public color: string;

          @bindable()
          public diameter: number;

          private readonly el: INode<HTMLElement> = resolve(INode) as INode<HTMLElement>;

          public binding() {
            this.el.style.background = this.color;
            assert.strictEqual(this.diameter, undefined, 'diameter === undefined');
          }
        }

        return [Square];
      },
      assertFn: (_ctx, host, _comp, _attrs) => {
        assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
      }
    },
    {
      title: '(4) works in basic scenario, [dynamic options style]',
      template: '<div square="color: red"></div>',
      attrResources: () => {
        @customAttribute({
          name: 'square'
        })
        class Square {
          @bindable()
          public color: string;

          private readonly el: INode<HTMLElement> = resolve(INode) as INode<HTMLElement>;

          public binding() {
            this.el.style.background = this.color;
          }
        }

        return [Square];
      },
      assertFn: (_ctx, host, _comp, _attrs) => {
        assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
      }
    },
    {
      title: '(5) works in basic scenario, [dynamic options style] + [defaultProperty]',
      template: '<div square="color: red"></div>',
      attrResources: () => {
        @customAttribute({
          name: 'square',
          defaultProperty: 'color'
        })
        class Square {
          @bindable()
          public color: string;

          @bindable()
          public diameter: string;

          private readonly el: INode<HTMLElement> = resolve(INode) as INode<HTMLElement>;

          public binding() {
            this.el.style.background = this.color;
            assert.strictEqual(this.diameter, undefined);
          }
        }

        return [Square];
      },
      assertFn: (_ctx, host, _comp, _attrs) => {
        assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
      }
    },
    {
      title: '(6) works with interpolation',
      template: `<div square="color: \${\`red\`}; diameter: \${5}"></div>`,
      attrResources: () => {
        @customAttribute({
          name: 'square'
        })
        class Square {
          @bindable()
          public diameter: number;

          @bindable()
          public color: string;

          private readonly el: INode<HTMLElement> = resolve(INode) as INode<HTMLElement>;

          public binding() {
            this.el.style.background = this.color;
            this.el.style.width = this.el.style.height = `${this.diameter}px`;
          }
        }

        return [Square];
      },
      assertFn: (_ctx, host, _comp, _attrs) => {
        assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
        assert.equal(host.querySelector('div').style.width, '5px');
      }
    },
    {
      title: '(7) default to "value" as default property when no bindables defined',
      template: '<div square.bind="color || `red`">',
      attrResources: () => {
        @customAttribute({ name: 'square' })
        class Square {
          public value: string;
          private readonly el: INode<HTMLElement> = resolve(INode) as INode<HTMLElement>;

          public binding() {
            this.el.style.background = this.value;
          }
        }
        return [Square];
      },
      assertFn: (_ctx, host, _comp) => {
        assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
      }
    },
    {
      title: '(8) defaultProperty can specify a non-bindable property (implicit bindable)',
      template: '<div square.bind="color || `red`">',
      attrResources: () => {
        @customAttribute({ name: 'square', defaultProperty: 'myProp' })
        class Square {
          public myProp: string;
          private readonly el: INode<HTMLElement> = resolve(INode) as INode<HTMLElement>;

          public binding() {
            this.el.style.background = this.myProp;
          }
        }
        return [Square];
      },
      assertFn: (_ctx, host, _comp) => {
        assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
      }
    },
    {
      title: '(9) defaultProperty preserves binding mode when pointing to existing bindable with twoWay mode',
      template: '<div my-attr.bind="value"></div>',
      root: class App {
        public value = 'initial';
      },
      attrResources: () => {
        @customAttribute({ name: 'my-attr', defaultProperty: 'data' })
        class MyAttr {
          @bindable({ mode: BindingMode.twoWay })
          public data: string;

          public bound() {
            // Simulate the attribute updating the value (e.g., from user input)
            this.data = 'updated-by-attr';
          }
        }
        return [MyAttr];
      },
      assertFn: async (_ctx, _host, comp) => {
        // The two-way binding should have propagated the change back to the component
        runTasks();
        assert.equal(comp.value, 'updated-by-attr', 'two-way binding should update parent component');
      }
    },
    ...[
      'color | identity: value',
      '`literal:literal`',
      'color & bb:value',
    ].map((expression, idx) => {
      return {
        title: `(${8 + idx + 1}) does not get interpreted as multi bindings when there is a binding command with colon in value: ${expression}`,
        template: `<div square.bind="${expression}">`,
        attrResources: () => {
          @customAttribute({ name: 'square' })
          class Square {
            public value: string;
            private readonly el: INode<HTMLElement> = resolve(INode) as INode<HTMLElement>;

            public binding() {
              const value = this.value === 'literal:literal' ? 'red' : this.value;
              this.el.style.background = value;
            }
          }

          @valueConverter('identity')
          class Identity {
            public toView(val: any, alternativeValue: any) {
              return alternativeValue || val;
            }
          }

          @bindingBehavior('bb')
          class BB {
            public bind() {/*  */}
            public unbind() {/*  */}
          }

          return [Square, Identity, BB];
        },
        root: class App {
          public color = 'red';
        },
        assertFn: (_ctx, host, _comp) => {
          assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
        }
      };
    }) as IPrimaryBindableTestCase[],
    // unhappy usage
    {
      title: 'throws when combining binding commnd with interpolation',
      template: `<div square="color.bind: \${\`red\`}; diameter: \${5}"></div>`,
      testWillThrow: true,
      attrResources: () => {
        @customAttribute({
          name: 'square'
        })
        class Square {
          @bindable()
          public diameter: number;

          @bindable()
          public color: string;

          private readonly el: INode<HTMLElement> = resolve(INode) as INode<HTMLElement>;
        }
        return [Square];
      },
      assertFn: (_ctx, _host, _comp, _attrs) => {
        throw new Error('Should not have run');
      }
    },
    {
      title: 'works with long name, in single binding syntax',
      template: '<div square="5"></div>',
      attrResources: () => {
        @customAttribute({
          name: 'square',
          defaultProperty: 'borderRadius'
        })
        class Square {

          @bindable()
          public borderRadius: number;

          @bindable()
          public diameter: number;

          @bindable()
          public color: string;

          private readonly el: INode<HTMLElement> = resolve(INode) as INode<HTMLElement>;

          public binding(): void {
            this.el.style.borderRadius = `${this.borderRadius || 0}px`;
          }
        }
        return [Square];
      },
      assertFn: (_ctx, host) => {
        assert.strictEqual(host.querySelector('div').style.borderRadius, '5px');
      }
    },
    {
      title: 'works with long name, in multi binding syntax',
      template: '<div square="border-radius: 5; color: red"></div>',
      attrResources: () => {
        @customAttribute({
          name: 'square',
          defaultProperty: 'borderRadius'
        })
        class Square {

          @bindable()
          public borderRadius: number;

          @bindable()
          public color: string;

          private readonly el: INode<HTMLElement> = resolve(INode) as INode<HTMLElement>;

          public binding(): void {
            this.el.style.borderRadius = `${this.borderRadius || 0}px`;
            this.el.style.color = this.color;
          }
        }
        return [Square];
      },
      assertFn: (_ctx, host) => {
        const divEl = host.querySelector('div');
        assert.strictEqual(divEl.style.borderRadius, '5px');
        assert.strictEqual(divEl.style.color, 'red');
      }
    },
    {
      title: 'works with long name, in multi binding syntax + with binding command',
      template: '<div square="border-radius.bind: 5; color: red"></div>',
      attrResources: () => {
        @customAttribute({
          name: 'square',
          defaultProperty: 'borderRadius'
        })
        class Square {

          @bindable()
          public borderRadius: number;

          @bindable()
          public color: string;

          private readonly el: INode<HTMLElement> = resolve(INode) as INode<HTMLElement>;

          public binding(): void {
            this.el.style.borderRadius = `${this.borderRadius || 0}px`;
            this.el.style.color = this.color;
          }
        }
        return [Square];
      },
      assertFn: (_ctx, host) => {
        const divEl = host.querySelector('div');
        assert.strictEqual(divEl.style.borderRadius, '5px');
        assert.strictEqual(divEl.style.color, 'red');
      }
    },
  ];

  for (const testCase of testCases) {
    const {
      title,
      template,
      root,
      attrResources = () => [],
      resources = [],
      only,
      assertFn,
      testWillThrow
    } = testCase;
    // if (!PLATFORM.isBrowserLike && browserOnly) {
    //   continue;
    // }
    const suit = (_title: string, fn: any) => only
      // eslint-disable-next-line mocha/no-exclusive-tests
      ? it.only(_title, fn)
      : it(_title, fn);

    suit(title, async function () {
      let body: HTMLElement;
      let host: HTMLElement;
      try {
        const ctx = TestContext.create();

        const App = CustomElement.define({ name: 'app', template }, root);
        const au = new Aurelia(ctx.container);
        const attrs = typeof attrResources === 'function' ? attrResources() : attrResources;

        body = ctx.doc.body;
        host = body.appendChild(ctx.createElement('app'));
        ctx.container.register(...resources, ...attrs);

        let component: any;
        try {
          au.app({ host, component: App });
          await au.start();
          component = au.root.controller.viewModel;
        } catch (ex) {
          if (testWillThrow) {
            // dont try to assert anything on throw
            // just bails
            try {
              await au.stop();
            } catch {/* and ignore all errors trying to stop */}
            return;
          }
          throw ex;
        }

        if (testWillThrow) {
          throw new Error('Expected test to throw, but did NOT');
        }

        await assertFn(ctx, host, component, attrs);

        await au.stop();
        au.dispose();
        // await assertFn_AfterDestroy(ctx, host, component);
      } finally {
        if (host) {
          host.remove();
        }
        if (body) {
          body.focus();
        }
      }
    });
  }

  describe('mimic vCurrent route-href', function () {
    class $RouteHref$ {

      public static readonly inject = [INode];

      @bindable()
      public params: any;

      @bindable()
      public href: string;

      @bindable()
      public route: string;

      public constructor(
        private readonly el: HTMLAnchorElement,
      ) {
        /*  */
      }

      public binding(): void {
        this.updateAnchor('route');
      }

      public routeChanged(): void {
        this.updateAnchor('route');
      }

      public paramsChanged(): void {
        this.updateAnchor('params');
      }

      private updateAnchor(property: 'route' | 'params'): void {
        this.el.href = `/?${property}=${String(this[property] || '')}`;
      }
    }

    const RouteHref = CustomAttribute.define({ name: 'route-href', defaultProperty: 'route' }, $RouteHref$);

    const DotConverter = ValueConverter.define(
      {
        // should it throw when defining a value converter with dash in name?
        // name: 'dot-converter'
        name: 'dotConverter'
      },
      class $$DotConverter {
        public toView(val: string, replaceWith: string): string {
          return typeof val === 'string' && typeof replaceWith === 'string'
            ? val.replace(/\./g, replaceWith)
            : val;
        }
      }
    );

    it('works correctly when binding only route name', async function () {
      const ctx = TestContext.create();

      const App = CustomElement.define({
        name: 'app',
        template: `<a route-href="home.main">Home page</a>`
      });
      const au = new Aurelia(ctx.container);

      const body = ctx.doc.body;
      const host = body.appendChild(ctx.createElement('app'));
      ctx.container.register(RouteHref);

      au.app({ component: App, host });
      await au.start();

      if (isNode()) {
        assert.strictEqual(host.querySelector('a').href, `/?route=home.main`);
      } else {
        assert.includes(host.querySelector('a').search, `?route=home.main`);
      }

      await au.stop();
      au.dispose();
      host.remove();
    });

    it('works correctly when using with value converter and a colon', async function () {
      const ctx = TestContext.create();

      const App = CustomElement.define({
        name: 'app',
        template: `<a route-href="\${'home.main' | dotConverter:'--'}">Home page</a>`
      });
      const au = new Aurelia(ctx.container);

      const body = ctx.doc.body;
      const host = body.appendChild(ctx.createElement('app'));
      ctx.container.register(RouteHref, DotConverter);

      au.app({ component: App, host });
      await au.start();

      if (isNode()) {
        assert.strictEqual(host.querySelector('a').href, '/?route=home--main');
      } else {
        assert.strictEqual(host.querySelector('a').search, '?route=home--main');
      }

      await au.stop();
      au.dispose();
      host.remove();
    });

    // todo: fix:
    //      + timing issue (change handler is invoked before binding)
    it('works correctly when using multi binding syntax', async function () {
      const ctx = TestContext.create();

      const App = CustomElement.define(
        {
          name: 'app',
          template: `<a route-href="route: home.main; params.bind: { id: appId }">Home page</a>`
        },
        class App {
          public appId: string;
        }
      );
      const au = new Aurelia(ctx.container);

      const body = ctx.doc.body;
      const host = body.appendChild(ctx.createElement('app'));
      ctx.container.register(RouteHref);

      au.app({ component: App, host });
      await au.start();

      const anchorEl = host.querySelector('a');

      if (isNode()) {
        assert.strictEqual(anchorEl.href, '/?route=home.main');
      } else {
        assert.strictEqual(anchorEl.search, '?route=home.main');
      }

      const app = au.root.controller.viewModel as any;

      app.appId = 'appId-appId';
      runTasks();
      if (isNode()) {
        assert.strictEqual(anchorEl.href, '/?params=[object Object]');
      } else {
        assert.strictEqual(anchorEl.search, `?params=[object%20Object]`);
      }

      await au.stop();
      au.dispose();
      host.remove();
    });
  });
});
