import { resolve } from '@aurelia/kernel';
import {
  CustomElement,
  customElement,
  AuCompose,
  INode,
  IRenderLocation,
  bindable,
} from '@aurelia/runtime-html';
import { ICompositionController } from '@aurelia/runtime-html/dist/types/resources/custom-elements/au-compose';
import {
  assert,
  createFixture,
  createSpy,
} from '@aurelia/testing';
import { isNode } from '../util.js';

describe('3-runtime-html/au-compose.spec.ts', function () {
  describe('view', function () {
    it('works with literal string', async function () {
      const { appHost, startPromise, tearDown } = createFixture(
        '<au-compose template="<div>hello world</div>">'
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
        `<au-compose template="<div>\${message}</div>">`,
        class App {
          public message = 'hello world';
        }
      );

      await startPromise;
      assert.strictEqual(appHost.textContent, 'hello world');

      component.message = 'hello';

      assert.strictEqual(appHost.textContent, 'hello');
      ctx.platform.domWriteQueue.flush();
      assert.strictEqual(appHost.textContent, 'hello');

      await tearDown();

      assert.strictEqual(appHost.textContent, '');
    });

    it('works with view string from view model', async function () {
      const { ctx, component, appHost, startPromise, tearDown } = createFixture(
        '<au-compose template.bind="view">',
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
        '<au-compose template.bind="view" scope-behavior="scoped" composition.bind="composition">',
        class App {
          message = 'hello world';
          view = `<div>\${message}</div>`;
          composition: ICompositionController;
        }
      );

      await startPromise;
      assert.strictEqual(appHost.textContent, '');

      component.message = 'hello';

      assert.strictEqual(appHost.textContent, '');
      ctx.platform.domWriteQueue.flush();
      assert.strictEqual(appHost.textContent, '');

      component.composition.controller.scope.bindingContext['message'] = 'hello';
      assert.strictEqual(appHost.textContent, '');
      ctx.platform.domWriteQueue.flush();
      assert.strictEqual(appHost.textContent, 'hello');

      await tearDown();

      assert.strictEqual(appHost.textContent, '');
    });

    it('understands view promise', async function () {
      const { ctx, component, appHost, startPromise, tearDown } = createFixture(
        '<au-compose template.bind="getView()" scope-behavior="scoped" composition.bind="composition">',
        class App {
          message = 'hello world';
          view = `<div>\${message}</div>`;
          composition: ICompositionController;

          getView() {
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

      component.composition.controller.scope.bindingContext['message'] = 'hello';
      assert.strictEqual(appHost.textContent, '');
      ctx.platform.domWriteQueue.flush();
      assert.strictEqual(appHost.textContent, 'hello');

      await tearDown();

      assert.strictEqual(appHost.textContent, '');
    });

    it('throws on invalid scope-behavior value', function () {
      const { component } = createFixture(
        '<au-compose template.bind="view" scope-behavior.bind="behavior">',
        class App {
          public message = 'hello world';
          public view = `<div>\${message}</div>`;
          public behavior = "auto";
        }
      );

      assert.throws(() => component.behavior = 'scope', 'Invalid scope behavior');
    });
  });

  describe('.component', function () {
    it('works with literal object', async function () {
      const { appHost, tearDown } = createFixture(
        `\${message}<au-compose component.bind="{ activate }">`,
        class App {
          public message = 'hello world';
          public view = `<div>\${message}</div>`;
          public behavior = "auto";

          public activate = () => {
            this.message = 'Aurelia!!';
          };
        }
      );

      assert.strictEqual(appHost.textContent, 'Aurelia!!');

      await tearDown();
      assert.strictEqual(appHost.textContent, '');
    });

    it('works with custom element', async function () {
      let activateCallCount = 0;
      const { appHost, tearDown } = createFixture(
        '<au-compose component.bind="fieldVm">',
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

      assert.strictEqual(appHost.textContent, '');
      assert.strictEqual(appHost.querySelector('input').value, 'hello');
      assert.strictEqual(activateCallCount, 1);

      await tearDown();
      assert.strictEqual(appHost.textContent, '');
      assert.strictEqual(appHost.querySelector('input'), null);
    });

    it('works with promise of custom element', async function () {
      let activateCallCount = 0;
      const { appHost, tearDown } = await createFixture(
        '<au-compose component.bind="getVm()">',
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
      ).started;

      assert.strictEqual(appHost.textContent, '');
      assert.strictEqual(appHost.querySelector('input').value, 'hello');
      assert.strictEqual(activateCallCount, 1);

      await tearDown();
      assert.strictEqual(appHost.textContent, '');
      assert.strictEqual(appHost.querySelector('input'), null);
    });

    it('passes model to activate method', function () {
      const models: unknown[] = [];
      const model = { a: 1, b: Symbol() };
      createFixture(
        `<au-compose component.bind="{ activate }" model.bind="model">`,
        class App {
          public model = model;
          public activate = (model: unknown) => {
            models.push(model);
          };
        }
      );

      assert.deepStrictEqual(models, [model]);
    });

    it('waits for activate promise', async function () {
      let resolve: (v?: unknown) => unknown;
      let attachedCallCount = 0;
      const { startPromise } = createFixture(
        `<au-compose component.bind="{ activate }" template.bind="view">`,
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
    });

    it('does not re-compose when only model is updated', function () {
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
      const { ctx, component } = createFixture(
        `<au-compose component.bind="vm" model.bind="model">`,
        class App {
          public model = model;
          public vm = PlainViewModelClass;
        }
      );

      assert.strictEqual(constructorCallCount, 1);
      assert.deepStrictEqual(models1, models2);

      model = { a: 2, b: Symbol() };
      models1.push(model);
      component.model = model;

      ctx.platform.domWriteQueue.flush();
      assert.strictEqual(constructorCallCount, 1);
      assert.strictEqual(models2.length, 2);
      assert.deepStrictEqual(models1, models2);
    });
  });

  describe('integration with repeat', function () {
    it('works with repeat in view only composition', function () {
      const { appHost } = createFixture(
        `<au-compose repeat.for="i of 5" template.bind="getView()">`,
        class App {
          public getMessage(i: number) {
            return `Hello ${i}`;
          }
          public getView() {
            return `<div>div \${i}: \${getMessage(i)}</div>`;
          }
        }
      );

      const divs = Array.from(appHost.querySelectorAll('div'));
      assert.strictEqual(divs.length, 5);
      divs.forEach((div, i) => {
        assert.strictEqual(div.textContent, `div ${i}: Hello ${i}`);
      });
    });

    it('works with repeat in literal object composition', function () {
      const models: unknown[] = [];
      createFixture(
        `<au-compose repeat.for="i of 5" component.bind="{ activate }" model.bind="{ index: i }">`,
        class App {
          public activate = (model: unknown) => {
            models.push(model);
          };
        }
      );

      assert.deepStrictEqual(models, Array.from({ length: 5 }, (_, index) => ({ index })));
    });

    it('deactivates when collection changes', async function () {
      const { component, appHost } = createFixture(
        `<au-compose repeat.for="i of items" template.bind="getView()">`,
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
    });
  });

  describe('multi au-compose', function () {
    it('composes au-compose', async function () {
      const { appHost, startPromise, tearDown } = createFixture(
        `<au-compose repeat.for="i of 5" template.bind="getView()">`,
        class App {
          public getMessage(i: number) {
            return `Hello ${i}`;
          }
          public getView() {
            return `<au-compose template.bind="getInnerView()">`;
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
    it('injects newly created host when composing custom element', function () {
      @customElement({
        name: 'el',
        template: '<div>Hello world from El</div>'
      })
      class El {
        public static inject = [INode];
        public constructor(public node: INode) {}
      }

      const { appHost } = createFixture(
        `<au-compose component.bind="El" model.bind="{ index: 0 }" containerless>`,
        class App {
          public El = El;
        }
      );

      assert.visibleTextEqual(appHost, 'Hello world from El');
      assert.html.innerEqual(appHost, '<el><div>Hello world from El</div></el>');

      const el = CustomElement.for(appHost.querySelector('el'), { name: 'el' }).viewModel as El;
      assert.strictEqual(el.node, appHost.querySelector('el'));
    });

    it('injects newly created host when composing different custom element', function () {
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

      const { ctx, appHost, component } = createFixture(
        `<au-compose component.bind="El" model.bind="{ index: 0 }" containerless>`,
        class App {
          public El = Child;
        }
      );

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
    });

    it('injects render location when composing POJO classes with <au-compose containerless/>', function () {
      let loc: IRenderLocation;
      class El {
        public static inject = [IRenderLocation];
        public constructor(l: IRenderLocation) {
          loc = l;
        }
      }

      const { appHost, assertHtml } = createFixture(
        `<au-compose component.bind="El" template="<div>Hello</div>" model.bind="{ index: 0 }" containerless>`,
        class App {
          public El = El;
        }
      );

      assert.visibleTextEqual(appHost, 'Hello');
      assert.strictEqual(loc, appHost.lastChild.previousSibling);
      assertHtml('<!--au-start--><!--au-start--><div>Hello</div><!--au-end--><!--au-end-->');
    });

    it('injects newly created element when composing POJO with tag bindable', function () {
      let host: INode;
      class El {
        constructor() {
          host = resolve(INode);
        }
      }

      const { appHost, assertHtml, assertText } = createFixture(
        `<au-compose tag="p" component.bind="El" template="<div>Hello</div>" model.bind="{ index: 0 }" containerless>`,
        class App {
          El = El;
        }
      );

      assertText('Hello');
      assert.strictEqual(host, appHost.querySelector('p'));
      assertHtml('<!--au-start--><p><div>Hello</div></p><!--au-end-->');
    });

    it('injects different host for POJO when tag binding changes', function () {
      let host: INode;
      class El {
        constructor() {
          host = resolve(INode);
        }
      }

      const { component, appHost, assertHtml, assertText } = createFixture(
        `<au-compose tag.bind="i ? 'h2' : 'h1'" component.bind="El" template="<div>Hello</div>" model.bind="{ index: 0 }" containerless>`,
        class App {
          i = 0;
          El = El;
        }
      );

      assertText('Hello');
      assert.strictEqual(host, appHost.querySelector('h1'));
      assertHtml('<!--au-start--><h1><div>Hello</div></h1><!--au-end-->');

      component.i = 1;
      assert.strictEqual(host, appHost.querySelector('h2'));
      assertHtml('<!--au-start--><h2><div>Hello</div></h2><!--au-end-->');
    });

    it('ignores tag binding change when composing custom element', function () {
      let compositionCount = 0;
      @customElement({
        name: 'el',
        template: '<div>Hello world from El</div>'
      })
      class El {}

      const { component, assertHtml, assertText } = createFixture(
        `<au-compose tag.bind="i ? 'h2' : 'h1'" component.bind="El" model.bind="{ index: 0 }" containerless composition.bind="composed">`,
        class App {
          i = 0;
          El = El;
          set composed(_value: ICompositionController) {
            compositionCount++;
          }
        }
      );

      assertText('Hello world from El');
      assertHtml('<!--au-start--><el><div>Hello world from El</div></el><!--au-end-->');
      // initial binding 1 + initial composition 1
      assert.strictEqual(compositionCount, 2);

      component.i = 1;
      assert.strictEqual(compositionCount, 2);
    });
  });

  describe('composition scenarios', function () {
    it('calls activate with the right model', function () {
      const models: unknown[] = [];
      const { appHost } = createFixture(
        `<au-compose component.bind="{ activate }" template="<div>Hello world</div>" model.bind="{ index: 0 }" containerless>`,
        class App {
          public activate = (model: unknown) => {
            models.push(model);
          };
        }
      );

      assert.deepStrictEqual(models, [{ index: 0 }]);
      assert.visibleTextEqual(appHost, 'Hello world');
      assert.html.innerEqual(appHost, '<div>Hello world</div>');
    });

    it('composes non-custom element mutiple times', async function () {
      const models: unknown[] = [];
      const { appHost, component, startPromise, tearDown } = createFixture(
        `<au-compose component.bind="{ activate }" template.bind="view" model.bind="{ index: 0 }" containerless>`,
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
        `<au-compose component.bind="El" model.bind="{ index: 0 }" containerless>`,
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
        `<au-compose component.bind="El" model.bind="{ index: 0 }" containerless>`,
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
        `<au-compose component.bind="El" template.bind="view" model.bind="{ index: 0 }" containerless>`,
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

    it('discards stale composition', function () {
      const { appHost, ctx, component } = createFixture(
        `<au-compose component.bind="El" template.bind="\`<div>$\\{text}</div>\`" model.bind="{ index: 0 }" containerless>`,
        class App {
          public El = { text: 'Hello' };
        }
      );

      assert.visibleTextEqual(appHost, 'Hello');
      assert.html.innerEqual(appHost, '<div>Hello</div>');

      component.El = { text: 'Hello 22' };
      component.El = { text: 'Hello 33' };
      ctx.platform.domWriteQueue.flush();
      assert.visibleTextEqual(appHost, 'Hello 33');
      assert.html.innerEqual(appHost, '<div>Hello 33</div>');
    });
  });

  describe('multi updates + <Promise>', function () {
    it('works with [multiple successive updates] + [activate<Promise>]', async function () {
      const baseTimeout = 75;
      let timeout = baseTimeout;
      const { appHost, component, startPromise, stop } = createFixture(
        `\${message}<au-compose component.bind="{ activate, value: i }" template.bind="view" composing.bind="pendingPromise" containerless>`,
        class App {
          i = 0;
          message = 'hello world';
          view = `<div>\${value}</div>`;
          auCompose: AuCompose;

          pendingPromise: Promise<void>;

          activate = () => {
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
      await component.pendingPromise;
      assert.strictEqual(appHost.textContent, `hello world38`);
      assert.html.innerEqual(appHost, 'hello world<div>38</div>');

      void stop();
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
      `\${message}<au-compose component.bind="vm" model.bind="message" composing.bind="pendingPromise" containerless>`,
      class App {
        public i = 0;
        public message = 'hello world';
        public auCompose: AuCompose;
        public vm: any = El1;

        pendingPromise: void | Promise<void>;
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

    await component.pendingPromise;
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
      `\${message}<au-compose component.bind="vm" model.bind="message" composing.bind="pendingPromise" containerless>`,
      class App {
        i = 0;
        message = 'hello world';
        auCompose: AuCompose;
        vm: any = El1;
        pendingPromise: Promise<void>;
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

    await component.pendingPromise;

    await tearDown();
    assert.strictEqual(appHost.textContent, '');
  });

  it('works with [au-slot] when composing custom element', async function () {
    const El1 = CustomElement.define({
      name: 'el1',
      template: `<p><au-slot>`
    }, class Element1 {});
    const { appHost, startPromise, tearDown } = createFixture(
      `<au-compose component.bind="vm"><input value.bind="message" au-slot>`,
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
    const { appHost, startPromise } = createFixture(
      `<au-compose repeat.for="i of 3" component.bind="vm"><input value.to-view="message + i" au-slot>`,
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
  });

  if (typeof window !== 'undefined') {
    it('works with promise in attach/detach', async function () {
      const El1 = CustomElement.define({
        name: 'el1',
        template: `<template ref="host"><p>Heollo??`
      }, class Element1 {
        public host: HTMLElement;
        public async attaching() {
          return new Promise(r => setTimeout(r, 50));
        }
        public async detaching() {
          return new Promise(r => setTimeout(r, 50));
        }
      });
      const { component, startPromise } = createFixture(
        `<au-compose repeat.for="vm of components" component.bind="vm">`,
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
    });
  }

  describe('containerless', function () {
    it('composes containerless', function () {
      const { appHost, component } = createFixture(
        '<au-compose component.bind="comp">',
        class {
          comp: any = CustomElement.define({
            name: 'my-button',
            template: '<button>click me',
            containerless: true,
          });
        }
      );
      assert.strictEqual(appHost.innerHTML, '<!--au-start--><!--au-start--><button>click me</button><!--au-end--><!--au-end-->');

      component.comp = {};
      // when there's no template it'll just add a render location for the composition
      // and doesn't do anything beside that
      assert.strictEqual(appHost.innerHTML, '<!--au-start--><!--au-start--><!--au-end--><!--au-end-->');
    });

    it('composes containerless inside a containerless <au-compose>', function () {
      const { appHost, component } = createFixture(
        '<au-compose component.bind="comp" containerless>',
        class {
          comp: any = CustomElement.define({
            name: 'my-button',
            template: '<button>click me',
            containerless: true,
          });
        }
      );
      assert.strictEqual(appHost.innerHTML, '<!--au-start--><!--au-start--><button>click me</button><!--au-end--><!--au-end-->');

      component.comp = {};
      // when there's no template it'll just add a render location for the composition
      // and doesn't do anything beside that
      assert.strictEqual(appHost.innerHTML, '<!--au-start--><!--au-start--><!--au-end--><!--au-end-->');
    });
  });

  describe('pass through props', function () {
    it('passes plain attributes', function () {
        @customElement('el')
        class El {}

        const { assertAttr } = createFixture('<au-compose style="width: 20%" component.bind="comp" component.ref="el">', class {
          comp = El;
          el: El;
        });

        assertAttr('el', 'style', 'width: 20%;');
    });

    it('transfers attrs when composing non custom element', function () {
      const { assertAttr } = createFixture('<au-compose style="width: 20%" tag="p" component.bind="{}">', class {
      });

      assertAttr('p', 'style', 'width: 20%;');
    });

    it('passes through ref binding', function () {
      @customElement('el')
      class El {}

      const { component } = createFixture('<au-compose component.bind="comp" component.ref="el">', class {
        comp = El;
        el: El;
      });

      assert.instanceOf(component.el, El);
    });

    it('passes through attribute as bindable', function () {
      @customElement({
        name: 'el',
        template: '${message}'
      })
      class El {
        @bindable() message: any;
      }

      const { assertText, assertHtml } = createFixture('<au-compose component.bind="comp" message.bind="msg">', class {
        comp = El;
        msg = 'hello world';
      });

      assertText('hello world');
      assertHtml('<!--au-start--><el>hello world</el><!--au-end-->');
    });

    it('passes through combination of normal and bindable attrs', function () {
      @customElement({
        name: 'el',
        template: '${message}'
      })
      class El {
        @bindable() message: any;
      }

      const { assertText, assertHtml } = createFixture('<au-compose component.bind="comp" id.bind="1" message.bind="msg" class="el">', class {
        comp = El;
        msg = 'hello world';
      });

      assertText('hello world');
      // .bind on id.bind causes the value to be set during .bind
      // which is after class attr, which is during rendering (composition)
      assertHtml('<!--au-start--><el class="el" id="1">hello world</el><!--au-end-->');
    });

    it('switches & cleans up after switching custom element view model', function () {
      let el1MessageCount = 0;
      @customElement({
        name: 'el-1',
        template: '${message}'
      })
      class El1 {
        @bindable() message: any;

        messageChanged() {
          el1MessageCount++;
        }
      }

      @customElement({
        name: 'el-2',
        template: '${id} hey there ${message}'
      })
      class El2 {
        @bindable() message: any;
        @bindable id: any;
      }

      const { component, assertText, assertHtml } = createFixture('<au-compose component.bind="comp" id.bind="1" message.bind="msg" class="el">', class {
        comp: any = El1;
        msg = 'hello world';
      });

      assertText('hello world');
      assert.strictEqual(el1MessageCount, 0);

      component.comp = El2;
      assertText('1 hey there hello world');
      assertHtml('<!--au-start--><el-2 class="el">1 hey there hello world</el-2><!--au-end-->');
      // all bindings to old vm were unbound
      assert.strictEqual(el1MessageCount, 0);
    });

    it('spreads the right attribute on non-custom-element composition tag change', function () {
      const { component, assertHtml } = createFixture('<au-compose tag.bind="i ? `a` : `b`" component.bind="{ }" download.bind="download">', class {
        i = 0;
        download = true;
      });

      assertHtml('<!--au-start--><b></b><!--au-end-->');
      component.i = 1;

      assertHtml('<!--au-start--><a download="true"></a><!--au-end-->');
    });

    // surrogate is not supported on non custom element composition
    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip('binds attributes with right scope on non custom element composition tag change', function () {
      const { component, assertHtml } = createFixture('<au-compose tag.bind="i ? `a` : `b`" component.bind="{ d: download }" template.bind="view">', class {
        i = 0;
        download = true;
        view = '<template download.bind=d>Hey';
      });

      assertHtml('<!--au-start--><b>Hey</b><!--au-end-->');
      component.i = 1;

      assertHtml('<!--au-start--><a download="true">Hey</a><!--au-end-->');
    });

    if (!isNode()) {
      it('does not pass through when no tag is specified in non custom element composition', function () {
        let i = 0;
        let hostEl: HTMLElement;
        const originalCreateElement = document.createElement;
        const spied = createSpy(document, 'createElement', (name) => {
          const el = originalCreateElement.call(document, name);
          if (name === 'div') {
            i++;
            hostEl = el;
          }
          return el;
        });
        const { assertHtml } = createFixture('<au-compose template="hey" class="el">', class {
          download = true;
          hydrated() {
            i = 0;
            hostEl = null;
          }
        });

        assertHtml('<!--au-start--><!--au-start-->hey<!--au-end--><!--au-end-->');
        assert.strictEqual(i, 1);
        assert.notStrictEqual(hostEl, null);
        assert.notStrictEqual(hostEl.getAttribute('class'), 'el');

        spied.restore();
      });
    }

    it('passes attributes into ...$attrs', function () {
      @customElement({
        name: 'my-input',
        capture: true,
        template: '<input ...$attrs />'
      })
      class MyInput {}

      const { assertValue } = createFixture('<au-compose component.bind="comp" value.bind="message" />', class {
        comp = MyInput;
        message = 'hello world';
      }, [MyInput]);

      assertValue('input', 'hello world');
    });

    it('passes ...$attrs on <au-compose>', function () {
      @customElement({
        name: 'my-input',
        capture: true,
        template: '<input ...$attrs />'
      })
      class MyInput {}

      @customElement({
        name: 'field',
        capture: true,
        template: '<au-compose component.bind="comp" ...$attrs >'
      })
      class Field {
        comp = MyInput;
      }

      const { assertValue, component, type } = createFixture('<field value.bind="message" />', class {
        message = 'hello world';
      }, [Field]);

      assertValue('input', 'hello world');
      type('input', 'hey');
      assert.strictEqual(component.message, 'hey');
    });

    it('transfers through ...$attrs', function () {
      @customElement({
        name: 'my-input',
        capture: true,
        template: '<input ...$attrs />'
      })
      class MyInput {
      }

      @customElement({
        name: 'field',
        capture: true,
        template: '<my-input ...$attrs />',
        dependencies: [MyInput]
      })
      class Field {}

      const { assertAttr, assertValue, component, type } = createFixture(
        '<au-compose component.bind="comp" value.bind="message" id="i1" >',
        class {
          comp = Field;
          message = 'hello world';
        },
        [Field]
      );

      assertValue('input', 'hello world');
      assertAttr('input', 'id', 'i1');

      type('input', 'hey');
      assert.strictEqual(component.message, 'hey');
    });

  });

  describe('comparison with normal rendering', function () {
    it('renders similar output', function () {
      @customElement({
        name: 'my-el',
        template: '<p>hey ${v}</p>'
      })
      class El {
        @bindable v;
      }

      const { assertHtml } = createFixture(
        `<div id=d1>
          <au-compose component.bind="el" style="width: 20%;" v="aurelia"></au-compose>
        </div>
        <div id=d2>
          <my-el style="width: 20%;" v="aurelia"></my-el>
        </div>`, class { el = El; }, [El]
      );

      assertHtml('#d1', '<my-el style="width: 20%;"><p>hey aurelia</p></my-el>', { compact: true });
      assertHtml('#d2', '<my-el style="width: 20%;"><p>hey aurelia</p></my-el>', { compact: true });
    });
  });
});
