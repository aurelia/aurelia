import { customElement, slotted } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/au-slot.slotted.spec.ts', function () {
  describe('intitial rendering', function () {
    it('assigns value', function () {
      @customElement({
        name: 'el',
        template: '<au-slot>'
      })
      class El {
        @slotted('div') divs;
      }

      const { component: { el } } = createFixture(
        '<el view-model.ref=el><div></div>',
        class App {
          el: El;
        },
        [El,]
      );

      assert.strictEqual(el.divs.length, 1);
    });

    it('assigns only projected content', function () {
      @customElement({
        name: 'el',
        template: '<div>div count: ${divs.length}</div><au-slot>'
      })
      class El {
        @slotted('div') divs;
      }

      const { assertText } = createFixture(
        '<el><div></div>',
        class App {},
        [El,]
      );

      assertText('div count: 1');
    });

    it('assigns only projected content from matching slot', function () {
      @customElement({
        name: 'el',
        template: '<div>div count: ${divs.length}</div><au-slot></au-slot><au-slot name="1">'
      })
      class El {
        @slotted('div', '1') divs;
      }

      const { assertText } = createFixture(
        // projecting 3 divs to 2 different slots
        '<el><div au-slot="1"></div><div></div><div></div>',
        class App {},
        [El,]
      );

      assertText('div count: 1');
    });

    it('calls change handler', function () {
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
        '<el><div></div>',
        class App { },
        [El,]
      );

      assert.strictEqual(call, 1);
    });

    it('does not call change handler if theres no slot', function () {
      let call = 0;
      @customElement({
        name: 'el',
        template: ''
      })
      class El {
        @slotted('div') divs;

        divsChanged() {
          call = 1;
        }
      }

      createFixture(
        '<el><div></div>',
        class App { },
        [El,]
      );

      assert.strictEqual(call, 0);
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
        '<el><input>',
        class App { },
        [El,]
      );

      assert.strictEqual(call, 0);
    });

    it('assigns to multiple @slotted properties with same queries', function () {
      @customElement({
        name: 'el',
        template: '<au-slot>'
      })
      class El {
        @slotted('div') divs;
        @slotted('div') divs2;
      }

      const { component: { el: { divs, divs2 } } } = createFixture(
        '<el view-model.ref="el"><div>',
        class App { el: El; },
        [El,]
      );

      assert.strictEqual(divs.length, 1);
      assert.strictEqual(divs2.length, 1);
    });
  });
});
