import { CustomElement, customElement, slotted } from '@aurelia/runtime-html';
import { tasksSettled } from '@aurelia/runtime';
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
        '<el component.ref=el><div></div>',
        class App {
          el: El;
        },
        [El,]
      );

      assert.strictEqual(el.divs.length, 1);
    });

    it('assigns only projected content', async function () {
      @customElement({
        name: 'el',
        template: '<div>div count: ${divs.length}</div><au-slot>'
      })
      class El {
        @slotted('div') divs;
      }

      const { assertText } = await createFixture(
        '<el><div></div>',
        class App {},
        [El,]
      ).started;

      assertText('div count: 1');
    });

    it('assigns only projected content from matching slot', async function () {
      @customElement({
        name: 'el',
        template: '<div>div count: ${divs.length}</div><au-slot></au-slot><au-slot name="1">'
      })
      class El {
        @slotted('div', '1') divs;
      }

      const { assertText } = await createFixture(
        // projecting 3 divs to 2 different slots
        '<el><div au-slot="1"></div><div></div><div></div>',
        class App {},
        [El,]
      ).started;

      assertText('div count: 1');
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

      await createFixture(
        '<el><div></div>',
        class App { },
        [El,]
      ).started;

      assert.strictEqual(call, 1);
    });

    it('calls specified change handler', async function () {
      let call = 0;
      @customElement({
        name: 'el',
        template: '<au-slot>'
      })
      class El {
        @slotted({
          callback: 'changed'
        }) divs;

        changed() {
          call = 1;
        }
      }

      await createFixture(
        '<el><div></div>',
        class App { },
        [El,]
      ).started;

      assert.strictEqual(call, 1);
    });

    it('does not call change handler if theres no slot', async function () {
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

      await createFixture(
        '<el><div></div>',
        class App { },
        [El,]
      ).started;

      assert.strictEqual(call, 0);
    });

    it('does not call change handler there are no matching nodes', async function () {
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

      await createFixture(
        '<el><input>',
        class App { },
        [El,]
      ).started;

      assert.strictEqual(call, 0);
    });

    it('assigns to multiple @slotted properties with same queries', async function () {
      @customElement({
        name: 'el',
        template: '<au-slot>'
      })
      class El {
        @slotted('div') divs;
        @slotted('div') divs2;
      }

      const { component: { el: { divs, divs2 } } } = await createFixture(
        '<el component.ref="el"><div>',
        class App { el: El; },
        [El,]
      ).started;

      assert.strictEqual(divs.length, 1);
      assert.strictEqual(divs2.length, 1);
    });

    it('assigns to multiple slotted properties with overlapping queries', async function () {
      @customElement({
        name: 'el',
        template: 'Count: ${divs.length} ${divAndPs.length}<au-slot>'
      })
      class El {
        @slotted('div') divs;
        @slotted('div, p') divAndPs;
      }

      const { assertText } = await createFixture(
        '<el><div></div><p>',
        class App { },
        [El,]
      ).started;

      assertText('Count: 1 2');
    });

    it('calls change handler of multiple slotted props with overlapping queries', async function () {
      let call1 = 0;
      let call2 = 0;
      @customElement({
        name: 'el',
        template: 'Count: ${divs.length} ${divAndPs.length}<au-slot>'
      })
      class El {
        @slotted('div') divs;
        @slotted('div, p') divAndPs;

        divsChanged() {
          call1 = 1;
        }
        divAndPsChanged() {
          call2 = 1;
        }
      }

      await createFixture(
        '<el><div></div><p>',
        class App { },
        [El,]
      ).started;

      assert.deepStrictEqual([call1, call2], [1, 1]);
    });

    it('assigns nodes rendered by repeat', async function () {
      @customElement({
        name: 'el',
        template: 'Count: ${divs.length} ${divAndPs.length}<au-slot>'
      })
      class El {
        @slotted('div') divs;
        @slotted('div, p') divAndPs;
      }

      const { assertText } = await createFixture(
        '<el><div repeat.for="i of 3"></div><p repeat.for="i of 3">',
        class App { },
        [El,]
      ).started;

      assertText('Count: 3 6');
    });

    it('assigns all nodes with $all', async function () {
      @customElement({
        name: 'el',
        template: 'Count: ${nodes.length} <au-slot>'
      })
      class El {
        @slotted('$all') nodes;
      }

      const { assertText } = await createFixture(
        '<el>text<div></div><p></p><!--ha-->',
        class App { },
        [El,]
      ).started;

      // comments are filtered out by projection slot change notifier
      assertText('Count: 3 text');
    });

    it('assigns all elements with *', async function () {
      @customElement({
        name: 'el',
        template: 'Count: ${nodes.length} <au-slot>'
      })
      class El {
        @slotted('*') nodes;
      }

      const { assertText } = await createFixture(
        '<el>text<div></div><p>',
        class App { },
        [El,]
      ).started;

      assertText('Count: 2 text');
    });

    it('works with slots when there are elements in between', async function () {
      @customElement({
        name: 'el',
        template: '<div>div count: ${divs.length}</div><div><au-slot></au-slot></div><au-slot name="1">'
      })
      class El {
        @slotted('div', '*') divs;
      }

      const { assertText } = await createFixture(
        // projecting 3 divs to 2 different slots
        '<el><div au-slot="1"></div><div></div><div></div>',
        class App {},
        [El,]
      ).started;

      assertText('div count: 3');
    });

    it('assigns when more slots are generated in fallback of a slot', async function () {
      @customElement({
        name: 'el',
        template: 'div count: ${divs.length}<au-slot><au-slot name="1">'
      })
      class El {
        @slotted('div', '*') divs;
      }

      const { assertText } = await createFixture(
        '<el><div au-slot="1"></div>',
        class App {},
        [El,]
      ).started;

      assertText('div count: 1');
    });

    it('assigns when projection contains slot', async function () {
      @customElement({
        name: 'parent',
        template: '<el><au-slot>'
      })
      class Parent {}

      @customElement({
        name: 'el',
        template: 'div count: ${divs.length}<au-slot>'
      })
      class El {
        @slotted('div', '*') divs;
      }

      const { assertText } = await createFixture(
        '<parent><div></div>',
        class App {},
        [Parent, El]
      ).started;

      assertText('div count: 1');
    });

    it('assigns when projection fallbacks', async function () {
      @customElement({
        name: 'parent',
        template: '<el><au-slot><div>'
      })
      class Parent {}

      @customElement({
        name: 'el',
        template: 'div count: ${divs.length}<au-slot>'
      })
      class El {
        @slotted('div', '*') divs;
      }

      const { assertText } = await createFixture(
        '<parent>',
        class App {},
        [Parent, El]
      ).started;

      assertText('div count: 1');
    });

    it('assigns when projection fallbacks multiple slot', async function () {
      @customElement({
        name: 'parent',
        template: '<el><au-slot au-slot=1><input><input>'
      })
      class Parent {}

      @customElement({
        name: 'el',
        template: 'inputs count: ${inputs.length}<au-slot></au-slot><div><au-slot name="1">'
      })
      class El {
        @slotted('input', '1') inputs;
      }

      const { assertText } = await createFixture(
        '<parent>',
        class App {},
        [Parent, El]
      ).started;

      assertText('inputs count: 2');
    });

    it('assigns values independently to different elements at root level', async function () {
      @customElement({
        name: 'el',
        template: 'inputs count: ${inputs.length}<au-slot></au-slot><div>'
      })
      class El {
        @slotted('input') inputs;
      }

      const { assertText } = await createFixture(
        '<el><input></el> | <el><input><input>',
        class App {},
        [El]
      ).started;

      assertText('inputs count: 1 | inputs count: 2');
    });

    it('assigns values independently to different elements in a custom element', async function () {
      @customElement({
        name: 'parent',
        template: '<el><input></el> | <el><input><input>'
      })
      class Parent {}
      @customElement({
        name: 'el',
        template: 'inputs count: ${inputs.length}<au-slot></au-slot><div>'
      })
      class El {
        @slotted('input') inputs;
      }

      const { assertText } = await createFixture(
        '<parent>',
        class App {},
        [Parent, El]
      ).started;

      assertText('inputs count: 1 | inputs count: 2');
    });

    it('assigns all node with custom slot name from definition object', async function () {
      @customElement({
        name: 'el',
        template: 'Count: ${nodes.length}<au-slot name=1>'
      })
      class El {
        @slotted({
          slotName: '1'
        })
        nodes;
      }

      const { assertText } = await createFixture(
        '<el><div au-slot=1>',
        class App { },
        [El,]
      ).started;

      assertText('Count: 1');
    });

    it('assigns on dynamically generated <au-slot>', async function () {
      @customElement({
        name: 'el',
        template: 'Count: ${nodes.length}<au-slot repeat.for="i of 3">'
      })
      class El {
        @slotted() nodes;
      }

      const { assertText } = await createFixture(
        '<el><div>',
        class App { },
        [El,]
      ).started;

      assertText('Count: 3');
    });

    it('does not call slotchange inititially', async function () {
      let call = 0;
      @customElement({
        name: 'el',
        template: 'Count: ${nodes.length}<au-slot slotchange.bind="log">'
      })
      class El {
        @slotted() nodes;

        log() {
          call = 1;
        }
      }

      await createFixture(
        '<el><div>',
        class App { },
        [El,]
      ).started;

      assert.strictEqual(call, 0);
    });
  });

  describe('mutation', function () {
    it('updates added/removed nodes on single node removal', async function () {
      @customElement({
        name: 'el',
        template: 'Count: ${nodes.length}<au-slot>'
      })
      class El {
        @slotted('*') nodes;
      }

      const { assertText, component } = await createFixture(
        '<el><div if.bind="show"></div><p>',
        class App { show = false; },
        [El,]
      ).started;

      assertText('Count: 1');

      component.show = true;
      await tasksSettled(); // flush binding
      await Promise.resolve(); // mutation observer tick
      assertText('Count: 2');

      component.show = false;
      await tasksSettled(); // flush binding
      await Promise.resolve(); // mutation observer tick
      assertText('Count: 1');
    });

    it('updates added/removed nodes on the removal of multiple nodes', async function () {
      @customElement({
        name: 'el',
        template: 'Count: ${nodes.length}<au-slot>'
      })
      class El {
        @slotted('*') nodes;
      }

      const { assertText, component } = await createFixture(
        '<el><div repeat.for="_ of i">',
        class App { i = 0; },
        [El,]
      ).started;

      assertText('Count: 0');
      component.i = 3;
      await tasksSettled(); // flush binding
      await Promise.resolve(); // mutation observer tick
      assertText('Count: 3');

      component.i = 0;
      await tasksSettled(); // flush binding
      await Promise.resolve(); // mutation observer tick
      assertText('Count: 0');
    });

    it('updates values independently for multiple <au-slot> in a custom element', async function () {
      @customElement({
        name: 'parent',
        template: '<button click.trigger="show = true"></button><el><input></el> | <el><input><input>' +
          '<template if.bind="show"><input>'
      })
      class Parent {}
      @customElement({
        name: 'el',
        template: 'inputs count: ${inputs.length}<au-slot></au-slot><div>'
      })
      class El {
        @slotted('input') inputs;
      }

      const { assertText, trigger } = await createFixture(
        '<parent>',
        class App {},
        [Parent, El]
      ).started;

      assertText('inputs count: 1 | inputs count: 2');
      trigger.click('button');
      await tasksSettled(); // flush binding
      await Promise.resolve(); // mutation observer tick
      assertText('inputs count: 1 | inputs count: 3');
    });

    it('calls slotchange after rendering', async function () {
      const calls: [string, number][] = [];
      @customElement({
        name: 'el',
        template: '<au-slot slotchange.bind="log">'
      })
      class El {
        @slotted('*') nodes;

        log(name: string, nodes: Node[]) {
          calls.push([name, nodes.length]);
        }
      }

      const { component } = createFixture(
        '<el><div if.bind="show"></div><p>',
        class App { show = false; },
        [El,]
      );

      component.show = true;
      await tasksSettled(); // flush binding
      await Promise.resolve(); // mutation observer tick
      assert.deepStrictEqual(calls, [['default', 2]]);

      component.show = false;
      await tasksSettled(); // flush binding
      await Promise.resolve(); // mutation observer tick
      assert.deepStrictEqual(calls, [['default', 2], ['default', 1]]);
    });

    it('calls slotchange without having to have @slotted gh #2071', async function () {
      const calls: [string, number][] = [];
      @customElement({
        name: 'el',
        template: '<au-slot slotchange.bind="log">'
      })
      class El {
        log(name: string, nodes: Node[]) {
          calls.push([name, nodes.length]);
        }
      }

      const { component } = createFixture(
        '<el><div if.bind="show"></div><p>',
        class App { show = false; },
        [El,]
      );

      component.show = true;
      await tasksSettled(); // flush binding
      await Promise.resolve(); // mutation observer tick
      assert.deepStrictEqual(calls, [['default', 2]]);

      component.show = false;
      await tasksSettled(); // flush binding
      await Promise.resolve(); // mutation observer tick
      assert.deepStrictEqual(calls, [['default', 2], ['default', 1]]);
    });

    it('[containerless] calls slotchange without having to have @slotted gh #2071', async function () {
      const calls: [string, number][] = [];
      @customElement({
        name: 'el',
        containerless: true,
        template: '<au-slot slotchange.bind="log">'
      })
      class El {
        log(name: string, nodes: Node[]) {
          calls.push([name, nodes.length]);
        }
      }

      const { component } = createFixture(
        '<el><div if.bind="show"></div><p>',
        class App { show = false; },
        [El,]
      );

      component.show = true;
      await tasksSettled(); // flush binding
      await Promise.resolve(); // mutation observer tick
      assert.deepStrictEqual(calls, [['default', 2]]);

      component.show = false;
      await tasksSettled(); // flush binding
      await Promise.resolve(); // mutation observer tick
      assert.deepStrictEqual(calls, [['default', 2], ['default', 1]]);
    });
  });

  describe('with shadow dom', function () {
    it('works with shadow dom on', async function () {
      const { assertTextContain } = createFixture(
        `<modal-basic>
          <div au-slot=test>from \${$host.msg}</div>
        `,
        class {},
        [CustomElement.define({
          name: 'modal-basic',
          shadowOptions: { mode: 'open' },
          template: '<slot></slot><au-slot name="test"></au-slot>'
        }, class {
          msg = 'modal';
        })]
      );

      assertTextContain('from modal');
    });
  });

  it('does not interfere with direct text child in shadow dom', async function () {
    const { assertTextContain } = createFixture(
      `<modal-basic>
        hi <div au-slot=test>from \${$host.msg}</div>
      `,
      class {},
      [CustomElement.define({
        name: 'modal-basic',
        shadowOptions: { mode: 'open' },
        template: '<slot></slot><au-slot name="test"></au-slot>'
      }, class {
        msg = 'modal';
      })]
    );

    assertTextContain('from modal');
  });
});
