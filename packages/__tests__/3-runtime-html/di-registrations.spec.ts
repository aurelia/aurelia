import { DI, newInstanceForScope } from '@aurelia/kernel';
import {
  customElement,
  bindable
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/di-registration.spec.ts', function () {
  describe('@newInstanceForScope', function () {
    it('resolves dependency with: interface + @newInstanceForScope + registration at the parent of requestor', async function () {
      // arrange
      let contextCallCount = 0;
      const IListboxContext = DI.createInterface<IListboxContext>(
        'IListboxContext',
        x => x.singleton(class ListboxContext {
          public open = false;
          public constructor() {
            contextCallCount++;
          }
        })
      );
      interface IListboxContext {
        open: boolean;
      }

      @customElement({
        name: 'listbox-item',
        template: `listbox item \${i}`,
      })
      class ListboxItem {
        @bindable
        public value: number;
        public constructor(
          @IListboxContext public readonly context: IListboxContext
        ) {}
      }

      @customElement({
        name: 'list-box',
        template: '<listbox-item repeat.for="i of 5" value.bind="i">',
        dependencies: [ListboxItem]
      })
      class Listbox {
        public constructor(
          @newInstanceForScope(IListboxContext) public readonly context: IListboxContext
        ) {}
      }

      // act
      const { component, startPromise, tearDown } = createFixture(
        `<list-box view-model.ref="listbox">`,
        class App {
          public readonly listbox: Listbox;
        },
        [Listbox, IListboxContext]
      );

      await startPromise;

      // assert
      assert.strictEqual(component.listbox.context.open, false);
      assert.strictEqual(contextCallCount, 1);

      await tearDown();
    });

    // TODO
    // a slightly different version of the above test,
    // where an interface is register right at the custom element level,
    // and will be used to create a new instance for itself
    // instead of having to rely on the interface being registered in a parent level
    //
    // this is quite messy due to the way container is constructed for custom element
    // it's inappropriate in timing, resulting in difficult scoping behavior for dependencies
    // will take a few steps to fix
    it.skip('resolves dependency with: interface + @newInstanceForScope + registration at requestor', async function () {
      // arrange
      let contextCallCount = 0;
      const IListboxContext = DI.createInterface<IListboxContext>(
        'IListboxContext',
        x => x.singleton(class ListboxContext {
          public open = false;
          public constructor() {
            contextCallCount++;
          }
        })
      );
      interface IListboxContext {
        open: boolean;
      }

      @customElement({
        name: 'listbox-item',
        template: `listbox item \${i}`,
      })
      class ListboxItem {
        @bindable
        public value: number;
        public constructor(
          @IListboxContext public readonly context: IListboxContext
        ) {}
      }

      @customElement({
        name: 'list-box',
        template: '<listbox-item repeat.for="i of 5" value.bind="i">',
        dependencies: [IListboxContext, ListboxItem]
      })
      class Listbox {
        public constructor(
          @newInstanceForScope(IListboxContext) public readonly context: IListboxContext
        ) {}
      }

      // act
      const { component, startPromise, tearDown } = createFixture(
        `<list-box view-model.ref="listbox">`,
        class App {
          public readonly listbox: Listbox;
        },
        [Listbox]
      );

      await startPromise;

      // assert
      assert.strictEqual(component.listbox.context.open, false);
      assert.strictEqual(contextCallCount, 1);

      await tearDown();
    });

    // TODO
    // A skipped test for the most intuitive behavior: @newInstanceForScope(Interface_With_Default)
    //
    // Ideally it probably shouldn't require any registration
    // to invoke an interface with default resolution provided,
    //
    // THOUGH, this may not be implemented, for the sake of consistency
    // with the way normal .get on interface
    it.skip('resolves dependency with: Interface + @newInstanceForScope + default resolver + no registration', async function () {
      // arrange
      let contextCallCount = 0;
      const IListboxContext = DI.createInterface<IListboxContext>(
        'IListboxContext',
        x => x.singleton(class ListboxContext {
          public open = false;
          public constructor() {
            contextCallCount++;
          }
        })
      );
      interface IListboxContext {
        open: boolean;
      }

      @customElement({
        name: 'listbox-item',
        template: `listbox item \${i}`,
      })
      class ListboxItem {
        @bindable
        public value: number;
        public constructor(
          @IListboxContext public readonly context: IListboxContext
        ) {}
      }

      @customElement({
        name: 'list-box',
        template: '<listbox-item repeat.for="i of 5" value.bind="i">',
        dependencies: [IListboxContext, ListboxItem]
      })
      class Listbox {
        public constructor(
          @newInstanceForScope(IListboxContext) public readonly context: IListboxContext
        ) {}
      }

      // act
      const { component, startPromise, tearDown } = createFixture(
        `<list-box view-model.ref="listbox">`,
        class App {
          public readonly listbox: Listbox;
        },
        [Listbox]
      );

      await startPromise;

      // assert
      assert.strictEqual(component.listbox.context.open, false);
      assert.strictEqual(contextCallCount, 1);

      await tearDown();
    });
  });

  // it('from within a type whose child has registered it, which is a parent via recursion', function () {
  //   const { au, host } = createFixture();

  //   const Bar = CustomElement.define(
  //     {
  //       name: 'bar',
  //       template: 'bar<foo depth.bind="depth + 1"></foo>'
  //     },
  //     class {
  //       public static bindables = {
  //         depth: { property: 'depth', attribute: 'depth' }
  //       };
  //     }
  //   );

  //   const Foo = CustomElement.define(
  //     {
  //       name: 'foo',
  //       template: 'foo<bar if.bind="depth === 0" depth.bind="depth"></bar>',
  //       dependencies: [Bar]
  //     },
  //     class {
  //       public static bindables = {
  //         depth: { property: 'depth', attribute: 'depth' }
  //       };
  //     }
  //   );

  //   const App = CustomElement.define(
  //     {
  //       name: 'app',
  //       template: `<foo depth.bind="depth"></foo>`,
  //       dependencies: [Foo]
  //     },
  //     class {
  //       public depth: number = 0;
  //     }
  //   );

  //   const component = new App();
  //   au.app({ host, component });
  //   au.start();

  //   assert.strictEqual(host.textContent, 'foobarfoo', `host.textContent`);
  // });

  // describe('can resolve locally registered types', function () {

  //   it('from within the type in which it was registered', function () {
  //     const { au, host } = createFixture();

  //     const Foo = CustomElement.define(
  //       {
  //         name: 'foo',
  //         template: 'foo'
  //       },
  //       class {}
  //     );

  //     const App = CustomElement.define(
  //       {
  //         name: 'app',
  //         template: `app`,
  //         dependencies: [Foo]
  //       },
  //       class {
  //         public node: INode;
  //         public child: IViewModel;
  //         constructor(node: INode) {
  //           this.node = node;
  //         }

  //         public binding(this: IViewModel & this): void {
  //           this.child = this.$context.get<IViewModel>('au:resource:custom-element:foo');
  //           this.child.$hydrate(LF.none, this.$context, this.node);
  //           this.child.$bind(LF.none, Scope.create(LF.none, BindingContext.create(LF.none)));
  //         }

  //         public beforeAttach(): void {
  //           this.child.$attach(LF.none);
  //         }
  //       }
  //     );

  //     const component = new App(host);
  //     au.app({ host, component });
  //     au.start();

  //     assert.strictEqual(host.textContent, 'fooapp', `host.textContent`);
  //   });

  //   it('from within a child type of the type in which is was registered', function () {
  //     const { au, host } = createFixture();

  //     const Bar = CustomElement.define(
  //       {
  //         name: 'bar',
  //         template: 'bar'
  //       },
  //       class {}
  //     );

  //     const Foo = CustomElement.define(
  //       {
  //         name: 'foo',
  //         template: 'foo'
  //       },
  //       class {
  //         public static readonly inject: readonly Key[] = [INode];
  //         public node: INode;
  //         public child: IViewModel;
  //         constructor(node: INode) {
  //           this.node = node;
  //         }

  //         public binding(this: IViewModel & this): void {
  //           this.child = this.$context.get<IViewModel>('au:resource:custom-element:bar');
  //           this.child.$hydrate(LF.none, this.$context, this.node);
  //           this.child.$bind(LF.none, Scope.create(LF.none, BindingContext.create(LF.none)));
  //         }

  //         public beforeAttach(): void {
  //           this.child.$attach(LF.none);
  //         }
  //       }
  //     );

  //     const App = CustomElement.define(
  //       {
  //         name: 'app',
  //         template: `app<foo></foo>`,
  //         dependencies: [Foo, Bar]
  //       },
  //       class {}
  //     );

  //     const component = new App();
  //     au.app({ host, component });
  //     au.start();

  //     assert.strictEqual(host.textContent, 'appbarfoo', `host.textContent`);
  //   });

  //   it('from within a grandchild type of the type in which is was registered', function () {
  //     const { au, host } = createFixture();

  //     const Baz = CustomElement.define(
  //       {
  //         name: 'baz',
  //         template: 'baz'
  //       },
  //       class {}
  //     );

  //     const Bar = CustomElement.define(
  //       {
  //         name: 'bar',
  //         template: 'bar'
  //       },
  //       class {
  //         public static readonly inject: readonly Key[] = [INode];
  //         public node: INode;
  //         public child: IViewModel;
  //         constructor(node: INode) {
  //           this.node = node;
  //         }

  //         public binding(this: IViewModel & this): void {
  //           this.child = this.$context.get<IViewModel>('au:resource:custom-element:baz');
  //           this.child.$hydrate(LF.none, this.$context, this.node);
  //           this.child.$bind(LF.none, Scope.create(LF.none, BindingContext.create(LF.none)));
  //         }

  //         public beforeAttach(): void {
  //           this.child.$attach(LF.none);
  //         }
  //       }
  //     );

  //     const Foo = CustomElement.define(
  //       {
  //         name: 'foo',
  //         template: 'foo<bar></bar>'
  //       },
  //       class {}
  //     );

  //     const App = CustomElement.define(
  //       {
  //         name: 'app',
  //         template: `app<foo></foo>`,
  //         dependencies: [Foo, Bar, Baz]
  //       },
  //       class {}
  //     );

  //     const component = new App();
  //     au.app({ host, component });
  //     au.start();

  //     assert.strictEqual(host.textContent, 'appfoobazbar', `host.textContent`);
  //   });
  // });
});
