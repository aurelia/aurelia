import { runTasks } from '@aurelia/runtime';
import { CustomElement, Aurelia } from '@aurelia/runtime-html';
import { assert, eachCartesianJoin, hJsx, // deepscan-disable-line UNUSED_IMPORT
TestContext, createFixture, } from '@aurelia/testing';
describe('3-runtime-html/portal.spec.tsx', function () {
    it('portals to "beforebegin" position 🚪-🔁-🚪', function () {
        const { assertHtml } = createFixture(hJsx(hJsx.Fragment, null,
            hJsx("div", { id: "d1" }, "hello"),
            hJsx("button", { portal: "target: #d1; position: beforebegin" }, "click me")));
        assertHtml('<!--au-start--><button>click me</button><!--au-end--><div id="d1">hello</div><!--au-start--><!--au-end-->');
    });
    it('portals to "afterbegin" position', function () {
        const { assertHtml } = createFixture(hJsx(hJsx.Fragment, null,
            hJsx("div", { id: "d1" }, "hello"),
            hJsx("button", { portal: "target: #d1; position: afterbegin" }, "click me")));
        assertHtml('<div id="d1"><!--au-start--><button>click me</button><!--au-end-->hello</div><!--au-start--><!--au-end-->');
    });
    it('portals to "beforeend" position', function () {
        const { assertHtml } = createFixture(hJsx(hJsx.Fragment, null,
            hJsx("div", { id: "d1" }, "hello"),
            hJsx("button", { portal: "target: #d1; position: beforeend" }, "click me")));
        assertHtml('<div id="d1">hello<!--au-start--><button>click me</button><!--au-end--></div><!--au-start--><!--au-end-->');
    });
    it('portals to "afterend" position', function () {
        const { assertHtml } = createFixture(hJsx(hJsx.Fragment, null,
            hJsx("div", { id: "d1" }, "hello"),
            hJsx("button", { portal: "target: #d1; position: afterend" }, "click me")));
        assertHtml('<div id="d1">hello</div><!--au-start--><button>click me</button><!--au-end--><!--au-start--><!--au-end-->');
    });
    it('moves view when position change beforeend -> afterend', function () {
        const { component, assertHtml } = createFixture(hJsx(hJsx.Fragment, null,
            hJsx("div", { id: "d1" }, "hello"),
            hJsx("button", { portal: "target: #d1; position.bind: position" }, "click me")), { position: 'beforeend' });
        component.position = 'afterend';
        runTasks();
        assertHtml('<div id="d1">hello</div><!--au-start--><button>click me</button><!--au-end--><!--au-start--><!--au-end-->');
    });
    it('moves view when position change afterend -> beforebegin', function () {
        const { component, assertHtml } = createFixture(hJsx(hJsx.Fragment, null,
            hJsx("div", { id: "d1" }, "hello"),
            hJsx("button", { portal: "target: #d1; position.bind: position" }, "click me")), { position: 'beforeend' });
        component.position = 'beforebegin';
        runTasks();
        assertHtml('<!--au-start--><button>click me</button><!--au-end--><div id="d1">hello</div><!--au-start--><!--au-end-->');
    });
    it('removes location marker when portal is deactivated', function () {
        const { component, assertHtml } = createFixture(hJsx(hJsx.Fragment, null,
            hJsx("div", { id: "dest" }),
            hJsx("p", { id: "package", "if$bind": "open", portal: "#dest" })), { open: false });
        assertHtml('div', '');
        component.open = true;
        runTasks();
        assertHtml('div', '<!--au-start--><p id="package"></p><!--au-end-->');
        component.open = false;
        runTasks();
        assertHtml('div', '');
    });
    describe('basic', function () {
        const basicTestCases = [
            {
                title: 'basic usage',
                rootVm: CustomElement.define({
                    name: 'app',
                    template: hJsx("template", null,
                        hJsx("div", { portal: true, class: 'portaled' }))
                }, class App {
                    constructor() {
                        this.message = 'Aurelia';
                    }
                }),
                assertionFn: (ctx, host, _component) => {
                    assert.equal(host.childElementCount, 0, 'It should have been empty.');
                    assert.notEqual(childrenQuerySelector(ctx.doc.body, '.portaled'), null, '<div".portaled"/> should have been portaled');
                }
            },
            {
                title: 'Portal custom elements',
                rootVm: CustomElement.define({
                    name: 'app',
                    template: hJsx("template", null,
                        hJsx("c-e", { portal: true })),
                    dependencies: [
                        CustomElement.define({
                            name: 'c-e',
                            template: hJsx("template", null, "C-E")
                        })
                    ]
                }, class App {
                    constructor() {
                        this.message = 'Aurelia';
                    }
                }),
                assertionFn: (ctx, host, _comp) => {
                    assert.equal(host.childElementCount, 0, 'It should have been empty.');
                    assert.notEqual(childrenQuerySelector(ctx.doc.body, 'c-e'), null, '<c-e/> should have been portaled');
                },
            },
            {
                title: 'portals nested template controller',
                rootVm: CustomElement.define({
                    name: 'app',
                    template: hJsx("template", null,
                        hJsx("div", { portal: true, "if$": 'showCe', class: 'divdiv' }, '${message}'))
                }, class App {
                    constructor() {
                        this.message = 'Aurelia';
                        this.showCe = true;
                    }
                }),
                assertionFn: (ctx, host, _comp) => {
                    assert.equal(host.childElementCount, 0, 'It should have been empty.');
                    assert.notEqual(childrenQuerySelector(ctx.doc.body, '.divdiv'), null, '<div.divdiv> should have been portaled');
                    assert.equal(ctx.doc.body.querySelector('.divdiv').textContent, 'Aurelia', 'It shoulda rendered ${message}');
                }
            },
            {
                title: 'portals when nested inside template controller',
                rootVm: CustomElement.define({
                    name: 'app',
                    template: hJsx("template", null,
                        hJsx("div", { "if$": 'showCe', portal: true, class: 'divdiv' }, '${message}'))
                }, class App {
                    constructor() {
                        this.message = 'Aurelia';
                        this.showCe = true;
                    }
                }),
                assertionFn: (ctx, host, _comp) => {
                    assert.equal(host.childElementCount, 0, 'It should have been empty.');
                    assert.notEqual(childrenQuerySelector(ctx.doc.body, '.divdiv'), null, '<div.divdiv> should have been portaled' /* message when failed */);
                    assert.equal(childrenQuerySelector(ctx.doc.body, '.divdiv').textContent, 'Aurelia', 'It shoulda rendered ${message}');
                }
            },
            {
                title: 'works with repeat',
                rootVm: CustomElement.define({
                    name: 'app',
                    template: hJsx("template", null,
                        hJsx("div", { portal: true, "repeat$for": 'item of items', class: 'divdiv' }, '${message}'))
                }, class App {
                    constructor() {
                        this.message = 'Aurelia';
                        this.showCe = true;
                        this.items = Array.from({ length: 5 }, (_, idx) => ({ idx }));
                    }
                }),
                assertionFn: (ctx, host) => {
                    assert.equal(host.childElementCount, 0, 'It should have been empty.');
                    assert.equal(childrenQuerySelectorAll(ctx.doc.body, '.divdiv').length, 5, 'There shoulda been 5 of <div.divdiv>');
                    assert.equal(ctx.doc.body.textContent.includes('Aurelia'.repeat(5)), true, 'It shoulda rendered ${message}');
                }
            },
            {
                title: 'removes portaled target after torndown',
                rootVm: CustomElement.define({
                    name: 'app',
                    template: hJsx("div", { portal: true, class: 'divdiv' }, '${message}')
                }, class App {
                }),
                assertionFn: (ctx, host) => {
                    assert.equal(host.childElementCount, 0, 'It should have been empty.');
                    assert.notEqual(childrenQuerySelector(ctx.doc.body, '.divdiv'), null, 'There shoulda been 1 <div.divdiv>');
                },
                postTeardownAssertionFn: (ctx, _host) => {
                    assert.equal(childrenQuerySelector(ctx.doc.body, '.divdiv'), null, 'There shoulda been no <div.divdiv>');
                }
            },
            {
                title: 'it understand render context 1 (render context available before binding)',
                rootVm: CustomElement.define({
                    name: 'app',
                    template: hJsx("template", null,
                        hJsx("div", { ref: 'localDiv' }),
                        hJsx("div", { portal: 'target.bind: localDiv', class: 'divdiv' }, '${message}'))
                }, class App {
                }),
                assertionFn: (_ctx, _host, comp) => {
                    // should work, or should work after a small waiting time for binding to update
                    assert.notEqual(childrenQuerySelector(comp.localDiv, '.divdiv'), null, 'comp.localDiv should have contained .divdiv directly');
                }
            },
            {
                title: 'it understand render context 2 (render context available after binding)',
                rootVm: CustomElement.define({
                    name: 'app',
                    template: hJsx("template", null,
                        hJsx("div", { portal: 'target.bind: localDiv', class: 'divdiv' }, '${message}'),
                        hJsx("div", { ref: 'localDiv' }))
                }, class App {
                }),
                assertionFn: (_ctx, _host, comp) => {
                    runTasks();
                    assert.notEqual(childrenQuerySelector(comp.localDiv, '.divdiv'), null, 'comp.localDiv should have contained .divdiv');
                },
                postTeardownAssertionFn: (ctx, _host, _comp) => {
                    assert.equal(childrenQuerySelectorAll(ctx.doc.body, '.divdiv').length, 0, 'all .divdiv should have been removed');
                }
            },
            {
                title: 'it works with funny movement',
                rootVm: CustomElement.define({
                    name: 'app',
                    template: hJsx(hJsx.Fragment, null,
                        hJsx("div", { ref: 'divdiv', portal: 'target.bind: target', class: 'divdiv' }, '${message}'),
                        hJsx("div", { ref: 'localDiv' }))
                }, class App {
                }),
                assertionFn: (ctx, _host, comp) => {
                    assert.equal(childrenQuerySelector(comp.localDiv, '.divdiv'), null, 'comp.localDiv should not have contained .divdiv (1)');
                    assert.equal(childrenQuerySelector(ctx.doc.body, '.divdiv'), comp.divdiv, 'body shoulda contained .divdiv (2)');
                    comp.target = comp.localDiv;
                    runTasks();
                    assert.equal(childrenQuerySelector(comp.localDiv, '.divdiv'), comp.divdiv, 'comp.localDiv should have contained .divdiv (3)');
                    comp.target = null;
                    runTasks();
                    assert.equal(childrenQuerySelector(ctx.doc.body, '.divdiv'), comp.divdiv, 'when .target=null, divdiv shoulda gone back to body (4)');
                    comp.target = comp.localDiv;
                    runTasks();
                    assert.equal(childrenQuerySelector(comp.localDiv, '.divdiv'), comp.divdiv, 'comp.localDiv should have contained .divdiv (5)');
                    comp.target = undefined;
                    runTasks();
                    assert.equal(childrenQuerySelector(ctx.doc.body, '.divdiv'), comp.divdiv, 'when .target = undefined, .divdiv shoulda gone back to body (6)');
                }
            },
            {
                title: 'it works with funny movement, with render context string',
                rootVm: CustomElement.define({
                    name: 'app',
                    template: hJsx("template", null,
                        hJsx("div", { ref: 'divdiv', portal: 'target.bind: target; render-context: #mock-render-context', class: 'divdiv' }, '${message}'),
                        hJsx("div", { ref: 'localDiv' }),
                        hJsx("div", { id: "mock-render-context0" },
                            hJsx("div", { id: "mock-1-0", class: "mock-target" }),
                            hJsx("div", { id: "mock-2-0", class: "mock-target" }),
                            hJsx("div", { id: "mock-3-0", class: "mock-target" })),
                        hJsx("div", { id: "mock-render-context" },
                            hJsx("div", { id: "mock-1-1", class: "mock-target" }),
                            hJsx("div", { id: "mock-2-1", class: "mock-target" }),
                            hJsx("div", { id: "mock-3-1", class: "mock-target" })))
                }, class App {
                }),
                assertionFn: (ctx, _host, comp) => {
                    assert.notStrictEqual(childrenQuerySelector(ctx.doc.body, '.divdiv'), null, 'it should have been moved to body');
                    comp.target = '.mock-target';
                    runTasks();
                    assert.strictEqual(comp.divdiv.parentElement.id, 'mock-1-1');
                    comp.target = null;
                    runTasks();
                    assert.strictEqual(comp.divdiv.parentElement, ctx.doc.body);
                }
            },
            {
                title: 'it works with funny movement, with render context element',
                rootVm: CustomElement.define({
                    name: 'app',
                    template: hJsx("template", null,
                        hJsx("div", { ref: 'divdiv', portal: 'target.bind: target; render-context.bind: renderContext', class: 'divdiv' }, '${message}'),
                        hJsx("div", { ref: 'localDiv' }),
                        hJsx("div", { id: "mock-render-context0" },
                            hJsx("div", { id: "mock-1-0", class: "mock-target" }),
                            hJsx("div", { id: "mock-2-0", class: "mock-target" }),
                            hJsx("div", { id: "mock-3-0", class: "mock-target" })),
                        hJsx("div", { id: "mock-render-context" },
                            hJsx("div", { id: "mock-1-1", class: "mock-target" }),
                            hJsx("div", { id: "mock-2-1", class: "mock-target" }),
                            hJsx("div", { id: "mock-3-1", class: "mock-target" })))
                }, class App {
                }),
                assertionFn: (ctx, host, comp) => {
                    assert.notStrictEqual(childrenQuerySelector(ctx.doc.body, '.divdiv'), null, 'it should have been moved to body');
                    comp.target = '.mock-target';
                    runTasks();
                    assert.strictEqual(comp.divdiv.parentElement.id, 'mock-1-0');
                    comp.target = null;
                    runTasks();
                    assert.strictEqual(comp.divdiv.parentElement, ctx.doc.body);
                    comp.target = '.mock-target';
                    runTasks();
                    // still not #mock-1-1 yet, because render context is unclear, so #mock-1-0 comes first for .mock-target
                    assert.strictEqual(comp.divdiv.parentElement.id, 'mock-1-0');
                    comp.renderContext = host.querySelector('#mock-render-context');
                    runTasks();
                    assert.strictEqual(comp.divdiv.parentElement.id, 'mock-1-1');
                    comp.renderContext = undefined;
                    runTasks();
                    assert.strictEqual(comp.divdiv.parentElement.id, 'mock-1-0');
                    comp.renderContext = null;
                    runTasks();
                    assert.strictEqual(comp.divdiv.parentElement.id, 'mock-1-0');
                }
            },
            // todo: add activating/deactivating + async + timing tests
        ];
        eachCartesianJoin([basicTestCases], (testCase) => {
            const { only, title, rootVm, assertionFn, postTeardownAssertionFn } = testCase;
            async function testFn() {
                const { ctx, component, host, dispose } = $setup({ root: rootVm });
                await assertionFn(ctx, host, component);
                await dispose();
                if (postTeardownAssertionFn) {
                    await postTeardownAssertionFn(ctx, host, component);
                }
            }
            only
                // eslint-disable-next-line mocha/no-exclusive-tests
                ? it.only(typeof title === 'string' ? title : title(), testFn)
                : it(typeof title === 'string' ? title : title(), testFn);
        });
    });
    function $setup(options) {
        const { root: Root, resources = [] } = options;
        const ctx = TestContext.create();
        ctx.container.register(...resources);
        const au = new Aurelia(ctx.container);
        const host = ctx.doc.body.appendChild(ctx.createElement('app'));
        const component = new Root();
        au.app({ host, component });
        void au.start();
        return {
            ctx,
            component,
            host,
            dispose: async () => {
                await au.stop();
                host.remove();
                au.dispose();
            }
        };
    }
    const childrenQuerySelector = (node, selector) => {
        return Array
            .from(node.children)
            .find(el => el.matches(selector)) || null;
    };
    const childrenQuerySelectorAll = (node, selector) => {
        return Array
            .from(node.children)
            .filter(el => el.matches(selector));
    };
});
//# sourceMappingURL=portal.spec.js.map