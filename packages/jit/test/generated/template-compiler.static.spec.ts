import { expect } from "chai";
import { DI } from "../../../kernel/src/index";
import { CustomElementResource, DOM, Aurelia, BindingMode } from "../../../runtime/src/index";
import { BasicConfiguration } from "../../src/index";

describe("generated.template-compiler.static", function () {
    function setup() {
        const container = DI.createContainer();
        container.register(BasicConfiguration);
        const au = new Aurelia(container);
        const host = DOM.createElement("div");
        return { au, host };
    }
    function verify(au, host, expected) {
        au.start();
        const outerHtmlAfterStart1 = host.outerHTML;
        expect(host.textContent).to.equal(expected, "after start #1");
        au.stop();
        const outerHtmlAfterStop1 = host.outerHTML;
        expect(host.textContent).to.equal("", "after stop #1");
        au.start();
        const outerHtmlAfterStart2 = host.outerHTML;
        expect(host.textContent).to.equal(expected, "after start #2");
        au.stop();
        const outerHtmlAfterStop2 = host.outerHTML;
        expect(host.textContent).to.equal("", "after stop #2");
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
        const Foo = CustomElementResource.define({ name: "foo", template: "<template>${msg}</template>" }, class {
            static bindables = { msg: { attribute: "msg", property: "msg" }, not: { attribute: "not", property: "not" }, item: { attribute: "item", property: "item" } };
            msg = "";
            not = "";
            item = "";
        });
        au.register(Foo);
        const App = CustomElementResource.define({ name: "app", template: "<template><foo msg.bind=\"msg\"></foo></template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$04 text$03 _", function () {
        const { au, host } = setup();
        const Foo = CustomElementResource.define({ name: "foo", template: "<template>${msg}</template>" }, class {
            static bindables = { msg: { attribute: "msg", property: "msg" }, not: { attribute: "not", property: "not" }, item: { attribute: "item", property: "item" } };
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(Foo);
        const App = CustomElementResource.define({ name: "app", template: "<template><foo msg.bind=\"msg\"></foo></template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$05 text$03 _", function () {
        const { au, host } = setup();
        const Foo = CustomElementResource.define({ name: "foo", template: "<template>${msg}</template>" }, class {
            static bindables = { msg: { attribute: "msg", property: "msg" }, not: { attribute: "not", property: "not" }, item: { attribute: "item", property: "item" } };
            static shadowOptions = { mode: "open" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(Foo);
        const App = CustomElementResource.define({ name: "app", template: "<template><foo msg.bind=\"msg\"></foo></template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
    it("tag$06 text$03 _", function () {
        const { au, host } = setup();
        const Foo = CustomElementResource.define({ name: "foo", template: "<template>${msg}</template>" }, class {
            static bindables = { msg: { attribute: "msg", property: "msg" }, not: { attribute: "not", property: "not" }, item: { attribute: "item", property: "item" } };
            static shadowOptions = { mode: "closed" };
            msg = "";
            not = "";
            item = "";
        });
        au.register(Foo);
        const App = CustomElementResource.define({ name: "app", template: "<template><foo msg.bind=\"msg\"></foo></template>" }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        verify(au, host, "a");
    });
});