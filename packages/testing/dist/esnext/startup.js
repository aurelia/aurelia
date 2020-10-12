import { CustomElement, Aurelia } from '@aurelia/runtime';
import { TestContext } from './html-test-context';
export function createFixture(template, $class, registrations = [], autoStart = true, ctx = TestContext.createHTMLTestContext()) {
    const { container, lifecycle, scheduler, observerLocator } = ctx;
    container.register(...registrations);
    const root = ctx.doc.body.appendChild(ctx.doc.createElement('div'));
    const host = root.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const App = CustomElement.define({ name: 'app', template }, $class || class {
    });
    const component = new App();
    let startPromise = void 0;
    if (autoStart) {
        au.app({ host: host, component });
        startPromise = au.start();
    }
    return {
        startPromise,
        ctx,
        host: ctx.doc.firstElementChild,
        container,
        lifecycle,
        scheduler,
        testHost: root,
        appHost: host,
        au,
        component,
        observerLocator,
        start: async () => {
            await au.app({ host: host, component }).start();
        },
        tearDown: async () => {
            await au.stop();
            root.remove();
            au.dispose();
        }
    };
}
//# sourceMappingURL=startup.js.map