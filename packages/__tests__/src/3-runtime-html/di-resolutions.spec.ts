import { DI, InterfaceSymbol, newInstanceForScope, resolve } from '@aurelia/kernel';
import { Aurelia, BindingBehavior, CustomElement, IHydratedCustomElementViewModel, ValueConverter, bindable, customElement } from '@aurelia/runtime-html';
import { TestContext, assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/di-resolutions.spec.ts', function () {
  describe('@newInstanceForScope', function () {
    it('resolves different instances for each scoped registration', function () {
      let id = 0;
      class Model { public id = ++id; }

      @customElement({ name: 'list-item', template: `\${model.id}` })
      class ListItem {
        public readonly model = resolve(Model);
      }

      @customElement({ name: 'list', template: '<list-item>', dependencies: [ListItem] })
      class List {
        public readonly context = resolve(newInstanceForScope(Model));
      }

      // act
      const { component } = createFixture(
        `<list component.ref="list1"></list><list component.ref="list2"></list>`,
        class App {
          public readonly list1: IHydratedCustomElementViewModel & List;
          public readonly list2: IHydratedCustomElementViewModel & List;
        },
        [List]
      );

      const listEl1 = component.list1.$controller.host;
      const listEl2 = component.list2.$controller.host;
      assert.strictEqual(id, 2);
      assert.visibleTextEqual(listEl1, '1');
      assert.visibleTextEqual(listEl2, '2');
    });

    it('resolves dependency with: Interface + @newInstanceForScope + default resolver + no registration', function () {
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
        value: number;
        context = resolve(IListboxContext);
      }

      @customElement({
        name: 'list-box',
        template: '<listbox-item repeat.for="i of 5" value.bind="i">',
        dependencies: [IListboxContext, ListboxItem]
      })
      class Listbox {
        context = resolve(newInstanceForScope(IListboxContext));
      }

      // act
      const { component } = createFixture(
        `<list-box component.ref="listbox">`,
        class App {
          public readonly listbox: Listbox;
        },
        [Listbox]
      );

      // assert
      assert.strictEqual(component.listbox.context.open, false);
      assert.strictEqual(contextCallCount, 1);
    });
  });

  describe('definition.injectable', function () {
    it('resolves injectable', function () {
      const InjectableParent = DI.createInterface('injectable') as InterfaceSymbol;
      @customElement({
        name: 'child',
      })
      class Child {
        public static get inject() { return [InjectableParent, Parent]; }
        public constructor(
          public readonly parent1: unknown,
          public readonly parent2: unknown,
        ) { }
      }

      @customElement({ name: 'parent', template: '<child>', injectable: InjectableParent, dependencies: [Child] })
      class Parent { }

      const { appHost } = createFixture('<parent>', CustomElement.define({
        name: 'app',
      }, class App { }), [Parent]);

      const child = CustomElement.for(appHost.querySelector('child')).viewModel as Child;
      const parent = CustomElement.for(appHost.querySelector('parent')).viewModel as Parent;
      assert.strictEqual(parent, child.parent1);
      assert.strictEqual(parent, child.parent2);
    });
  });

  describe('CustomElement.createInjectable', function () {
    it('properly links parent-child', async function () {
      const IRoot = CustomElement.createInjectable();
      const IParent = CustomElement.createInjectable<Parent>();
      const IChild = CustomElement.createInjectable<Child>();

      @customElement({
        name: 'root',
        template: `<parent></parent><parent></parent>`,
        injectable: IRoot,
      })
      class Root { }

      let parentId = 0;

      @customElement({
        name: 'parent',
        template: ` P(\${id}<child></child><child></child>)<parent if.bind="parent === null"></parent>`,
        injectable: IParent,
      })
      class Parent {
        public id: number = ++parentId;

        public constructor(
          public readonly root: Root | null = resolve(IRoot),
          public readonly parent: Parent | null = resolve<InterfaceSymbol<Parent>>(IParent),
        ) {
          assert.instanceOf(root, Root);
          if (parent !== null) {
            assert.instanceOf(parent, Parent);
          }
        }
      }

      let childId = 0;

      @customElement({
        name: 'child',
        template: ` C(\${id})<child if.bind="child === null"></child>`,
        injectable: IChild,
      })
      class Child {
        public id: number = ++childId;

        public constructor(
          public readonly root: Root | null = resolve(IRoot),
          public readonly parent: Parent | null = resolve<InterfaceSymbol<Parent>>(IParent),
          public readonly child: Child | null = resolve<InterfaceSymbol<Child>>(IChild),
        ) {
          assert.instanceOf(root, Root);
          assert.instanceOf(parent, Parent);
          if (child !== null) {
            assert.instanceOf(child, Child);
          }
          switch (this.id) {
            case 1:
            case 5:
            case 2:
            case 6:
              assert.strictEqual(parent.id, 1, `expected parent.id to be 1 at child.id ${this.id}, but got: ${parent.id}`);
              break;
            case 7:
            case 9:
            case 8:
            case 10:
              assert.strictEqual(parent.id, 3, `expected parent.id to be 3 at child.id ${this.id}, but got: ${parent.id}`);
              break;
            case 3:
            case 11:
            case 4:
            case 12:
              assert.strictEqual(parent.id, 2, `expected parent.id to be 2 at child.id ${this.id}, but got: ${parent.id}`);
              break;
            case 13:
            case 15:
            case 14:
            case 16:
              assert.strictEqual(parent.id, 4, `expected parent.id to be 4 at child.id ${this.id}, but got: ${parent.id}`);
              break;
          }
        }
      }

      const ctx = TestContext.create();
      const host = ctx.createElement('div');
      const component = new Root();
      const au = new Aurelia(ctx.container).register(Parent, Child).app({ host, component });

      await au.start();

      assert.visibleTextEqual(host, ' P(1 C(1) C(5) C(2) C(6)) P(3 C(7) C(9) C(8) C(10)) P(2 C(3) C(11) C(4) C(12)) P(4 C(13) C(15) C(14) C(16))');

      await au.stop();

      au.dispose();
    });
  });

  describe('singleton resources', function () {
    it('resolves to a single value converter instance', function () {
      let id = 0;
      const Pipe = ValueConverter.define('pipe', class {
        i = ++id;
      });
      createFixture('${message | pipe}', class { pipe = resolve(Pipe); }, [Pipe]);

      assert.strictEqual(id, 1);
    });

    it('resolves to a single binding behavior instance', function () {
      let id = 0;
      const BB = BindingBehavior.define('bb', class {
        i = ++id;
      });
      createFixture('${message & bb}', class { pipe = resolve(BB); }, [BB]);

      assert.strictEqual(id, 1);
    });
  });
});

