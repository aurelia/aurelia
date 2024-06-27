import { CustomElement, Aurelia, cssModules, customElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { assert, createFixture, createSink, TestContext } from '@aurelia/testing';

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

      assertClass('p:nth-child(1)', 'a_', 'strike');
    });

    it('works with class on surrogate elements', function () {
      @customElement({
        name: 'el',
        template: '<template class="b">Hey',
        dependencies: [cssModules({ 'a': 'a_' }), cssModules({ 'b': 'b_' })]
      })
      class El {}

      let i = 0;

      const { assertClass } = createFixture(
        '<el class="a" component.ref="el">',
        class { el: ICustomElementViewModel & El; },
        [El, createSink.warn(() => i = 1)]);

      assert.strictEqual(i, 0);
      assertClass('el', 'b_', 'a');
    });

    it('works with class with interpolation', function () {
      const { assertClass } = createFixture('<my-el>', undefined, [
        CustomElement.define({
          name: 'my-el',
          template: '<div class="some ${myClass}">',
          dependencies: [cssModules({ 'hey': 'abc' })]
        }, class MyEl {
          myClass = "hey";
        })
      ]);

      assertClass('div', 'abc', 'some');
    });

    it('works with bind command and an expression returning string value', function () {
      const { assertClass } = createFixture('<my-el>', undefined, [
        CustomElement.define({
          name: 'my-el',
          template: '<div class.bind="myClass">',
          dependencies: [cssModules({ 'hey': 'abc' })]
        }, class MyEl {
          myClass = "hey";
        })
      ]);

      assertClass('div', 'abc');
    });

    it('works with bind command and an expression returning an object', function () {
      const { assertClass } = createFixture('<my-el>', undefined, [
        CustomElement.define({
          name: 'my-el',
          template: '<div class.bind="myClass">',
          dependencies: [cssModules({ 'hey': 'abc' })]
        }, class MyEl {
          myClass = { "hey": true };
        })
      ]);

      assertClass('div', 'abc');
    });
  });
});
