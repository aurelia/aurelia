import { callSyntax } from '@aurelia/compat-v1';
import { Constructable } from '@aurelia/kernel';
import { CustomAttribute, CustomElement } from '@aurelia/runtime-html';
import { runTasks } from '@aurelia/runtime';
import { TestContext, assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/binding-command.call.spec.ts', function () {
  const testCases: IAttrBindingCommandTestCase[] = [
    {
      title: 'sets normal handler on element DOM lv1 prop',
      template: `<div onclick.call="a = 6">\${a}`,
      App: class { public a = 5; },
      assertFn: ({ appHost }) => {
        appHost.querySelector('div').click();
        runTasks();
        assert.visibleTextEqual(appHost.querySelector('div'), '6');
      },
    },
    {
      title: 'set a property on an element',
      template: `<div on-bla.call="a = 6">\${a}`,
      App: class { public a = 5; },
      assertFn: ({ appHost }) => {
        (appHost.querySelector('div') as any).onBla();
        runTasks();
        assert.visibleTextEqual(appHost.querySelector('div'), '6');
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
      assertFn: ({ appHost, component }) => {
        (component as any).attr.value(6);
        runTasks();
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
      assertFn: ({ appHost, component }) => {
        (component as any).attr.value(6);
        runTasks();
        assert.visibleTextEqual(appHost.querySelector('div'), '6');
      },
    },
  ];

  for (const testCase of testCases) {
    const { title, template, App, registrations = [], assertFn } = testCase;
    it(title, async function () {
      const { appHost, ctx, component, startPromise, tearDown } = createFixture(template, App, [...registrations, callSyntax]);

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

  it('sets property on custom element bindable', async function () {
    const { trigger, assertText } = await createFixture
      .component(class { a = 5; })
      .html`<el on-click.call="a = $event"><span>\${a}</span>`
      .deps(
        CustomElement.define({
          name: 'el',
          template: '<au-slot></au-slot> <button click.trigger="onClick(i = i + 1)">click me</button>',
          bindables: ['onClick']
        }, class El {
          public i = 0;
        }),
        callSyntax
      )
      .build().started;

    assertText('5 click me');
    trigger.click('button');
    runTasks();
    assertText('1 click me');
  });

  it('sets property on custom element surrogate from bindable', async function () {
    const { trigger, assertText } = await createFixture
      .component(class { a = 5; })
      .html`<el on-bla.call="a = $event"><span>\${a}</span>`
      .deps(
        CustomElement.define({
          name: 'el',
          template: '<template click.trigger="onBla(i = i + 1)"><au-slot>',
          bindables: ['onBla']
        }, class El {
          public i = 0;
        }),
        callSyntax
      )
      .build().started;

    assertText('5');
    trigger.click('el');
    runTasks();
    assertText('1');
  });
});
