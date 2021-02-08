import { CustomElement, Aurelia } from '@aurelia/runtime-html';
import { TestContext } from './test-context.js';
export function createFixture(template, $class, registrations = [], autoStart = true, ctx = TestContext.create()) {
    const { container, platform, observerLocator } = ctx;
    container.register(...registrations);
    const root = ctx.doc.body.appendChild(ctx.doc.createElement('div'));
    const host = root.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const App = CustomElement.define({ name: 'app', template }, $class || class {
    });
    if (container.has(App, true)) {
        throw new Error('Container of the context cotains instance of the application root component. ' +
            'Consider using a different class, or context as it will likely cause surprises in tests.');
    }
    const component = container.get(App);
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
        platform,
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