// import {
//   Controller,
//   LifecycleFlags as LF,
//   Interpolation,
//   AccessScopeExpression,
//   CustomElement,
//   ITargetedInstruction,
//   HooksDefinition,
//   BindingMode,
//   BindingBehaviorExpression,
//   HydrateElementInstruction,
//   BindingType,
//   HydrateTemplateController,
//   ToViewBindingInstruction,
//   If,
//   CustomElementDefinition,
//   BindableDefinition,
//   ICustomElementController,
// } from '@aurelia/runtime';
// import {
//   parseExpression,
// } from '@aurelia/jit';
// import {
//   TextBindingInstruction,
// } from '@aurelia/runtime-html';
// import {
//   TestContext,
//   assert,
//   h,
//   CallCollection,
//   recordCalls,
//   stopRecordingCalls,
// } from '@aurelia/testing';
// import {
//   PLATFORM,
//   Class,
//   resetId,
//   nextId,
// } from '@aurelia/kernel';

// describe.skip('controller', function () {
//   const allHooks = Object.freeze(new HooksDefinition({
//     created: true,
//     binding: true,
//     afterBind: true,
//     beforeAttach: true,
//     afterAttachChildren: true,
//     beforeDetach: true,
//     dispose: true,
//     afterDetachChildren: true,
//     beforeUnbind: true,
//     afterUnbindChildren: true,
//   }));
//   const noHooks = Object.freeze(new HooksDefinition({}));

//   function addTracingHooks<TProto>(ctor: Class<TProto>): Class<TProto & {
//     created(...args: any[]): void;
//     beforeBind(...args: any[]): void;
//     afterBind(...args: any[]): void;
//     beforeAttach(...args: any[]): void;
//     afterAttachChildren(...args: any[]): void;
//     beforeDetach(...args: any[]): void;
//     dispose(...args: any[]): void;
//     afterDetachChildren(...args: any[]): void;
//     beforeUnbind(...args: any[]): void;
//     afterUnbindChildren(...args: any[]): void;
//   }> {
//     const proto = ctor.prototype as any;

//     proto.created = function (...args: any[]): void {
//       this.$$calls.addCall(this.id, 'created', ...args);
//     };
//     proto.beforeBind = function (...args: any[]): void {
//       this.$$calls.addCall(this.id, 'beforeBind', ...args);
//     };
//     proto.afterBind = function (...args: any[]): void {
//       this.$$calls.addCall(this.id, 'afterBind', ...args);
//     };
//     proto.beforeAttach = function (...args: any[]): void {
//       this.$$calls.addCall(this.id, 'beforeAttach', ...args);
//     };
//     proto.afterAttachChildren = function (...args: any[]): void {
//       this.$$calls.addCall(this.id, 'afterAttachChildren', ...args);
//     };
//     proto.beforeDetach = function (...args: any[]): void {
//       this.$$calls.addCall(this.id, 'beforeDetach', ...args);
//     };
//     proto.dispose = function (...args: any[]): void {
//       this.$$calls.addCall(this.id, 'dispose', ...args);
//     };
//     proto.afterDetachChildren = function (...args: any[]): void {
//       this.$$calls.addCall(this.id, 'afterDetachChildren', ...args);
//     };
//     proto.beforeUnbind = function (...args: any[]): void {
//       this.$$calls.addCall(this.id, 'beforeUnbind', ...args);
//     };
//     proto.afterUnbindChildren = function (...args: any[]): void {
//       this.$$calls.addCall(this.id, 'afterUnbindChildren', ...args);
//     };

//     return ctor as any;
//   }

//   function createDescription(
//     name: string,
//     template: unknown,
//     bindables: string[],
//     instructions: ITargetedInstruction[][],
//     hooks: Readonly<HooksDefinition>,
//   ) {
//     return CustomElementDefinition.create({
//       name,
//       template,
//       needsCompile: false,
//       bindables: bindables.reduce(
//         function (acc, cur) {
//           acc[cur] = BindableDefinition.create(cur, { mode: BindingMode.oneTime });
//           return acc;
//         },
//         {},
//       ),
//       instructions,
//       hooks,
//     });
//   }

//   function createViewModel(
//     template: unknown,
//     bindables: string[],
//     instructions: ITargetedInstruction[][],
//   ) {
//     const description = createDescription(
//       'view-model',
//       template,
//       bindables,
//       instructions,
//       allHooks,
//     );

//     const $ViewModel = CustomElement.define(description, class {
//       public static readonly inject = [CallCollection];

//       public $controller: Controller<Node>;
//       public readonly id: number = nextId('au$component');

//       public constructor(
//         public readonly $$calls: CallCollection,
//       ) {}
//     });

//     return addTracingHooks($ViewModel);
//   }

//   function createFixture() {
//     resetId('au$component');

//     const ctx = TestContext.createHTMLTestContext();
//     const { container, lifecycle, dom, scheduler } = ctx;
//     const $loc = h('div');
//     const host = h('div', null, $loc);
//     const loc = dom.convertToRenderLocation($loc);
//     const calls = container.get(CallCollection);

//     recordCalls(Controller, calls);
//     recordCalls(If, calls);

//     return {
//       ctx,
//       calls,
//       container,
//       scheduler,
//       lifecycle,
//       dom,
//       host,
//       loc,
//     };
//   }

//   function tearDown() {
//     stopRecordingCalls(Controller);
//     stopRecordingCalls(If);
//   }

//   describe('forSyntheticView()', function () {
//     it(`correctly executes 1 CustomElement lifecycle`, function () {
//       const {
//         lifecycle,
//         scheduler,
//         container,
//         host,
//         calls,
//       } = createFixture();

//       const flags = LF.none;

//       const ViewModel = createViewModel(
//         h(
//           'div',
//           null,
//           h('au-m', { class: 'au' }),
//           '',
//         ),
//         [],
//         [
//           [
//             new TextBindingInstruction(
//               new Interpolation(['', ''], [new BindingBehaviorExpression(new AccessScopeExpression('id'), 'oneTime', PLATFORM.emptyArray)])
//             ),
//           ],
//         ],
//       );

//       const viewModel = container.get(ViewModel);

//       const sut = Controller.forCustomElement(viewModel, lifecycle, host, container, void 0);

//       const expectedCalls = new CallCollection();

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           .addCall(1, 'created', LF.getterSetterStrategy),
//         '1',
//       );

//       sut.bind(sut, null, flags);

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           .addCall(2, 'bind', LF.none)
//           .addCall(2, 'bindCustomElement', LF.fromBind, sut.scope)
//           .addCall(2, 'bindBindings', LF.fromBind, sut.scope)
//           .addCall(1, 'beforeBind', LF.fromBind)
//           .addCall(2, 'bindControllers', LF.fromBind, sut.scope)
//           .addCall(2, 'endBind', LF.fromBind)
//           .addCall(2, 'afterBind', LF.fromBind)
//           .addCall(1, 'afterBind', LF.fromBind),
//         '2',
//       );

//       sut.attach(sut, null, flags);

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           .addCall(2, 'attach', LF.none)
//           .addCall(2, 'attachCustomElement', LF.fromAttach)
//           .addCall(1, 'beforeAttach', LF.fromAttach)
//           .addCall(2, 'attachControllers', LF.fromAttach),
//         '3',
//       );
//       assert.strictEqual(host.textContent, '', '4');

//       scheduler.getRenderTaskQueue().flush();

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           .addCall(2, 'mount', LF.fromTick)
//           .addCall(2, 'mountCustomElement', LF.fromTick)
//           .addCall(2, 'afterAttachChildren', LF.fromTick)
//           .addCall(1, 'afterAttachChildren', LF.fromTick),
//         '5',
//       );
//       assert.strictEqual(host.textContent, '1', '6');

//       sut.detach(sut, null, flags);

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           .addCall(2, 'detach', LF.none)
//           .addCall(2, 'detachCustomElement', LF.fromDetach)
//           .addCall(1, 'beforeDetach', LF.fromDetach)
//           .addCall(2, 'detachControllers', LF.fromDetach),
//         '7',
//       );
//       assert.strictEqual(host.textContent, '1', '8');

//       scheduler.getRenderTaskQueue().flush();

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           .addCall(2, 'unmount', LF.fromTick)
//           .addCall(2, 'unmountCustomElement', LF.fromTick)
//           .addCall(2, 'afterDetachChildren', LF.fromTick)
//           .addCall(1, 'afterDetachChildren', LF.fromTick),
//         '9',
//       );
//       assert.strictEqual(host.textContent, '', '10');

//       sut.unbind(sut, null, flags);

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           .addCall(2, 'unbind', LF.none)
//           .addCall(2, 'unbindCustomElement', LF.fromUnbind)
//           .addCall(1, 'beforeUnbind', LF.fromUnbind)
//           .addCall(2, 'unbindControllers', LF.fromUnbind)
//           .addCall(2, 'unbindBindings', LF.fromUnbind)
//           .addCall(2, 'endUnbind', LF.fromUnbind)
//           .addCall(2, 'afterUnbindChildren', LF.fromUnbind)
//           .addCall(1, 'afterUnbindChildren', LF.fromUnbind),
//         '11',
//       );

//       tearDown();
//     });

//     it(`correctly executes 1-1 CustomElement+if lifecycles`, function () {
//       const {
//         lifecycle,
//         scheduler,
//         container,
//         host,
//         calls,
//       } = createFixture();

//       const flags = LF.none;

//       const ViewModel = createViewModel(
//         h(
//           'div',
//           null,
//           h('au-m', { class: 'au' }),
//           '',
//           h('au-m', { class: 'au' }),
//         ),
//         [],
//         [
//           [
//             new TextBindingInstruction(parseExpression(`\${id&oneTime}`, BindingType.Interpolation)),
//           ],
//           [
//             new HydrateTemplateController(
//               createDescription(
//                 'if',
//                 h('view-model', { class: 'au' }),
//                 [],
//                 [
//                   [new HydrateElementInstruction('view-model', [])],
//                 ],
//                 noHooks,
//               ),
//               'if',
//               [new ToViewBindingInstruction(parseExpression('id===1&oneTime'), 'value')],
//             ),
//           ],
//         ],
//       );

//       const viewModel = container.get(ViewModel);

//       const sut = Controller.forCustomElement(viewModel, lifecycle, host, container, void 0);

//       const expectedCalls = new CallCollection();

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           // ce #1
//           .addCall(1, 'created', LF.getterSetterStrategy),
//         '1',
//       );

//       sut.bind(sut, null, flags);

//       const ifInstance = sut.controllers[0].bindingContext as unknown as If;
//       const secondCustomElementController = ifInstance.ifView.controllers[0] as ICustomElementController;
//       const secondIfInstance = secondCustomElementController.controllers[0].bindingContext as unknown as If;

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           // ce #1 controller
//           .addCall(2, 'bind', LF.none)
//           .addCall(2, 'bindCustomElement', LF.fromBind, sut.scope)
//           .addCall(2, 'bindBindings', LF.fromBind, sut.scope)

//           // if #1
//           .addCall(3, 'valueChanged', true, false, LF.none)

//           // ce #1
//           .addCall(1, 'beforeBind', LF.fromBind)

//           // ce #1 controller
//           .addCall(2, 'bindControllers', LF.fromBind, sut.scope)

//           // if #1 controller
//           .addCall(4, 'bind', LF.fromBind, sut.scope)
//           .addCall(4, 'bindCustomAttribute', LF.fromBind, sut.scope)

//           // if #1
//           .addCall(3, 'beforeBind', LF.fromBind)
//           .addCall(3, 'swap', true, LF.fromBind)
//           .addCall(3, 'updateView', true, LF.fromBind)
//           .addCall(3, 'ensureView', void 0, ifInstance['ifFactory'], LF.fromBind)

//           // ce #2
//           .addCall(6, 'created', LF.fromBind | LF.getterSetterStrategy)

//           // if #1 ifView
//           .addCall(5, 'hold', ifInstance['location'])

//           // if #1
//           .addCall(3, 'activate', ifInstance.ifView, LF.fromBind)
//           .addCall(3, 'bindView', LF.fromBind)

//           // if #1 ifView
//           .addCall(5, 'bind', LF.fromBind, sut.scope)
//           .addCall(5, 'bindSynthetic', LF.fromBind, sut.scope)
//           .addCall(5, 'bindBindings', LF.fromBind, sut.scope)
//           .addCall(5, 'bindControllers', LF.fromBind, sut.scope)

//           // ce #2 controller
//           .addCall(7, 'bind', LF.fromBind, sut.scope)
//           .addCall(7, 'bindCustomElement', LF.fromBind, secondCustomElementController.scope)
//           .addCall(7, 'bindBindings', LF.fromBind, secondCustomElementController.scope)

//           // ce #2
//           .addCall(6, 'beforeBind', LF.fromBind)

//           // ce #2 controller
//           .addCall(7, 'bindControllers', LF.fromBind, secondCustomElementController.scope)

//           // if #2 controller
//           .addCall(9, 'bind', LF.fromBind, secondCustomElementController.scope)
//           .addCall(9, 'bindCustomAttribute', LF.fromBind, secondCustomElementController.scope)

//           // if #2
//           .addCall(8, 'beforeBind', LF.fromBind)
//           .addCall(8, 'swap', false, LF.fromBind)
//           .addCall(8, 'deactivate', LF.fromBind)
//           .addCall(8, 'updateView', false, LF.fromBind)
//           .addCall(8, 'activate', secondIfInstance.elseView, LF.fromBind)

//           // if #2 controller
//           .addCall(9, 'endBind', LF.fromBind)

//           // ce #2 controller
//           .addCall(7, 'endBind', LF.fromBind)

//           // if #1 ifView
//           .addCall(5, 'endBind', LF.fromBind)

//           // if #1 controller
//           .addCall(4, 'endBind', LF.fromBind)

//           // ce #1 controller
//           .addCall(2, 'endBind', LF.fromBind)

//           // ce #2 controller
//           .addCall(7, 'afterBind', LF.fromBind)

//           // ce #2
//           .addCall(6, 'afterBind', LF.fromBind)

//           // ce #1 controller
//           .addCall(2, 'afterBind', LF.fromBind)

//           // ce #1
//           .addCall(1, 'afterBind', LF.fromBind),
//         '2',
//       );

//       sut.attach(sut, null, flags);

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           // ce #1 controller
//           .addCall(2, 'attach', LF.none)
//           .addCall(2, 'attachCustomElement', LF.fromAttach)

//           // ce #1
//           .addCall(1, 'beforeAttach', LF.fromAttach)

//           // ce #1 controller
//           .addCall(2, 'attachControllers', LF.fromAttach)

//           // if #1 controller
//           .addCall(4, 'attach', LF.fromAttach)
//           .addCall(4, 'attachCustomAttribute', LF.fromAttach)

//           // if #1
//           .addCall(3, 'beforeAttach', LF.fromAttach)
//           .addCall(3, 'attachView', LF.fromAttach)

//           // if #1 ifView
//           .addCall(5, 'attach', LF.fromAttach)
//           .addCall(5, 'attachSynthetic', LF.fromAttach)
//           .addCall(5, 'attachControllers', LF.fromAttach)

//           // ce #2 controller
//           .addCall(7, 'attach', LF.fromAttach)
//           .addCall(7, 'attachCustomElement', LF.fromAttach)

//           // ce #2
//           .addCall(6, 'beforeAttach', LF.fromAttach)

//           // ce #2 controller
//           .addCall(7, 'attachControllers', LF.fromAttach)

//           // if #2 controller
//           .addCall(9, 'attach', LF.fromAttach)
//           .addCall(9, 'attachCustomAttribute', LF.fromAttach)

//           // if #2
//           .addCall(8, 'beforeAttach', LF.fromAttach)
//           .addCall(8, 'attachView', LF.fromAttach),
//         '3',
//       );
//       assert.strictEqual(host.textContent, '', '4');

//       scheduler.getRenderTaskQueue().flush();

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           // ce #1 controller
//           .addCall(2, 'mount', LF.fromTick)
//           .addCall(2, 'mountCustomElement', LF.fromTick)

//           // if #1 ifView
//           .addCall(5, 'mount', LF.fromTick)
//           .addCall(5, 'mountSynthetic', LF.fromTick)

//           // ce #2 controller
//           .addCall(7, 'mount', LF.fromTick)
//           .addCall(7, 'mountCustomElement', LF.fromTick)

//           .addCall(7, 'afterAttachChildren', LF.fromTick)

//           // ce #2
//           .addCall(6, 'afterAttachChildren', LF.fromTick)

//           // ce #1 controller
//           .addCall(2, 'afterAttachChildren', LF.fromTick)

//           // ce #1
//           .addCall(1, 'afterAttachChildren', LF.fromTick),
//         '5',
//       );
//       assert.strictEqual(host.textContent, '16', '6');

//       sut.detach(sut, null, flags);

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           // ce #1 controller
//           .addCall(2, 'detach', LF.none)
//           .addCall(2, 'detachCustomElement', LF.fromDetach)

//           // ce #1
//           .addCall(1, 'beforeDetach', LF.fromDetach)

//           // ce #1 controller
//           .addCall(2, 'detachControllers', LF.fromDetach)

//           // if #1 controller
//           .addCall(4, 'detach', LF.fromDetach)
//           .addCall(4, 'detachCustomAttribute', LF.fromDetach)

//           // if #1
//           .addCall(3, 'beforeDetach', LF.fromDetach)

//           // if #1 ifView
//           .addCall(5, 'detach', LF.fromDetach)
//           .addCall(5, 'detachSynthetic', LF.fromDetach)
//           .addCall(5, 'detachControllers', LF.fromDetach)

//           // ce #2 controller
//           .addCall(7, 'detach', LF.fromDetach)
//           .addCall(7, 'detachCustomElement', LF.fromDetach)

//           // ce #2
//           .addCall(6, 'beforeDetach', LF.fromDetach)

//           // ce #2 controller
//           .addCall(7, 'detachControllers', LF.fromDetach)

//           // if #2 controller
//           .addCall(9, 'detach', LF.fromDetach)
//           .addCall(9, 'detachCustomAttribute', LF.fromDetach)

//           // if #2
//           .addCall(8, 'beforeDetach', LF.fromDetach),
//         '7',
//       );
//       assert.strictEqual(host.textContent, '16', '8');

//       scheduler.getRenderTaskQueue().flush();

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           // ce #1 controller
//           .addCall(2, 'unmount', LF.fromTick)
//           .addCall(2, 'unmountCustomElement', LF.fromTick)

//           // if #1 ifView
//           .addCall(5, 'unmount', LF.fromTick)
//           .addCall(5, 'unmountSynthetic', LF.fromTick)

//           // ce #2 controller
//           .addCall(7, 'unmount', LF.fromTick)
//           .addCall(7, 'unmountCustomElement', LF.fromTick)

//           .addCall(7, 'afterDetachChildren', LF.fromTick)

//           // ce #2
//           .addCall(6, 'afterDetachChildren', LF.fromTick)

//           // ce #1 controller
//           .addCall(2, 'afterDetachChildren', LF.fromTick)

//           // ce #1
//           .addCall(1, 'afterDetachChildren', LF.fromTick)
//         ,
//         '9',
//       );
//       assert.strictEqual(host.textContent, '', '10');

//       sut.unbind(sut, null, flags);

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           // ce #1 controller
//           .addCall(2, 'unbind', LF.none)
//           .addCall(2, 'unbindCustomElement', LF.fromUnbind)

//           // ce #1
//           .addCall(1, 'beforeUnbind', LF.fromUnbind)

//           // ce #1 controller
//           .addCall(2, 'unbindControllers', LF.fromUnbind)

//           // if #1 controller
//           .addCall(4, 'unbind', LF.fromUnbind)
//           .addCall(4, 'unbindCustomAttribute', LF.fromUnbind)

//           // if #1
//           .addCall(3, 'beforeUnbind', LF.fromUnbind)

//           // if #1 ifView
//           .addCall(5, 'unbind', LF.fromUnbind)
//           .addCall(5, 'unbindSynthetic', LF.fromUnbind)
//           .addCall(5, 'unbindControllers', LF.fromUnbind)

//           // ce #2 controller
//           .addCall(7, 'unbind', LF.fromUnbind)
//           .addCall(7, 'unbindCustomElement', LF.fromUnbind)

//           // ce #2
//           .addCall(6, 'beforeUnbind', LF.fromUnbind)

//           // ce #2 controller
//           .addCall(7, 'unbindControllers', LF.fromUnbind)

//           // if #2 controller
//           .addCall(9, 'unbind', LF.fromUnbind)
//           .addCall(9, 'unbindCustomAttribute', LF.fromUnbind)

//           // if #2
//           .addCall(8, 'beforeUnbind', LF.fromUnbind)

//           // if #2 controller
//           .addCall(9, 'endUnbind', LF.fromUnbind)

//           // ce #2 controller
//           .addCall(7, 'unbindBindings', LF.fromUnbind)
//           .addCall(7, 'endUnbind', LF.fromUnbind)

//           // if #1 ifView
//           .addCall(5, 'unbindBindings', LF.fromUnbind)
//           .addCall(5, 'endUnbind', LF.fromUnbind)

//           // if #1 controller
//           .addCall(4, 'endUnbind', LF.fromUnbind)

//           // ce #1 controller
//           .addCall(2, 'unbindBindings', LF.fromUnbind)
//           .addCall(2, 'endUnbind', LF.fromUnbind)

//           // ce #2 controller
//           .addCall(7, 'afterUnbindChildren', LF.fromUnbind)

//           // ce #2
//           .addCall(6, 'afterUnbindChildren', LF.fromUnbind)

//           // ce #1 controller
//           .addCall(2, 'afterUnbindChildren', LF.fromUnbind)

//           // ce #1
//           .addCall(1, 'afterUnbindChildren', LF.fromUnbind),
//         '11',
//       );

//       tearDown();
//     });

//     it(`correctly executes 1-1 CustomElement+if with bindables lifecycles`, function () {
//       const {
//         lifecycle,
//         scheduler,
//         container,
//         host,
//         calls,
//       } = createFixture();

//       const flags = LF.none;

//       const ViewModel = createViewModel(
//         h(
//           'div',
//           null,
//           h('au-m', { class: 'au' }),
//           '',
//           h('au-m', { class: 'au' }),
//         ),
//         [
//           'msg',
//         ],
//         [
//           [
//             new TextBindingInstruction(parseExpression(`\${msg}`, BindingType.Interpolation)),
//           ],
//           [
//             new HydrateTemplateController(
//               createDescription(
//                 'if',
//                 h('view-model', { class: 'au' }),
//                 [],
//                 [
//                   [
//                     new HydrateElementInstruction(
//                       'view-model',
//                       [new ToViewBindingInstruction(parseExpression('msg'), 'msg')],
//                     ),
//                   ],
//                 ],
//                 noHooks,
//               ),
//               'if',
//               [new ToViewBindingInstruction(parseExpression('id===1&oneTime'), 'value')],
//             ),
//           ],
//         ],
//       );

//       const viewModel = container.get(ViewModel);
//       viewModel['msg'] = 'hi';

//       const sut = Controller.forCustomElement(viewModel, lifecycle, host, container, void 0);

//       const expectedCalls = new CallCollection();

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           // ce #1
//           .addCall(1, 'created', LF.getterSetterStrategy),
//         '1',
//       );

//       sut.bind(sut, null, flags);

//       const ifInstance = sut.controllers[0].bindingContext as unknown as If;
//       const secondCustomElementController = ifInstance.ifView.controllers[0] as ICustomElementController;
//       const secondIfInstance = secondCustomElementController.controllers[0].bindingContext as unknown as If;

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           // ce #1 controller
//           .addCall(2, 'bind', LF.none)
//           .addCall(2, 'bindCustomElement', LF.fromBind, sut.scope)
//           .addCall(2, 'bindBindings', LF.fromBind, sut.scope)

//           // if #1
//           .addCall(3, 'valueChanged', true, false, LF.none)

//           // ce #1
//           .addCall(1, 'beforeBind', LF.fromBind)

//           // ce #1 controller
//           .addCall(2, 'bindControllers', LF.fromBind, sut.scope)

//           // if #1 controller
//           .addCall(4, 'bind', LF.fromBind, sut.scope)
//           .addCall(4, 'bindCustomAttribute', LF.fromBind, sut.scope)

//           // if #1
//           .addCall(3, 'beforeBind', LF.fromBind)
//           .addCall(3, 'swap', true, LF.fromBind)
//           .addCall(3, 'updateView', true, LF.fromBind)
//           .addCall(3, 'ensureView', void 0, ifInstance['ifFactory'], LF.fromBind)

//           // ce #2
//           .addCall(6, 'created', LF.fromBind | LF.getterSetterStrategy)

//           // if #1 ifView
//           .addCall(5, 'hold', ifInstance['location'])

//           // if #1
//           .addCall(3, 'activate', ifInstance.ifView, LF.fromBind)
//           .addCall(3, 'bindView', LF.fromBind)

//           // if #1 ifView
//           .addCall(5, 'bind', LF.fromBind, sut.scope)
//           .addCall(5, 'bindSynthetic', LF.fromBind, sut.scope)
//           .addCall(5, 'bindBindings', LF.fromBind, sut.scope)
//           .addCall(5, 'bindControllers', LF.fromBind, sut.scope)

//           // ce #2 controller
//           .addCall(7, 'bind', LF.fromBind, sut.scope)
//           .addCall(7, 'bindCustomElement', LF.fromBind, secondCustomElementController.scope)
//           .addCall(7, 'bindBindings', LF.fromBind, secondCustomElementController.scope)

//           // ce #2
//           .addCall(6, 'beforeBind', LF.fromBind)

//           // ce #2 controller
//           .addCall(7, 'bindControllers', LF.fromBind, secondCustomElementController.scope)

//           // if #2 controller
//           .addCall(9, 'bind', LF.fromBind, secondCustomElementController.scope)
//           .addCall(9, 'bindCustomAttribute', LF.fromBind, secondCustomElementController.scope)

//           // if #2
//           .addCall(8, 'beforeBind', LF.fromBind)
//           .addCall(8, 'swap', false, LF.fromBind)
//           .addCall(8, 'deactivate', LF.fromBind)
//           .addCall(8, 'updateView', false, LF.fromBind)
//           .addCall(8, 'activate', secondIfInstance.elseView, LF.fromBind)

//           // if #2 controller
//           .addCall(9, 'endBind', LF.fromBind)

//           // ce #2 controller
//           .addCall(7, 'endBind', LF.fromBind)

//           // if #1 ifView
//           .addCall(5, 'endBind', LF.fromBind)

//           // if #1 controller
//           .addCall(4, 'endBind', LF.fromBind)

//           // ce #1 controller
//           .addCall(2, 'endBind', LF.fromBind)

//           // ce #2 controller
//           .addCall(7, 'afterBind', LF.fromBind)

//           // ce #2
//           .addCall(6, 'afterBind', LF.fromBind)

//           // ce #1 controller
//           .addCall(2, 'afterBind', LF.fromBind)

//           // ce #1
//           .addCall(1, 'afterBind', LF.fromBind),
//         '2',
//       );

//       sut.attach(sut, null, flags);

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           // ce #1 controller
//           .addCall(2, 'attach', LF.none)
//           .addCall(2, 'attachCustomElement', LF.fromAttach)

//           // ce #1
//           .addCall(1, 'beforeAttach', LF.fromAttach)

//           // ce #1 controller
//           .addCall(2, 'attachControllers', LF.fromAttach)

//           // if #1 controller
//           .addCall(4, 'attach', LF.fromAttach)
//           .addCall(4, 'attachCustomAttribute', LF.fromAttach)

//           // if #1
//           .addCall(3, 'beforeAttach', LF.fromAttach)
//           .addCall(3, 'attachView', LF.fromAttach)

//           // if #1 ifView
//           .addCall(5, 'attach', LF.fromAttach)
//           .addCall(5, 'attachSynthetic', LF.fromAttach)
//           .addCall(5, 'attachControllers', LF.fromAttach)

//           // ce #2 controller
//           .addCall(7, 'attach', LF.fromAttach)
//           .addCall(7, 'attachCustomElement', LF.fromAttach)

//           // ce #2
//           .addCall(6, 'beforeAttach', LF.fromAttach)

//           // ce #2 controller
//           .addCall(7, 'attachControllers', LF.fromAttach)

//           // if #2 controller
//           .addCall(9, 'attach', LF.fromAttach)
//           .addCall(9, 'attachCustomAttribute', LF.fromAttach)

//           // if #2
//           .addCall(8, 'beforeAttach', LF.fromAttach)
//           .addCall(8, 'attachView', LF.fromAttach),
//         '3',
//       );
//       assert.strictEqual(host.textContent, '', '4');

//       scheduler.getRenderTaskQueue().flush();

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           // ce #1 controller
//           .addCall(2, 'mount', LF.fromTick)
//           .addCall(2, 'mountCustomElement', LF.fromTick)

//           // if #1 ifView
//           .addCall(5, 'mount', LF.fromTick)
//           .addCall(5, 'mountSynthetic', LF.fromTick)

//           // ce #2 controller
//           .addCall(7, 'mount', LF.fromTick)
//           .addCall(7, 'mountCustomElement', LF.fromTick)

//           .addCall(7, 'afterAttachChildren', LF.fromTick)

//           // ce #2
//           .addCall(6, 'afterAttachChildren', LF.fromTick)

//           // ce #1 controller
//           .addCall(2, 'afterAttachChildren', LF.fromTick)

//           // ce #1
//           .addCall(1, 'afterAttachChildren', LF.fromTick),
//         '5',
//       );
//       assert.strictEqual(host.textContent, 'hihi', '6');

//       sut.detach(sut, null, flags);

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           // ce #1 controller
//           .addCall(2, 'detach', LF.none)
//           .addCall(2, 'detachCustomElement', LF.fromDetach)

//           // ce #1
//           .addCall(1, 'beforeDetach', LF.fromDetach)

//           // ce #1 controller
//           .addCall(2, 'detachControllers', LF.fromDetach)

//           // if #1 controller
//           .addCall(4, 'detach', LF.fromDetach)
//           .addCall(4, 'detachCustomAttribute', LF.fromDetach)

//           // if #1
//           .addCall(3, 'beforeDetach', LF.fromDetach)

//           // if #1 ifView
//           .addCall(5, 'detach', LF.fromDetach)
//           .addCall(5, 'detachSynthetic', LF.fromDetach)
//           .addCall(5, 'detachControllers', LF.fromDetach)

//           // ce #2 controller
//           .addCall(7, 'detach', LF.fromDetach)
//           .addCall(7, 'detachCustomElement', LF.fromDetach)

//           // ce #2
//           .addCall(6, 'beforeDetach', LF.fromDetach)

//           // ce #2 controller
//           .addCall(7, 'detachControllers', LF.fromDetach)

//           // if #2 controller
//           .addCall(9, 'detach', LF.fromDetach)
//           .addCall(9, 'detachCustomAttribute', LF.fromDetach)

//           // if #2
//           .addCall(8, 'beforeDetach', LF.fromDetach),
//         '7',
//       );
//       assert.strictEqual(host.textContent, 'hihi', '8');

//       scheduler.getRenderTaskQueue().flush();

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           // ce #1 controller
//           .addCall(2, 'unmount', LF.fromTick)
//           .addCall(2, 'unmountCustomElement', LF.fromTick)

//           // if #1 ifView
//           .addCall(5, 'unmount', LF.fromTick)
//           .addCall(5, 'unmountSynthetic', LF.fromTick)

//           // ce #2 controller
//           .addCall(7, 'unmount', LF.fromTick)
//           .addCall(7, 'unmountCustomElement', LF.fromTick)

//           .addCall(7, 'afterDetachChildren', LF.fromTick)

//           // ce #2
//           .addCall(6, 'afterDetachChildren', LF.fromTick)

//           // ce #1 controller
//           .addCall(2, 'afterDetachChildren', LF.fromTick)

//           // ce #1
//           .addCall(1, 'afterDetachChildren', LF.fromTick)
//         ,
//         '9',
//       );
//       assert.strictEqual(host.textContent, '', '10');

//       sut.unbind(sut, null, flags);

//       assert.deepStrictEqual(
//         calls,
//         expectedCalls
//           // ce #1 controller
//           .addCall(2, 'unbind', LF.none)
//           .addCall(2, 'unbindCustomElement', LF.fromUnbind)

//           // ce #1
//           .addCall(1, 'beforeUnbind', LF.fromUnbind)

//           // ce #1 controller
//           .addCall(2, 'unbindControllers', LF.fromUnbind)

//           // if #1 controller
//           .addCall(4, 'unbind', LF.fromUnbind)
//           .addCall(4, 'unbindCustomAttribute', LF.fromUnbind)

//           // if #1
//           .addCall(3, 'beforeUnbind', LF.fromUnbind)

//           // if #1 ifView
//           .addCall(5, 'unbind', LF.fromUnbind)
//           .addCall(5, 'unbindSynthetic', LF.fromUnbind)
//           .addCall(5, 'unbindControllers', LF.fromUnbind)

//           // ce #2 controller
//           .addCall(7, 'unbind', LF.fromUnbind)
//           .addCall(7, 'unbindCustomElement', LF.fromUnbind)

//           // ce #2
//           .addCall(6, 'beforeUnbind', LF.fromUnbind)

//           // ce #2 controller
//           .addCall(7, 'unbindControllers', LF.fromUnbind)

//           // if #2 controller
//           .addCall(9, 'unbind', LF.fromUnbind)
//           .addCall(9, 'unbindCustomAttribute', LF.fromUnbind)

//           // if #2
//           .addCall(8, 'beforeUnbind', LF.fromUnbind)

//           // if #2 controller
//           .addCall(9, 'endUnbind', LF.fromUnbind)

//           // ce #2 controller
//           .addCall(7, 'unbindBindings', LF.fromUnbind)
//           .addCall(7, 'endUnbind', LF.fromUnbind)

//           // if #1 ifView
//           .addCall(5, 'unbindBindings', LF.fromUnbind)
//           .addCall(5, 'endUnbind', LF.fromUnbind)

//           // if #1 controller
//           .addCall(4, 'endUnbind', LF.fromUnbind)

//           // ce #1 controller
//           .addCall(2, 'unbindBindings', LF.fromUnbind)
//           .addCall(2, 'endUnbind', LF.fromUnbind)

//           // ce #2 controller
//           .addCall(7, 'afterUnbindChildren', LF.fromUnbind)

//           // ce #2
//           .addCall(6, 'afterUnbindChildren', LF.fromUnbind)

//           // ce #1 controller
//           .addCall(2, 'afterUnbindChildren', LF.fromUnbind)

//           // ce #1
//           .addCall(1, 'afterUnbindChildren', LF.fromUnbind),
//         '11',
//       );

//       tearDown();
//     });
//   });
// });

// /**
//  * ```
//  * (incomplete notes)
//  * - repeater
//  *   - array
//  *     - add/replace/remove/reorder * start/middle/end/all
//  *   - map
//  *     - set/remove/clear * start/middle/end/all
//  *   - set
//  *     - set/remove/clear * start/middle/end/all
//  * - if
//  *   - under repeater
//  *   - above repeater
//  * - replaceable
//  *   - if on the replaceable
//  *   - repeater on the replaceable
//  *   - if on the part
//  *   - repeater on the part
//  * - with
//  *   - under any scope
//  * - compose
//  *   - everything else as sync
//  *   - everything else as async
//  *
//  * content:
//  * - shallow observers
//  *   - bind/to-view/from-view/two-way/one-time * self/setter / attribute-ns/data-attribute/checked/style/class/svg/value-attribute/select/element-property/element-attribute
//  *
//  * /call/ref/let/interpolation/listener
//  *
//  *
//  * - ce -> if -> ce
//  * - ce -> if -> if
//  * - ce -> if -> repeat
//  * - ce -> if -> with
//  * - ce -> if -> compose
//  *
//  * - ce -> repeat -> ce
//  * - ce -> with -> ce
//  * - ce -> compose -> ce
//  * - ce -> replace -> ce -> replaceable
//  * - ce -> if -> ce
//  * - custom-element -> repeat -> view
//  *```
//  */
