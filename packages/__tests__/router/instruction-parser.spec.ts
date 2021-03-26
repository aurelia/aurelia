import { IRouter, RouterConfiguration, RoutingInstruction, InstructionParameters } from '@aurelia/router';
import { CustomElement, Aurelia } from '@aurelia/runtime-html';
import { assert, MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';

describe('RoutingInstruction parsing', function () {
  async function createFixture() {
    const ctx = TestContext.create();
    const container = ctx.container;

    const App = CustomElement.define({ name: 'app', template: '<template><au-viewport name="left"></au-viewport><au-viewport name="right"></au-viewport></template>' });

    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);

    const au = ctx.wnd['au'] = new Aurelia(container)
      .register(RouterConfiguration)
      .app({ host: host, component: App });

    const router = container.get(IRouter);
    const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
    mockBrowserHistoryLocation.changeCallback = async (ev) => { router.viewer.handlePopStateEvent(ev); };
    router.viewer.history = mockBrowserHistoryLocation as any;
    router.viewer.location = mockBrowserHistoryLocation as any;

    await au.start();

    async function tearDown() {
      await au.stop(true);
      ctx.doc.body.removeChild(host);

      au.dispose();
    }

    return { au, container, host, router, tearDown, ctx };
  }

  this.timeout(5000);

  describe('can handle routing instructions', function () {
    interface InstructionTest {
      instruction: string;
      routingInstruction?: RoutingInstruction | string;
      parsed?: unknown[];
      clean?: string;
    }

    const ctx = TestContext.create();
    const container = ctx.container;
    const router = container.get(IRouter);

    const instructions: InstructionTest[] = [
      { instruction: '-', parsed: [{ "component": "-" }], clean: '-' },
      { instruction: 'a', parsed: [{ "component": "a" }], clean: 'a' },
      { instruction: 'b', parsed: [{ "component": "b" }], clean: 'b' },
      { instruction: 'c', parsed: [{ "component": "c" }], clean: 'c' },
      { instruction: 'd', parsed: [{ "component": "d" }], clean: 'd' },

      { instruction: '+a', parsed: [{ "component": "a" }], clean: 'error:siblings' },
      { instruction: '+b', parsed: [{ "component": "b" }], clean: 'error:siblings' },
      { instruction: '+c', parsed: [{ "component": "c" }], clean: 'error:siblings' },
      { instruction: '+d', parsed: [{ "component": "d" }], clean: 'error:siblings' },

      { instruction: '(a)', parsed: [{ "component": "a" }], clean: 'a' },
      { instruction: '(b)', parsed: [{ "component": "b" }], clean: 'b' },
      { instruction: '(c)', parsed: [{ "component": "c" }], clean: 'c' },
      { instruction: '(d)', parsed: [{ "component": "d" }], clean: 'd' },

      { instruction: '(+a)', parsed: [{ "component": "a" }], clean: 'error:siblings' },
      { instruction: '(+b)', parsed: [{ "component": "b" }], clean: 'error:siblings' },
      { instruction: '(+c)', parsed: [{ "component": "c" }], clean: 'error:siblings' },
      { instruction: '(+d)', parsed: [{ "component": "d" }], clean: 'error:siblings' },

      { instruction: '+(a)', parsed: [{ "component": "a" }], clean: 'error:siblings' },
      { instruction: '+(b)', parsed: [{ "component": "b" }], clean: 'error:siblings' },
      { instruction: '+(c)', parsed: [{ "component": "c" }], clean: 'error:siblings' },
      { instruction: '+(d)', parsed: [{ "component": "d" }], clean: 'error:siblings' },

      { instruction: '(a)+b', parsed: [{ "component": "a" }, { "component": "b" }], clean: 'a+b' },
      { instruction: 'a+(b)', parsed: [{ "component": "a" }, { "component": "b" }], clean: 'a+b' },

      { instruction: '+(a)+b', parsed: [{ "component": "a" }, { "component": "b" }], clean: 'error:siblings' },
      { instruction: '+a+(b)', parsed: [{ "component": "a" }, { "component": "b" }], clean: 'error:siblings' },

      { instruction: 'a+b', parsed: [{ "component": "a" }, { "component": "b" }], clean: 'a+b' },
      { instruction: 'b+c', parsed: [{ "component": "b" }, { "component": "c" }], clean: 'b+c' },
      { instruction: 'c+d', parsed: [{ "component": "c" }, { "component": "d" }], clean: 'c+d' },

      { instruction: '+a+b', parsed: [{ "component": "a" }, { "component": "b" }], clean: 'error:siblings' },
      { instruction: '+b+c', parsed: [{ "component": "b" }, { "component": "c" }], clean: 'error:siblings' },
      { instruction: '+c+d', parsed: [{ "component": "c" }, { "component": "d" }], clean: 'error:siblings' },

      { instruction: '(a)/b', parsed: [{ "component": "a", "children": [{ "component": "b" }] }], clean: 'a/b' },
      { instruction: 'a/(b)', parsed: [{ "component": "a", "children": [{ "component": "b" }] }], clean: 'a/b' },

      { instruction: '+(a)/b', parsed: [{ "component": "a", "children": [{ "component": "b" }] }], clean: 'error:siblings' },
      { instruction: '+a/(b)', parsed: [{ "component": "a", "children": [{ "component": "b" }] }], clean: 'error:siblings' },

      { instruction: 'a/b', parsed: [{ "component": "a", "children": [{ "component": "b" }] }], clean: 'a/b' },
      { instruction: 'b/c', parsed: [{ "component": "b", "children": [{ "component": "c" }] }], clean: 'b/c' },
      { instruction: 'c/d', parsed: [{ "component": "c", "children": [{ "component": "d" }] }], clean: 'c/d' },

      { instruction: '+a/b', parsed: [{ "component": "a", "children": [{ "component": "b" }] }], clean: 'error:siblings' },
      { instruction: '+b/c', parsed: [{ "component": "b", "children": [{ "component": "c" }] }], clean: 'error:siblings' },
      { instruction: '+c/d', parsed: [{ "component": "c", "children": [{ "component": "d" }] }], clean: 'error:siblings' },

      { instruction: '(a+b)', parsed: [{ "component": "a" }, { "component": "b" }], clean: 'a+b' },
      { instruction: '(b+c)', parsed: [{ "component": "b" }, { "component": "c" }], clean: 'b+c' },
      { instruction: '(c+d)', parsed: [{ "component": "c" }, { "component": "d" }], clean: 'c+d' },

      { instruction: '(a/b)', parsed: [{ "component": "a", "children": [{ "component": "b" }] }], clean: 'a/b' },
      { instruction: '(b/c)', parsed: [{ "component": "b", "children": [{ "component": "c" }] }], clean: 'b/c' },
      { instruction: '(c/d)', parsed: [{ "component": "c", "children": [{ "component": "d" }] }], clean: 'c/d' },

      { instruction: '+(a+b)', parsed: [{ "component": "a" }, { "component": "b" }], clean: 'error:siblings' },
      { instruction: '+(b+c)', parsed: [{ "component": "b" }, { "component": "c" }], clean: 'error:siblings' },
      { instruction: '+(c+d)', parsed: [{ "component": "c" }, { "component": "d" }], clean: 'error:siblings' },

      { instruction: 'a+b+c', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }], clean: 'a+b+c' },
      { instruction: '(a+b)+c', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }], clean: 'a+b+c' },
      { instruction: 'a+(b+c)', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }], clean: 'a+b+c' },
      { instruction: 'a/b+c', parsed: [{ "component": "a", "children": [{ "component": "b" }] }, { "component": "c" }], clean: 'a/b+c' },
      { instruction: '(a/b)+c', parsed: [{ "component": "a", "children": [{ "component": "b" }] }, { "component": "c" }], clean: 'a/b+c' },
      { instruction: 'a+b/c', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c" }] }], clean: 'a+b/c' },
      { instruction: 'a+(b/c)', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c" }] }], clean: 'a+b/c' },

      { instruction: '+a+b+c', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }], clean: 'error:siblings' },
      { instruction: '+(a+b)+c', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }], clean: 'error:siblings' },
      { instruction: '+a+(b+c)', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }], clean: 'error:siblings' },
      { instruction: '+a/b+c', parsed: [{ "component": "a", "children": [{ "component": "b" }] }, { "component": "c" }], clean: 'error:siblings' },
      { instruction: '+(a/b)+c', parsed: [{ "component": "a", "children": [{ "component": "b" }] }, { "component": "c" }], clean: 'error:siblings' },
      { instruction: '+a+b/c', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c" }] }], clean: 'error:siblings' },
      { instruction: '+a+(b/c)', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c" }] }], clean: 'error:siblings' },

      { instruction: 'b+c+d', parsed: [{ "component": "b" }, { "component": "c" }, { "component": "d" }], clean: 'b+c+d' },
      { instruction: '(b+c)+d', parsed: [{ "component": "b" }, { "component": "c" }, { "component": "d" }], clean: 'b+c+d' },
      { instruction: 'b+(c+d)', parsed: [{ "component": "b" }, { "component": "c" }, { "component": "d" }], clean: 'b+c+d' },
      { instruction: 'b/c+d', parsed: [{ "component": "b", "children": [{ "component": "c" }] }, { "component": "d" }], clean: 'b/c+d' },
      { instruction: '(b/c)+d', parsed: [{ "component": "b", "children": [{ "component": "c" }] }, { "component": "d" }], clean: 'b/c+d' },
      { instruction: 'b+c/d', parsed: [{ "component": "b" }, { "component": "c", "children": [{ "component": "d" }] }], clean: 'b+c/d' },
      { instruction: 'b+(c/d)', parsed: [{ "component": "b" }, { "component": "c", "children": [{ "component": "d" }] }], clean: 'b+c/d' },

      { instruction: 'a/b/c', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c" }] }] }], clean: 'a/b/c' },
      { instruction: 'a/(b/c)', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c" }] }] }], clean: 'a/b/c' },
      { instruction: 'a/(b+c)', parsed: [{ "component": "a", "children": [{ "component": "b" }, { "component": "c" }] }], clean: 'a/(b+c)' },
      { instruction: '(a/b)/c', parsed: [{ "component": "a", "children": [{ "component": "c" }] }], clean: 'a/b/c' },
      { instruction: '(a+b)/c', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c" }] }], clean: 'error:children' },

      { instruction: '+a/b/c', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c" }] }] }], clean: 'error:siblings' },
      { instruction: '+a/(b/c)', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c" }] }] }], clean: 'error:siblings' },
      { instruction: '+a/(b+c)', parsed: [{ "component": "a", "children": [{ "component": "b" }, { "component": "c" }] }], clean: 'error:siblings' },
      { instruction: '+(a/b)/c', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c" }] }] }], clean: 'error:siblings' },
      { instruction: '+(a+b)/c', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c" }] }], clean: 'error:siblings' },

      { instruction: 'b/c/d', parsed: [{ "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }], clean: 'b/c/d' },
      { instruction: 'b/(c/d)', parsed: [{ "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }], clean: 'b/c/d' },
      { instruction: 'b/(c+d)', parsed: [{ "component": "b", "children": [{ "component": "c" }, { "component": "d" }] }], clean: 'b/(c+d)' },
      { instruction: '(b/c)/d', parsed: [{ "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }], clean: 'b/c/d' },
      { instruction: '(b+c)/d', clean: 'error:children' },

      { instruction: '(a+b+c)', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }], clean: 'a+b+c' },
      { instruction: '((a+b)+c)', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }], clean: 'a+b+c' },
      { instruction: '(a+(b+c))', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }], clean: 'a+b+c' },
      { instruction: '(a/b+c)', parsed: [{ "component": "a", "children": [{ "component": "b" }] }, { "component": "c" }], clean: 'a/b+c' },
      { instruction: '((a/b)+c)', parsed: [{ "component": "a", "children": [{ "component": "b" }] }, { "component": "c" }], clean: 'a/b+c' },
      { instruction: '(a+b/c)', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c" }] }], clean: 'a+b/c' },
      { instruction: '(a+(b/c))', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c" }] }], clean: 'a+b/c' },

      { instruction: '(b+c+d)', parsed: [{ "component": "b" }, { "component": "c" }, { "component": "d" }], clean: 'b+c+d' },
      { instruction: '((b+c)+d)', parsed: [{ "component": "b" }, { "component": "c" }, { "component": "d" }], clean: 'b+c+d' },
      { instruction: '(b+(c+d))', parsed: [{ "component": "b" }, { "component": "c" }, { "component": "d" }], clean: 'b+c+d' },
      { instruction: '(b/c+d)', parsed: [{ "component": "b", "children": [{ "component": "c" }] }, { "component": "d" }], clean: 'b/c+d' },
      { instruction: '((b/c)+d)', parsed: [{ "component": "b", "children": [{ "component": "c" }] }, { "component": "d" }], clean: 'b/c+d' },
      { instruction: '(b+c/d)', parsed: [{ "component": "b" }, { "component": "c", "children": [{ "component": "d" }] }], clean: 'b+c/d' },
      { instruction: '(b+(c/d))', parsed: [{ "component": "b" }, { "component": "c", "children": [{ "component": "d" }] }], clean: 'b+c/d' },

      { instruction: '(a/b/c)', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c" }] }] }], clean: 'a/b/c' },
      { instruction: '(a/(b/c))', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c" }] }] }], clean: 'a/b/c' },
      { instruction: '(a/(b+c))', parsed: [{ "component": "a", "children": [{ "component": "b" }, { "component": "c" }] }], clean: 'a/(b+c)' },
      { instruction: '((a/b)/c)', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c" }] }] }], clean: 'a/b/c' },
      { instruction: '((a+b)/c)', clean: 'error:children' },

      { instruction: '(b/c/d)', parsed: [{ "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }], clean: 'b/c/d' },
      { instruction: '(b/(c/d))', parsed: [{ "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }], clean: 'b/c/d' },
      { instruction: '(b/(c+d))', parsed: [{ "component": "b", "children": [{ "component": "c" }, { "component": "d" }] }], clean: 'b/(c+d)' },
      { instruction: '((b/c)/d)', parsed: [{ "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }], clean: 'b/c/d' },
      { instruction: '((b+c)/d)', clean: 'error:children' },

      { instruction: 'a+b+c+d', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }, { "component": "d" }], clean: 'a+b+c+d' },
      { instruction: '(a+b)+c+d', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }, { "component": "d" }], clean: 'a+b+c+d' },
      { instruction: 'a+(b+c)+d', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }, { "component": "d" }], clean: 'a+b+c+d' },
      { instruction: 'a+b+(c+d)', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }, { "component": "d" }], clean: 'a+b+c+d' },
      { instruction: '(a+b)+(c+d)', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }, { "component": "d" }], clean: 'a+b+c+d' },
      { instruction: '(a+b+c)+d', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }, { "component": "d" }], clean: 'a+b+c+d' },
      { instruction: '((a+b)+c)+d', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }, { "component": "d" }], clean: 'a+b+c+d' },
      { instruction: '(a+(b+c))+d', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }, { "component": "d" }], clean: 'a+b+c+d' },
      { instruction: 'a+(b+c+d)', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }, { "component": "d" }], clean: 'a+b+c+d' },
      { instruction: 'a+((b+c)+d)', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }, { "component": "d" }], clean: 'a+b+c+d' },
      { instruction: 'a+(b+(c+d))', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c" }, { "component": "d" }], clean: 'a+b+c+d' },

      { instruction: 'a/b+c+d', parsed: [{ "component": "a", "children": [{ "component": "b" }] }, { "component": "c" }, { "component": "d" }], clean: 'a/b+c+d' },
      { instruction: '(a/b)+c+d', parsed: [{ "component": "a", "children": [{ "component": "b" }] }, { "component": "c" }, { "component": "d" }], clean: 'a/b+c+d' },
      { instruction: 'a/(b+c)+d', parsed: [{ "component": "a", "children": [{ "component": "b" }, { "component": "c" }] }, { "component": "d" }], clean: 'a/(b+c)+d' },
      { instruction: 'a/b+(c+d)', parsed: [{ "component": "a", "children": [{ "component": "b" }] }, { "component": "c" }, { "component": "d" }], clean: 'a/b+c+d' },
      { instruction: '(a/b)+(c+d)', parsed: [{ "component": "a", "children": [{ "component": "b" }] }, { "component": "c" }, { "component": "d" }], clean: 'a/b+c+d' },
      { instruction: '(a/b+c)+d', parsed: [{ "component": "a", "children": [{ "component": "b" }] }, { "component": "c" }, { "component": "d" }], clean: 'a/b+c+d' },
      { instruction: '((a/b)+c)+d', parsed: [{ "component": "a", "children": [{ "component": "b" }] }, { "component": "c" }, { "component": "d" }], clean: 'a/b+c+d' },
      { instruction: '(a/(b+c))+d', parsed: [{ "component": "a", "children": [{ "component": "b" }, { "component": "c" }] }, { "component": "d" }], clean: 'a/(b+c)+d' },

      { instruction: 'a+b/c+d', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c" }] }, { "component": "d" }], clean: 'a+b/c+d' },
      { instruction: '(a+b)/c+d', clean: 'error:children', },
      { instruction: 'a+(b/c)+d', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c" }] }, { "component": "d" }], clean: 'a+b/c+d' },
      { instruction: 'a+b/(c+d)', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c" }, { "component": "d" }] }], clean: 'a+b/(c+d)' },
      { instruction: '(a+b/c)+d', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c" }] }, { "component": "d" }], clean: 'a+b/c+d' },
      { instruction: '((a+b)/c)+d', clean: 'error:children', },
      { instruction: '(a+(b/c))+d', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c" }] }, { "component": "d" }], clean: 'a+b/c+d' },
      { instruction: 'a+(b/c+d)', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c" }] }, { "component": "d" }], clean: 'a+b/c+d' },
      { instruction: 'a+((b/c)+d)', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c" }] }, { "component": "d" }], clean: 'a+b/c+d' },
      { instruction: 'a+(b/(c+d))', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c" }, { "component": "d" }] }], clean: 'a+b/(c+d)' },

      { instruction: 'a+b+c/d', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c", "children": [{ "component": "d" }] }], clean: 'a+b+c/d' },
      { instruction: '(a+b)+c/d', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c", "children": [{ "component": "d" }] }], clean: 'a+b+c/d' },
      { instruction: 'a+(b+c)/d', clean: 'error:children', },
      { instruction: 'a+b+(c/d)', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c", "children": [{ "component": "d" }] }], clean: 'a+b+c/d' },
      { instruction: '(a+b)+(c/d)', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c", "children": [{ "component": "d" }] }], clean: 'a+b+c/d' },
      { instruction: 'a+(b+c/d)', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c", "children": [{ "component": "d" }] }], clean: 'a+b+c/d' },
      { instruction: 'a+((b+c)/d)', clean: 'error:children', },
      { instruction: 'a+(b+(c/d))', parsed: [{ "component": "a" }, { "component": "b" }, { "component": "c", "children": [{ "component": "d" }] }], clean: 'a+b+c/d' },

      { instruction: 'a/b+c/d', parsed: [{ "component": "a", "children": [{ "component": "b" }] }, { "component": "c", "children": [{ "component": "d" }] }], clean: 'a/b+c/d' },
      { instruction: '(a/b)+c/d', parsed: [{ "component": "a", "children": [{ "component": "b" }] }, { "component": "c", "children": [{ "component": "d" }] }], clean: 'a/b+c/d' },
      { instruction: 'a/b+(c/d)', parsed: [{ "component": "a", "children": [{ "component": "b" }] }, { "component": "c", "children": [{ "component": "d" }] }], clean: 'a/b+c/d' },
      { instruction: '(a/b)+(c/d)', parsed: [{ "component": "a", "children": [{ "component": "b" }] }, { "component": "c", "children": [{ "component": "d" }] }], clean: 'a/b+c/d' },

      { instruction: 'a/b/c+d', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c" }] }] }, { "component": "d" }], clean: 'a/b/c+d' },
      { instruction: '(a/b)/c+d', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c" }] }] }, { "component": "d" }], clean: 'a/b/c+d' },
      { instruction: 'a/(b/c)+d', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c" }] }] }, { "component": "d" }], clean: 'a/b/c+d' },
      { instruction: '(a/b/c)+d', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c" }] }] }, { "component": "d" }], clean: 'a/b/c+d' },
      { instruction: '((a/b)/c)+d', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c" }] }] }, { "component": "d" }], clean: 'a/b/c+d' },
      { instruction: '(a/(b/c))+d', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c" }] }] }, { "component": "d" }], clean: 'a/b/c+d' },

      { instruction: 'a+b/c/d', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }], clean: 'a+b/c/d' },
      { instruction: 'a+(b/c)/d', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }], clean: 'a+b/c/d' },
      { instruction: 'a+b/(c/d)', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }], clean: 'a+b/c/d' },
      { instruction: 'a+(b/c/d)', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }], clean: 'a+b/c/d' },
      { instruction: 'a+((b/c)/d)', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }], clean: 'a+b/c/d' },
      { instruction: 'a+(b/(c/d))', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }], clean: 'a+b/c/d' },

      { instruction: 'a/b/c/d', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }] }], clean: 'a/b/c/d' },
      { instruction: '(a/b)/c/d', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }] }], clean: 'a/b/c/d' },
      { instruction: 'a/(b/c)/d', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }] }], clean: 'a/b/c/d' },
      { instruction: 'a/b/(c/d)', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }] }], clean: 'a/b/c/d' },
      { instruction: '(a/b)/(c/d)', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }] }], clean: 'a/b/c/d' },
      { instruction: '(a/b/c)/d', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }] }], clean: 'a/b/c/d' },
      { instruction: '((a/b)/c)/d', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }] }], clean: 'a/b/c/d' },
      { instruction: '(a/(b/c))/d', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }] }], clean: 'a/b/c/d' },
      { instruction: 'a/(b/c/d)', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }] }], clean: 'a/b/c/d' },
      { instruction: 'a/((b/c)/d)', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }] }], clean: 'a/b/c/d' },
      { instruction: 'a/(b/(c/d))', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }] }], clean: 'a/b/c/d' },

      { instruction: '(a+b)/c/d', clean: 'error:children' },
      { instruction: '(a+b)/(c/d)', clean: 'error:children' },
      { instruction: '(a+b/c)/d', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }], clean: 'a+b/c/d' },
      { instruction: '((a+b)/c)/d', clean: 'error:children' },
      { instruction: '(a+(b/c))/d', parsed: [{ "component": "a" }, { "component": "b", "children": [{ "component": "c", "children": [{ "component": "d" }] }] }], clean: 'a+b/c/d' },

      { instruction: 'a/(b+c)/d', clean: 'error:children' },
      { instruction: '(a/b+c)/d', clean: 'error:children' },
      { instruction: '((a/b)+c)/d', clean: 'error:children' },
      { instruction: '(a/(b+c))/d', clean: 'error:children' },
      { instruction: 'a/(b+c/d)', parsed: [{ "component": "a", "children": [{ "component": "b" }, { "component": "c", "children": [{ "component": "d" }] }] }], clean: 'a/(b+c/d)' },
      { instruction: 'a/((b+c)/d)', clean: 'error:children' },
      { instruction: 'a/(b+(c/d))', parsed: [{ "component": "a", "children": [{ "component": "b" }, { "component": "c", "children": [{ "component": "d" }] }] }], clean: 'a/(b+c/d)' },

      { instruction: 'a/b/(c+d)', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c" }, { "component": "d" }] }] }], clean: 'a/b/(c+d)' },
      { instruction: '(a/b)/(c+d)', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c" }, { "component": "d" }] }] }], clean: 'a/b/(c+d)' },
      { instruction: 'a/(b/c+d)', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c" }] }, { "component": "d" }] }], clean: 'a/(b/c+d)' },
      { instruction: 'a/((b/c)+d)', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c" }] }, { "component": "d" }] }], clean: 'a/(b/c+d)' },
      { instruction: 'a/(b/(c+d))', parsed: [{ "component": "a", "children": [{ "component": "b", "children": [{ "component": "c" }, { "component": "d" }] }] }], clean: 'a/b/(c+d)' },

      { instruction: '(a+b)/(c+d)', clean: 'error:children' },

      { instruction: '(a+b+c)/d', clean: 'error:children' },
      { instruction: '((a+b)+c)/d', clean: 'error:children' },
      { instruction: '(a+(b+c))/d', clean: 'error:children' },

      { instruction: 'a/(b+c+d)', parsed: [{ "component": "a", "children": [{ "component": "b" }, { "component": "c" }, { "component": "d" }] }], clean: 'a/(b+c+d)' },
      { instruction: 'a/((b+c)+d)', parsed: [{ "component": "a", "children": [{ "component": "b" }, { "component": "c" }, { "component": "d" }] }], clean: 'a/(b+c+d)' },
      { instruction: 'a/(b+(c+d))', parsed: [{ "component": "a", "children": [{ "component": "b" }, { "component": "c" }, { "component": "d" }] }], clean: 'a/(b+c+d)' },
    ];

    function assertError(error: string, type: string, msg: string): void {
      let errMsg;
      switch (type) {
        case 'error:siblings':
          errMsg = 'Error: Instruction parser error: Unnecessary siblings separator';
          assert.equal(error.toString().slice(0, errMsg.length), errMsg, `error:siblings:${msg}`);
          break;
        case 'error:scopes':
          errMsg = 'Error: Instruction parser error: Unnecessary scopes';
          assert.equal(error.toString().slice(0, errMsg.length), errMsg, `error:scopes:${msg}`);
          break;
        case 'error:children':
          errMsg = 'Error: Instruction parser error: Children below scope';
          assert.equal(error.toString().slice(0, errMsg.length), errMsg, `error:scopes:${msg}`);
          break;
        default:
          throw error;
      }
    }

    for (const test of instructions) {
      const { instruction, routingInstruction, parsed, clean } = test;

      it(`parses routing instruction: ${instruction} => ${clean ?? routingInstruction}`, async function () {
        const { host, router, tearDown } = await createFixture();

        let routingInstructions;
        let error = '';
        try {
          routingInstructions = RoutingInstruction.parse(instruction);
        } catch (err) {
          error = err;
        }
        if (error === '') {
          const newInstruction = RoutingInstruction.stringify(router, routingInstructions);
          // if (parsed == null) {
          //   console.log(`{ instruction: '${instruction}', parsed: ${JSON.stringify(routingInstructions)}, clean: '${newInstruction}' },`);
          // }
          assert.strictEqual(newInstruction, clean ?? routingInstruction, `newInstruction`);
        } else {
          // console.log(error);
          if (clean == null) {
            console.log(`{ instruction: '${instruction}', clean: '${routingInstruction}' },`);
          }
          assertError(error, clean ?? routingInstruction as string, instruction);
        }

        await tearDown();
      });
    }
  });
});
