import { CustomElement, Aurelia, cssModules } from '@aurelia/runtime-html';
import { assert, createFixture, TestContext } from '@aurelia/testing';

describe('3-runtime-html/styles.integration.spec.ts', function () {

  describe('css module', function () {
    it(`CSS Modules don't inherit from parent`, async function () {
      function createFixture() {
        const ctx = TestContext.create();
        const au = new Aurelia(ctx.container);
        const host = ctx.createElement('div');

        return { ctx, au, host };
      }

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

    it('works with colon in classes when there is NO matching css', async function () {
      const { assertClass } = createFixture('<my-el>', undefined, [
        CustomElement.define({
          name: 'my-el',
          template: '<div class="hover:bg-white">',
          dependencies: [cssModules({})]
        })
      ]);

      assertClass('div', 'hover:bg-white');
    });

    it('works with colon in classes when there is matching css', async function () {
      const { assertClass } = createFixture('<my-el>', undefined, [
        CustomElement.define({
          name: 'my-el',
          template: '<div class="hover:bg-white">',
          dependencies: [cssModules({ 'hover:bg-white': 'abc' })]
        })
      ]);

      assertClass('div', 'abc');
    });

    it('works with class binding command - github #1684', function () {
      const template = `<p class="strike" selected.class="isSelected">
I am green if I am selected and red if I am not
</p>
<p selected.class="isSelected">
I am green if I am selected and red if I am not
</p>
<pre>\${isSelected}</pre>
<button type="button" click.trigger="toggle()">Toggle selected state</button>`;

      const { assertClass } = createFixture(
        '<component>',
        void 0,
        [CustomElement.define({
          name: 'component',
          template,
          dependencies: [cssModules({ selected: 'a_' })]
        }, class Component {
          isSelected = true;
        })]
      );

      assertClass('p:nth-child(1)', 'au', 'a_', 'strike');
    });
  });
});
