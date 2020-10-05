import { CustomElement, Aurelia, customElement } from '@aurelia/runtime';
import { TestContext, assert } from '@aurelia/testing';

describe('CustomElement.createInjectable', function () {
  it('properly links parent-child', async function () {
    const IRoot = CustomElement.createInjectable();
    const IParent = CustomElement.createInjectable();
    const IChild = CustomElement.createInjectable();

    @customElement({
      name: 'root',
      template: `<parent></parent><parent></parent>`,
      injectable: IRoot,
    })
    class Root {}

    let parentId = 0;

    @customElement({
      name: 'parent',
      template: ` P(\${id}<child></child><child></child>)<parent if.bind="parent === null"></parent>`,
      injectable: IParent,
    })
    class Parent {
      public id: number = ++parentId;

      public constructor(
        @IRoot public readonly root: Root | null,
        @IParent public readonly parent: Parent | null,
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
        @IRoot public readonly root: Root | null,
        @IParent public readonly parent: Parent | null,
        @IChild public readonly child: Child | null,
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

    const ctx = TestContext.createHTMLTestContext();
    const host = ctx.createElement('div');
    const component = new Root();
    const au = new Aurelia(ctx.container).register(Parent, Child).app({ host, component });

    await au.start().wait();

    assert.visibleTextEqual(au.root, ' P(1 C(1) C(5) C(2) C(6)) P(3 C(7) C(9) C(8) C(10)) P(2 C(3) C(11) C(4) C(12)) P(4 C(13) C(15) C(14) C(16))');

    await au.stop().wait();
  });
});
