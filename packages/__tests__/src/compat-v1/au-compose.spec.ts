import { disableComposeCompat, enableComposeCompat } from '@aurelia/compat-v1';
import { CustomElement } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

// only smoke tests here, enough to assert the most basic behaviors/expectation
// main tests should be at the main au-compose spec
describe('compat-v1/au-compose.spec.ts', function () {

  describe('without enabling of compat', function () {
    it('does not work', async function () {
      const { assertText } = createFixture('<au-compose view="hello">');

      assertText('');
    });
  });
  describe('with enabling of compat', function () {
    this.beforeAll(function () {
      enableComposeCompat();
    });
    this.afterAll(function () {
      disableComposeCompat();
    });

    describe('.view', function () {
      it('works with literal string', async function () {
        const { tearDown, assertText } = createFixture(
          '<au-compose view="<div>hello world</div>">'
        );
        assertText('hello world');

        await tearDown();

        assertText('');
      });

      it('works with view string from view model', async function () {
        const { ctx, component, tearDown, assertText } = createFixture(
          '<au-compose view.bind="view">',
          class App {
            public message = 'hello world';
            public view = `<div>\${message}</div>`;
          }
        );

        assertText('hello world');

        component.message = 'hello';

        assertText('hello world');
        ctx.platform.domWriteQueue.flush();
        assertText('hello');

        await tearDown();

        assertText('');
      });
    });

    describe('.view-model', function () {
      it('works with literal object', async function () {
        const { assertText, tearDown } = createFixture(
          `\${message}<au-compose view-model.bind="{ activate }">`,
          class App {
            public message = 'hello world';
            public view = `<div>\${message}</div>`;
            public behavior = "auto";

            public activate = () => {
              this.message = 'Aurelia!!';
            };
          }
        );

        assertText('Aurelia!!');

        await tearDown();
        assertText('');
      });

      it.only('works with custom element', async function () {
        let activateCallCount = 0;
        const { queryBy, assertText, assertValue, tearDown } = createFixture(
          '<au-compose view-model.bind="fieldVm">',
          class App {
            public message = 'hello world';
            public fieldVm = CustomElement.define(
              { name: 'input-field', template: '<input value.bind="value">' },
              class InputField {
                public value = 'hello';
                public activate() {
                  activateCallCount++;
                }
              }
            );
          }
        );

        assertText('');
        assertValue('input', 'hello');
        assert.strictEqual(activateCallCount, 1);

        await tearDown();
        assertText('');
        assert.strictEqual(queryBy('input'), null);
      });
    });
  });
});
