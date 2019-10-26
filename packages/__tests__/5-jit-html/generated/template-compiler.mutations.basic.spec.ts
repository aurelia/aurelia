// import { Aurelia, CustomElement, INode } from "@aurelia/runtime";
// import { expect } from "chai";
// import { TestContext } from "@aurelia/testing";

// describe("generated.template-compiler.mutations.basic", function () {
//     function setup() {
//         const ctx = TestContext.createHTMLTestContext();
//         const au = new Aurelia(ctx.container);
//         const host = ctx.createElement("div");
//         return { au, host, ctx };
//     }
//     it("works 1", function () {
//         const { au, host } = setup();
//         const App = CustomElement.define({ name: "app", template: "<template><foo></foo></template>" }, class {
//         });
//         const items = [];
//         const Foo = CustomElement.define({ name: "foo", template: "<template><div repeat.for=\"item of items\">${item}</div></template>" }, class {
//             static inject = [INode];
//             items = items;
//             el;
//             $lifecycle;
//             cycled = false;
//             constructor(el) {
//                 this.el = el;
//             }
//             binding() {
//                 this.items.push(1);
//             }
//             bound() {
//                 this.items.push(2);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during bound() before mutation", `this.el.textContent`);
//             }
//             attaching() {
//                 this.items.push(3);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during attaching() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//             }
//             attached() {
//                 this.items.push(4);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "12345678123" : "123", "this.el.textContent during attached() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//                 assert.strictEqual(this.el.textContent, this.cycled ? "123456781234" : "1234", "this.el.textContent during attached() after mutation after flushChanges()", `this.el.textContent`);
//             }
//             detaching() {
//                 this.items.push(5);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "123456781234" : "1234", "this.el.textContent during detaching() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//                 assert.strictEqual(this.el.textContent, this.cycled ? "1234567812345" : "12345", "this.el.textContent during detaching() after mutation after flushChanges()", `this.el.textContent`);
//             }
//             detached() {
//                 this.items.push(6);
//             }
//             unbinding() {
//                 this.items.push(7);
//             }
//             unbound() {
//                 this.items.push(8);
//                 this.cycled = true;
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during unbound() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during unbound() after mutation after flushChanges()", `this.el.textContent`);
//             }
//         });
//         au.register(Foo);
//         const component = new App();
//         au.app({ host, component });
//         au.start();
//         assert.strictEqual(host.textContent, "1234", "host.textContent after start #1", `host.textContent`);
//         assert.deepStrictEqual(items, [1, 2, 3, 4], `items`);
//         au.stop();
//         assert.strictEqual(host.textContent, "", "host.textContent after stop #1", `host.textContent`);
//         assert.deepStrictEqual(items, [1, 2, 3, 4, 5, 6, 7, 8], `items`);
//         au.start();
//         assert.strictEqual(host.textContent, "123456781234", "host.textContent after start #2", `host.textContent`);
//         assert.deepStrictEqual(items, [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4], `items`);
//         au.stop();
//         assert.strictEqual(host.textContent, "", "host.textContent after stop #2", `host.textContent`);
//         assert.deepStrictEqual(items, [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8], `items`);
//     });
//     it("works 2", function () {
//         const { au, host } = setup();
//         const App = CustomElement.define({ name: "app", template: "<template><foo></foo></template>" }, class {
//         });
//         const items = [];
//         const Foo = CustomElement.define({ name: "foo", template: "<template><div repeat.for=\"item of items\">${item}</div></template>" }, class {
//             static inject = [INode];
//             items = items;
//             el;
//             $lifecycle;
//             cycled = false;
//             constructor(el) {
//                 this.el = el;
//             }
//             binding() {
//                 this.items.push(1);
//             }
//             bound() {
//                 this.items.push(2);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during bound() before mutation", `this.el.textContent`);
//             }
//             attaching() {
//                 this.items.push(3);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during attaching() before mutation", `this.el.textContent`);
//             }
//             attached() {
//                 this.items.push(4);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "12345678123" : "123", "this.el.textContent during attached() before mutation", `this.el.textContent`);
//             }
//             detaching() {
//                 this.items.push(5);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "12345678123" : "123", "this.el.textContent during detaching() before mutation", `this.el.textContent`);
//             }
//             detached() {
//                 this.items.push(6);
//             }
//             unbinding() {
//                 this.items.push(7);
//             }
//             unbound() {
//                 this.items.push(8);
//                 this.cycled = true;
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during unbound() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during unbound() after mutation after flushChanges()", `this.el.textContent`);
//             }
//         });
//         au.register(Foo);
//         const component = new App();
//         au.app({ host, component });
//         au.start();
//         assert.strictEqual(host.textContent, "123", "host.textContent after start #1", `host.textContent`);
//         assert.deepStrictEqual(items, [1, 2, 3, 4], `items`);
//         au.stop();
//         assert.strictEqual(host.textContent, "", "host.textContent after stop #1", `host.textContent`);
//         assert.deepStrictEqual(items, [1, 2, 3, 4, 5, 6, 7, 8], `items`);
//         au.start();
//         assert.strictEqual(host.textContent, "12345678123", "host.textContent after start #2", `host.textContent`);
//         assert.deepStrictEqual(items, [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4], `items`);
//         au.stop();
//         assert.strictEqual(host.textContent, "", "host.textContent after stop #2", `host.textContent`);
//         assert.deepStrictEqual(items, [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8], `items`);
//     });
//     it("works 3", function () {
//         const { au, host } = setup();
//         const App = CustomElement.define({ name: "app", template: "<template><foo></foo></template>" }, class {
//         });
//         const items = [];
//         const Foo = CustomElement.define({ name: "foo", template: "<template><div repeat.for=\"item of items\" if.bind=\"item % mod === 0\">${item}</div></template>" }, class {
//             static inject = [INode];
//             items = items;
//             mod = 2;
//             el;
//             $lifecycle;
//             cycled = false;
//             constructor(el) {
//                 this.el = el;
//             }
//             binding() {
//                 this.items.push(1);
//             }
//             bound() {
//                 this.items.push(2);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during bound() before mutation", `this.el.textContent`);
//             }
//             attaching() {
//                 this.items.push(3);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during attaching() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//             }
//             attached() {
//                 this.items.push(4);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "363" : "2", "this.el.textContent during attached() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//                 assert.strictEqual(this.el.textContent, this.cycled ? "363" : "24", "this.el.textContent during attached() after mutation after flushChanges()", `this.el.textContent`);
//             }
//             detaching() {
//                 this.items.push(5);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "363" : "24", "this.el.textContent during detaching() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//                 assert.strictEqual(this.el.textContent, this.cycled ? "363" : "24", "this.el.textContent during detaching() after mutation after flushChanges()", `this.el.textContent`);
//             }
//             detached() {
//                 this.items.push(6);
//             }
//             unbinding() {
//                 this.items.push(7);
//             }
//             unbound() {
//                 this.items.push(8);
//                 this.cycled = true;
//                 this.mod = 3;
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during unbound() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during unbound() after mutation after flushChanges()", `this.el.textContent`);
//             }
//         });
//         au.register(Foo);
//         const component = new App();
//         au.app({ host, component });
//         au.start();
//         assert.strictEqual(host.textContent, "24", "host.textContent after start #1", `host.textContent`);
//         assert.deepStrictEqual(items, [1, 2, 3, 4], `items`);
//         au.stop();
//         assert.strictEqual(host.textContent, "", "host.textContent after stop #1", `host.textContent`);
//         assert.deepStrictEqual(items, [1, 2, 3, 4, 5, 6, 7, 8], `items`);
//         au.start();
//         assert.strictEqual(host.textContent, "363", "host.textContent after start #2", `host.textContent`);
//         assert.deepStrictEqual(items, [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4], `items`);
//         au.stop();
//         assert.strictEqual(host.textContent, "", "host.textContent after stop #2", `host.textContent`);
//         assert.deepStrictEqual(items, [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8], `items`);
//     });
//     it("works 4", function () {
//         const { au, host } = setup();
//         const App = CustomElement.define({ name: "app", template: "<template><foo></foo></template>" }, class {
//         });
//         const items = [];
//         const Foo = CustomElement.define({ name: "foo", template: "<template><div repeat.for=\"item of items\" if.bind=\"item % mod === 0\">${item}</div></template>" }, class {
//             static inject = [INode];
//             items = items;
//             mod = 2;
//             el;
//             $lifecycle;
//             cycled = false;
//             constructor(el) {
//                 this.el = el;
//             }
//             binding() {
//                 this.items.push(1);
//             }
//             bound() {
//                 this.items.push(2);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during bound() before mutation", `this.el.textContent`);
//             }
//             attaching() {
//                 this.items.push(3);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during attaching() before mutation", `this.el.textContent`);
//             }
//             attached() {
//                 this.items.push(4);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "363" : "2", "this.el.textContent during attached() before mutation", `this.el.textContent`);
//             }
//             detaching() {
//                 this.items.push(5);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "363" : "2", "this.el.textContent during detaching() before mutation", `this.el.textContent`);
//             }
//             detached() {
//                 this.items.push(6);
//             }
//             unbinding() {
//                 this.items.push(7);
//             }
//             unbound() {
//                 this.items.push(8);
//                 this.cycled = true;
//                 this.mod = 3;
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during unbound() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during unbound() after mutation after flushChanges()", `this.el.textContent`);
//             }
//         });
//         au.register(Foo);
//         const component = new App();
//         au.app({ host, component });
//         au.start();
//         assert.strictEqual(host.textContent, "2", "host.textContent after start #1", `host.textContent`);
//         assert.deepStrictEqual(items, [1, 2, 3, 4], `items`);
//         au.stop();
//         assert.strictEqual(host.textContent, "", "host.textContent after stop #1", `host.textContent`);
//         assert.deepStrictEqual(items, [1, 2, 3, 4, 5, 6, 7, 8], `items`);
//         au.start();
//         assert.strictEqual(host.textContent, "363", "host.textContent after start #2", `host.textContent`);
//         assert.deepStrictEqual(items, [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4], `items`);
//         au.stop();
//         assert.strictEqual(host.textContent, "", "host.textContent after stop #2", `host.textContent`);
//         assert.deepStrictEqual(items, [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8], `items`);
//     });
// });
