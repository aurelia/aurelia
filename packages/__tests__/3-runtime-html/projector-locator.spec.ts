// import { CustomElement, Controller, ContainerlessProjector, HostProjector, ProjectorLocator, ShadowDOMProjector } from '@aurelia/runtime-html';
// import { TestContext, assert } from '@aurelia/testing';

// describe.skip(`determineProjector`, function () {
//   const ctx = TestContext.create();
//   const locator = new ProjectorLocator();

//   it(`@useShadowDOM yields ShadowDOMProjector`, function () {
//     const host = ctx.createElement('div');

//     const Foo = CustomElement.define(
//       {
//         name: 'foo',
//         shadowOptions: { mode: 'open' }
//       },
//       class {},
//     );
//     const definition = CustomElement.getDefinition(Foo);
//     const component = new Foo();
//     const controller = Controller.forCustomElement(null, ctx.container, component, host, void 0, null);
//     const projector = locator.getElementProjector(controller, host, definition);

//     assert.instanceOf(projector, ShadowDOMProjector, `projector`);
//     assert.instanceOf(projector['shadowRoot'], ctx.Node, `projector['shadowRoot']`);
//     assert.strictEqual(CustomElement.for(projector['shadowRoot']), component, `CustomElement.for(projector['shadowRoot'])`);
//     assert.strictEqual(CustomElement.for(host), component, `CustomElement.for(host)`);
//     assert.strictEqual(projector.children.length, projector['shadowRoot']['childNodes'].length, `projector.children.length`);
//     if (projector.children.length > 0) {
//       assert.deepStrictEqual(projector.children, projector['shadowRoot']['childNodes'], `projector.children`);
//     }
//     assert.strictEqual(projector.provideEncapsulationSource(), projector['shadowRoot'], `projector.provideEncapsulationSource()`);
//   });

//   it(`hasSlots=true yields ShadowDOMProjector`, function () {
//     const host = ctx.createElement('div');
//     const Foo = CustomElement.define(
//       {
//         name: 'foo',
//         hasSlots: true
//       },
//       class {}
//     );
//     const definition = CustomElement.getDefinition(Foo);
//     const component = new Foo();
//     const controller = Controller.forCustomElement(null, ctx.container, component, host, void 0, null);
//     const projector = locator.getElementProjector(controller, host, definition);

//     assert.instanceOf(projector, ShadowDOMProjector, `projector`);
//     assert.instanceOf(projector['shadowRoot'], ctx.Node, `projector['shadowRoot']`);
//     assert.strictEqual(CustomElement.for(projector['shadowRoot']), component, `CustomElement.for(projector['shadowRoot'])`);
//     assert.strictEqual(CustomElement.for(host), component, `CustomElement.for(host)`);
//     assert.strictEqual(projector.children.length, projector['shadowRoot']['childNodes'].length, `projector.children.length`);
//     if (projector.children.length > 0) {
//       assert.deepStrictEqual(projector.children, projector['shadowRoot']['childNodes'], `projector.children`);
//     }
//     assert.strictEqual(projector.provideEncapsulationSource(), projector['shadowRoot'], `projector.provideEncapsulationSource()`);
//   });

//   it(`@containerless yields ContainerlessProjector`, function () {
//     const host = ctx.createElement('div');
//     const parent = ctx.createElement('div');
//     parent.appendChild(host);
//     const Foo = CustomElement.define(
//       {
//         name: 'foo',
//         containerless: true
//       },
//       class {}
//     );
//     const definition = CustomElement.getDefinition(Foo);
//     const component = new Foo();
//     const controller = Controller.forCustomElement(null, ctx.container, component, host, void 0, null);
//     const projector = locator.getElementProjector(controller, host, definition);

//     assert.instanceOf(projector, ContainerlessProjector, `projector`);
//     assert.strictEqual(projector['childNodes'].length, 0, `projector['childNodes'].length`);
//     assert.strictEqual(host.parentNode, null, `host.parentNode`);
//     assert.instanceOf(parent.firstChild, ctx.Comment, `parent.firstChild`);
//     assert.strictEqual(parent.firstChild.textContent, 'au-start', `parent.firstChild.textContent`);
//     assert.instanceOf(parent.lastChild, ctx.Comment, `parent.lastChild`);
//     assert.strictEqual(parent.lastChild.textContent, 'au-end', `parent.lastChild.textContent`);
//     assert.strictEqual(parent.firstChild.nextSibling['$controller'], component, `parent.firstChild.nextSibling['$controller']`);
//     assert.strictEqual(projector.children.length, projector.host['childNodes'].length, `projector.children.length`);
//     if (projector.children.length > 0) {
//       assert.deepStrictEqual(projector.children, projector.host['childNodes'], `projector.children`);
//     }
//     assert.notStrictEqual(projector.provideEncapsulationSource(), projector['host'], `projector.provideEncapsulationSource()`);
//     assert.strictEqual(projector.provideEncapsulationSource(), parent, `projector.provideEncapsulationSource()`);
//   });

//   it(`@containerless yields ContainerlessProjector (with child)`, function () {
//     const parent = ctx.createElement('div');
//     const host = ctx.createElement('div');
//     const child = ctx.createElement('div');
//     parent.appendChild(host);
//     host.appendChild(child);
//     const Foo = CustomElement.define(
//       {
//         name: 'foo',
//         containerless: true
//       },
//       class {}
//     );
//     const definition = CustomElement.getDefinition(Foo);
//     const component = new Foo();
//     const controller = Controller.forCustomElement(null, ctx.container, component, host, void 0, null);
//     const projector = locator.getElementProjector(controller, host, definition);

//     assert.instanceOf(projector, ContainerlessProjector, `projector`);
//     assert.strictEqual(projector['childNodes'][0], child, `projector['childNodes'][0]`);
//     assert.strictEqual(host.parentNode, null, `host.parentNode`);
//     assert.instanceOf(parent.firstChild, ctx.Comment, `parent.firstChild`);
//     assert.strictEqual(parent.firstChild.textContent, 'au-start', `parent.firstChild.textContent`);
//     assert.instanceOf(parent.lastChild, ctx.Comment, `parent.lastChild`);
//     assert.strictEqual(parent.lastChild.textContent, 'au-end', `parent.lastChild.textContent`);
//     assert.strictEqual(parent.firstChild.nextSibling['$controller'], component, `parent.firstChild.nextSibling['$controller']`);
//     assert.notStrictEqual(projector.provideEncapsulationSource(), projector['host'], `projector.provideEncapsulationSource()`);
//     assert.strictEqual(projector.provideEncapsulationSource(), parent, `projector.provideEncapsulationSource()`);
//   });

//   it(`no shadowDOM, slots or containerless yields HostProjector`, function () {
//     const host = ctx.createElement('div');
//     const Foo = CustomElement.define(
//       {
//         name: 'foo'
//       },
//       class {}
//     );
//     const definition = CustomElement.getDefinition(Foo);
//     const component = new Foo();
//     const controller = Controller.forCustomElement(null, ctx.container, component, host, void 0, null);
//     const projector = locator.getElementProjector(controller, host, definition);

//     assert.strictEqual(CustomElement.for(host), component, `CustomElement.for(host)`);
//     assert.instanceOf(projector, HostProjector, `projector`);
//     assert.strictEqual(projector.children, projector.host.childNodes, `projector.children`);
//     assert.strictEqual(projector.provideEncapsulationSource(), host, `projector.provideEncapsulationSource()`);
//   });

//   it(`@containerless + @useShadowDOM throws`, function () {
//     const host = ctx.createElement('div');
//     const Foo = CustomElement.define(
//       {
//         name: 'foo',
//         containerless: true,
//         shadowOptions: { mode: 'open' }
//       },
//       class {}
//     );
//     const definition = CustomElement.getDefinition(Foo);
//     const component = new Foo();
//     const controller = Controller.forCustomElement(null, ctx.container, component, host, void 0, null);

//     assert.throws(() => locator.getElementProjector(controller, host, definition), /You cannot combine the containerless custom element option with Shadow DOM./, `() => locator.getElementProjector(dom, component, host, definition)`);
//   });

//   it(`@containerless + hasSlots throws`, function () {
//     const host = ctx.createElement('div');
//     const Foo = CustomElement.define(
//       {
//         name: 'foo',
//         containerless: true,
//         hasSlots: true
//       },
//       class {}
//     );
//     const definition = CustomElement.getDefinition(Foo);
//     const component = new Foo();
//     const controller = Controller.forCustomElement(null, ctx.container, component, host, void 0, null);

//     assert.throws(() => locator.getElementProjector(controller, host, definition), /You cannot combine the containerless custom element option with Shadow DOM./, `() => locator.getElementProjector(dom, component, host, definition)`);
//   });
// });
