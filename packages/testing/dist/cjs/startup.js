"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFixture = void 0;
const runtime_html_1 = require("@aurelia/runtime-html");
const test_context_js_1 = require("./test-context.js");
function createFixture(template, $class, registrations = [], autoStart = true, ctx = test_context_js_1.TestContext.create()) {
    const { container, platform, observerLocator } = ctx;
    container.register(...registrations);
    const root = ctx.doc.body.appendChild(ctx.doc.createElement('div'));
    const host = root.appendChild(ctx.createElement('app'));
    const au = new runtime_html_1.Aurelia(container);
    const App = runtime_html_1.CustomElement.define({ name: 'app', template }, $class || class {
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
exports.createFixture = createFixture;
//# sourceMappingURL=startup.js.map