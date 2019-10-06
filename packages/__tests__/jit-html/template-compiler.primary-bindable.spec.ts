import {
  Constructable, PLATFORM
} from '@aurelia/kernel';
import {
  Aurelia,
  bindable,
  bindingBehavior,
  customAttribute,
  CustomElement,
  ICustomAttributeResource,
  INode,
  valueConverter,
  CustomAttribute,
  IDOM,
  ValueConverter
} from '@aurelia/runtime';
import {
  assert,
  HTMLTestContext,
  TestContext
} from '@aurelia/testing';
import { HTMLDOM } from '../../runtime-html/dist';

describe('template-compiler.primary-bindable.spec.ts', function() {

  interface IPrimaryBindableTestCase {
    title: string;
    template: string | HTMLElement;
    root?: Constructable;
    only?: boolean;
    resources?: any[];
    browserOnly?: boolean;
    testWillThrow?: boolean;
    attrResources?: any[] | (() => any[]);
    assertFn: (ctx: HTMLTestContext, host: HTMLElement, comp: any, attrResources: any[]) => void | Promise<void>;
  }

  const testCases: IPrimaryBindableTestCase[] = [
    {
      title: '(1) works in basic scenario',
      template: '<div square="red"></div>',
      attrResources: () => {
        @customAttribute('square')
        class Square {
          @bindable()
          public color: string;

          constructor(@INode private readonly el: HTMLElement) {}

          public binding() {
            this.el.style.background = this.color;
          }
        }

        return [Square];
      },
      assertFn: (ctx, host, comp, attrs) => {
        assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
      }
    },
    {
      title: '(2) works in basic scenario, with [primary] 1st position',
      template: '<div square="red"></div>',
      attrResources: () => {
        @customAttribute('square')
        class Square {
          @bindable({ primary: true })
          public color: string;

          @bindable()
          public diameter: number;

          constructor(@INode private readonly el: HTMLElement) {}

          public binding() {
            this.el.style.background = this.color;
            assert.strictEqual(this.diameter, undefined, 'diameter === undefined');
          }
        }

        return [Square];
      },
      assertFn: (ctx, host, comp, attrs) => {
        assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
      }
    },
    {
      title: '(3) works in basic scenario, with [primary] 2nd position',
      template: '<div square="red"></div>',
      attrResources: () => {
        @customAttribute('square')
        class Square {
          @bindable()
          public diameter: number;

          @bindable({ primary: true })
          public color: string;

          constructor(@INode private readonly el: HTMLElement) {}

          public binding() {
            this.el.style.background = this.color;
            assert.strictEqual(this.diameter, undefined, 'diameter === undefined');
          }
        }

        return [Square];
      },
      assertFn: (ctx, host, comp, attrs) => {
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

          constructor(@INode private readonly el: HTMLElement) {}

          public binding() {
            this.el.style.background = this.color;
          }
        }

        return [Square];
      },
      assertFn: (ctx, host, comp, attrs) => {
        assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
      }
    },
    {
      title: '(5) works in basic scenario, [dynamic options style] + [primary] 1st position',
      template: '<div square="color: red"></div>',
      attrResources: () => {
        @customAttribute({
          name: 'square'
        })
        class Square {
          @bindable({ primary: true })
          public color: string;

          @bindable()
          public diameter: string;

          constructor(@INode private readonly el: HTMLElement) {}

          public binding() {
            this.el.style.background = this.color;
            assert.strictEqual(this.diameter, undefined);
          }
        }

        return [Square];
      },
      assertFn: (ctx, host, comp, attrs) => {
        assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
      }
    },
    {
      title: '(6) works in basic scenario, [dynamic options style] + [primary] 2nd position',
      template: '<div square="color: red"></div>',
      attrResources: () => {
        @customAttribute({
          name: 'square'
        })
        class Square {
          @bindable()
          public diameter: string;

          @bindable({ primary: true })
          public color: string;

          constructor(@INode private readonly el: HTMLElement) {}

          public binding() {
            this.el.style.background = this.color;
          }
        }

        return [Square];
      },
      assertFn: (ctx, host, comp, attrs) => {
        assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
      }
    },
    {
      title: '(7) works with interpolation',
      template: '<div square="color: ${`red`}; diameter: ${5}"></div>',
      attrResources: () => {
        @customAttribute({
          name: 'square'
        })
        class Square {
          @bindable()
          public diameter: number;

          @bindable()
          public color: string;

          constructor(@INode private readonly el: HTMLElement) {}

          public binding() {
            this.el.style.background = this.color;
            this.el.style.width = this.el.style.height = `${this.diameter}px`;
          }
        }

        return [Square];
      },
      assertFn: (ctx, host, comp, attrs) => {
        assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
        assert.equal(host.querySelector('div').style.width, '5px');
      }
    },
    {
      title: '(8) default to "value" as primary bindable',
      template: '<div square.bind="color || `red`">',
      attrResources: () => {
        @customAttribute({ name: 'square' })
        class Square {
          public value: string;
          constructor(@INode private el: HTMLElement) {}
          public binding() {
            this.el.style.background = this.value;
          }
        }
        return [Square];
      },
      assertFn: (ctx, host, comp) => {
        assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
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
            constructor(@INode private el: HTMLElement) {}
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
        assertFn: (ctx, host, comp) => {
          assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
        }
      };
    }) as IPrimaryBindableTestCase[],
    // unhappy usage
    {
      title: 'throws when combining binding commnd with interpolation',
      template: '<div square="color.bind: ${`red`}; diameter: ${5}"></div>',
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

          constructor(@INode private readonly el: HTMLElement) {}
        }
        return [Square];
      },
      assertFn: (ctx, host, comp, attrs) => {
        throw new Error('Should not have run');
      }
    },
    {
      title: 'throws when there are two primaries',
      template: '<div square="red"></div>',
      testWillThrow: true,
      attrResources: () => {
        @customAttribute({
          name: 'square'
        })
        class Square {
          @bindable({ primary: true })
          public diameter: number;

          @bindable({ primary: true })
          public color: string;

          constructor(@INode private readonly el: HTMLElement) {}
        }
        return [Square];
      },
      assertFn: (ctx, host, comp, attrs) => {
        throw new Error('Should not have run');
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
      browserOnly,
      assertFn,
      testWillThrow
    } = testCase;
    if (!PLATFORM.isBrowserLike && browserOnly) {
      continue;
    }
    const suit = (_title: string, fn: any) => only
      ? it.only(_title, fn)
      : it(_title, fn);

    suit(title, async function() {
      let body: HTMLElement;
      let host: HTMLElement;
      try {
        const ctx = TestContext.createHTMLTestContext();

        const App = CustomElement.define({ name: 'app', template }, root);
        const au = new Aurelia(ctx.container);
        const attrs = typeof attrResources === 'function' ? attrResources() : attrResources;

        body = ctx.doc.body;
        host = body.appendChild(ctx.createElement('app'));
        ctx.container.register(...resources, ...attrs);

        let didThrow = false;
        let component: any;
        try {
          au.app({ host, component: App });
          await au.start().wait();
          component = au.root.viewModel;
        } catch (ex) {
          didThrow = true;
          if (testWillThrow) {
            // dont try to assert anything on throw
            // just bails
            try {
              await au.stop().wait();
            } catch {/* and ignore all errors trying to stop */}
            return;
          }
          throw ex;
        }

        if (testWillThrow && !didThrow) {
          throw new Error('Expected test to throw, but did NOT');
        }

        await assertFn(ctx, host, component, attrs);

        await au.stop().wait();
        // await assertFn_AfterDestroy(ctx, host, component);
      } finally {
        if (host) {
          host.remove();
        }
        if (body) {
          body.focus();
        }
        await waitForFrames(2);
      }
    });
  }

  describe('mimic vCurrent route-href', function() {
    class $RouteHref$ {

      public static readonly inject = [INode, IDOM];

      @bindable()
      public params: any;

      @bindable()
      public href: string;

      @bindable({ primary: true })
      public route: string;

      constructor(
        private readonly el: HTMLAnchorElement,
        private readonly dom: HTMLDOM
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
        this.href = `/?${property}=${JSON.stringify(this[property] || '')}`;
      }
    }

    const RouteHref = CustomAttribute.define('route-href', $RouteHref$);

    const DotConverter = ValueConverter.define(
      {
        name: 'dot-converter'
      },
      class $$DotConverter {
        public toView(val: string, replaceWith: string): string {
          return typeof val === 'string' && typeof replaceWith === 'string'
            ? val.replace(/\./g, replaceWith)
            : val;
        }
      }
    );

    it('works correctly when binding only route name', async function() {
      const ctx = TestContext.createHTMLTestContext();

      const App = CustomElement.define({
        name: 'app',
        template: `<a route-href="home.main">Home page</a>`
      });
      const au = new Aurelia(ctx.container);

      const body = ctx.doc.body;
      const host = body.appendChild(ctx.createElement('app'));
      ctx.container.register(RouteHref);

      au.app({ component: App, host });
      await au.start().wait();

      assert.strictEqual(host.querySelector('a').search, '/?route=home.main');

      await au.stop().wait();
      host.remove();
    });

    it('works correctly when using with value converter and a colon', async function() {
      const ctx = TestContext.createHTMLTestContext();

      const App = CustomElement.define({
        name: 'app',
        template: `<a route-href="\${routeName | dotConverter:'--'}">Home page</a>`
      });
      const au = new Aurelia(ctx.container);

      const body = ctx.doc.body;
      const host = body.appendChild(ctx.createElement('app'));
      ctx.container.register(RouteHref, DotConverter);

      au.app({ component: App, host });
      await au.start().wait();

      assert.strictEqual(host.querySelector('a').search, '/?route=home--main');

      await au.stop().wait();
      host.remove();
    });

    it('works correctly when using multi binding syntax', async function() {
      const ctx = TestContext.createHTMLTestContext();

      const App = CustomElement.define(
        {
          name: 'app',
          template: `<a route-href="route: home.main; params: { id: appId }">Home page</a>`
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
      await au.start().wait();

      assert.strictEqual(
        host.querySelector('a').search,
        '/?route=home.main'
      );

      ctx.container.get(App).appId = 'appId-appId';
      assert.strictEqual(
        host.querySelector('a').search,
        `/?params=${JSON.stringify({ id: 'appId-appId' })}`
      );

      await au.stop().wait();
      host.remove();
    });
  });
});

async function waitForFrames(frameCount: number): Promise<void> {
  while (frameCount-- > 0) {
    await new Promise(PLATFORM.requestAnimationFrame);
  }
}
