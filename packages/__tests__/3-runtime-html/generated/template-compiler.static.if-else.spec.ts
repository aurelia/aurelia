import { Profiler } from "@aurelia/kernel";
import { Aurelia, CustomElement } from "@aurelia/runtime";
import { TestContext, writeProfilerReport, assert } from "@aurelia/testing";

describe("generated.template-compiler.static.if-else", function () {
    // eslint-disable-next-line mocha/no-hooks
    before(function () {
        Profiler.enable();
    });
    // eslint-disable-next-line mocha/no-hooks
    after(function () {
        Profiler.disable();
        writeProfilerReport("static.if-else");
    });
    function createFixture() {
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
        au.dispose();
    }
    it("tag$01 text$01 if$01 if$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\">a</div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$01 if$01 if$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\"><div if.bind=\"true\">a</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$01 if$01 if$02 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\"></div><div else>b</div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$01 text$01 if$01 if$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\"></div><div else><div if.bind=\"true\"></div><div else>b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$01 text$01 if$01 if$04 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\">a</div><div else>b</div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$01 if$01 if$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\"><div if.bind=\"true\">a</div><div else>b</div></div><div else><div if.bind=\"true\">a</div><div else>b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$01 if$02 else$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\">a</div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$01 text$01 if$02 else$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\"><div if.bind=\"false\">a</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$01 text$01 if$02 else$02 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\"></div><div else>b</div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$01 if$02 else$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\"></div><div else><div if.bind=\"false\"></div><div else>b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$01 if$02 else$04 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\">a</div><div else>b</div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$01 if$02 else$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\"><div if.bind=\"false\">a</div><div else>b</div></div><div else><div if.bind=\"false\">a</div><div else>b</div></div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$02 if$01 if$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\">a</div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$02 if$01 if$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\"><div if.bind=\"true\">a</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$02 if$01 if$02 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\"></div><div else>${not}</div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$01 text$02 if$01 if$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\"></div><div else><div if.bind=\"true\"></div><div else>${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$01 text$02 if$01 if$04 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\">a</div><div else>${not}</div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$02 if$01 if$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\"><div if.bind=\"true\">a</div><div else>${not}</div></div><div else><div if.bind=\"true\">a</div><div else>${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$02 if$02 else$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\">a</div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$01 text$02 if$02 else$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\"><div if.bind=\"false\">a</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$01 text$02 if$02 else$02 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\"></div><div else>${not}</div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$02 if$02 else$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\"></div><div else><div if.bind=\"false\"></div><div else>${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$02 if$02 else$04 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\">a</div><div else>${not}</div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$02 if$02 else$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\"><div if.bind=\"false\">a</div><div else>${not}</div></div><div else><div if.bind=\"false\">a</div><div else>${not}</div></div></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$03 if$01 if$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\">${msg}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$03 if$01 if$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\"><div if.bind=\"true\">${msg}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$03 if$01 if$02 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\"></div><div else>${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$01 text$03 if$01 if$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\"></div><div else><div if.bind=\"true\"></div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$01 text$03 if$01 if$04 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\">${msg}</div><div else>${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$03 if$01 if$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\"><div if.bind=\"true\">${msg}</div><div else>${not}</div></div><div else><div if.bind=\"true\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$03 if$02 else$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\">${msg}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$01 text$03 if$02 else$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\"><div if.bind=\"false\">${msg}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$01 text$03 if$02 else$02 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\"></div><div else>${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$03 if$02 else$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\"></div><div else><div if.bind=\"false\"></div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$03 if$02 else$04 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\">${msg}</div><div else>${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$03 if$02 else$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\"><div if.bind=\"false\">${msg}</div><div else>${not}</div></div><div else><div if.bind=\"false\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$04 if$01 if$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\">${msg}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$04 if$01 if$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\"><div if.bind=\"true\">${msg}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$04 if$01 if$02 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\"></div><div else>${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$01 text$04 if$01 if$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\"></div><div else><div if.bind=\"true\"></div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$01 text$04 if$01 if$04 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\">${msg}</div><div else>${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$04 if$01 if$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"true\"><div if.bind=\"true\">${msg}</div><div else>${not}</div></div><div else><div if.bind=\"true\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$04 if$02 else$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\">${msg}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$01 text$04 if$02 else$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\"><div if.bind=\"false\">${msg}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$01 text$04 if$02 else$02 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\"></div><div else>${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$04 if$02 else$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\"></div><div else><div if.bind=\"false\"></div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$04 if$02 else$04 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\">${msg}</div><div else>${not}</div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$01 text$04 if$02 else$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div if.bind=\"false\"><div if.bind=\"false\">${msg}</div><div else>${not}</div></div><div else><div if.bind=\"false\">${msg}</div><div else>${not}</div></div></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$01 if$01 if$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\">a</template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$01 if$01 if$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\">a</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$01 if$01 if$02 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"></template><template else>b</template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$02 text$01 if$01 if$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"></template><template else><template if.bind=\"true\"></template><template else>b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$02 text$01 if$01 if$04 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\">a</template><template else>b</template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$01 if$01 if$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\">a</template><template else>b</template></template><template else><template if.bind=\"true\">a</template><template else>b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$01 if$02 else$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\">a</template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$02 text$01 if$02 else$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><template if.bind=\"false\">a</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$02 text$01 if$02 else$02 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else>b</template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$01 if$02 else$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else>b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$01 if$02 else$04 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\">a</template><template else>b</template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$01 if$02 else$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><template if.bind=\"false\">a</template><template else>b</template></template><template else><template if.bind=\"false\">a</template><template else>b</template></template></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$02 if$01 if$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\">a</template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$02 if$01 if$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\">a</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$02 if$01 if$02 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"></template><template else>${not}</template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$02 text$02 if$01 if$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"></template><template else><template if.bind=\"true\"></template><template else>${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$02 text$02 if$01 if$04 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\">a</template><template else>${not}</template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$02 if$01 if$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\">a</template><template else>${not}</template></template><template else><template if.bind=\"true\">a</template><template else>${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$02 if$02 else$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\">a</template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$02 text$02 if$02 else$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><template if.bind=\"false\">a</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$02 text$02 if$02 else$02 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else>${not}</template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$02 if$02 else$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else>${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$02 if$02 else$04 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\">a</template><template else>${not}</template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$02 if$02 else$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><template if.bind=\"false\">a</template><template else>${not}</template></template><template else><template if.bind=\"false\">a</template><template else>${not}</template></template></template>" }, class {
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$03 if$01 if$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\">${msg}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$03 if$01 if$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\">${msg}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$03 if$01 if$02 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"></template><template else>${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$02 text$03 if$01 if$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"></template><template else><template if.bind=\"true\"></template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$02 text$03 if$01 if$04 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\">${msg}</template><template else>${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$03 if$01 if$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\">${msg}</template><template else>${not}</template></template><template else><template if.bind=\"true\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$03 if$02 else$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\">${msg}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$02 text$03 if$02 else$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><template if.bind=\"false\">${msg}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$02 text$03 if$02 else$02 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else>${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$03 if$02 else$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$03 if$02 else$04 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\">${msg}</template><template else>${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$03 if$02 else$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><template if.bind=\"false\">${msg}</template><template else>${not}</template></template><template else><template if.bind=\"false\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$04 if$01 if$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\">${msg}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$04 if$01 if$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\">${msg}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$04 if$01 if$02 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"></template><template else>${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$02 text$04 if$01 if$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"></template><template else><template if.bind=\"true\"></template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$02 text$04 if$01 if$04 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\">${msg}</template><template else>${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$04 if$01 if$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\">${msg}</template><template else>${not}</template></template><template else><template if.bind=\"true\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$04 if$02 else$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\">${msg}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$02 text$04 if$02 else$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><template if.bind=\"false\">${msg}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "");
    });
    it("tag$02 text$04 if$02 else$02 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else>${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$04 if$02 else$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$04 if$02 else$04 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\">${msg}</template><template else>${not}</template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$02 text$04 if$02 else$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><template if.bind=\"false\">${msg}</template><template else>${not}</template></template><template else><template if.bind=\"false\">${msg}</template><template else>${not}</template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$03 if$01 if$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$03 if$01 if$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$03 if$01 if$04 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$03 if$01 if$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template><template else><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$03 if$02 else$02 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$03 if$02 else$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$03 if$02 else$04 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$03 if$02 else$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template><template else><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$04 if$01 if$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$04 if$01 if$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$04 if$01 if$04 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$04 if$01 if$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template><template else><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$04 if$02 else$02 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$04 if$02 else$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$04 if$02 else$04 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$03 text$04 if$02 else$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template><template else><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$03 if$01 if$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$03 if$01 if$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$03 if$01 if$04 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$03 if$01 if$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template><template else><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$03 if$02 else$02 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$03 if$02 else$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$03 if$02 else$04 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$03 if$02 else$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template><template else><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$04 if$01 if$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$04 if$01 if$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$04 if$01 if$04 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$04 if$01 if$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template><template else><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$04 if$02 else$02 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$04 if$02 else$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$04 if$02 else$04 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$04 text$04 if$02 else$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template><template else><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$03 if$01 if$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$03 if$01 if$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$03 if$01 if$04 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$03 if$01 if$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template><template else><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$03 if$02 else$02 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$03 if$02 else$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$03 if$02 else$04 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$03 if$02 else$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template><template else><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$04 if$01 if$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$04 if$01 if$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$04 if$01 if$04 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$04 if$01 if$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template><template else><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$04 if$02 else$02 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$04 if$02 else$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$04 if$02 else$04 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$05 text$04 if$02 else$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template><template else><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$03 if$01 if$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$03 if$01 if$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$03 if$01 if$04 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$03 if$01 if$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template><template else><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$03 if$02 else$02 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$03 if$02 else$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$03 if$02 else$04 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$03 if$02 else$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template><template else><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$04 if$01 if$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$04 if$01 if$01 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$04 if$01 if$04 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$04 if$01 if$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"true\"><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template><template else><template if.bind=\"true\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$04 if$02 else$02 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$04 if$02 else$03 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"></template><template else><template if.bind=\"false\"></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$04 if$02 else$04 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
    it("tag$06 text$04 if$02 else$05 nested$01 _", function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}${not}${item}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><template if.bind=\"false\"><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template><template else><template if.bind=\"false\"><my-foo msg.bind=\"msg\"></my-foo></template><template else><my-foo not.bind=\"not\"></my-foo></template></template></template>" }, class {
            msg = "a";
            not = "b";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "b");
    });
});
