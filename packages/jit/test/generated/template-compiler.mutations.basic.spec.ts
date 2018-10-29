import { expect } from "chai";
import { DI } from "../../../kernel/src/index";
import { CustomElementResource, DOM, Aurelia, BindingMode, IChangeSet } from "../../../runtime/src/index";
import { BasicConfiguration } from "../../src/index";

describe.only("generated.template-compiler.mutations.basic", function () {
    function setup() {
        const container = DI.createContainer();
        container.register(BasicConfiguration);
        const cs = container.get(IChangeSet);
        const au = new Aurelia(container);
        const host = DOM.createElement("div");
        return { au, host, cs };
    }
    it("works", function () {
        const { au, host, cs } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><foo></foo></template>" }, class {
        });
        const items = [];
        const Foo = CustomElementResource.define({ name: "foo", template: "<template><div repeat.for=\"item of items\">${item}</div></template>" }, class {
            items = items;
            el;
            cycled = false;
            static inject = [Element];
            constructor(el) {
                this.el = el;
            }
            binding() {
                this.items.push(1);
            }
            bound() {
                this.items.push(2);
                expect(this.el.textContent).to.equal("");
            }
            attaching() {
                this.items.push(3);
                cs.flushChanges();
                expect(this.el.textContent).to.equal("");
            }
            attached() {
                expect(this.el.textContent).to.equal(this.cycled ? "1234567812" : "123");
                this.items.push(4);
                cs.flushChanges();
                expect(this.el.textContent).to.equal(this.cycled ? "1234567812" : "1234");
            }
            detaching() {
                expect(this.el.textContent).to.equal(this.cycled ? "1234567812" : "1234");
                this.items.push(5);
                cs.flushChanges();
                expect(this.el.textContent).to.equal(this.cycled ? "1234567812" : "12345");
            }
            detached() {
                expect(this.el.textContent).to.equal("");
                this.items.push(6);
                cs.flushChanges();
            }
            unbinding() {
                this.items.push(7);
            }
            unbound() {
                this.items.push(8);
                this.cycled = true;
            }
        });
        au.register(Foo);
        const component = new App();
        au.app({ host, component });
        au.start();
        expect(host.textContent).to.equal("1234");
        expect(items.length).to.equal(4);
        au.stop();
        expect(host.textContent).to.equal("");
        expect(items.length).to.equal(8);
        au.start();
        expect(host.textContent).to.equal("1234567812");
        expect(items.length).to.equal(12);
        au.stop();
        expect(host.textContent).to.equal("");
        expect(items.length).to.equal(16);
    });
    it("works", function () {
        const { au, host, cs } = setup();
        const App = CustomElementResource.define({ name: "app", template: "<template><foo></foo></template>" }, class {
        });
        const items = [];
        const Foo = CustomElementResource.define({ name: "foo", template: "<template><div repeat.for=\"item of items\">${item}</div></template>" }, class {
            items = items;
            el;
            cycled = false;
            static inject = [Element];
            constructor(el) {
                this.el = el;
            }
            binding() {
                this.items.push(1);
            }
            bound() {
                this.items.push(2);
                expect(this.el.textContent).to.equal("");
            }
            attaching() {
                this.items.push(3);
                expect(this.el.textContent).to.equal("");
            }
            attached() {
                expect(this.el.textContent).to.equal(this.cycled ? "1234567812" : "312");
                this.items.push(4);
                expect(this.el.textContent).to.equal(this.cycled ? "1234567812" : "312");
            }
            detaching() {
                expect(this.el.textContent).to.equal(this.cycled ? "1234567812" : "312");
                this.items.push(5);
                expect(this.el.textContent).to.equal(this.cycled ? "1234567812" : "312");
            }
            detached() {
                expect(this.el.textContent).to.equal("");
                this.items.push(6);
            }
            unbinding() {
                this.items.push(7);
            }
            unbound() {
                this.items.push(8);
                this.cycled = true;
            }
        });
        au.register(Foo);
        const component = new App();
        au.app({ host, component });
        au.start();
        expect(host.textContent).to.equal("312");
        expect(items).to.deep.equal([1, 2, 3, 4]);
        au.stop();
        expect(host.textContent).to.equal("");
        expect(items).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8]);
        au.start();
        expect(host.textContent).to.equal("1234567812");
        expect(items).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4]);
        au.stop();
        expect(host.textContent).to.equal("");
        expect(items).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8]);
    });
});