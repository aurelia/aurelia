import { CustomElement, Aurelia, cssModules } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

describe('styles', function () {
  function createFixture() {
    const ctx = TestContext.create();
    const au = new Aurelia(ctx.container);
    const host = ctx.createElement('div');

    return { ctx, au, host };
  }

  it(`CSS Modules don't inherit from parent`, async function () {
    const { au, host } = createFixture();
    const cssClasses = { test: 'something-else' };

    const WithStyles = CustomElement.define({
      name: 'with-styles',
      template: `<div id="target" class="test"><slot></slot></div>`,
      dependencies: [cssModules(cssClasses)],
      shadowOptions: { mode: 'open' }
    });

    const WithoutStyles = CustomElement.define({
      name: 'without-styles',
      template: `<div id="target" class="test"><slot></slot></div>`,
      shadowOptions: { mode: 'open' }
    });

    const component = CustomElement.define(
      {
        name: 'app',
        template: `<with-styles ref="withStyles"><without-styles ref="withoutStyles"></without-styles></with-styles>`,
        dependencies: [WithStyles, WithoutStyles]
      },
      class {
        public withStyles: any;
        public withoutStyles: any;
      }
    );

    await au.app({ host, component }).start();

    const withStyles = (au.root.controller.viewModel as any).withStyles;
    const withStylesRoot = CustomElement.for(withStyles).shadowRoot;
    const withStyleDiv = withStylesRoot.getElementById('target');

    assert.equal(true, withStyleDiv.classList.contains(cssClasses.test));

    const withoutStyles = (au.root.controller.viewModel as any).withoutStyles;
    const withoutStylesRoot = CustomElement.for(withoutStyles).shadowRoot;
    const withoutStylesDiv = withoutStylesRoot.getElementById('target');

    assert.equal(true, withoutStylesDiv.classList.contains('test'));

    await au.stop();

    au.dispose();
  });
});
