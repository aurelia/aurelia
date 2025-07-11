import { Aurelia, CustomElement } from "@aurelia/runtime-html";
import { TestContext, assert } from "@aurelia/testing";

describe("3-runtime-html/generated/static.spec.ts", function () {
    function createFixture() {
        const ctx = TestContext.create();
        const au = new Aurelia(ctx.container);
        const host = ctx.createElement("div");
        return { au, host };
    }
    async function verify(au, host, expected) {
        await au.start();
        const outerHtmlAfterStart1 = host.outerHTML;
        assert.visibleTextEqual(host, expected, "after start #1");
        await au.stop();
        const outerHtmlAfterStop1 = host.outerHTML;
        assert.visibleTextEqual(host, "", "after stop #1");
        await au.start();
        const outerHtmlAfterStart2 = host.outerHTML;
        assert.visibleTextEqual(host, expected, "after start #2");
        await au.stop();
        const outerHtmlAfterStop2 = host.outerHTML;
        assert.visibleTextEqual(host, "", "after stop #2");
        assert.strictEqual(outerHtmlAfterStart1, outerHtmlAfterStart2, "outerHTML after start #1 / #2");
        assert.strictEqual(outerHtmlAfterStop1, outerHtmlAfterStop2, "outerHTML after stop #1 / #2");
        au.dispose();
    }
    it("tag$01 text$01 _", async function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div>a</div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        await verify(au, host, "a");
    });
    it("tag$01 text$03 _", async function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template><div>${msg}</div></template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        await verify(au, host, "a");
    });
    it("tag$02 text$01 _", async function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template>a</template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        await verify(au, host, "a");
    });
    it("tag$02 text$03 _", async function () {
        const { au, host } = createFixture();
        const App = CustomElement.define({ name: "app", template: "<template>${msg}</template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        await verify(au, host, "a");
    });
    it("tag$03 text$03 _", async function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"></my-foo></template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        await verify(au, host, "a");
    });
    it("tag$04 text$03 _", async function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"></my-foo></template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        await verify(au, host, "a");
    });
    it("tag$05 text$03 _", async function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"></my-foo></template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        await verify(au, host, "a");
    });
    it("tag$06 text$03 _", async function () {
        const { au, host } = createFixture();
        const MyFoo = CustomElement.define({ name: "my-foo", template: "<template>${msg}</template>" }, class {
            static bindables = ["msg", "not", "item"];
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElement.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"></my-foo></template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        await verify(au, host, "a");
    });
});
