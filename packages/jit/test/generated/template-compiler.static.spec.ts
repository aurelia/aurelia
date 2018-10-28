import { expect } from "chai";
import { DI } from "../../../kernel/src/index";
import { CustomElementResource, DOM, Aurelia, BindingMode } from "../../../runtime/src/index";
import { BasicConfiguration } from "../../src/index";

describe("generated.template-compiler.static", function generated_template_compiler_static() {
    function setup() {
        const container = DI.createContainer();
        container.register(BasicConfiguration);
        const au = new Aurelia(container);
        const host = DOM.createElement("div");
        return { au, host };
    }
    it("tag$01 text$01 _", function tag$01_text$01__() {
        const { au, host } = setup();
        const template = "<template><div>a</div></template>";
        const name = "app";
        const App = CustomElementResource.define({ name, template }, class {
        });
        const component = new App();
        au.app({ host, component });
        au.start();
        const outerHtmlAfterStart1 = host.outerHTML;
        expect(host.textContent).to.equal("a", "after start #1");
        au.stop();
        const outerHtmlAfterStop1 = host.outerHTML;
        expect(host.textContent).to.equal("", "after stop #1");
        au.start();
        const outerHtmlAfterStart2 = host.outerHTML;
        expect(host.textContent).to.equal("a", "after start #2");
        au.stop();
        const outerHtmlAfterStop2 = host.outerHTML;
        expect(host.textContent).to.equal("", "after stop #2");
        expect(outerHtmlAfterStart1).to.equal(outerHtmlAfterStart2, "outerHTML after start #1 / #2");
        expect(outerHtmlAfterStop1).to.equal(outerHtmlAfterStop2, "outerHTML after stop #1 / #2");
    });
    it("tag$01 text$03 _", function tag$01_text$03__() {
        const { au, host } = setup();
        const template = "<template><div>${msg}</div></template>";
        const name = "app";
        const App = CustomElementResource.define({ name, template }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        au.start();
        const outerHtmlAfterStart1 = host.outerHTML;
        expect(host.textContent).to.equal("a", "after start #1");
        au.stop();
        const outerHtmlAfterStop1 = host.outerHTML;
        expect(host.textContent).to.equal("", "after stop #1");
        au.start();
        const outerHtmlAfterStart2 = host.outerHTML;
        expect(host.textContent).to.equal("a", "after start #2");
        au.stop();
        const outerHtmlAfterStop2 = host.outerHTML;
        expect(host.textContent).to.equal("", "after stop #2");
        expect(outerHtmlAfterStart1).to.equal(outerHtmlAfterStart2, "outerHTML after start #1 / #2");
        expect(outerHtmlAfterStop1).to.equal(outerHtmlAfterStop2, "outerHTML after stop #1 / #2");
    });
    it("tag$02 text$01 _", function tag$02_text$01__() {
        const { au, host } = setup();
        const template = "<template>a</template>";
        const name = "app";
        const App = CustomElementResource.define({ name, template }, class {
        });
        const component = new App();
        au.app({ host, component });
        au.start();
        const outerHtmlAfterStart1 = host.outerHTML;
        expect(host.textContent).to.equal("a", "after start #1");
        au.stop();
        const outerHtmlAfterStop1 = host.outerHTML;
        expect(host.textContent).to.equal("", "after stop #1");
        au.start();
        const outerHtmlAfterStart2 = host.outerHTML;
        expect(host.textContent).to.equal("a", "after start #2");
        au.stop();
        const outerHtmlAfterStop2 = host.outerHTML;
        expect(host.textContent).to.equal("", "after stop #2");
        expect(outerHtmlAfterStart1).to.equal(outerHtmlAfterStart2, "outerHTML after start #1 / #2");
        expect(outerHtmlAfterStop1).to.equal(outerHtmlAfterStop2, "outerHTML after stop #1 / #2");
    });
    it("tag$02 text$03 _", function tag$02_text$03__() {
        const { au, host } = setup();
        const template = "<template>${msg}</template>";
        const name = "app";
        const App = CustomElementResource.define({ name, template }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        au.start();
        const outerHtmlAfterStart1 = host.outerHTML;
        expect(host.textContent).to.equal("a", "after start #1");
        au.stop();
        const outerHtmlAfterStop1 = host.outerHTML;
        expect(host.textContent).to.equal("", "after stop #1");
        au.start();
        const outerHtmlAfterStart2 = host.outerHTML;
        expect(host.textContent).to.equal("a", "after start #2");
        au.stop();
        const outerHtmlAfterStop2 = host.outerHTML;
        expect(host.textContent).to.equal("", "after stop #2");
        expect(outerHtmlAfterStart1).to.equal(outerHtmlAfterStart2, "outerHTML after start #1 / #2");
        expect(outerHtmlAfterStop1).to.equal(outerHtmlAfterStop2, "outerHTML after stop #1 / #2");
    });
    it("tag$03 text$03 _", function tag$03_text$03__() {
        const { au, host } = setup();
        const template = "<template><foo msg.bind=\"msg\"></foo></template>";
        const name = "app";
        const Foo = CustomElementResource.define({ name: "foo", template: "<template>${msg}</template>" }, class {
            static bindables = { msg: { attribute: "msg", property: "msg" }, not: { attribute: "not", property: "not" }, item: { attribute: "item", property: "item" } };
            msg = "";
            not = "";
            item = "";
        });
        au.register(Foo);
        const App = CustomElementResource.define({ name, template }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        au.start();
        const outerHtmlAfterStart1 = host.outerHTML;
        expect(host.textContent).to.equal("a", "after start #1");
        au.stop();
        const outerHtmlAfterStop1 = host.outerHTML;
        expect(host.textContent).to.equal("", "after stop #1");
        au.start();
        const outerHtmlAfterStart2 = host.outerHTML;
        expect(host.textContent).to.equal("a", "after start #2");
        au.stop();
        const outerHtmlAfterStop2 = host.outerHTML;
        expect(host.textContent).to.equal("", "after stop #2");
        expect(outerHtmlAfterStart1).to.equal(outerHtmlAfterStart2, "outerHTML after start #1 / #2");
        expect(outerHtmlAfterStop1).to.equal(outerHtmlAfterStop2, "outerHTML after stop #1 / #2");
    });
    it("tag$04 text$03 _", function tag$04_text$03__() {
        const { au, host } = setup();
        const template = "<template><foo msg.bind=\"msg\"></foo></template>";
        const name = "app";
        const Foo = CustomElementResource.define({ name: "foo", template: "<template>${msg}</template>" }, class {
            static bindables = { msg: { attribute: "msg", property: "msg" }, not: { attribute: "not", property: "not" }, item: { attribute: "item", property: "item" } };
            static containerless = true;
            msg = "";
            not = "";
            item = "";
        });
        au.register(Foo);
        const App = CustomElementResource.define({ name, template }, class {
            msg = "a";
        });
        const component = new App();
        au.app({ host, component });
        au.start();
        const outerHtmlAfterStart1 = host.outerHTML;
        expect(host.textContent).to.equal("a", "after start #1");
        au.stop();
        const outerHtmlAfterStop1 = host.outerHTML;
        expect(host.textContent).to.equal("", "after stop #1");
        au.start();
        const outerHtmlAfterStart2 = host.outerHTML;
        expect(host.textContent).to.equal("a", "after start #2");
        au.stop();
        const outerHtmlAfterStop2 = host.outerHTML;
        expect(host.textContent).to.equal("", "after stop #2");
        expect(outerHtmlAfterStart1).to.equal(outerHtmlAfterStart2, "outerHTML after start #1 / #2");
        expect(outerHtmlAfterStop1).to.equal(outerHtmlAfterStop2, "outerHTML after stop #1 / #2");
    });
});