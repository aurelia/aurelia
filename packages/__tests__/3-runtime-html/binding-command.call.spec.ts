import { Constructable } from '@aurelia/kernel';
import { CustomAttribute, CustomElement } from '@aurelia/runtime-html';
import { TestContext, assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/binding-command.call.spec.ts', function () {
  const testCases: IAttrBindingCommandTestCase[] = [
    {
      title: 'sets normal handler on element DOM lv1 prop',
      template: `<div onclick.call="a = 6">\${a}`,
      App: class { public a = 5; },
      assertFn: ({ ctx, appHost }) => {
        appHost.querySelector('div').click();
        ctx.platform.domWriteQueue.flush();
        assert.visibleTextEqual(appHost.querySelector('div'), '6');
      },
    },
    {
      title: 'set a property on an element',
      template: `<div on-bla.call="a = 6">\${a}`,
      App: class { public a = 5; },
      assertFn: ({ ctx, appHost }) => {
        (appHost.querySelector('div') as any).onBla();
        ctx.platform.domWriteQueue.flush();
        assert.visibleTextEqual(appHost.querySelector('div'), '6');
      },
    },
    {
      title: 'sets property on custom element bindable',
      template: `<el on-click.call="a = $event"><span>\${a}</span>`,
      App: class { public a = 5; },
      registrations: [
        CustomElement.define({
          name: 'el',
          template: '<button click.trigger="onClick(i = i + 1)">Click me</button>',
          bindables: ['onClick']
        }, class El {
          public i = 0;
        })
      ],
      assertFn: ({ ctx, appHost }) => {
        appHost.querySelector('button').click();
        ctx.platform.domWriteQueue.flush();
        assert.visibleTextEqual(appHost.querySelector('span'), '1');
      },
    },
    {
      title: 'set a property on a custom attribute primary prop syntax',
      template: `<div listener.call="a = $event" listener.ref="attr">\${a}`,
      App: class { public a = 5; },
      registrations: [
        CustomAttribute.define({
          name: 'listener',
          bindables: ['value']
        }, class {})
      ],
      assertFn: ({ ctx, appHost, component }) => {
        (component as any).attr.value(6);
        ctx.platform.domWriteQueue.flush();
        assert.visibleTextEqual(appHost.querySelector('div'), '6');
      },
    },
    {
      title: 'set a property on a custom attribute, multi prop syntax',
      template: `<div listener="value.call: a = $event" listener.ref="attr">\${a}`,
      App: class { public a = 5; },
      registrations: [
        CustomAttribute.define({
          name: 'listener',
          bindables: ['value']
        }, class {})
      ],
      assertFn: ({ ctx, appHost, component }) => {
        (component as any).attr.value(6);
        ctx.platform.domWriteQueue.flush();
        assert.visibleTextEqual(appHost.querySelector('div'), '6');
      },
    },
    {
      title: 'sets property on custom element surrogate from bindable',
      template: `<el on-bla.call="a = $event"><span>\${a}</span>`,
      App: class { public a = 5; },
      registrations: [
        CustomElement.define({
          name: 'el',
          template: '<template click.trigger="onBla(i = i + 1)">',
          bindables: ['onBla']
        }, class El {
          public i = 0;
        })
      ],
      assertFn: ({ ctx, appHost }) => {
        appHost.querySelector<HTMLElement>('el').click();
        ctx.platform.domWriteQueue.flush();
        assert.visibleTextEqual(appHost.querySelector('span'), '1');
      },
    },
  ];

  for (const testCase of testCases) {
    const { title, template, App, registrations = [], assertFn } = testCase;
    it(title, async function () {
      const { appHost, ctx, component, startPromise, tearDown } = createFixture(template, App, registrations);

      await startPromise;

      await assertFn({ ctx, component, appHost });

      await tearDown();
    });
  }

  interface IAttrBindingCommandTestCase<T = unknown> {
    title: string;
    template: string;
    App?: Constructable<T>;
    registrations?: unknown[];
    assertFn: (params: { ctx: TestContext; component: T; appHost: HTMLElement }) => void | Promise<void>;
  }
});
