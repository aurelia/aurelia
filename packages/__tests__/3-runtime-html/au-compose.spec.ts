import {
  CustomElement,
  customElement,
  AuCompose,
  INode,
  IRenderLocation,
} from '@aurelia/runtime-html';
import {
  assert,
  createFixture,
} from '@aurelia/testing';

describe('3-runtime-html/au-compose.spec.ts', function () {
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
      assert.strictEqual(appHost.textContent, 'hello');
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
      // compose is done changing things
      // but UI update by message prop change is queued
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

  // the tests in the 3 describes below
  // are only temporary indicators of composition capability/behaviors
  // they may change and should the tests.
  // The tests below shouldn't dictate the direction of <au-compose/>
  describe('host/renderlocation injection', function () {
    it('injects newly created host when composing custom element', async function () {
      @customElement({
        name: 'el',
        template: '<div>Hello world from El</div>'
      })
      class El {
        public static inject = [INode];
        public constructor(public node: INode) {}
      }

      const { appHost, startPromise, tearDown } = createFixture(
        `<au-compose view-model.bind="El" model.bind="{ index: 0 }" containerless>`,
        class App {
          public El = El;
        }
      );

      await startPromise;

      assert.visibleTextEqual(appHost, 'Hello world from El');
      assert.html.innerEqual(appHost, '<el><div>Hello world from El</div></el>');

      const el = CustomElement.for(appHost.querySelector('el'), { name: 'el' }).viewModel as El;
      assert.strictEqual(el.node, appHost.querySelector('el'));

      await tearDown();
    });

    it('injects newly created host when composing different custom element', async function () {
      @customElement({
        name: 'child',
        template: '<div>Hello world from Child</div>'
      })
      class Child {
        public static inject = [INode];
        public constructor(public node: INode) {}
      }

      @customElement({
        name: 'parent',
        template: '<div>Hello world from Parent</div>'
      })
      class Parent {
        public static inject = [INode];
        public constructor(public node: INode) {}
      }

      const { ctx, appHost, component, startPromise, tearDown } = createFixture(
        `<au-compose view-model.bind="El" model.bind="{ index: 0 }" containerless>`,
        class App {
          public El = Child;
        }
      );

      await startPromise;

      assert.visibleTextEqual(appHost, 'Hello world from Child');
      assert.html.innerEqual(appHost, '<child><div>Hello world from Child</div></child>');

      const childElHost = appHost.querySelector('child');
      const child = CustomElement.for(childElHost, { name: 'child' }).viewModel as Child;
      assert.strictEqual(child.node, childElHost);

      component.El = Parent;
      ctx.platform.domWriteQueue.flush();
      assert.visibleTextEqual(appHost, 'Hello world from Parent');
      assert.html.innerEqual(appHost, '<parent><div>Hello world from Parent</div></parent>');
      const parentElHost = appHost.querySelector('parent');
      const parent = CustomElement.for(parentElHost, { name: 'parent' }).viewModel as Parent;
      assert.strictEqual(parent.node, parentElHost);

      await tearDown();
    });

    it('injects <au-compose/> element itself when composing POJO classes', async function () {
      let node: INode;
      class El {
        public static inject = [INode];
        public constructor(public el: INode) {
          node = el;
        }
      }

      const { appHost, startPromise, tearDown } = createFixture(
        `<au-compose view-model.bind="El" view="<div>Hello</div>" model.bind="{ index: 0 }">`,
        class App {
          public El = El;
        }
      );

      await startPromise;

      assert.visibleTextEqual(appHost, 'Hello');
      assert.html.innerEqual(
        appHost,
        '<au-compose class="au"><div>Hello</div></au-compose>'
      );

      assert.strictEqual(node, appHost.querySelector('au-compose'));

      await tearDown();
    });

    it('injects render location when composing POJO classes with <au-compose containerless/>', async function () {
      let loc: IRenderLocation;
      class El {
        public static inject = [IRenderLocation];
        public constructor(l: IRenderLocation) {
          loc = l;
        }
      }

      const { appHost, startPromise, tearDown } = createFixture(
        `<au-compose view-model.bind="El" view="<div>Hello</div>" model.bind="{ index: 0 }" containerless>`,
        class App {
          public El = El;
        }
      );

      await startPromise;

      assert.visibleTextEqual(appHost, 'Hello');
      assert.html.innerEqual(
        appHost,
        '<div>Hello</div>'
      );

      assert.strictEqual(loc, appHost.lastChild);
      assert.strictEqual(appHost.innerHTML, '<!--au-start--><div>Hello</div><!--au-end-->');

      await tearDown();
    });
  });

  describe('containerless on usage: <au-compose containerless />', function () {
    it('works with containerless on the host element', async function () {
      const models: unknown[] = [];
      const { appHost, startPromise, tearDown } = createFixture(
        `<au-compose view-model.bind="{ activate }" view="<div>Hello world</div>" model.bind="{ index: 0 }" containerless>`,
        class App {
          public activate = (model: unknown) => {
            models.push(model);
          };
        }
      );

      await startPromise;

      assert.deepStrictEqual(models, [{ index: 0 }]);
      assert.visibleTextEqual(appHost, 'Hello world');
      assert.html.innerEqual(appHost, '<div>Hello world</div>');

      await tearDown();
    });

    it('composes non-custom element mutiple times', async function () {
      const models: unknown[] = [];
      const { appHost, component, startPromise, tearDown } = createFixture(
        `<au-compose view-model.bind="{ activate }" view.bind="view" model.bind="{ index: 0 }" containerless>`,
        class App {
          public activate = (model: unknown) => {
            models.push(model);
          };
          public view = '<div>Hello world</div>';
        }
      );

      await startPromise;

      assert.deepStrictEqual(models, [{ index: 0 }]);
      assert.visibleTextEqual(appHost, 'Hello world');
      assert.html.innerEqual(appHost, '<div>Hello world</div>');

      component.view = '<b>Hello</b>';
      assert.html.innerEqual(appHost, '<b>Hello</b>');
      assert.deepStrictEqual(models, [{ index: 0 }, { index: 0 }]);
      assert.visibleTextEqual(appHost, 'Hello');
      assert.html.innerEqual(appHost, '<b>Hello</b>');

      await tearDown();
    });

    it('works with containerless composing custom element', async function () {
      @customElement({
        name: 'el',
        template: '<div>Hello world from El</div>'
      })
      class El { }

      const { appHost, startPromise, tearDown } = createFixture(
        `<au-compose view-model.bind="El" model.bind="{ index: 0 }" containerless>`,
        class App {
          public El = El;
        }
      );

      await startPromise;

      assert.visibleTextEqual(appHost, 'Hello world from El');
      assert.html.innerEqual(appHost, '<el><div>Hello world from El</div></el>');

      await tearDown();
    });

    it('composes custom element mutiple times', async function () {
      @customElement({
        name: 'child',
        template: '<div>Hello world from Child</div>'
      })
      class Child { }

      @customElement({
        name: 'parent',
        template: '<div>Hello world from Parent</div>'
      })
      class Parent { }

      const { appHost, ctx, component, startPromise, tearDown } = createFixture(
        `<au-compose view-model.bind="El" model.bind="{ index: 0 }" containerless>`,
        class App {
          public El = Child;
        }
      );

      await startPromise;

      assert.visibleTextEqual(appHost, 'Hello world from Child');
      assert.html.innerEqual(appHost, '<child><div>Hello world from Child</div></child>');

      component.El = Parent;
      ctx.platform.domWriteQueue.flush();
      assert.visibleTextEqual(appHost, 'Hello world from Parent');
      assert.html.innerEqual(appHost, '<parent><div>Hello world from Parent</div></parent>');

      await tearDown();
    });

    it('-> composes containerless custom element', async function () {
      @customElement({
        name: 'el',
        template: '<div>Hello world from El</div>',
        containerless: true,
      })
      class El { }

      const { appHost, start } = createFixture(
        `<au-compose view-model.bind="El" model.bind="{ index: 0 }" containerless>`,
        class App {
          public El = El;
        },
        [],
        false
      );

      let ex: Error;
      try {
        await start();
      } catch (e) {
        ex = e;
      }
      assert.instanceOf(ex, Error);
      // assert.includes(String(ex), 'Containerless custom element is not supported by <au-compose/>');
      assert.includes(String(ex), 'AUR0806');

      appHost.remove();
    });

    it('switches POJO -> custom element -> POJO', async function () {
      @customElement({
        name: 'child',
        template: '<div>Hello world from Child</div>'
      })
      class Child { }

      @customElement({
        name: 'parent',
        template: '<div>Hello world from Parent</div>'
      })
      class Parent { }

      const { appHost, ctx, component, startPromise, tearDown } = createFixture(
        `<au-compose view-model.bind="El" view.bind="view" model.bind="{ index: 0 }" containerless>`,
        class App {
          public message = 'app';
          public El: unknown = { message: 'POJO' };
          public view = `<div>Hello world from \${message}</div>`;
        }
      );

      await startPromise;

      assert.visibleTextEqual(appHost, 'Hello world from POJO');
      assert.html.innerEqual(appHost, '<div>Hello world from POJO</div>');

      component.El = Parent;
      ctx.platform.domWriteQueue.flush();
      assert.visibleTextEqual(appHost, 'Hello world from Parent');
      assert.html.innerEqual(appHost, '<parent><div>Hello world from Parent</div></parent>');

      component.El = { message: 'POJO2' };
      ctx.platform.domWriteQueue.flush();
      assert.visibleTextEqual(appHost, 'Hello world from POJO2');
      assert.html.innerEqual(appHost, '<div>Hello world from POJO2</div>');

      component.El = Child;
      ctx.platform.domWriteQueue.flush();
      assert.visibleTextEqual(appHost, 'Hello world from Child');
      assert.strictEqual(appHost.innerHTML, '<!--au-start--><child><div>Hello world from Child</div></child><!--au-end-->');

      await tearDown();
      assert.strictEqual(appHost.innerHTML, '');
    });

    it('discards stale composition', async function () {
      const { appHost, ctx, component, startPromise, tearDown } = createFixture(
        `<au-compose view-model.bind="El" view.bind="\`<div>$\\{text}</div>\`" model.bind="{ index: 0 }" containerless>`,
        class App {
          public El = { text: 'Hello' };
        }
      );

      await startPromise;

      assert.visibleTextEqual(appHost, 'Hello');
      assert.html.innerEqual(appHost, '<div>Hello</div>');

      component.El = { text: 'Hello 22' };
      component.El = { text: 'Hello 33' };
      ctx.platform.domWriteQueue.flush();
      assert.visibleTextEqual(appHost, 'Hello 33');
      assert.html.innerEqual(appHost, '<div>Hello 33</div>');

      await tearDown();
    });
  });

  describe('multi updates + <Promise>', function () {
    it('works with [multiple successive updates] + [activate<Promise>]', async function () {
      const baseTimeout = 75;
      let timeout = baseTimeout;
      const { appHost, component, startPromise, tearDown } = createFixture(
        `\${message}<au-compose view-model.bind="{ activate, value: i }" view.bind="view" view-model.ref="auCompose" containerless>`,
        class App {
          public i = 0;
          public message = 'hello world';
          public view = `<div>\${value}</div>`;
          public auCompose: AuCompose;

          public activate = () => {
            if (timeout === baseTimeout) {
              timeout--;
              return;
            }
            return new Promise(r => setTimeout(r, Math.random() * timeout--));
          };
        }
      );

      await startPromise;

      assert.strictEqual(appHost.textContent, 'hello world0');

      component.i++;
      component.i++;
      while (component.i < timeout) {
        component.i++;
        timeout--;
        assert.strictEqual(appHost.textContent, 'hello world0');
      }
      const auCompose = component.auCompose;
      await auCompose.pending;
      assert.strictEqual(appHost.textContent, `hello world38`);
      assert.html.innerEqual(appHost, 'hello world<div>38</div>');

      await tearDown();
      assert.strictEqual(appHost.textContent, '');
    });
  });

  it('works with [multiple successive updates] + [binding<Promise>]', async function () {
    const baseTimeout = 75;
    let timeout = baseTimeout;
    const El1 = CustomElement.define({
      name: 'el1',
      template: `<div>\${value} 1</div>`
    }, class El {
      public value: unknown;
      public activate(model: unknown) {
        this.value = model;
      }
      public binding() {
        if (timeout === baseTimeout) {
          timeout--;
          return;
        }
        return new Promise(r => setTimeout(r, Math.random() * timeout--));
      }
    });
    const El2 = CustomElement.define({
      name: 'el2',
      template: `<p>\${value} 2</p>`
    }, class El {
      public value: unknown;
      public activate(model: unknown) {
        this.value = model;
      }
      public binding() {
        if (timeout === baseTimeout) {
          timeout--;
          return;
        }
        return new Promise(r => setTimeout(r, Math.random() * timeout--));
      }
    });
    const { appHost, component, startPromise, tearDown } = createFixture(
      `\${message}<au-compose view-model.bind="vm" model.bind="message" view-model.ref="auCompose" containerless>`,
      class App {
        public i = 0;
        public message = 'hello world';
        public auCompose: AuCompose;
        public vm: any = El1;
      }
    );

    await startPromise;

    assert.strictEqual(appHost.textContent, 'hello worldhello world 1');

    component.vm = El2;
    component.vm = El1;
    component.vm = El2;

    assert.strictEqual(appHost.textContent, `hello worldhello world 1`);
    // in the interim before a composition is completely disposed, on the fly host created will be in the doc
    assert.html.innerEqual(appHost, 'hello world<el1><div>hello world 1</div></el1><el2></el2>');

    const auCompose = component.auCompose;
    await auCompose.pending;
    assert.strictEqual(appHost.textContent, `hello worldhello world 2`);
    assert.html.innerEqual(appHost, 'hello world<el2><p>hello world 2</p></el2>');

    await tearDown();
    assert.strictEqual(appHost.textContent, '');
  });

  // todo:
  // in the future, if we ever add ability to control swapping order of compose
  // this test may need changes
  it('invokes lifecycle in reasonable manner', async function () {
    const lifecyclesCalls: string[] = [];
    const El1 = CustomElement.define({
      name: 'el1',
      template: `<div>\${value} 1</div>`
    }, class El {
      public activate() {
        lifecyclesCalls.push('1.activate');
      }
      public binding() {
        lifecyclesCalls.push('1.binding');
      }
      public bound() {
        lifecyclesCalls.push('1.bound');
      }
      public attaching() {
        lifecyclesCalls.push('1.attaching');
      }
      public attached() {
        lifecyclesCalls.push('1.attached');
      }
      public detaching() {
        lifecyclesCalls.push('1.detaching');
      }
      public unbinding() {
        lifecyclesCalls.push('1.unbinding');
      }
    });
    const El2 = CustomElement.define({
      name: 'el2',
      template: `<p>\${value} 2</p>`
    }, class El {
      public activate() {
        lifecyclesCalls.push('2.activate');
      }
      public binding() {
        lifecyclesCalls.push('2.binding');
      }
      public bound() {
        lifecyclesCalls.push('2.bound');
      }
      public attaching() {
        lifecyclesCalls.push('2.attaching');
      }
      public attached() {
        lifecyclesCalls.push('2.attached');
      }
      public detaching() {
        lifecyclesCalls.push('2.detaching');
      }
      public unbinding() {
        lifecyclesCalls.push('2.unbinding');
      }
    });
    const { appHost, component, startPromise, tearDown } = createFixture(
      `\${message}<au-compose view-model.bind="vm" model.bind="message" view-model.ref="auCompose" containerless>`,
      class App {
        public i = 0;
        public message = 'hello world';
        public auCompose: AuCompose;
        public vm: any = El1;
      }
    );

    await startPromise;

    assert.deepStrictEqual(lifecyclesCalls, [
      '1.activate',
      '1.binding',
      '1.bound',
      '1.attaching',
      '1.attached',
    ]);

    // 1.1
    component.vm = El2;
    // 1.2
    component.vm = El1;
    // 1.3
    component.vm = El2;

    assert.deepStrictEqual(lifecyclesCalls, [
      '1.activate',
      '1.binding',
      '1.bound',
      '1.attaching',
      '1.attached',
      // activation before detactivation
      // 1.1 starts
      '2.activate',
      '2.binding',
      '2.bound',
      '2.attaching',
      '2.attached',
      '1.detaching',
      '1.unbinding',
      // 1.1 ends

      // 1.2 starts
      '1.activate',
      '1.binding',
      '1.bound',
      '1.attaching',
      '1.attached',
      '2.detaching',
      '2.unbinding',
      // 1.2 ends

      // 1.3 starts
      '2.activate',
      '2.binding',
      '2.bound',
      '2.attaching',
      '2.attached',
      '1.detaching',
      '1.unbinding',
      // 1.3 ends
    ]);

    const auCompose = component.auCompose;
    await auCompose.pending;

    await tearDown();
    assert.strictEqual(appHost.textContent, '');
  });

  it('works with [au-slot] when composing custom element', async function () {
    const El1 = CustomElement.define({
      name: 'el1',
      template: `<p><au-slot>`
    }, class Element1 {});
    const { appHost, startPromise, tearDown } = createFixture(
      `<au-compose view-model.bind="vm"><input value.bind="message" au-slot>`,
      class App {
        public message = 'Aurelia';
        public vm: any = El1;
      }
    );

    await startPromise;

    assert.strictEqual((appHost.querySelector('p input') as HTMLInputElement).value, 'Aurelia');

    await tearDown();
  });

  it('works with [au-slot] + [repeat] when composing custom element', async function () {
    const El1 = CustomElement.define({
      name: 'el1',
      template: `<p><au-slot>`
    }, class Element1 {});
    const { appHost, startPromise, tearDown } = createFixture(
      `<au-compose repeat.for="i of 3" view-model.bind="vm"><input value.to-view="message + i" au-slot>`,
      class App {
        public message = 'Aurelia';
        public vm: any = El1;
      }
    );

    await startPromise;

    assert.deepStrictEqual(
      Array.from(appHost.querySelectorAll('p input')).map((i: HTMLInputElement) => i.value),
      ['Aurelia0', 'Aurelia1', 'Aurelia2']
    );
    await tearDown();
  });

  if (typeof window !== 'undefined') {
    it('works with promise in attach/detach', async function () {
      const El1 = CustomElement.define({
        name: 'el1',
        template: `<template ref="host"><p>Heollo??`
      }, class Element1 {
        public host: HTMLElement;
        public async attaching() {
          return this.host.animate([{ color: 'red' }, { color: 'blue' }], 50).finished;
        }
        public async detaching() {
          return this.host.animate([{ color: 'blue' }, { color: 'green' }], { duration: 50 }).finished;
        }
      });
      const { component, startPromise, tearDown } = createFixture(
        `<au-compose repeat.for="vm of components" view-model.bind="vm">`,
        class App {
          public message = 'Aurelia';
          public components: any[] = [];
          public vm = El1;

          public render() {
            this.components.push(El1);
          }

          public remove() {
            this.components.pop();
          }
        }
      );

      await startPromise;

      component.render();
      await new Promise(r => setTimeout(r, 100));

      component.render();
      await new Promise(r => setTimeout(r, 100));

      component.remove();
      await new Promise(r => setTimeout(r, 150));

      await tearDown();
    });
  }
});
