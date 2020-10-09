// import { Aurelia, CustomElement, INode } from "@aurelia/runtime";
// import { expect } from "chai";
// import { TestContext } from "@aurelia/testing";

// describe("generated.template-compiler.mutations.basic", function () {
//     function createFixture() {
//         const ctx = TestContext.createHTMLTestContext();
//         const au = new Aurelia(ctx.container);
//         const host = ctx.createElement("div");
//         return { au, host, ctx };
//     }
//     it("works 1", function () {
//         const { au, host } = createFixture();
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
//             beforeBind() {
//                 this.items.push(1);
//             }
//             afterBind() {
//                 this.items.push(2);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during afterBind() before mutation", `this.el.textContent`);
//             }
//             beforeAttach() {
//                 this.items.push(3);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during beforeAttach() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//             }
//             afterAttachChildren() {
//                 this.items.push(4);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "12345678123" : "123", "this.el.textContent during afterAttachChildren() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//                 assert.strictEqual(this.el.textContent, this.cycled ? "123456781234" : "1234", "this.el.textContent during afterAttachChildren() after mutation after flushChanges()", `this.el.textContent`);
//             }
//             beforeDetach() {
//                 this.items.push(5);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "123456781234" : "1234", "this.el.textContent during beforeDetach() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//                 assert.strictEqual(this.el.textContent, this.cycled ? "1234567812345" : "12345", "this.el.textContent during beforeDetach() after mutation after flushChanges()", `this.el.textContent`);
//             }
//             afterDetachChildren() {
//                 this.items.push(6);
//             }
//             beforeUnbind() {
//                 this.items.push(7);
//             }
//             afterUnbindChildren() {
//                 this.items.push(8);
//                 this.cycled = true;
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during afterUnbindChildren() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during afterUnbindChildren() after mutation after flushChanges()", `this.el.textContent`);
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
//         const { au, host } = createFixture();
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
//             beforeBind() {
//                 this.items.push(1);
//             }
//             afterBind() {
//                 this.items.push(2);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during afterBind() before mutation", `this.el.textContent`);
//             }
//             beforeAttach() {
//                 this.items.push(3);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during beforeAttach() before mutation", `this.el.textContent`);
//             }
//             afterAttachChildren() {
//                 this.items.push(4);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "12345678123" : "123", "this.el.textContent during afterAttachChildren() before mutation", `this.el.textContent`);
//             }
//             beforeDetach() {
//                 this.items.push(5);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "12345678123" : "123", "this.el.textContent during beforeDetach() before mutation", `this.el.textContent`);
//             }
//             afterDetachChildren() {
//                 this.items.push(6);
//             }
//             beforeUnbind() {
//                 this.items.push(7);
//             }
//             afterUnbindChildren() {
//                 this.items.push(8);
//                 this.cycled = true;
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during afterUnbindChildren() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during afterUnbindChildren() after mutation after flushChanges()", `this.el.textContent`);
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
//         const { au, host } = createFixture();
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
//             beforeBind() {
//                 this.items.push(1);
//             }
//             afterBind() {
//                 this.items.push(2);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during afterBind() before mutation", `this.el.textContent`);
//             }
//             beforeAttach() {
//                 this.items.push(3);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during beforeAttach() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//             }
//             afterAttachChildren() {
//                 this.items.push(4);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "363" : "2", "this.el.textContent during afterAttachChildren() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//                 assert.strictEqual(this.el.textContent, this.cycled ? "363" : "24", "this.el.textContent during afterAttachChildren() after mutation after flushChanges()", `this.el.textContent`);
//             }
//             beforeDetach() {
//                 this.items.push(5);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "363" : "24", "this.el.textContent during beforeDetach() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//                 assert.strictEqual(this.el.textContent, this.cycled ? "363" : "24", "this.el.textContent during beforeDetach() after mutation after flushChanges()", `this.el.textContent`);
//             }
//             afterDetachChildren() {
//                 this.items.push(6);
//             }
//             beforeUnbind() {
//                 this.items.push(7);
//             }
//             afterUnbindChildren() {
//                 this.items.push(8);
//                 this.cycled = true;
//                 this.mod = 3;
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during afterUnbindChildren() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during afterUnbindChildren() after mutation after flushChanges()", `this.el.textContent`);
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
//         const { au, host } = createFixture();
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
//             beforeBind() {
//                 this.items.push(1);
//             }
//             afterBind() {
//                 this.items.push(2);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during afterBind() before mutation", `this.el.textContent`);
//             }
//             beforeAttach() {
//                 this.items.push(3);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during beforeAttach() before mutation", `this.el.textContent`);
//             }
//             afterAttachChildren() {
//                 this.items.push(4);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "363" : "2", "this.el.textContent during afterAttachChildren() before mutation", `this.el.textContent`);
//             }
//             beforeDetach() {
//                 this.items.push(5);
//                 assert.strictEqual(this.el.textContent, this.cycled ? "363" : "2", "this.el.textContent during beforeDetach() before mutation", `this.el.textContent`);
//             }
//             afterDetachChildren() {
//                 this.items.push(6);
//             }
//             beforeUnbind() {
//                 this.items.push(7);
//             }
//             afterUnbindChildren() {
//                 this.items.push(8);
//                 this.cycled = true;
//                 this.mod = 3;
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during afterUnbindChildren() before mutation before flushChanges()", `this.el.textContent`);
//                 this.$lifecycle.processFlushQueue();
//                 assert.strictEqual(this.el.textContent, this.cycled ? "" : "", "this.el.textContent during afterUnbindChildren() after mutation after flushChanges()", `this.el.textContent`);
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
