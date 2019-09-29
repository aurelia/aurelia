import { Aurelia, CustomElement, INode, Controller } from '@aurelia/runtime';
import { StyleConfiguration, styles } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

describe('styles', function () {
  function setup() {
      const ctx = TestContext.createHTMLTestContext();
      const au = new Aurelia(ctx.container);
      const host = ctx.createElement('div');

      ctx.container.register(
        StyleConfiguration.cssModulesProcessor()
      );

      return { ctx, au, host };
  }

  it(`CSS Modules don't inherit from parent`, async function () {
    const { au, host } = setup();
    const cssClasses = { test: 'something-else' };

    const WithStyles = CustomElement.define(
      {
        name: 'with-styles',
        template: `<div id="target" class="test"><slot></slot></div>`,
        dependencies: [styles(cssClasses)]
      },
      class {
        static get inject() { return [INode]; }
        constructor(private readonly element: HTMLElement) {}

        public attached() {
          // verify that the div has an updated class
        }
      },
    );

    const WithoutStyles = CustomElement.define(
      {
        name: 'without-styles',
        template: `<div id="target" class="test"><slot></slot></div>`
      },
      class {
        static get inject() { return [INode]; }
        constructor(private readonly element: HTMLElement) {}

        public attached() {
          // verify that the div has a class of "test"
        }
      },
    );

    const component = CustomElement.define(
      {
        name: 'app',
        template: `<with-styles ref="withStyles"><without-styles ref="withoutStyles"></without-styles></with-styles>`,
        dependencies: [WithStyles, WithoutStyles]
      }, class {
        withStyles: any;
        withoutStyles: any;
      }
    );

    await au.app({ host, component }).start().wait();

    const withStyles = (au.root.viewModel as any).withStyles;
    const withStylesRoot = withStyles.$controller.projector.provideEncapsulationSource() as ShadowRoot;
    const withStyleDiv = withStylesRoot.getElementById('target');

    assert.equal(true, withStyleDiv.classList.contains(cssClasses.test));

    const withoutStyles = (au.root.viewModel as any).withoutStyles;
    const withoutStylesRoot = withoutStyles.$controller.projector.provideEncapsulationSource() as ShadowRoot;
    const withoutStylesDiv = withoutStylesRoot.getElementById('target');

    assert.equal(true, withoutStylesDiv.classList.contains('test'));
  });
});
