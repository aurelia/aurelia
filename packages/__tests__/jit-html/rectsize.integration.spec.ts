import { Constructable } from '@aurelia/kernel';
import { Aurelia, CustomElement } from '@aurelia/runtime';
import { RectSize } from '@aurelia/runtime-html';
import { assert, HTMLTestContext, TestContext } from '@aurelia/testing';
// tslint:disable-next-line:import-name
import ResizeObserver from '@juggle/resize-observer';
import { ResizeObserverSize } from './resize-observer-typings-test';

describe('rectsize.integration.spec.ts', function() {

  it('works in basic scenario', async function() {
    RectSize.ResizeObserver = ResizeObserver;
    const { dispose, ctx, host, component } = setup(
      `<form style="width: 100px">
        <div id=formField1 rectsize.bind="firstnameFieldSize" style="height: 60px">
          <label>First name</label>
          <input name=firstname />
        </div>
      </form>`,
      class App {
        public firstnameFieldSize: ResizeObserverSize;
      }
    );

    await waitForFrames(ctx, 1);
    assert.deepEqual(component.firstnameFieldSize, { inlineSize: 100, blockSize: 60 }, 'Should have been 100x60 (1)');

    host.querySelector('form').style.width = '200px';
    assert.deepEqual(component.firstnameFieldSize, { inlineSize: 100, blockSize: 60 }, 'Should have been 100x60 still (2)');
    await waitForFrames(ctx, 1);
    assert.deepEqual(component.firstnameFieldSize, { inlineSize: 200, blockSize: 60 }, 'Should have been 200x60');

    dispose();
  });

  function setup<T>(template: string | Node, $class: Constructable<T>, autoStart: boolean = true, ...registrations: any[]) {
    const ctx = TestContext.createHTMLTestContext();
    const { container, lifecycle, observerLocator } = ctx;
    container.register(...registrations, RectSize);
    const host = ctx.doc.body.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const App = CustomElement.define({ name: 'app', template }, $class);
    const component = new App();

    let startPromise: Promise<unknown>;
    if (autoStart) {
      au.app({ host, component });
      startPromise = au.start().wait();
    }

    return {
      startPromise,
      ctx,
      container,
      lifecycle,
      host,
      au,
      component,
      observerLocator,
      start: async () => {
        au.app({ host, component });
        await au.start().wait();
      },
      dispose: async () => {
        await au.stop().wait();
        host.remove();
      }
    };
  }

  function waitForFrames(ctx: HTMLTestContext, frameCount: number) {
    // tslint:disable-next-line:promise-must-complete
    return new Promise<void>(r => {
      const next = () => {
        if (frameCount > 0) {
          frameCount--;
          ctx.wnd.requestAnimationFrame(next);
        } else {
          r();
        }
      };
      next();
    });
  }
});
