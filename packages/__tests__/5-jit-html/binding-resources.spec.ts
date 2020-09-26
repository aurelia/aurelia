import { TestContext, assert } from '@aurelia/testing';
import { Aurelia, customElement, bindable, BindingMode } from '@aurelia/runtime';

async function wait(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

// TemplateCompiler - Binding Resources integration
describe('binding-resources', function () {
  function createFixture() {
      const ctx = TestContext.createHTMLTestContext();
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
      await au.start().wait();

      const receiver = component.receiver;
      component.value = '1';

      await wait(20);

      assert.strictEqual(receiver.value, '0', `change 1 not yet propagated`);

      component.value = '2';

      await wait(20);

      assert.strictEqual(receiver.value, '0', `change 2 not yet propagated`);

      component.value = '3';

      await wait(20);

      assert.strictEqual(receiver.value, '0', `change 3 not yet propagated`);

      await wait(50);

      assert.strictEqual(receiver.value, '3', `change 3 propagated`);

      await au.stop().wait();
      assert.isSchedulerEmpty();
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
      await au.start().wait();

      const receiver = component.receiver;
      component.value = '1';

      await wait(20);

      assert.strictEqual(receiver.value, '0', `change 1 not yet propagated`);

      component.value = '2';

      await wait(20);

      assert.strictEqual(receiver.value, '0', `change 2 not yet propagated`);

      component.value = '3';

      await wait(20);

      assert.strictEqual(receiver.value, '0', `change 3 not yet propagated`);

      await wait(50);

      assert.strictEqual(receiver.value, '3', `change 3 propagated`);

      await au.stop().wait();
      assert.isSchedulerEmpty();
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
      await au.start().wait();

      const receiver = component.receiver;
      component.value = '1';

      await wait(20);

      assert.strictEqual(component.value, '1', `component keeps change 1`);
      assert.strictEqual(receiver.value, '0', `change 1 not yet propagated to receiver`);

      receiver.value = '2';

      await wait(20);

      assert.strictEqual(component.value, '1', `change 2 not yet propagated to component`);
      assert.strictEqual(receiver.value, '2', `receiver keeps change 2`);

      component.value = '3';

      await wait(20);

      assert.strictEqual(component.value, '3', `component keeps change 3`);
      assert.strictEqual(receiver.value, '2', `change 3 not yet propagated to receiver`);

      await ctx.scheduler.yieldAll();

      assert.strictEqual(receiver.value, '3', `change 3 propagated`);

      await au.stop().wait();
      assert.isSchedulerEmpty();
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
        await au.start().wait();

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

        await ctx.scheduler.yieldAll();

        assert.strictEqual(component.events.length, 1, `event 3 propagated`);
        assert.strictEqual(component.events[0], event3, `event 3 is the specific event that propagated`);

        host.remove();

        await au.stop().wait();
        assert.isSchedulerEmpty();
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
