import { customElement, slotted } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/au-slot.slotted.spec.ts', function () {
  describe('intitial rendering', function () {
    it('assigns value', async function () {
      @customElement({
        name: 'el',
        template: '<au-slot>'
      })
      class El {
        @slotted('div') divs;

      }

      const { component: { el } } = createFixture(
        '<el view-model.ref=el><div></div><div></div>',
        class App {
          el: El;
        },
        [El,]
      );

      assert.strictEqual(el.divs.length, 2);
    });

    it('calls change handler', async function () {
      let call = 0;
      @customElement({
        name: 'el',
        template: '<au-slot>'
      })
      class El {
        @slotted('div') divs;

        divsChanged() {
          call = 1;
        }
      }

      createFixture(
        '<el view-model.ref=el><div></div>',
        class App { },
        [El,]
      );

      assert.strictEqual(call, 1);
    });

    it('does not call change handler there are no matching nodes', function () {
      let call = 0;
      @customElement({
        name: 'el',
        template: '<au-slot>'
      })
      class El {
        @slotted('div') divs;

        divsChanged() {
          call = 1;
        }
      }

      createFixture(
        '<el view-model.ref=el><input>',
        class App { },
        [El,]
      );

      assert.strictEqual(call, 0);
    });
  });
});
