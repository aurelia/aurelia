import { Aurelia, CustomElementResource, IViewModel } from '@aurelia/runtime';
import { TestContext, HTMLTestContext, hJsx, assert } from '@aurelia/testing';
import { childrenQuerySelector } from './html-extensions';

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
      assert.notEqual(
        childrenQuerySelector(ctx.doc.body, '.portaled'),
        null,
        /* message when failed */'<div".portaled"/> should have been portaled'
      );

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
      assert.notEqual(
        childrenQuerySelector(ctx.doc.body, 'c-e'),
        null,
        /* message when failed */'<c-e/> should have been portaled'
      );

      tearDown(au);
    });

    it('portals nested template controller', async function() {
      const App = CustomElementResource.define(
        {
          name: 'app',
          template: <template><div portal if$="showCe" class="divdiv">{"${message}"}</div></template>
        },
        class App {
          message = 'Aurelia';
          showCe = true
        }
      );

      const ctx = TestContext.createHTMLTestContext();
      const au = new Aurelia(ctx.container);

      const host = ctx.doc.body.appendChild(ctx.createElement('div'));
      const component = new App();

      au.app({ host, component });
      au.start();

      assert.equal(host.childElementCount, 0, 'It should have been empty.');
      assert.notEqual(
        childrenQuerySelector(ctx.doc.body, '.divdiv'),
        null,
        /* message when failed */'<div.divdiv> should have been portaled'
      );
      assert.equal(
        ctx.doc.body.querySelector('.divdiv').textContent,
        'Aurelia',
        'It shoulda rendered ${message}'
      )

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
