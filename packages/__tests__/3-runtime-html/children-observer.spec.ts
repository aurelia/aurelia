import { children, CustomElement, PartialChildrenDefinition, Aurelia } from '@aurelia/runtime-html';
import { TestContext, assert } from '@aurelia/testing';
import { IContainer } from '@aurelia/kernel';

describe('ChildrenObserver', function () {
  describe('populates', function () {
    it('children array with child view models', function () {
      const { au, viewModel, ChildOne, ChildTwo } = createAppAndStart();
      assert.equal(viewModel.children.length, 2);
      assert.instanceOf(viewModel.children[0], ChildOne);
      assert.instanceOf(viewModel.children[1], ChildTwo);

      void au.stop();

      au.dispose();
    });

    it('children array with by custom query', function () {
      const { au, viewModel, ChildOne } = createAppAndStart({
        query: p => (p.host as HTMLElement).querySelectorAll('.child-one')
      });

      assert.equal(viewModel.children.length, 1);
      assert.instanceOf(viewModel.children[0], ChildOne);

      void au.stop();
      au.dispose();
    });

    it('children array with by custom query, filter, and map', function () {
      const { au, viewModel, ChildOne } = createAppAndStart({
        query: p => (p.host as HTMLElement).querySelectorAll('.child-one'),
        filter: (node) => !!node,
        map: (node) => node
      });

      assert.equal(viewModel.children.length, 1);
      assert.equal(viewModel.children[0].tagName, CustomElement.getDefinition(ChildOne).name.toUpperCase());

      void au.stop();
      au.dispose();
    });
  });

  describe('updates', function () {
    // if (!PLATFORM.isBrowserLike) {
    //   return;
    // }

    it('children array with child view models', function (done) {
      const { au, viewModel, ChildOne, ChildTwo, hostViewModel } = createAppAndStart();

      assert.equal(viewModel.children.length, 2);
      assert.equal(viewModel.childrenChangedCallCount, 0);

      hostViewModel.oneCount = 2;
      hostViewModel.twoCount = 2;

      waitForUpdate(() => {
        assert.equal(viewModel.children.length, 4);
        assert.equal(viewModel.childrenChangedCallCount, 1);
        assert.instanceOf(viewModel.children[0], ChildOne);
        assert.instanceOf(viewModel.children[1], ChildOne);
        assert.instanceOf(viewModel.children[2], ChildTwo);
        assert.instanceOf(viewModel.children[3], ChildTwo);
        void au.stop();

        au.dispose();
        done();
      });
    });

    it('children array with by custom query', function (done) {
      const { au, viewModel, ChildTwo, hostViewModel } = createAppAndStart({
        query: p => (p.host as HTMLElement).querySelectorAll('.child-two')
      });

      assert.equal(viewModel.children.length, 1);
      assert.instanceOf(viewModel.children[0], ChildTwo);
      assert.equal(viewModel.childrenChangedCallCount, 0);

      hostViewModel.oneCount = 2;
      hostViewModel.twoCount = 2;

      waitForUpdate(() => {
        assert.equal(viewModel.children.length, 2);
        assert.equal(viewModel.childrenChangedCallCount, 1);
        assert.instanceOf(viewModel.children[0], ChildTwo);
        assert.instanceOf(viewModel.children[1], ChildTwo);
        void au.stop();

        au.dispose();
        done();
      });
    });

    it('children array with by custom query, filter, and map', function (done) {
      const { au, viewModel, ChildTwo, hostViewModel } = createAppAndStart({
        query: p => (p.host as HTMLElement).querySelectorAll('.child-two'),
        filter: (node) => !!node,
        map: (node) => node
      });

      const tagName = CustomElement.getDefinition(ChildTwo).name.toUpperCase();

      assert.equal(viewModel.children.length, 1);
      assert.equal(viewModel.children[0].tagName, tagName);
      assert.equal(viewModel.childrenChangedCallCount, 0);

      hostViewModel.oneCount = 2;
      hostViewModel.twoCount = 2;

      waitForUpdate(() => {
        assert.equal(viewModel.children.length, 2);
        assert.equal(viewModel.childrenChangedCallCount, 1);
        assert.equal(viewModel.children[0].tagName, tagName);
        assert.equal(viewModel.children[1].tagName, tagName);
        void au.stop();

        au.dispose();
        done();
      });
    });
  });

  function waitForUpdate(callback: () => void) {
    Promise.resolve().then(() => callback()).catch((error: Error) => { throw error; });
  }

  function createAppAndStart(childrenOptions?: PartialChildrenDefinition) {
    const ctx = TestContext.create();
    const { container } = ctx;

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
      template: `<slot></slot>`
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
