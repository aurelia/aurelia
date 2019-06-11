// tslint:disable:quotemark member-access no-all-duplicated-branches
import { Profiler } from "@aurelia/kernel";
import { Aurelia, CustomElementResource } from "@aurelia/runtime";
import { TestContext, writeProfilerReport, assert } from "@aurelia/testing";

describe("generated.template-compiler.static.if-else.repeat", function () {
    before(function () {
        Profiler.enable();
    });
    after(function () {
        Profiler.disable();
        writeProfilerReport("static.if-else.repeat");
    });
    function setup() {
        const ctx = TestContext.createHTMLTestContext();
        const au = new Aurelia(ctx.container);
        const host = ctx.createElement("div");
        return { au, host };
    }
    function verify(au, host, expected) {
        const root = au.root;
        au.start();
        const outerHtmlAfterStart1 = host.outerHTML;
        assert.visibleTextEqual(root, expected, "after start #1");
        au.stop();
        const outerHtmlAfterStop1 = host.outerHTML;
        assert.visibleTextEqual(root, "", "after stop #1");
        au.start();
        const outerHtmlAfterStart2 = host.outerHTML;
        assert.visibleTextEqual(root, expected, "after start #2");
        au.stop();
        const outerHtmlAfterStop2 = host.outerHTML;
        assert.visibleTextEqual(root, "", "after stop #2");
        assert.strictEqual(outerHtmlAfterStart1, outerHtmlAfterStart2, "outerHTML after start #1 / #2");
        assert.strictEqual(outerHtmlAfterStop1, outerHtmlAfterStop2, "outerHTML after stop #1 / #2");
    }
    it("tag$01 text$01 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"true\">a</div><div else>b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$01 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 1\">a</div></div><div else><div repeat.for=\"i of 1\">b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$01 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"i of 1\">a</div><div else repeat.for=\"i of 1\">b</div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$01 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"true\">a</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$01 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\" if.bind=\"true\">a</div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$01 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 1\">a</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$01 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"i of 1\">a</div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$01 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"true\">a</div><div else>b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$01 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"true\">a</div><div else></div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$01 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 1\">a</div></div><div else><div repeat.for=\"i of 1\">a</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$01 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 1\">a</div></div><div else></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$01 if$01 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"true\">a</div><div else>b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$01 if$01 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div><div else><div repeat.for=\"i of 3\">b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$01 if$01 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"i of 3\">a</div><div else repeat.for=\"i of 3\">b</div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$01 if$01 repeat$12 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"true\">a</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$01 if$01 repeat$12 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\" if.bind=\"true\">a</div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$01 if$01 repeat$12 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$01 if$01 repeat$12 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"i of 3\">a</div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$01 if$01 repeat$12 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"true\">a</div><div else>b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$01 if$01 repeat$12 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"true\">a</div><div else></div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$01 if$01 repeat$12 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div><div else><div repeat.for=\"i of 3\">a</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$01 if$01 repeat$12 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div><div else></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$01 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"false\">a</div><div else>b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$01 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"><div repeat.for=\"i of 1\">a</div></div><div else><div repeat.for=\"i of 1\">b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$01 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\" repeat.for=\"i of 1\">a</div><div else repeat.for=\"i of 1\">b</div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$01 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"false\">a</div><div else>b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$01 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"false\"></div><div else>b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$01 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">a</div><div else><div repeat.for=\"i of 1\">b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$01 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 1\">b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$01 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">a</div><div else repeat.for=\"i of 1\">b</div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$01 if$02 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"false\">a</div><div else>b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$01 if$02 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"><div repeat.for=\"i of 3\">a</div></div><div else><div repeat.for=\"i of 3\">b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$01 if$02 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\" repeat.for=\"i of 3\">a</div><div else repeat.for=\"i of 3\">b</div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$01 if$02 repeat$12 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"false\">a</div><div else>b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$01 if$02 repeat$12 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else>b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$01 if$02 repeat$12 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">a</div><div else><div repeat.for=\"i of 3\">b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$01 if$02 repeat$12 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 3\">b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$01 if$02 repeat$12 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">a</div><div else repeat.for=\"i of 3\">b</div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$02 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"true\">a</div><div else>${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$02 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 1\">a</div></div><div else><div repeat.for=\"i of 1\">${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$02 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"i of 1\">a</div><div else repeat.for=\"i of 1\">${not}</div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$02 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"true\">a</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$02 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\" if.bind=\"true\">a</div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$02 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 1\">a</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$02 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"i of 1\">a</div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$02 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"true\">a</div><div else>${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$02 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"true\">a</div><div else></div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$02 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 1\">a</div></div><div else><div repeat.for=\"i of 1\">a</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$02 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 1\">a</div></div><div else></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$02 if$01 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"true\">a</div><div else>${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$02 if$01 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div><div else><div repeat.for=\"i of 3\">${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$02 if$01 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"i of 3\">a</div><div else repeat.for=\"i of 3\">${not}</div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$02 if$01 repeat$12 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"true\">a</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$02 if$01 repeat$12 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\" if.bind=\"true\">a</div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$02 if$01 repeat$12 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$02 if$01 repeat$12 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"i of 3\">a</div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$02 if$01 repeat$12 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"true\">a</div><div else>${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$02 if$01 repeat$12 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"true\">a</div><div else></div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$02 if$01 repeat$12 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div><div else><div repeat.for=\"i of 3\">a</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$02 if$01 repeat$12 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 3\">a</div></div><div else></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$02 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"false\">a</div><div else>${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$02 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"><div repeat.for=\"i of 1\">a</div></div><div else><div repeat.for=\"i of 1\">${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$02 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\" repeat.for=\"i of 1\">a</div><div else repeat.for=\"i of 1\">${not}</div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$02 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"false\">a</div><div else>${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$02 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"false\"></div><div else>${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$02 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">a</div><div else><div repeat.for=\"i of 1\">${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$02 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 1\">${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$02 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">a</div><div else repeat.for=\"i of 1\">${not}</div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$02 if$02 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"false\">a</div><div else>${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$02 if$02 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"><div repeat.for=\"i of 3\">a</div></div><div else><div repeat.for=\"i of 3\">${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$02 if$02 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\" repeat.for=\"i of 3\">a</div><div else repeat.for=\"i of 3\">${not}</div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$02 if$02 repeat$12 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"false\">a</div><div else>${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$02 if$02 repeat$12 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else>${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$02 if$02 repeat$12 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">a</div><div else><div repeat.for=\"i of 3\">${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$02 if$02 repeat$12 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 3\">${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$02 if$02 repeat$12 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">a</div><div else repeat.for=\"i of 3\">${not}</div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$03 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"true\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$03 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 1\">${msg}</div></div><div else><div repeat.for=\"i of 1\">${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$03 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"i of 1\">${msg}</div><div else repeat.for=\"i of 1\">${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$03 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"true\">${msg}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$03 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\" if.bind=\"true\">${msg}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$03 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 1\">${msg}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$03 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"i of 1\">${msg}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$03 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"true\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$03 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"true\">${msg}</div><div else></div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$03 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 1\">${msg}</div></div><div else><div repeat.for=\"i of 1\">${msg}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$03 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 1\">${msg}</div></div><div else></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$03 if$01 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"true\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$03 if$01 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div><div else><div repeat.for=\"i of 3\">${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$03 if$01 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"i of 3\">${msg}</div><div else repeat.for=\"i of 3\">${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$03 if$01 repeat$12 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"true\">${msg}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$03 if$01 repeat$12 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\" if.bind=\"true\">${msg}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$03 if$01 repeat$12 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$03 if$01 repeat$12 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"i of 3\">${msg}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$03 if$01 repeat$12 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"true\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$03 if$01 repeat$12 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"true\">${msg}</div><div else></div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$03 if$01 repeat$12 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div><div else><div repeat.for=\"i of 3\">${msg}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$03 if$01 repeat$12 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div><div else></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$03 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"item of ['a', 'b', 'c']\"><div if.bind=\"true\">${item}</div><div else>${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$03 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div><div else><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$03 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</div><div else repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$03 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"item of ['a', 'b', 'c']\"><div if.bind=\"true\">${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$03 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\">${item}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$03 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$03 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$03 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"item of ['a', 'b', 'c']\"><div if.bind=\"true\">${item}</div><div else>${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$03 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"item of ['a', 'b', 'c']\"><div if.bind=\"true\">${item}</div><div else></div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$03 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div><div else><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$03 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div><div else></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$03 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"false\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$03 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"><div repeat.for=\"i of 1\">${msg}</div></div><div else><div repeat.for=\"i of 1\">${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$03 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\" repeat.for=\"i of 1\">${msg}</div><div else repeat.for=\"i of 1\">${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$03 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"false\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$03 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"false\"></div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$03 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">${msg}</div><div else><div repeat.for=\"i of 1\">${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$03 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 1\">${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$03 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">${msg}</div><div else repeat.for=\"i of 1\">${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$03 if$02 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"false\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$03 if$02 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"><div repeat.for=\"i of 3\">${msg}</div></div><div else><div repeat.for=\"i of 3\">${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$03 if$02 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\" repeat.for=\"i of 3\">${msg}</div><div else repeat.for=\"i of 3\">${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$03 if$02 repeat$12 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"false\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$03 if$02 repeat$12 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$03 if$02 repeat$12 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">${msg}</div><div else><div repeat.for=\"i of 3\">${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$03 if$02 repeat$12 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 3\">${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$03 if$02 repeat$12 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">${msg}</div><div else repeat.for=\"i of 3\">${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$03 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"item of ['a', 'b', 'c']\"><div if.bind=\"false\">${item}</div><div else>${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$03 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div><div else><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$03 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</div><div else repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$03 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"item of ['a', 'b', 'c']\"><div if.bind=\"false\">${item}</div><div else>${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$03 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"item of ['a', 'b', 'c']\"><div if.bind=\"false\"></div><div else>${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$03 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">${item}</div><div else><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$03 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"></div><div else><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$03 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">${item}</div><div else repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$04 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"true\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$04 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 1\">${msg}</div></div><div else><div repeat.for=\"i of 1\">${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$04 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"i of 1\">${msg}</div><div else repeat.for=\"i of 1\">${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$04 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"true\">${msg}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$04 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\" if.bind=\"true\">${msg}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$04 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 1\">${msg}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$04 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"i of 1\">${msg}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$04 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"true\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$04 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"true\">${msg}</div><div else></div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$04 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 1\">${msg}</div></div><div else><div repeat.for=\"i of 1\">${msg}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$04 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 1\">${msg}</div></div><div else></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$04 if$01 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"true\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$04 if$01 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div><div else><div repeat.for=\"i of 3\">${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$04 if$01 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"i of 3\">${msg}</div><div else repeat.for=\"i of 3\">${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$04 if$01 repeat$12 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"true\">${msg}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$04 if$01 repeat$12 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\" if.bind=\"true\">${msg}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$04 if$01 repeat$12 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$04 if$01 repeat$12 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"i of 3\">${msg}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$04 if$01 repeat$12 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"true\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$04 if$01 repeat$12 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"true\">${msg}</div><div else></div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$04 if$01 repeat$12 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div><div else><div repeat.for=\"i of 3\">${msg}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$04 if$01 repeat$12 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"i of 3\">${msg}</div></div><div else></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$01 text$04 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"item of ['a', 'b', 'c']\"><div if.bind=\"true\">${item}</div><div else>${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$04 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div><div else><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$04 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</div><div else repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$04 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"item of ['a', 'b', 'c']\"><div if.bind=\"true\">${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$04 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\">${item}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$04 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$04 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$04 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"item of ['a', 'b', 'c']\"><div if.bind=\"true\">${item}</div><div else>${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$04 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"item of ['a', 'b', 'c']\"><div if.bind=\"true\">${item}</div><div else></div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$04 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div><div else><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$04 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"true\"><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div><div else></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$04 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"false\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$04 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"><div repeat.for=\"i of 1\">${msg}</div></div><div else><div repeat.for=\"i of 1\">${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$04 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\" repeat.for=\"i of 1\">${msg}</div><div else repeat.for=\"i of 1\">${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$04 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"false\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$04 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 1\"><div if.bind=\"false\"></div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$04 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">${msg}</div><div else><div repeat.for=\"i of 1\">${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$04 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 1\">${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$04 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">${msg}</div><div else repeat.for=\"i of 1\">${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$04 if$02 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"false\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$04 if$02 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"><div repeat.for=\"i of 3\">${msg}</div></div><div else><div repeat.for=\"i of 3\">${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$04 if$02 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\" repeat.for=\"i of 3\">${msg}</div><div else repeat.for=\"i of 3\">${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$04 if$02 repeat$12 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"false\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$04 if$02 repeat$12 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"i of 3\"><div if.bind=\"false\"></div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$04 if$02 repeat$12 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">${msg}</div><div else><div repeat.for=\"i of 3\">${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$04 if$02 repeat$12 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"></div><div else><div repeat.for=\"i of 3\">${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$04 if$02 repeat$12 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">${msg}</div><div else repeat.for=\"i of 3\">${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$01 text$04 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"item of ['a', 'b', 'c']\"><div if.bind=\"false\">${item}</div><div else>${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$04 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div><div else><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$04 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</div><div else repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$04 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"item of ['a', 'b', 'c']\"><div if.bind=\"false\">${item}</div><div else>${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$04 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div repeat.for=\"item of ['a', 'b', 'c']\"><div if.bind=\"false\"></div><div else>${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$04 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">${item}</div><div else><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$04 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\"></div><div else><div repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$01 text$04 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div if.bind=\"false\">${item}</div><div else repeat.for=\"item of ['a', 'b', 'c']\">${item}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$01 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\">a</template><template else>b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$01 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\">a</template></template><template else><template repeat.for=\"i of 1\">b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$01 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\">a</template><template else repeat.for=\"i of 1\">b</template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$01 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\">a</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$01 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\">a</template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$01 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\">a</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$01 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\">a</template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$01 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\">a</template><template else>b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$01 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\">a</template><template else></template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$01 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\">a</template></template><template else><template repeat.for=\"i of 1\">a</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$01 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\">a</template></template><template else></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$01 if$01 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\">a</template><template else>b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$01 if$01 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template><template else><template repeat.for=\"i of 3\">b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$01 if$01 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\">a</template><template else repeat.for=\"i of 3\">b</template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$01 if$01 repeat$12 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\">a</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$01 if$01 repeat$12 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\" if.bind=\"true\">a</template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$01 if$01 repeat$12 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$01 if$01 repeat$12 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\">a</template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$01 if$01 repeat$12 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\">a</template><template else>b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$01 if$01 repeat$12 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\">a</template><template else></template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$01 if$01 repeat$12 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template><template else><template repeat.for=\"i of 3\">a</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$01 if$01 repeat$12 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template><template else></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$01 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\">a</template><template else>b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$01 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\">a</template></template><template else><template repeat.for=\"i of 1\">b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$01 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\">a</template><template else repeat.for=\"i of 1\">b</template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$01 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\">a</template><template else>b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$01 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else>b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$01 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">a</template><template else><template repeat.for=\"i of 1\">b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$01 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\">b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$01 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">a</template><template else repeat.for=\"i of 1\">b</template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$01 if$02 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\">a</template><template else>b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$01 if$02 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">a</template></template><template else><template repeat.for=\"i of 3\">b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$01 if$02 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 3\">a</template><template else repeat.for=\"i of 3\">b</template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$01 if$02 repeat$12 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\">a</template><template else>b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$01 if$02 repeat$12 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else>b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$01 if$02 repeat$12 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">a</template><template else><template repeat.for=\"i of 3\">b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$01 if$02 repeat$12 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\">b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$01 if$02 repeat$12 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">a</template><template else repeat.for=\"i of 3\">b</template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$02 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\">a</template><template else>${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$02 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\">a</template></template><template else><template repeat.for=\"i of 1\">${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$02 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\">a</template><template else repeat.for=\"i of 1\">${not}</template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$02 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\">a</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$02 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\">a</template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$02 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\">a</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$02 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\">a</template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$02 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\">a</template><template else>${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$02 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\">a</template><template else></template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$02 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\">a</template></template><template else><template repeat.for=\"i of 1\">a</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$02 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\">a</template></template><template else></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$02 if$01 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\">a</template><template else>${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$02 if$01 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template><template else><template repeat.for=\"i of 3\">${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$02 if$01 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\">a</template><template else repeat.for=\"i of 3\">${not}</template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$02 if$01 repeat$12 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\">a</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$02 if$01 repeat$12 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\" if.bind=\"true\">a</template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$02 if$01 repeat$12 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$02 if$01 repeat$12 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\">a</template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$02 if$01 repeat$12 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\">a</template><template else>${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$02 if$01 repeat$12 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\">a</template><template else></template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$02 if$01 repeat$12 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template><template else><template repeat.for=\"i of 3\">a</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$02 if$01 repeat$12 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">a</template></template><template else></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$02 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\">a</template><template else>${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$02 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\">a</template></template><template else><template repeat.for=\"i of 1\">${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$02 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\">a</template><template else repeat.for=\"i of 1\">${not}</template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$02 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\">a</template><template else>${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$02 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else>${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$02 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">a</template><template else><template repeat.for=\"i of 1\">${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$02 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\">${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$02 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">a</template><template else repeat.for=\"i of 1\">${not}</template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$02 if$02 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\">a</template><template else>${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$02 if$02 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">a</template></template><template else><template repeat.for=\"i of 3\">${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$02 if$02 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 3\">a</template><template else repeat.for=\"i of 3\">${not}</template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$02 if$02 repeat$12 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\">a</template><template else>${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$02 if$02 repeat$12 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else>${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$02 if$02 repeat$12 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">a</template><template else><template repeat.for=\"i of 3\">${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$02 if$02 repeat$12 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\">${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$02 if$02 repeat$12 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">a</template><template else repeat.for=\"i of 3\">${not}</template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$03 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$03 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\">${msg}</template></template><template else><template repeat.for=\"i of 1\">${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$03 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\">${msg}</template><template else repeat.for=\"i of 1\">${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$03 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\">${msg}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$03 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\">${msg}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$03 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\">${msg}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$03 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\">${msg}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$03 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$03 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\">${msg}</template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$03 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\">${msg}</template></template><template else><template repeat.for=\"i of 1\">${msg}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$03 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\">${msg}</template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$03 if$01 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$03 if$01 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template><template else><template repeat.for=\"i of 3\">${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$03 if$01 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\">${msg}</template><template else repeat.for=\"i of 3\">${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$03 if$01 repeat$12 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\">${msg}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$03 if$01 repeat$12 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\" if.bind=\"true\">${msg}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$03 if$01 repeat$12 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$03 if$01 repeat$12 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\">${msg}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$03 if$01 repeat$12 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$03 if$01 repeat$12 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\">${msg}</template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$03 if$01 repeat$12 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template><template else><template repeat.for=\"i of 3\">${msg}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$03 if$01 repeat$12 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$03 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\">${item}</template><template else>${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$03 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$03 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</template><template else repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$03 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\">${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$03 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\">${item}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$03 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$03 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$03 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\">${item}</template><template else>${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$03 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\">${item}</template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$03 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$03 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$03 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$03 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\">${msg}</template></template><template else><template repeat.for=\"i of 1\">${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$03 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\">${msg}</template><template else repeat.for=\"i of 1\">${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$03 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$03 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$03 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">${msg}</template><template else><template repeat.for=\"i of 1\">${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$03 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\">${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$03 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">${msg}</template><template else repeat.for=\"i of 1\">${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$03 if$02 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$03 if$02 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">${msg}</template></template><template else><template repeat.for=\"i of 3\">${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$03 if$02 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 3\">${msg}</template><template else repeat.for=\"i of 3\">${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$03 if$02 repeat$12 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$03 if$02 repeat$12 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$03 if$02 repeat$12 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">${msg}</template><template else><template repeat.for=\"i of 3\">${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$03 if$02 repeat$12 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\">${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$03 if$02 repeat$12 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">${msg}</template><template else repeat.for=\"i of 3\">${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$03 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\">${item}</template><template else>${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$03 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$03 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</template><template else repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$03 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\">${item}</template><template else>${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$03 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"></template><template else>${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$03 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">${item}</template><template else><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$03 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$03 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">${item}</template><template else repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$04 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$04 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\">${msg}</template></template><template else><template repeat.for=\"i of 1\">${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$04 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\">${msg}</template><template else repeat.for=\"i of 1\">${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$04 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\">${msg}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$04 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\">${msg}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$04 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\">${msg}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$04 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\">${msg}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$04 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$04 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\">${msg}</template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$04 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\">${msg}</template></template><template else><template repeat.for=\"i of 1\">${msg}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$04 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\">${msg}</template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$04 if$01 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$04 if$01 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template><template else><template repeat.for=\"i of 3\">${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$04 if$01 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\">${msg}</template><template else repeat.for=\"i of 3\">${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$04 if$01 repeat$12 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\">${msg}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$04 if$01 repeat$12 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\" if.bind=\"true\">${msg}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$04 if$01 repeat$12 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$04 if$01 repeat$12 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\">${msg}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$04 if$01 repeat$12 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$04 if$01 repeat$12 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\">${msg}</template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$04 if$01 repeat$12 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template><template else><template repeat.for=\"i of 3\">${msg}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$04 if$01 repeat$12 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\">${msg}</template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$02 text$04 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\">${item}</template><template else>${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$04 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$04 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</template><template else repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$04 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\">${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$04 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\">${item}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$04 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$04 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$04 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\">${item}</template><template else>${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$04 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\">${item}</template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$04 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$04 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$04 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$04 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\">${msg}</template></template><template else><template repeat.for=\"i of 1\">${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$04 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\">${msg}</template><template else repeat.for=\"i of 1\">${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$04 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$04 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$04 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">${msg}</template><template else><template repeat.for=\"i of 1\">${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$04 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\">${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$04 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">${msg}</template><template else repeat.for=\"i of 1\">${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$04 if$02 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$04 if$02 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\">${msg}</template></template><template else><template repeat.for=\"i of 3\">${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$04 if$02 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 3\">${msg}</template><template else repeat.for=\"i of 3\">${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$04 if$02 repeat$12 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$04 if$02 repeat$12 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$04 if$02 repeat$12 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">${msg}</template><template else><template repeat.for=\"i of 3\">${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$04 if$02 repeat$12 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\">${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$04 if$02 repeat$12 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">${msg}</template><template else repeat.for=\"i of 3\">${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$02 text$04 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\">${item}</template><template else>${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$04 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$04 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\">${item}</template><template else repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$04 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\">${item}</template><template else>${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$04 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"></template><template else>${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$04 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">${item}</template><template else><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$04 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$02 text$04 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\">${item}</template><template else repeat.for=\"item of ['a', 'b', 'c']\">${item}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$03 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$03 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$03 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$03 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$03 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$03 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$03 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$03 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$03 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$03 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$03 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$03 if$01 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$03 if$01 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$03 if$01 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$03 if$01 repeat$12 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$03 if$01 repeat$12 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$03 if$01 repeat$12 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$03 if$01 repeat$12 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$03 if$01 repeat$12 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$03 if$01 repeat$12 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$03 if$01 repeat$12 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$03 if$01 repeat$12 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$03 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$03 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$03 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$03 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$03 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$03 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$03 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$03 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$03 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$03 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$03 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$03 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$03 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$03 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$03 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$03 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$03 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$03 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$03 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$03 if$02 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$03 text$03 if$02 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$03 text$03 if$02 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$03 text$03 if$02 repeat$12 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$03 text$03 if$02 repeat$12 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$03 text$03 if$02 repeat$12 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$03 text$03 if$02 repeat$12 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$03 text$03 if$02 repeat$12 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$03 text$03 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$03 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$03 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$03 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$03 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$03 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$03 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$03 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$04 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$04 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$04 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$04 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$04 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$04 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$04 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$04 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$04 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$04 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$04 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$04 if$01 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$04 if$01 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$04 if$01 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$04 if$01 repeat$12 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$04 if$01 repeat$12 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$04 if$01 repeat$12 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$04 if$01 repeat$12 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$04 if$01 repeat$12 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$04 if$01 repeat$12 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$04 if$01 repeat$12 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$04 if$01 repeat$12 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$03 text$04 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$04 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$04 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$04 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$04 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$04 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$04 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$04 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$04 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$04 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$04 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$04 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$04 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$04 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$04 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$04 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$04 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$04 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$04 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$04 if$02 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$03 text$04 if$02 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$03 text$04 if$02 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$03 text$04 if$02 repeat$12 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$03 text$04 if$02 repeat$12 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$03 text$04 if$02 repeat$12 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$03 text$04 if$02 repeat$12 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$03 text$04 if$02 repeat$12 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$03 text$04 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$04 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$04 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$04 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$04 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$04 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$04 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$03 text$04 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$03 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$03 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$03 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$03 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$03 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$03 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$03 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$03 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$03 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$03 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$03 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$03 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$03 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$03 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$03 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$03 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$03 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$03 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$03 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$03 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$03 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$03 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$03 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$03 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$03 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$03 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$03 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$03 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$03 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$03 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$03 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$03 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$03 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$03 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$03 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$03 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$03 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$03 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$04 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$04 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$04 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$04 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$04 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$04 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$04 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$04 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$04 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$04 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$04 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$04 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$04 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$04 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$04 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$04 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$04 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$04 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$04 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$04 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$04 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$04 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$04 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$04 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$04 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$04 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$04 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$04 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$04 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$04 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$04 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$04 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$04 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$04 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$04 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$04 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$04 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$04 text$04 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$03 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$03 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$03 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$03 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$03 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$03 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$03 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$03 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$03 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$03 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$03 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$03 if$01 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$03 if$01 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$03 if$01 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$03 if$01 repeat$12 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$03 if$01 repeat$12 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$03 if$01 repeat$12 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$03 if$01 repeat$12 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$03 if$01 repeat$12 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$03 if$01 repeat$12 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$03 if$01 repeat$12 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$03 if$01 repeat$12 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$03 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$03 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$03 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$03 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$03 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$03 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$03 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$03 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$03 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$03 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$03 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$03 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$03 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$03 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$03 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$03 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$03 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$03 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$03 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$03 if$02 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$05 text$03 if$02 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$05 text$03 if$02 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$05 text$03 if$02 repeat$12 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$05 text$03 if$02 repeat$12 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$05 text$03 if$02 repeat$12 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$05 text$03 if$02 repeat$12 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$05 text$03 if$02 repeat$12 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$05 text$03 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$03 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$03 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$03 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$03 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$03 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$03 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$03 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$04 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$04 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$04 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$04 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$04 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$04 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$04 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$04 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$04 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$04 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$04 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$04 if$01 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$04 if$01 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$04 if$01 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$04 if$01 repeat$12 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$04 if$01 repeat$12 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$04 if$01 repeat$12 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$04 if$01 repeat$12 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$04 if$01 repeat$12 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$04 if$01 repeat$12 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$04 if$01 repeat$12 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$04 if$01 repeat$12 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$05 text$04 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$04 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$04 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$04 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$04 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$04 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$04 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$04 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$04 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$04 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$04 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$04 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$04 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$04 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$04 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$04 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$04 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$04 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$04 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$04 if$02 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$05 text$04 if$02 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$05 text$04 if$02 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$05 text$04 if$02 repeat$12 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$05 text$04 if$02 repeat$12 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$05 text$04 if$02 repeat$12 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$05 text$04 if$02 repeat$12 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$05 text$04 if$02 repeat$12 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$05 text$04 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$04 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$04 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$04 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$04 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$04 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$04 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$05 text$04 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$03 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$03 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$03 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$03 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$03 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$03 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$03 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$03 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$03 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$03 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$03 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$03 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$03 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$03 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$03 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$03 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$03 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$03 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$03 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$03 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$03 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$03 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$03 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$03 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$03 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$03 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$03 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$03 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$03 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$03 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$03 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$03 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$03 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$03 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$03 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$03 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$03 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$03 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$04 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$04 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$04 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$04 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$04 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$04 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$04 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$04 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$04 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$04 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$04 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$04 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$04 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$04 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$04 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$04 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$04 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$04 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$04 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$04 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$04 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$04 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$04 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$04 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$04 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$04 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$04 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$04 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$04 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$04 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$04 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$04 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$04 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$04 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$04 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$04 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$04 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$06 text$04 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$03 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$03 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$03 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$03 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$03 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$03 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$03 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$03 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$03 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$03 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$03 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$03 if$01 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$03 if$01 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$03 if$01 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$03 if$01 repeat$12 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$03 if$01 repeat$12 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$03 if$01 repeat$12 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$03 if$01 repeat$12 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$03 if$01 repeat$12 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$03 if$01 repeat$12 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$03 if$01 repeat$12 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$03 if$01 repeat$12 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$03 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$03 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$03 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$03 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$03 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$03 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$03 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$03 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$03 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$03 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$03 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$03 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$07 text$03 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$07 text$03 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$07 text$03 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$07 text$03 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$07 text$03 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$07 text$03 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$07 text$03 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$07 text$03 if$02 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$07 text$03 if$02 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$07 text$03 if$02 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$07 text$03 if$02 repeat$12 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$07 text$03 if$02 repeat$12 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$07 text$03 if$02 repeat$12 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$07 text$03 if$02 repeat$12 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$07 text$03 if$02 repeat$12 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$07 text$03 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$03 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$03 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$03 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$03 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$03 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$03 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$03 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$04 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$04 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$04 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$04 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$04 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$04 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$04 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$04 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$04 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$04 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$04 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$04 if$01 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$04 if$01 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$04 if$01 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$04 if$01 repeat$12 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$04 if$01 repeat$12 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$04 if$01 repeat$12 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$04 if$01 repeat$12 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$04 if$01 repeat$12 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$04 if$01 repeat$12 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$04 if$01 repeat$12 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$04 if$01 repeat$12 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$07 text$04 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$04 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$04 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$04 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$04 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$04 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$04 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$04 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$04 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$04 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$04 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$04 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$07 text$04 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$07 text$04 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$07 text$04 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$07 text$04 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$07 text$04 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$07 text$04 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$07 text$04 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$07 text$04 if$02 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$07 text$04 if$02 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$07 text$04 if$02 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$07 text$04 if$02 repeat$12 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$07 text$04 if$02 repeat$12 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$07 text$04 if$02 repeat$12 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$07 text$04 if$02 repeat$12 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$07 text$04 if$02 repeat$12 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$07 text$04 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$04 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$04 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$04 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$04 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$04 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$04 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$07 text$04 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$03 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$03 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$03 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$03 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$03 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$03 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$03 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$03 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$03 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$03 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$03 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$03 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$03 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$03 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$03 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$03 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$03 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$03 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$03 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$03 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$03 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$03 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$03 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$08 text$03 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$08 text$03 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$08 text$03 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$08 text$03 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$08 text$03 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$08 text$03 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$08 text$03 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$08 text$03 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$03 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$03 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$03 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$03 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$03 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$03 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$03 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$04 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$04 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$04 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$04 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$04 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$04 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$04 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$04 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$04 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$04 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$04 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$04 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$04 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$04 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$04 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$04 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$04 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$04 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$04 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$04 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$04 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$04 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$04 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$08 text$04 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$08 text$04 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$08 text$04 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$08 text$04 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$08 text$04 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$08 text$04 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$08 text$04 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$08 text$04 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$04 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$04 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$04 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$04 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$04 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$04 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$08 text$04 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$03 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$03 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$03 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$03 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$03 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$03 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$03 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$03 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$03 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$03 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$03 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$03 if$01 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$03 if$01 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$03 if$01 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$03 if$01 repeat$12 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$03 if$01 repeat$12 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$03 if$01 repeat$12 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$03 if$01 repeat$12 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$03 if$01 repeat$12 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$03 if$01 repeat$12 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$03 if$01 repeat$12 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$03 if$01 repeat$12 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$03 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$03 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$03 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$03 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$03 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$03 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$03 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$03 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$03 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$03 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$03 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$03 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$09 text$03 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$09 text$03 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$09 text$03 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$09 text$03 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$09 text$03 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$09 text$03 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$09 text$03 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$09 text$03 if$02 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$09 text$03 if$02 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$09 text$03 if$02 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$09 text$03 if$02 repeat$12 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$09 text$03 if$02 repeat$12 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$09 text$03 if$02 repeat$12 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$09 text$03 if$02 repeat$12 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$09 text$03 if$02 repeat$12 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$09 text$03 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$03 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$03 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$03 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$03 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$03 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$03 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$03 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$04 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$04 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$04 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$04 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$04 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$04 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$04 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$04 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$04 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$04 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$04 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$04 if$01 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$04 if$01 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$04 if$01 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$04 if$01 repeat$12 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$04 if$01 repeat$12 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\" if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$04 if$01 repeat$12 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$04 if$01 repeat$12 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$04 if$01 repeat$12 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$04 if$01 repeat$12 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$04 if$01 repeat$12 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$04 if$01 repeat$12 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "aaa");
    });
    it("tag$09 text$04 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$04 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$04 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$04 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$04 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$04 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$04 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$04 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$04 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$04 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$04 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$04 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$09 text$04 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$09 text$04 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$09 text$04 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$09 text$04 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$09 text$04 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$09 text$04 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$09 text$04 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$09 text$04 if$02 repeat$12 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$09 text$04 if$02 repeat$12 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$09 text$04 if$02 repeat$12 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 3\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$09 text$04 if$02 repeat$12 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$09 text$04 if$02 repeat$12 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 3\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$09 text$04 if$02 repeat$12 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$09 text$04 if$02 repeat$12 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$09 text$04 if$02 repeat$12 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else repeat.for=\"i of 3\"><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "bbb");
    });
    it("tag$09 text$04 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$04 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$04 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$04 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$04 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"></template><template else><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$04 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$04 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$09 text$04 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$03 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$03 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$03 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$03 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$03 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$03 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$03 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$03 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$03 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$03 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$03 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$03 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$03 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$03 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$03 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$03 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$03 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$03 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$03 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$03 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$03 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$03 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$03 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$10 text$03 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$10 text$03 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$10 text$03 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$10 text$03 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$10 text$03 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$10 text$03 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$10 text$03 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$10 text$03 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$03 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$03 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$03 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$03 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$03 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$03 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$03 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$04 if$01 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$04 if$01 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$04 if$01 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$04 if$01 repeat$11 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$04 if$01 repeat$11 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\" if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$04 if$01 repeat$11 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$04 if$01 repeat$11 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$04 if$01 repeat$11 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$04 if$01 repeat$11 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$04 if$01 repeat$11 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$04 if$01 repeat$11 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$04 if$01 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$04 if$01 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$04 if$01 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$04 if$01 repeat$13 variant$04 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$04 if$01 repeat$13 variant$05 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\" if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$04 if$01 repeat$13 variant$06 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$04 if$01 repeat$13 variant$07 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$04 if$01 repeat$13 variant$08 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$04 if$01 repeat$13 variant$08$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"true\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$04 if$01 repeat$13 variant$09 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$04 if$01 repeat$13 variant$09$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"true\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$04 if$02 repeat$11 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$10 text$04 if$02 repeat$11 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$10 text$04 if$02 repeat$11 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"i of 1\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$10 text$04 if$02 repeat$11 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$10 text$04 if$02 repeat$11 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"i of 1\"><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$10 text$04 if$02 repeat$11 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$10 text$04 if$02 repeat$11 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$10 text$04 if$02 repeat$11 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template><template else repeat.for=\"i of 1\"><my-foo not.bind=\"not\"><template replace-part=\"part2\">${not}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$10 text$04 if$02 repeat$13 variant$01 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$04 if$02 repeat$13 variant$02 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$04 if$02 repeat$13 variant$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\" repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$04 if$02 repeat$13 variant$10 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$04 if$02 repeat$13 variant$10$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template repeat.for=\"item of ['a', 'b', 'c']\"><template if.bind=\"false\"></template><template else><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$04 if$02 repeat$13 variant$11 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$04 if$02 repeat$13 variant$11$empty _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
    it("tag$10 text$04 if$02 repeat$13 variant$12 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo item.bind=\"item\"><template replace-part=\"part1\">${item}</template></my-foo></template><template else repeat.for=\"item of ['a', 'b', 'c']\"><my-foo item.bind=\"item\"><template replace-part=\"part2\">${item}</template></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "abc");
    });
});
