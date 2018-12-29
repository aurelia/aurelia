import { expect } from "chai";
import { CustomElementResource, Aurelia } from "../../../runtime/src/index";
import { HTMLJitConfiguration } from "../../src/index";
import { getVisibleText } from "../util";

describe("generated.template-compiler.static", function () {
    function setup() {
        const container = HTMLJitConfiguration.createContainer();
        const au = new Aurelia(container);
        const host = document.createElement("div");
        return { au, host };
    }
    function verify(au, host, expected) {
        au.start();
        const outerHtmlAfterStart1 = host.outerHTML;
        expect(getVisibleText(au, host)).to.equal(expected, "after start #1");
        au.stop();
        const outerHtmlAfterStop1 = host.outerHTML;
        expect(getVisibleText(au, host)).to.equal("", "after stop #1");
        au.start();
        const outerHtmlAfterStart2 = host.outerHTML;
        expect(getVisibleText(au, host)).to.equal(expected, "after start #2");
        au.stop();
        const outerHtmlAfterStop2 = host.outerHTML;
        expect(getVisibleText(au, host)).to.equal("", "after stop #2");
        expect(outerHtmlAfterStart1).to.equal(outerHtmlAfterStart2, "outerHTML after start #1 / #2");
        expect(outerHtmlAfterStop1).to.equal(outerHtmlAfterStop2, "outerHTML after stop #1 / #2");
    }
    it("tag$01 text$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div>a</div></template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$01 text$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><div>${msg}</div></template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$01 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template>a</template>" }, class {
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$02 text$03 _", function () {
        const { au, host } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template>${msg}</template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$03 text$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}</template>" }, class {
            static bindables = { msg: { property: "msg", attribute: "msg" }, not: { property: "not", attribute: "not" }, item: { property: "item", attribute: "item" } };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"></my-foo></template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = { msg: { property: "msg", attribute: "msg" }, not: { property: "not", attribute: "not" }, item: { property: "item", attribute: "item" } };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}</template>" }, class {
            static bindables = { msg: { property: "msg", attribute: "msg" }, not: { property: "not", attribute: "not" }, item: { property: "item", attribute: "item" } };
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"></my-foo></template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = { msg: { property: "msg", attribute: "msg" }, not: { property: "not", attribute: "not" }, item: { property: "item", attribute: "item" } };
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$07 text$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}</template>" }, class {
            static bindables = { msg: { property: "msg", attribute: "msg" }, not: { property: "not", attribute: "not" }, item: { property: "item", attribute: "item" } };
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"></my-foo></template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$08 text$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = { msg: { property: "msg", attribute: "msg" }, not: { property: "not", attribute: "not" }, item: { property: "item", attribute: "item" } };
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$09 text$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template>${msg}</template>" }, class {
            static bindables = { msg: { property: "msg", attribute: "msg" }, not: { property: "not", attribute: "not" }, item: { property: "item", attribute: "item" } };
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"></my-foo></template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$10 text$03 _", function () {
        const { au, host } = setup();
        const MyFoo = CustomElementResource.define({ name: "my-foo", template: "<template><template replaceable part=\"part1\"></template><template replaceable part=\"part2\"></template></template>" }, class {
            static bindables = { msg: { property: "msg", attribute: "msg" }, not: { property: "not", attribute: "not" }, item: { property: "item", attribute: "item" } };
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(MyFoo);
        const App = CustomElementResource.define({ name: "app", template: "<template><my-foo msg.bind=\"msg\"><template replace-part=\"part1\">${msg}</template></my-foo></template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
});