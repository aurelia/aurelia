import { IContainer } from '@aurelia/kernel';
import {
  CustomElement,
  IObserverLocator,
  view,
  customElement,
  getRenderContext,
  Aurelia,
  RenderPlan,
  IPlatform,
  AuCompose,
} from '@aurelia/runtime-html';
import {
  eachCartesianJoin,
  TestContext,
  trimFull,
  assert,
  createFixture,
} from '@aurelia/testing';

describe('3-runtime-html/compose.spec.ts/au-render', function () {
  function createFixture(): SpecContext {
    const ctx = TestContext.create();
    const { container, platform, observerLocator } = ctx;
    const au = new Aurelia(container);
    const host = platform.document.createElement('div');

    return { container, platform, au, host, observerLocator };
  }

  interface SpecContext {
    container: IContainer;
    platform: IPlatform;
    au: Aurelia;
    host: HTMLElement;
    observerLocator: IObserverLocator;
  }
  interface Spec {
    t: string;
  }
  interface SubjectSpec extends Spec {
    expectedText: string;
    createSubject(ctx: SpecContext): any;
  }
  interface TemplateSpec extends Spec {
    template: string;
  }

  const subjectSpecs: SubjectSpec[] = [
    {
      t: '1',
      createSubject: () => ({ template: `<template>Hello!</template>` }),
      expectedText: 'Hello!'
    },
    {
      t: '2',
      createSubject: () => Promise.resolve({ template: `<template>Hello!</template>` }),
      expectedText: 'Hello!'
    },
    {
      t: '3',
      createSubject: () => Promise.resolve().then(() => {
        return new Promise(resolve => {
          setTimeout(() => { resolve({ template: `<template>Hello!</template>` }); }, 50);
        });
      }),
      expectedText: 'Hello!'
    },
    {
      t: '4',
      createSubject: ctx => getRenderContext({ name: 'cmp', template: `<template>Hello!</template>` }, ctx.container).getViewFactory(),
      expectedText: 'Hello!'
    },
    // {
    //   t: '5',
    //   createSubject: ctx => getRenderContext({ name: 'cmp', template: `<template>Hello!</template>` }, ctx.container).getViewFactory().create(),
    //   expectedText: 'Hello!'
    // },
    {
      t: '6',
      createSubject: ctx => new RenderPlan(`<div>Hello!</div>` as any, [], []),
      expectedText: 'Hello!'
    }
  ];

  const templateSpecs: TemplateSpec[] = [
    {
      t: '1',
      template: `<template><au-render subject.bind="sub"></au-render></template>`
    },
    {
      t: '2',
      template: `<template><template as-element="au-render" subject.bind="sub"></template></template>`
    },
    {
      t: '13',
      template: `<template><au-render repeat.for="i of 1" subject.bind="sub"></au-render></template>`
    },
    {
      t: '4',
      template: `<template><au-render if.bind="true" subject.bind="sub"></au-render></template>`
    },
    {
      t: '5',
      template: `<template><div if.bind="false"></div><au-render else subject.bind="sub"></au-render></template>`
    },
    {
      t: '16',
      template: `<template><au-render if.bind="true" repeat.for="i of 1" subject.bind="sub"></au-render></template>`
    },
    {
      t: '17',
      template: `<template><au-render if.bind="true" repeat.for="i of 1" subject.bind="sub"></au-render></template>`
    },
    {
      t: '18',
      template: `<template><au-render subject.bind="sub" if.bind="true" repeat.for="i of 1"></au-render></template>`
    },
    {
      t: '19',
      template: `<template><au-render if.bind="true" subject.bind="sub" repeat.for="i of 1"></au-render></template>`
    },
  ];

  eachCartesianJoin([subjectSpecs, templateSpecs], (subjectSpec, templateSpec) => {
    const { createSubject, expectedText } = subjectSpec;
    const { template } = templateSpec;

    it(`verify au-compose behavior - subjectSpec ${subjectSpec.t}, templateSpec ${templateSpec.t}`, async function () {
      const ctx = createFixture();
      const subject = createSubject(ctx);
      const { au, host } = ctx;

      class App { public sub: any = null; }
      CustomElement.define({ name: 'app', template }, App);
      const component = new App();
      component.sub = subject;
      const task = au.app({ host, component }).start();
      if (subject instanceof Promise) {
        assert.strictEqual(trimFull(host.textContent), '', `host.textContent #1`);
        await task;
        assert.strictEqual(trimFull(host.textContent), expectedText, `host.textContent #2`);
      } else {
        assert.strictEqual(trimFull(host.textContent), expectedText, `host.textContent #3`);
      }
      await au.stop();
    });
  });

  describe('With the ViewLocator value converter', function () {
    it('can compose a vanilla JS class instance', async function () {
      const { au, host } = createFixture();

      @view({ name: 'default-view', template: `\${message}` })
      class MyModel {
        public message = 'Hello world!';
      }

      @customElement({ name: 'app', template: '<au-render subject.bind="model | view"></au-compose>' })
      class App {
        public model = new MyModel();
      }

      au.app({ host, component: App });
      await au.start();

      assert.visibleTextEqual(host, 'Hello world!');

      await au.stop();

      au.dispose();
    });
  });
});

describe('3-runtime-html/compose.spec.ts/au-compose', function () {
  describe('view', function () {
    it('works with literal string', async function () {
      const { appHost, startPromise, tearDown } = createFixture(
        '<au-compose view="<div>hello world</div>">'
      );

      await startPromise;
      assert.strictEqual(appHost.textContent, 'hello world');

      await tearDown();

      assert.strictEqual(appHost.textContent, '');
    });

    // this test is a different with the rest, where the view is being recreated
    // and the composition happens again.
    // Instead of the bindings getting notified by the changes in the view model
    it('works with dynamic view + interpolation', async function () {
      const { ctx, component, appHost, startPromise, tearDown } = createFixture(
        `<au-compose view="<div>\${message}</div>">`,
        class App {
          public message = 'hello world';
        }
      );

      await startPromise;
      assert.strictEqual(appHost.textContent, 'hello world');

      component.message = 'hello';
      const auComponentVm = CustomElement.for(appHost.querySelector('au-compose')).viewModel as AuCompose;

      assert.strictEqual(auComponentVm.view, '<div>hello</div>');
      assert.strictEqual(appHost.textContent, 'hello world');
      ctx.platform.domWriteQueue.flush();
      assert.strictEqual(appHost.textContent, 'hello');

      await tearDown();

      assert.strictEqual(appHost.textContent, '');
    });

    it('works with view string from view model', async function () {
      const { ctx, component, appHost, startPromise, tearDown } = createFixture(
        '<au-compose view.bind="view">',
        class App {
          public message = 'hello world';
          public view = `<div>\${message}</div>`;
        }
      );

      await startPromise;
      assert.strictEqual(appHost.textContent, 'hello world');

      component.message = 'hello';

      assert.strictEqual(appHost.textContent, 'hello world');
      ctx.platform.domWriteQueue.flush();
      assert.strictEqual(appHost.textContent, 'hello');

      await tearDown();

      assert.strictEqual(appHost.textContent, '');
    });

    it('understands non-inherit scope config', async function () {
      const { ctx, component, appHost, startPromise, tearDown } = createFixture(
        '<au-compose view.bind="view" scope-behavior="scoped">',
        class App {
          public message = 'hello world';
          public view = `<div>\${message}</div>`;
        }
      );

      await startPromise;
      assert.strictEqual(appHost.textContent, '');

      component.message = 'hello';

      assert.strictEqual(appHost.textContent, '');
      ctx.platform.domWriteQueue.flush();
      assert.strictEqual(appHost.textContent, '');

      const auComponentVm = CustomElement.for(appHost.querySelector('au-compose')).viewModel as AuCompose;
      auComponentVm.composition.controller.scope.bindingContext['message'] = 'hello';
      assert.strictEqual(appHost.textContent, '');
      ctx.platform.domWriteQueue.flush();
      assert.strictEqual(appHost.textContent, 'hello');

      await tearDown();

      assert.strictEqual(appHost.textContent, '');
    });

    it('understands view promise', async function () {
      const { ctx, component, appHost, startPromise, tearDown } = createFixture(
        '<au-compose view.bind="getView()" scope-behavior="scoped">',
        class App {
          public message = 'hello world';
          public view = `<div>\${message}</div>`;

          public getView() {
            return Promise.resolve(this.view);
          }
        }
      );

      await startPromise;
      assert.strictEqual(appHost.textContent, '');

      component.message = 'hello';

      assert.strictEqual(appHost.textContent, '');
      ctx.platform.domWriteQueue.flush();
      assert.strictEqual(appHost.textContent, '');

      const auComponentVm = CustomElement.for(appHost.querySelector('au-compose')).viewModel as AuCompose;
      auComponentVm.composition.controller.scope.bindingContext['message'] = 'hello';
      assert.strictEqual(appHost.textContent, '');
      ctx.platform.domWriteQueue.flush();
      assert.strictEqual(appHost.textContent, 'hello');

      await tearDown();

      assert.strictEqual(appHost.textContent, '');
    });

    it('throws on invalid scope-behavior value', async function () {
      const { component, startPromise, tearDown } = createFixture(
        '<au-compose view.bind="view" scope-behavior.bind="behavior">',
        class App {
          public message = 'hello world';
          public view = `<div>\${message}</div>`;
          public behavior = "auto";
        }
      );

      await startPromise;

      assert.throws(() => component.behavior = 'scope', 'Invalid scope behavior');

      await tearDown();
    });
  });

  describe('view-model', function () {
    it('works with literal object', async function () {
      const { ctx, appHost, startPromise, tearDown } = createFixture(
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

      await startPromise;

      assert.strictEqual(appHost.textContent, 'hello world');
      ctx.platform.domWriteQueue.flush();
      assert.strictEqual(appHost.textContent, 'Aurelia!!');

      await tearDown();
      assert.strictEqual(appHost.textContent, '');
    });

    it('works with custom element', async function () {
      let activateCallCount = 0;
      const { appHost, startPromise, tearDown } = createFixture(
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

      await startPromise;

      assert.strictEqual(appHost.textContent, '');
      assert.strictEqual(appHost.querySelector('input').value, 'hello');
      assert.strictEqual(activateCallCount, 1);

      await tearDown();
      assert.strictEqual(appHost.textContent, '');
      assert.strictEqual(appHost.querySelector('input'), null);
    });

    it('works with promise of custom element', async function () {
      let activateCallCount = 0;
      const { appHost, startPromise, tearDown } = createFixture(
        '<au-compose view-model.bind="getVm()">',
        class App {
          public getVm() {
            return Promise.resolve(CustomElement.define(
              { name: 'input-field', template: '<input value.bind="value">' },
              class InputField {
                public value = 'hello';
                public activate() {
                  activateCallCount++;
                }
              }
            ));
          }
        }
      );

      await startPromise;

      assert.strictEqual(appHost.textContent, '');
      assert.strictEqual(appHost.querySelector('input').value, 'hello');
      assert.strictEqual(activateCallCount, 1);

      await tearDown();
      assert.strictEqual(appHost.textContent, '');
      assert.strictEqual(appHost.querySelector('input'), null);
    });

    it('passes model to activate method', async function () {
      const models: unknown[] = [];
      const model = { a: 1, b: Symbol() };
      const { startPromise, tearDown } = createFixture(
        `<au-compose view-model.bind="{ activate }" model.bind="model">`,
        class App {
          public model = model;
          public activate = (model: unknown) => {
            models.push(model);
          };
        }
      );

      await startPromise;

      assert.deepStrictEqual(models, [model]);

      await tearDown();
    });

    it('waits for activate promise', async function () {
      let resolve: (v?: unknown) => unknown;
      let attachedCallCount = 0;
      const { startPromise, tearDown } = createFixture(
        `<au-compose view-model.bind="{ activate }" view.bind="view">`,
        class App {
          public activate = () => {
            return new Promise<unknown>(r => {
              resolve = r;
            });
          };
          public attached() {
            attachedCallCount++;
          }
        }
      );

      await Promise.race([
        new Promise(r => setTimeout(r, 50)),
        startPromise
      ]);
      assert.strictEqual(attachedCallCount, 0);
      resolve();

      await Promise.race([
        new Promise(r => setTimeout(r)),
        startPromise
      ]);
      assert.strictEqual(attachedCallCount, 1);

      await tearDown();
    });

    it('does not re-compose when only model is updated', async function () {
      let constructorCallCount = 0;
      let model = { a: 1, b: Symbol() };
      const models1: unknown[] = [model];
      const models2: unknown[] = [];
      class PlainViewModelClass {
        public constructor() {
          constructorCallCount++;
        }
        public activate(model: unknown) {
          models2.push(model);
        }
      }
      const { ctx, component, startPromise, tearDown } = createFixture(
        `<au-compose view-model.bind="vm" model.bind="model">`,
        class App {
          public model = model;
          public vm = PlainViewModelClass;
        }
      );

      await startPromise;

      assert.strictEqual(constructorCallCount, 1);
      assert.deepStrictEqual(models1, models2);

      model = { a: 2, b: Symbol() };
      models1.push(model);
      component.model = model;

      ctx.platform.domWriteQueue.flush();
      assert.strictEqual(constructorCallCount, 1);
      assert.strictEqual(models2.length, 2);
      assert.deepStrictEqual(models1, models2);

      await tearDown();
    });
  });

  describe('integration with repeat', function () {
    it('works with repeat in view only composition', async function () {
      const { appHost, startPromise, tearDown } = createFixture(
        `<au-compose repeat.for="i of 5" view.bind="getView()">`,
        class App {
          public getMessage(i: number) {
            return `Hello ${i}`;
          }
          public getView() {
            return `<div>div \${i}: \${getMessage(i)}</div>`;
          }
        }
      );

      await startPromise;

      const divs = Array.from(appHost.querySelectorAll('div'));
      assert.strictEqual(divs.length, 5);
      divs.forEach((div, i) => {
        assert.strictEqual(div.textContent, `div ${i}: Hello ${i}`);
      });

      await tearDown();
    });

    it('works with repeat in literal object composition', async function () {
      const models: unknown[] = [];
      const { startPromise, tearDown } = createFixture(
        `<au-compose repeat.for="i of 5" view-model.bind="{ activate }" model.bind="{ index: i }">`,
        class App {
          public activate = (model: unknown) => {
            models.push(model);
          };
        }
      );

      await startPromise;

      assert.deepStrictEqual(models, Array.from({ length: 5 }, (_, index) => ({ index })));

      await tearDown();
    });

    it('deactivates when collection changes', async function () {
      const { component, appHost, startPromise, tearDown } = createFixture(
        `<au-compose repeat.for="i of items" view.bind="getView()">`,
        class App {
          public items = 5;
          public getMessage(i: number) {
            return `Hello ${i}`;
          }
          public getView() {
            return `<div>div \${i}: \${getMessage(i)}</div>`;
          }
        }
      );

      await startPromise;

      let divs = Array.from(appHost.querySelectorAll('div'));
      assert.strictEqual(divs.length, 5);
      divs.forEach((div, i) => {
        assert.strictEqual(div.textContent, `div ${i}: Hello ${i}`);
      });

      component.items = 3;
      divs = Array.from(appHost.querySelectorAll('div'));
      assert.strictEqual(divs.length, 3);
      divs.forEach((div, i) => {
        assert.strictEqual(div.textContent, `div ${i}: Hello ${i}`);
      });

      await tearDown();
    });
  });

  describe('multi au-compose', function () {
    it('composes au-compose', async function () {
      const { appHost, startPromise, tearDown } = createFixture(
        `<au-compose repeat.for="i of 5" view.bind="getView()">`,
        class App {
          public getMessage(i: number) {
            return `Hello ${i}`;
          }
          public getView() {
            return `<au-compose view.bind="getInnerView()">`;
          }
          public getInnerView() {
            return `<div>div \${i}: \${getMessage(i)}</div>`;
          }
        }
      );

      await startPromise;

      const divs = Array.from(appHost.querySelectorAll('div'));
      assert.strictEqual(divs.length, 5);
      divs.forEach((div, i) => {
        assert.strictEqual(div.textContent, `div ${i}: Hello ${i}`);
      });

      await tearDown();
      assert.strictEqual(appHost.querySelectorAll('div').length, 0);
    });
  });

  // TODO:
  // fix containerless in core compilation
  //
  // describe('containerless', function () {
  //   it('works with containerless on the host element', async function () {
  //     const models: unknown[] = [];
  //     const { startPromise, tearDown } = createFixture(
  //       `<au-compose view-model.bind="{ activate }" model.bind="{ index: 0 }" containerless>`,
  //       class App {
  //         public activate = (model: unknown) => {
  //           models.push(model);
  //         };
  //       }
  //     );

  //     await startPromise;

  //     assert.deepStrictEqual(models, [{ index: 0 }]);

  //     await tearDown();
  //   });
  // });
});
