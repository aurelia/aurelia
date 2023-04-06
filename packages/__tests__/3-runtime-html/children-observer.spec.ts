import { children, CustomElement, PartialChildrenDefinition, Aurelia, customElement } from '@aurelia/runtime-html';
import { TestContext, assert, createFixture } from '@aurelia/testing';
import { IContainer } from '@aurelia/kernel';

describe('3-runtime-html/children-observer.spec.ts', function () {
  describe('populates', function () {
    it('[without shadow DOM] static plain elements', async function () {
      @customElement({ name: 'my-el', template: '<slot>', shadowOptions: { mode: 'open' } })
      class MyEl {
        @children({ filter: n => !!n, map: n => n }) public children: unknown[];
      }
      const { getBy } = await createFixture(
        '<my-el><div>one</div><span>two</span>',
        class {},
        [MyEl]
      ).started;

      const myElVm = CustomElement.for(getBy('my-el')).viewModel as MyEl;
      assert.strictEqual(myElVm.children.length, 2);
    });

    it('children array with child view models', async function () {
      const { au, viewModel, ChildOne, ChildTwo } = createAppAndStart();

      await Promise.resolve();
      assert.equal(viewModel.children.length, 2);
      assert.instanceOf(viewModel.children[0], ChildOne);
      assert.instanceOf(viewModel.children[1], ChildTwo);

      await au.stop();

      au.dispose();
    });

    it('children array with by custom query', async function () {
      const { au, viewModel, ChildOne } = createAppAndStart({
        query: p => p.host.querySelectorAll('.child-one')
      });

      await Promise.resolve();

      assert.equal(viewModel.children.length, 1);
      assert.instanceOf(viewModel.children[0], ChildOne);

      await au.stop();
      au.dispose();
    });

    it('children array with by custom query, filter, and map', async function () {
      const { au, viewModel, ChildOne } = createAppAndStart({
        query: p => p.host.querySelectorAll('.child-one'),
        filter: (node) => !!node,
        map: (node) => node
      });

      await Promise.resolve();

      assert.equal(viewModel.children.length, 1);
      assert.equal(viewModel.children[0].tagName, CustomElement.getDefinition(ChildOne).name.toUpperCase());

      await au.stop();
      au.dispose();
    });
  });

  describe('updates', function () {
    it('children array with child view models', async function () {
      const { au, viewModel, ChildOne, ChildTwo, hostViewModel } = createAppAndStart();

      await Promise.resolve();

      assert.equal(viewModel.children.length, 2);
      assert.equal(viewModel.childrenChangedCallCount, 1);

      hostViewModel.oneCount = 2;
      hostViewModel.twoCount = 2;

      await Promise.resolve();

      assert.equal(viewModel.children.length, 4);
      assert.equal(viewModel.childrenChangedCallCount, 2);
      assert.instanceOf(viewModel.children[0], ChildOne);
      assert.instanceOf(viewModel.children[1], ChildOne);
      assert.instanceOf(viewModel.children[2], ChildTwo);
      assert.instanceOf(viewModel.children[3], ChildTwo);
      await au.stop();

      au.dispose();
    });

    it('children array with by custom query', async function () {
      const { au, viewModel, ChildTwo, hostViewModel } = createAppAndStart({
        query: p => p.host.querySelectorAll('.child-two')
      });

      await Promise.resolve();

      assert.equal(viewModel.children.length, 1);
      assert.instanceOf(viewModel.children[0], ChildTwo);
      assert.equal(viewModel.childrenChangedCallCount, 1);

      hostViewModel.oneCount = 2;
      hostViewModel.twoCount = 2;

      await Promise.resolve();

      assert.equal(viewModel.children.length, 2);
      assert.equal(viewModel.childrenChangedCallCount, 2);
      assert.instanceOf(viewModel.children[0], ChildTwo);
      assert.instanceOf(viewModel.children[1], ChildTwo);

      await au.stop();

      au.dispose();
    });

    it('children array with by custom query, filter, and map', async function () {
      const { au, viewModel, ChildTwo, hostViewModel } = createAppAndStart({
        query: p => p.host.querySelectorAll('.child-two'),
        filter: (node) => !!node,
        map: (node) => node
      });

      await Promise.resolve();

      const tagName = CustomElement.getDefinition(ChildTwo).name.toUpperCase();

      assert.equal(viewModel.children.length, 1);
      assert.equal(viewModel.children[0].tagName, tagName);
      assert.equal(viewModel.childrenChangedCallCount, 1);

      hostViewModel.oneCount = 2;
      hostViewModel.twoCount = 2;

      await Promise.resolve();

      assert.equal(viewModel.children.length, 2);
      assert.equal(viewModel.childrenChangedCallCount, 2);
      assert.equal(viewModel.children[0].tagName, tagName);
      assert.equal(viewModel.children[1].tagName, tagName);

      await au.stop();

      au.dispose();
    });

    it('updates subscribers', async function () {
      @customElement({
        name: 'e-l',
        template: 'child count: ${nodes.length}<au-slot>',
        shadowOptions: { mode: 'open' }
      })
      class El {
        @children('div') nodes: any[];
      }
      const { assertText } = createFixture(
        '<e-l ref=el><div repeat.for="i of items">',
        class App {
          items = 3;
        },
        [El]
      );

      await new Promise(r => setTimeout(r, 50));

      assertText('child count: 3');
    });
  });

  function createAppAndStart(childrenOptions?: PartialChildrenDefinition) {
    const ctx = TestContext.create();
    const { container } = ctx;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const HostElement = defineAndRegisterElementWithChildren(container, childrenOptions);
    const ChildOne = defineAndRegisterElement('child-one', container);
    const ChildTwo = defineAndRegisterElement('child-two', container);
    const component = defineAndRegisterHost(
      `
        <element-with-children>
          <child-one repeat.for="n of oneCount" class="child-one"></child-one>
          <child-two repeat.for="n of twoCount" class="child-two"></child-two>
        </element-with-children>
      `,
      container
    );

    const au = new Aurelia(container);
    const host = ctx.createElement(CustomElement.getDefinition(component).name);

    au.app({ host, component });
    void au.start();

    const hostViewModel = CustomElement.for(host).viewModel as {
      oneCount: number;
      twoCount: number;
    };
    const viewModel = CustomElement.for(host.children[0]).viewModel as {
      children: any[];
      childrenChangedCallCount: number;
    };

    return {
      au,
      hostViewModel,
      viewModel,
      ChildOne,
      ChildTwo
    };
  }

  function defineAndRegisterElementWithChildren(container: IContainer, options?: PartialChildrenDefinition) {
    class ElementWithChildren {
      @children(options) public children;
      public childrenChangedCallCount = 0;
      public childrenChanged() {
        this.childrenChangedCallCount++;
      }
    }

    const element = CustomElement.define({
      name: 'element-with-children',
      template: `<slot></slot>`,
      shadowOptions: { mode: 'open' }
    }, ElementWithChildren);

    container.register(element);

    return element;
  }

  function defineAndRegisterHost(template: string, container: IContainer) {
    class HostElement {
      public oneCount = 1;
      public twoCount = 1;
    }

    const element = CustomElement.define({
      name: 'host-element',
      template
    }, HostElement);

    container.register(element);

    return element;
  }

  function defineAndRegisterElement(name: string, container: IContainer) {
    class Element {
    }

    const element = CustomElement.define({
      name: name,
      template: `<div>My name is ${name}.`
    }, Element);

    container.register(element);

    return element;
  }
});
