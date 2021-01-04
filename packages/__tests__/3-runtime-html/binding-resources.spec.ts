import { TestContext, assert } from '@aurelia/testing';
import { customElement, bindable, BindingMode, Aurelia } from '@aurelia/runtime-html';

async function wait(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

// TemplateCompiler - Binding Resources integration
describe('binding-resources', function () {
  function createFixture() {
    const ctx = TestContext.create();
    const au = new Aurelia(ctx.container);
    const host = ctx.createElement('div');
    return {
      au,
      host,
      ctx,
    };
  }

  describe('debounce', function () {
    it('works with toView bindings to elements', async function () {
      @customElement({
        name: 'app',
        template: `<input ref="receiver" value.to-view="value & debounce:25">`,
      })
      class App {
        public value: string = '0';
        public receiver: HTMLInputElement;
      }

      const { au, host, ctx } = createFixture();

      const component = new App();
      au.app({ component, host });
      await au.start();

      const receiver = component.receiver;
      component.value = '1';

      assert.strictEqual(receiver.value, '0', 'target value pre #1');
      ctx.platform.domWriteQueue.flush();
      assert.strictEqual(receiver.value, '1', 'target value #1');

      component.value = '2';

      assert.strictEqual(receiver.value, '1', 'target value pre #2');
      ctx.platform.domWriteQueue.flush();
      assert.strictEqual(receiver.value, '2', 'target value #2');

      component.value = '3';

      assert.strictEqual(receiver.value, '2', 'target value pre #3');
      ctx.platform.domWriteQueue.flush();
      assert.strictEqual(receiver.value, '3', 'target value #3');

      await wait(50);

      assert.strictEqual(receiver.value, '3', 'target value pre #4');
      ctx.platform.domWriteQueue.flush();
      assert.strictEqual(receiver.value, '3', 'target value #4');

      await au.stop();

      au.dispose();
    });

    it('works with toView bindings to other components', async function () {
      @customElement({
        name: 'au-receiver',
        template: null,
      })
      class Receiver {
        @bindable({ mode: BindingMode.toView })
        public value: string = '0';
      }

      @customElement({
        name: 'app',
        template: `<au-receiver view-model.ref="receiver" value.bind="value & debounce:25"></au-receiver>`,
        dependencies: [Receiver],
      })
      class App {
        public value: string = '0';
        public receiver: Receiver;
      }

      const { au, host, ctx } = createFixture();

      const component = new App();
      au.app({ component, host });
      await au.start();

      const receiver = component.receiver;
      component.value = '1';

      assert.strictEqual(receiver.value, '1');

      receiver.value = '1.5';

      assert.strictEqual(receiver.value, '1.5');

      component.value = '3';

      assert.strictEqual(receiver.value, '3');

      await wait(50);

      assert.strictEqual(receiver.value, '3');

      await au.stop();
      assert.strictEqual(receiver.value, '3');

      au.dispose();

      assert.strictEqual(receiver.value, '3');
    });

    it('works with twoWay bindings to other components', async function () {
      @customElement({
        name: 'au-receiver',
        template: null,
      })
      class Receiver {
        @bindable({ mode: BindingMode.twoWay })
        public value: string = '0';
      }

      @customElement({
        name: 'app',
        template: `<au-receiver view-model.ref="receiver" value.bind="value & debounce:25"></au-receiver>`,
        dependencies: [Receiver],
      })
      class App {
        public value: string = '0';
        public receiver: Receiver;
      }

      const { au, host, ctx } = createFixture();

      const component = new App();
      au.app({ component, host });
      await au.start();

      const receiver = component.receiver;
      component.value = '1';

      assert.strictEqual(component.value, '1');
      assert.strictEqual(receiver.value, '1');

      receiver.value = '2';

      await wait(20);

      assert.strictEqual(component.value, '1', `change 2 not yet propagated to component`);
      assert.strictEqual(receiver.value, '2', `receiver keeps change 2`);

      component.value = '3';

      assert.strictEqual(component.value, '3');
      assert.strictEqual(receiver.value, '3');

      await wait(50);

      // assert that in 2 way binding, after a target update has been debounced
      // any changes from source should override and discard that queue
      assert.strictEqual(receiver.value, '3', `change 3 propagated`);

      await au.stop();

      au.dispose();
    });

    for (const command of ['trigger', 'capture', 'delegate']) {
      it(`works with ${command} bindings`, async function () {
        @customElement({
          name: 'app',
          template: `<div ref="receiver" click.${command}="handleClick($event) & debounce:25"></div>`,
        })
        class App {
          public receiver: HTMLDivElement;

          public events: CustomEvent[] = [];
          public handleClick($event: CustomEvent): void {
            this.events.push($event);
          }
        }

        const { au, host, ctx } = createFixture();

        const component = new App();

        ctx.doc.body.appendChild(host);
        au.app({ component, host });
        await au.start();

        const eventInit = { bubbles: true, cancelable: true };
        const receiver = component.receiver;
        const event1 = new ctx.CustomEvent('click', eventInit);
        receiver.dispatchEvent(event1);

        await wait(20);

        assert.strictEqual(component.events.length, 0, `event 1 not yet propagated`);

        const event2 = new ctx.CustomEvent('click', eventInit);
        receiver.dispatchEvent(event2);

        await wait(20);

        assert.strictEqual(component.events.length, 0, `event 2 not yet propagated`);

        const event3 = new ctx.CustomEvent('click', eventInit);
        receiver.dispatchEvent(event3);

        await wait(20);

        assert.strictEqual(component.events.length, 0, `event 3 not yet propagated`);

        await ctx.platform.macroTaskQueue.yield();

        assert.strictEqual(component.events.length, 1, `event 3 propagated`);
        assert.strictEqual(component.events[0], event3, `event 3 is the specific event that propagated`);

        host.remove();

        await au.stop();

        au.dispose();
      });
    }
  });

  // TODO: fix throttle
  // it(`throttleBindingBehavior - input.value`, done => {
  //   const { au, lifecycle, host, component } = createFixture(`<template><input value.to-view="message & throttle:50"></template>`);
  //   au.app({ host, component }).start();
  //   assert.strictEqual(host.firstChild['value'], '', `host.firstChild['value']`);
  //   component.message = 'hello!';
  //   lifecycle.flush(LifecycleFlags.none);
  //   assert.strictEqual(host.firstChild['value'], 'hello!', `host.firstChild['value']`);
  //   component.message = 'hello!!';
  //   lifecycle.flush(LifecycleFlags.none);
  //   assert.strictEqual(host.firstChild['value'], 'hello!', `host.firstChild['value']`);
  //   component.message = 'hello!!!';
  //   lifecycle.flush(LifecycleFlags.none);
  //   assert.strictEqual(host.firstChild['value'], 'hello!', `host.firstChild['value']`);
  //   setTimeout(() => {
  //     component.message = 'hello!!!!';
  //     lifecycle.flush(LifecycleFlags.none);
  //     assert.strictEqual(host.firstChild['value'], 'hello!!!!', `host.firstChild['value']`);
  //     done();
  //   }, 75);
  // });
});
