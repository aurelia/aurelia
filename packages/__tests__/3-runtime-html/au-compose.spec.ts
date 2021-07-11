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
      const { appHost, ctx, component, startPromise, tearDown } = createFixture(
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
      assert.html.innerEqual(appHost, '<div>Hello world</div>');
      ctx.platform.domWriteQueue.flush();
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
      assert.includes(String(ex), 'Containerless custom element is not supported by <au-compose/>');

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
      assert.strictEqual(appHost.innerHTML, '<!--au-start--><!--au-end-->');
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
});
