import { Constructable } from '@aurelia/kernel';
import { CustomAttribute } from '@aurelia/runtime-html';
import { TestContext, assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/binding-command.attr.spec.ts', function () {
  const testCases: IAttrBindingCommandTestCase[] = [
    {
      title: 'sets attribute with hyphen',
      template: '<div my-attr.attr="a">',
      App: class { public a = 5 },
      assertFn: ({ appHost }) => {
        assert.strictEqual(appHost.querySelector('div')?.getAttribute('my-attr'), '5');
      },
    },
    {
      title: 'sets attribute without hyphen',
      template: '<div myattr.attr="a">',
      App: class { public a = 5 },
      assertFn: ({ appHost }) => {
        assert.strictEqual(appHost.querySelector('div')?.getAttribute('myattr'), '5');
      },
    },
    {
      title: 'ignores custom attributes',
      template: '<div custom-attr.attr="a"></div>',
      App: class { public a = 5 },
      registrations: [
        CustomAttribute.define({ name: 'custom-attr', bindables: ['value'] }, class {
          constructor() {
            throw new Error('Should have not created a custom attribute');
          }
        })
      ],
      assertFn: ({ appHost }) => {
        assert.strictEqual(appHost.querySelector('div')?.getAttribute('custom-attr'), '5');
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
    registrations?: unknown[],
    assertFn: (params: { ctx: TestContext; component: T; appHost: HTMLElement; }) => void | Promise<void>;
  }
});
