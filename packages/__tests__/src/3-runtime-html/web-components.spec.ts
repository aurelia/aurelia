import { CustomElement, INode } from '@aurelia/runtime-html';
import { IWcElementRegistry } from '@aurelia/web-components';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/web-components.spec.ts', function () {
  // do not test in JSDOM
  if (typeof process !== 'undefined') {
    return;
  }
  describe('define', function () {
    it('throws on invalid WC element name', async function () {
      const { container, startPromise, tearDown } = createFixture(
        `<my-element>`,
        class App { }
      );

      await startPromise;

      assert.throws(() => container.get(IWcElementRegistry).define('myelement', class MyElement { }));

      await tearDown();
    });

    it('throws on containerless WC element', async function () {
      const { container, startPromise, tearDown } = createFixture(
        `<my-element>`,
        class App { },
      );

      await startPromise;

      assert.throws(() => container.get(IWcElementRegistry).define('myelement', class MyElement { public static containerless = true; }));
      assert.throws(() => container.get(IWcElementRegistry).define('myelement', { containerless: true }));

      await tearDown();
    });

    it('works with basic plain class', async function () {
      const { container, appHost, startPromise, tearDown } = createFixture(
        `<my-element>`,
        class App { },
      );

      await startPromise;

      container.get(IWcElementRegistry).define('my-element', class MyElement {
        public static template = `\${message}`;

        public message: string = 'hello world';
      });

      assert.html.textContent(appHost, 'hello world');
      await tearDown();
    });

    it('works with literal object element definition', async function () {
      const { container, appHost, startPromise, tearDown } = createFixture(
        `<my-element-1>`,
        class App { },
      );

      await startPromise;

      container.get(IWcElementRegistry).define('my-element-1', { template: 'hello world' });

      assert.html.textContent(appHost, 'hello world');

      await tearDown();
    });

    it('works with Au custom element class', async function () {
      const { container, appHost, startPromise, tearDown } = createFixture(
        `<my-element-2>`,
        class App { },
      );

      await startPromise;

      container.get(IWcElementRegistry).define(
        'my-element-2',
        CustomElement.define({ name: '1', template: `\${message}` }, class MyElement {
          public message: string = 'hello world';
        })
      );

      assert.html.textContent(appHost, 'hello world');
      await tearDown();
    });

    it('extends built-in elemenet', async function () {
      const { container, appHost, startPromise, tearDown } = createFixture(
        `<button is="my-btn-1">`,
        class App { },
      );

      await startPromise;

      container.get(IWcElementRegistry).define('my-btn-1', { template: '<div>hello world</div>' }, { extends: 'button' });

      assert.html.innerEqual(appHost.querySelector('button'), '<div>hello world</div>');

      await tearDown();
    });

    it('observes attribute on normal custom element', async function () {
      const { platform, container, appHost, component, startPromise, tearDown } = createFixture(
        `<my-element-3 message.attr="message">`,
        class App {
          public message = 'hello world';
        },
      );

      await startPromise;

      container.get(IWcElementRegistry).define(
        'my-element-3',
        class MyElement {
          public static template = `\${message}`;
          public static bindables = ['message'];
          public message: string;
        }
      );

      assert.html.textContent(appHost, 'hello world');

      component.message = 'hello';
      assert.html.textContent(appHost, 'hello world');

      platform.domWriteQueue.flush();
      assert.html.textContent(appHost, 'hello');

      await tearDown();
    });

    it('observes attribute on extended built-in custom element', async function () {
      const { platform, container, appHost, component, startPromise, tearDown } = createFixture(
        `<p is="my-element-4" message.attr="message">`,
        class App {
          public message = 'hello world';
        },
      );

      await startPromise;

      container.get(IWcElementRegistry).define(
        'my-element-4',
        class MyElement {
          public static template = `<div>\${message}</div>`;
          public static bindables = ['message'];
          public message: string;
        },
        { extends: 'p' }
      );

      const p = appHost.querySelector('p');
      assert.html.innerEqual(p, '<div>hello world</div>');

      component.message = 'hello';
      assert.html.innerEqual(p, '<div>hello world</div>');

      platform.domWriteQueue.flush();
      assert.html.innerEqual(p, '<div>hello</div>');

      await tearDown();
    });

    it('works with bindable-as-property on normal custom element', async function () {
      const { platform, container, appHost, startPromise, tearDown } = createFixture(
        `<my-element-5 message.attr="message">`,
        class App {
          public message = 'hello world';
        },
      );

      await startPromise;

      container.get(IWcElementRegistry).define(
        'my-element-5',
        class MyElement {
          public static template = `<div>\${message}</div>`;
          public static bindables = ['message'];
          public message: string;
        }
      );

      const el5 = appHost.querySelector('my-element-5') as HTMLElement & { message: string };
      assert.html.innerEqual(el5, '<div>hello world</div>');

      el5.message = 'hello';

      platform.domWriteQueue.flush();
      assert.html.innerEqual(el5, '<div>hello</div>');

      await tearDown();
    });

    it('support host injection', async function () {
      const { platform, container, appHost, startPromise, tearDown } = createFixture(`<my-element-6>`, class App { });

      await startPromise;

      class MyElementVm {
        public static template = `\${message}`;
        public static inject = [INode, platform.Element, platform.HTMLElement];

        public message: string = 'hello world';

        public constructor(node: INode, element: Element, htmlElement: HTMLElement) {
          assert.strictEqual(node, element);
          assert.strictEqual(element, htmlElement);
        }
      }
      container.get(IWcElementRegistry).define('my-element-6', MyElementVm);

      assert.html.textContent(appHost, 'hello world');
      await tearDown();
    });

    it('bindables works when created with document.createElement', async function () {
      const { platform, container, appHost, startPromise, tearDown } = createFixture(``);

      await startPromise;

      class MyElementVm {
        public static template = `\${message}`;
        public static bindables = ['message'];
        public static inject = [INode, platform.Element, platform.HTMLElement];

        public message: string = '';

        public constructor(node: INode, element: Element, htmlElement: HTMLElement) {
          assert.strictEqual(node, element);
          assert.strictEqual(element, htmlElement);
        }
      }
      container.get(IWcElementRegistry).define('my-element-7', MyElementVm);

      const myEl7 = platform.document.createElement('my-element-7') as HTMLElement & { message: string };
      assert.strictEqual(myEl7['auCtrl'], void 0);
      assert.html.textContent(myEl7, '');

      appHost.appendChild(myEl7);

      myEl7.message = 'hello world';
      assert.html.textContent(myEl7, '');
      platform.domWriteQueue.flush();
      assert.html.textContent(myEl7, 'hello world');
      await tearDown();
    });

    it('works with shadow dom mode', async function () {
      const { container, appHost, startPromise, tearDown } = createFixture(`<my-element-8>`);

      await startPromise;

      class MyElementVm {
        public static shadowOptions: ShadowRootInit = { mode: 'open' };
        public static template = `<div>hello world</div>`;
      }
      container.get(IWcElementRegistry).define('my-element-8', MyElementVm);

      const myEl8 = appHost.querySelector('my-element-8') as HTMLElement & { message: string };
      assert.strictEqual(myEl8.textContent, '');
      assert.html.innerEqual(myEl8.shadowRoot, '<div>hello world</div>');

      await tearDown();
    });
  });

  describe('disconnectedCallback()', function () {
    it('deactivate controller', async function () {
      const { container, appHost, startPromise, tearDown } = createFixture(
        `<my-element-20>`,
        class App { }
      );

      await startPromise;

      container.get(IWcElementRegistry).define('my-element-20', class MyElement {
        public static template = `<div repeat.for="i of 3">\${i}</div>`;

        public message: string = 'hello world';
      });

      assert.html.textContent(appHost, '012');
      await tearDown();

      assert.html.textContent(appHost, '');
    });
  });
});
