import { TestContext } from '../util';
import { CustomElementResource, Aurelia, ICustomElement, IDOM, IProjectorLocator, IRenderingEngine, INode, LifecycleFlags, Scope, BindingContext } from '@aurelia/runtime';
import { expect } from 'chai';
import { InterfaceSymbol } from '@aurelia/kernel';


describe('DI', function() {
  function setup() {
    const ctx = TestContext.createHTMLTestContext();
    const container = ctx.container;
    const au = new Aurelia(container);
    const host = ctx.createElement('div');

    return { ctx, container, au, host };
  }

  describe('can render locally registered types', function() {

    it('from within the type in which it was registered', function() {
      const { au, host } = setup();

      const Foo = CustomElementResource.define(
        {
          name: 'foo',
          template: 'foo'
        },
        class {}
      );

      const App = CustomElementResource.define(
        {
          name: 'app',
          template: `<foo></foo>`,
          dependencies: [Foo]
        },
        class {}
      );

      const component = new App();
      au.app({ host, component });
      au.start();

      expect(host.textContent).to.equal('foo');
    });

    it('from within a child type of the type in which is was registered', function() {
      const { au, host } = setup();

      const Bar = CustomElementResource.define(
        {
          name: 'bar',
          template: 'bar'
        },
        class {}
      );

      const Foo = CustomElementResource.define(
        {
          name: 'foo',
          template: 'foo<bar></bar>'
        },
        class {}
      );

      const App = CustomElementResource.define(
        {
          name: 'app',
          template: `<foo></foo>`,
          dependencies: [Foo, Bar]
        },
        class {}
      );

      const component = new App();
      au.app({ host, component });
      au.start();

      expect(host.textContent).to.equal('foobar');
    });

    it('from within a grandchild type of the type in which is was registered', function() {
      const { au, host } = setup();

      const Baz = CustomElementResource.define(
        {
          name: 'baz',
          template: 'baz'
        },
        class {}
      );

      const Bar = CustomElementResource.define(
        {
          name: 'bar',
          template: 'bar<baz></baz>'
        },
        class {}
      );

      const Foo = CustomElementResource.define(
        {
          name: 'foo',
          template: 'foo<bar></bar>'
        },
        class {}
      );

      const App = CustomElementResource.define(
        {
          name: 'app',
          template: `<foo></foo>`,
          dependencies: [Foo, Bar, Baz]
        },
        class {}
      );

      const component = new App();
      au.app({ host, component });
      au.start();

      expect(host.textContent).to.equal('foobarbaz');
    });

    it('from within a type whose child has registered it, which is a parent via recursion', function() {
      const { au, host } = setup();

      const Bar = CustomElementResource.define(
        {
          name: 'bar',
          template: 'bar<foo depth.bind="depth + 1"></foo>'
        },
        class {
          public static bindables = {
            depth: { property: 'depth', attribute: 'depth' }
          };
        }
      );

      const Foo = CustomElementResource.define(
        {
          name: 'foo',
          template: 'foo<bar if.bind="depth === 0" depth.bind="depth"></bar>',
          dependencies: [Bar]
        },
        class {
          public static bindables = {
            depth: { property: 'depth', attribute: 'depth' }
          };
        }
      );

      const App = CustomElementResource.define(
        {
          name: 'app',
          template: `<foo depth.bind="depth"></foo>`,
          dependencies: [Foo]
        },
        class {
          public depth: number = 0;
        }
      );

      const component = new App();
      au.app({ host, component });
      au.start();

      expect(host.textContent).to.equal('foobarfoo');
    });
  });

  describe('can resolve locally registered types', function() {

    it('from within the type in which it was registered', function() {
      const { au, host } = setup();

      const Foo = CustomElementResource.define(
        {
          name: 'foo',
          template: 'foo'
        },
        class {}
      );

      const App = CustomElementResource.define(
        {
          name: 'app',
          template: `app`,
          dependencies: [Foo]
        },
        class {
          public node: INode;
          public child: ICustomElement;
          constructor(node: INode) {
            this.node = node;
          }

          public binding(this: ICustomElement & this): void {
            this.child = this.$context.get<ICustomElement>('custom-element:foo');
            this.child.$hydrate(this.$context.get(IDOM), this.$context.get(IProjectorLocator), this.$context.get(IRenderingEngine), this.node, this.$context);
            this.child.$bind(LifecycleFlags.none, Scope.create(BindingContext.create()));
          }

          public attaching(): void {
            this.child.$attach(LifecycleFlags.none);
          }
        }
      );

      const component = new App(host);
      au.app({ host, component });
      au.start();

      expect(host.textContent).to.equal('fooapp');
    });

    it('from within a child type of the type in which is was registered', function() {
      const { au, host } = setup();

      const Bar = CustomElementResource.define(
        {
          name: 'bar',
          template: 'bar'
        },
        class {}
      );

      const Foo = CustomElementResource.define(
        {
          name: 'foo',
          template: 'foo'
        },
        class {
          public static inject: InterfaceSymbol<unknown>[] = [INode];
          public node: INode;
          public child: ICustomElement;
          constructor(node: INode) {
            this.node = node;
          }

          public binding(this: ICustomElement & this): void {
            this.child = this.$context.get<ICustomElement>('custom-element:bar');
            this.child.$hydrate(this.$context.get(IDOM), this.$context.get(IProjectorLocator), this.$context.get(IRenderingEngine), this.node, this.$context);
            this.child.$bind(LifecycleFlags.none, Scope.create(BindingContext.create()));
          }

          public attaching(): void {
            this.child.$attach(LifecycleFlags.none);
          }
        }
      );

      const App = CustomElementResource.define(
        {
          name: 'app',
          template: `app<foo></foo>`,
          dependencies: [Foo, Bar]
        },
        class {}
      );

      const component = new App();
      au.app({ host, component });
      au.start();

      expect(host.textContent).to.equal('appbarfoo');
    });

    it('from within a grandchild type of the type in which is was registered', function() {
      const { au, host } = setup();

      const Baz = CustomElementResource.define(
        {
          name: 'baz',
          template: 'baz'
        },
        class {}
      );

      const Bar = CustomElementResource.define(
        {
          name: 'bar',
          template: 'bar'
        },
        class {
          public static inject: InterfaceSymbol<unknown>[] = [INode];
          public node: INode;
          public child: ICustomElement;
          constructor(node: INode) {
            this.node = node;
          }

          public binding(this: ICustomElement & this): void {
            this.child = this.$context.get<ICustomElement>('custom-element:baz');
            this.child.$hydrate(this.$context.get(IDOM), this.$context.get(IProjectorLocator), this.$context.get(IRenderingEngine), this.node, this.$context);
            this.child.$bind(LifecycleFlags.none, Scope.create(BindingContext.create()));
          }

          public attaching(): void {
            this.child.$attach(LifecycleFlags.none);
          }
        }
      );

      const Foo = CustomElementResource.define(
        {
          name: 'foo',
          template: 'foo<bar></bar>'
        },
        class {}
      );

      const App = CustomElementResource.define(
        {
          name: 'app',
          template: `app<foo></foo>`,
          dependencies: [Foo, Bar, Baz]
        },
        class {}
      );

      const component = new App();
      au.app({ host, component });
      au.start();

      expect(host.textContent).to.equal('appfoobazbar');
    });
  });
});
