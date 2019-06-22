import { Aurelia, CustomElementResource, IViewModel } from '@aurelia/runtime';
import { TestContext, HTMLTestContext, hJsx, assert } from '@aurelia/testing';

describe.only('portal.spec.tsx 🚪-🔁-🚪', function () {

  describe('basic', function() {

    it(`Portal basic`, async function() {
      const App = CustomElementResource.define(
        { name: 'app', template: <template><div portal class="portaled"></div></template> },
        class App { message = 'Aurelia' }
      );

      const ctx = TestContext.createHTMLTestContext();
      const au = new Aurelia(ctx.container);

      const host = ctx.doc.body.appendChild(ctx.createElement('div'));
      const component = new App();

      au.app({ host, component });
      au.start();

      assert.equal(host.childElementCount, 0, 'It should have been empty.');
      assert.notEqual(ctx.doc.body.querySelector('.portaled'), null, '<div".portaled"/> should have been portaled');

      tearDown(au);
    });

    it('Portal custom elements', async function() {
      const App = CustomElementResource.define(
        {
          name: 'app',
          template: <template><c-e portal></c-e></template>,
          dependencies: [
            CustomElementResource.define(
              {
                name: 'c-e',
                template: <template>C-E</template>
              }
            )
          ]
        },
        class App { message = 'Aurelia' }
      );

      const ctx = TestContext.createHTMLTestContext();
      const au = new Aurelia(ctx.container);

      const host = ctx.doc.body.appendChild(ctx.createElement('div'));
      const component = new App();

      au.app({ host, component });
      au.start();

      assert.equal(host.childElementCount, 0, 'It should have been empty.');
      assert.notEqual(ctx.doc.body.querySelector('c-e'), null, '<c-e/> should have been portaled');

      tearDown(au);
    });

  });

  function tearDown(au: Aurelia) {
    au.stop();
    (au.root.host as Element).remove();
  }

  function createItems(count: number, baseName: string = 'item') {
    return Array.from({ length: count }, (_, idx) => {
      return { idx, name: `${baseName}-${idx}` }
    });
  }
});
