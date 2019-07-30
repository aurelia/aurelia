import { children, Aurelia, CustomElement } from '@aurelia/runtime';
import { TestContext, assert } from '@aurelia/testing';
import { IContainer } from '@aurelia/kernel';

describe('ChildrenObserver', () => {
  it('populates children array with child view models', () => {
    const { au, viewModel, ChildOne, ChildTwo } = createAppAndStart();
    const children = viewModel.children;

    assert.equal(viewModel.children.length, 2);
    assert.instanceOf(children[0], ChildOne);
    assert.instanceOf(children[1], ChildTwo);

    au.stop();
  });

  function createAppAndStart() {
    const ctx = TestContext.createHTMLTestContext();
    const { container } = ctx;

    const ElementWithChildren = defineAndRegisterElementWithChildren(container);
    const ChildOne = defineAndRegisterElement('child-one', container);
    const ChildTwo = defineAndRegisterElement('child-two', container);
    const HostElement = defineAndRegisterElementWithTemplate(
      'host-element',
      `
        <element-with-children>
          <child-one></child-one>
          <child-two></child-two>
        </element-with-children>
      `,
      container
    );

    const au = new Aurelia(container);
    const host = ctx.createElement(HostElement.description.name);

    au.app({ host, component: HostElement });
    au.start();

    const viewModel = (host.childNodes[1] as any).$controller.viewModel;

    return {
      au,
      viewModel,
      ChildOne,
      ChildTwo
    };
  }

  function defineAndRegisterElementWithChildren(container: IContainer) {
    class ElementWithChildren {
      @children children;
    }

    const element = CustomElement.define({
      name: 'element-with-children',
      template: `<slot></slot>`
    }, ElementWithChildren);

    container.register(element);

    return element;
  }

  function defineAndRegisterElementWithTemplate(name: string, template: string, container: IContainer) {
    class ElementWithTemplate {
    }

    const element = CustomElement.define({
      name: name,
      template
    }, ElementWithTemplate);

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
