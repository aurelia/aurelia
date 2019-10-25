(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/runtime", "./html-test-context"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const runtime_1 = require("@aurelia/runtime");
    const html_test_context_1 = require("./html-test-context");
    function setup(template, $class, registrations = [], autoStart = true, ctx = html_test_context_1.TestContext.createHTMLTestContext()) {
        const { container, lifecycle, scheduler, observerLocator } = ctx;
        container.register(...registrations);
        const root = ctx.doc.body.appendChild(ctx.doc.createElement('div'));
        const host = root.appendChild(ctx.createElement('app'));
        const au = new runtime_1.Aurelia(container);
        const App = runtime_1.CustomElement.define({ name: 'app', template }, $class || class {
        });
        const component = new App();
        let startPromise = Promise.resolve();
        if (autoStart) {
            au.app({ host: host, component });
            startPromise = au.start().wait();
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
                await au.app({ host: host, component }).start().wait();
            },
            tearDown: async () => {
                await au.stop().wait();
                root.remove();
            }
        };
    }
    exports.setup = setup;
});
//# sourceMappingURL=startup.js.map