// import {
//   DI,
//   IContainer,
//   Registration
// } from '@aurelia/kernel';
// import { expect } from 'chai';
// import {
//   AccessMember,
//   AccessScope,
//   Aurelia,
//   Binding,
//   BindingIdentifier,
//   BindingMode,
//   ForOfStatement,
//   ICustomElement,
//   IDOM,
//   IExpressionParser,
//   ILifecycle,
//   INode,
//   Interpolation,
//   IObservedArray,
//   ITemplateDefinition,
//   IView,
//   Lifecycle,
//   LifecycleFlags,
//   ObservedCollection,
//   ObserverLocator,
//   Repeat,
//   RuntimeBehavior,
//   State,
//   TargetedInstructionType,
//   ViewFactory
// } from '@aurelia/runtime';
// import {
//   MockIfElseTextNodeTemplate,
//   MockNodeSequence
// } from '../../mock';
// import { createScopeForTest } from '../../shared';
// import {
//   createRepeater,
//   eachCartesianJoinFactory
// } from '../../util';

// const expressions = {
//   item: new AccessScope('item'),
//   items: new ForOfStatement(new BindingIdentifier('item'), new AccessScope('items')),
//   show: new AccessScope('show', 0)
// };

// function verifyViewBindingContexts(views: IView[], items: any[]): void {
//   if (items == null) {
//     return;
//   }
//   if (typeof items === 'number') {
//     for (let i = 0, ii = views.length; i < ii; ++i) {
//       expect(views[i].$scope.bindingContext['item']).to.equal(i);
//     }
//   } else {
//     for (let i = 0, ii = views.length; i < ii; ++i) {
//       expect(views[i].$scope.bindingContext['item']).to.equal(items[i]);
//     }
//   }
// }

// function setup<T extends ObservedCollection>() {
//   const host = document.createElement('div');
//   const location = document.createComment('au-loc');
//   host.appendChild(location);
//   const container = DI.createContainer();
//   container.register(domRegistration);
//   const lifecycle = container.get(ILifecycle) as Lifecycle;

//   const observerLocator = new ObserverLocator(dom, lifecycle, null, null, null);
//   const factory = new ViewFactory(null, new MockIfElseTextNodeTemplate(dom, expressions.show, observerLocator, lifecycle, container) as any, lifecycle);
//   const renderable = { } as any;
//   const sut = new Repeat<T>(location, renderable, factory);
//   renderable.$componentHead = renderable.$componentTail = new Binding(expressions.items, sut, 'items', BindingMode.toView, null, container as any);
//   sut.$state = 0;
//   sut.$scope = null;
//   const behavior = RuntimeBehavior.create(Repeat as any, sut);
//   behavior.applyTo(sut, lifecycle);

//   return { sut, host, lifecycle };
// }

// describe(`Repeat`, function () {

//   eachCartesianJoinFactory([
//     // initial input items
//     [
//       () => [[{if: 1, else: 2}, {if: 3, else: 4}],   2, true,  `13`, `24`, `[{if:1,else:2},{if:3,else:4}] show=true `],
//       () => [[{if: 1, else: 2}, {if: 3, else: 4}],   2, false, `13`, `24`, `[{if:1,else:2},{if:3,else:4}] show=false`]
//     ] as (() => [any, number, boolean, string, string, string])[],
//     // first operation "execute1" (initial bind + attach)
//     [

//       ([items, count, show, trueValue, falseValue]) => [(sut, host, lifecycle) => {
//         sut.$bind(LifecycleFlags.fromBind, createScopeForTest({ show }));

//         expect(sut.views.length).to.equal(count, `execute1, sut.views.length`);
//         expect(host.textContent).to.equal('', `execute1, host.textContent`);
//         verifyViewBindingContexts(sut.views, items);

//         lifecycle.beginAttach();
//         sut.$attach(LifecycleFlags.none);
//         lifecycle.endAttach(LifecycleFlags.none);

//         expect(sut.views.length).to.equal(count, `execute1, sut.views.length`);
//         expect(sut.$scope.bindingContext.show).to.equal(show);
//         expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? trueValue : falseValue, `execute1, host.textContent`);

//       }, `$bind(fromBind)  -> $attach(none)`],

//       ([items, count, show, trueValue, falseValue]) => [(sut, host, lifecycle) => {
//         sut.$bind(LifecycleFlags.fromFlush, createScopeForTest({ show }));

//         expect(sut.views.length).to.equal(count, `execute1, sut.views.length`);
//         expect(host.textContent).to.equal('', `execute1, host.textContent`);
//         verifyViewBindingContexts(sut.views, items);

//         lifecycle.beginAttach();
//         sut.$attach(LifecycleFlags.none);
//         lifecycle.endAttach(LifecycleFlags.none);

//         expect(sut.$scope.bindingContext.show).to.equal(show);
//         expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? trueValue : falseValue, `execute1, host.textContent`);

//       }, `$bind(fromFlush) -> $attach(none)`]
//     ] as (($1: [any, number, boolean, string, string, string]) => [(sut: Repeat, host: Node, lifecycle: Lifecycle) => void, string])[],
//     // second operation "execute2" (second bind or noop)
//     [

//       ([items, count, show, trueValue, falseValue]) => [(sut, host, lifecycle) => {
//         sut.$bind(LifecycleFlags.fromBind, sut.$scope);

//         expect(sut.views.length).to.equal(count, `execute1, sut.views.length`);
//         verifyViewBindingContexts(sut.views, items);

//         expect(sut.$scope.bindingContext.show).to.equal(show);
//         expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? trueValue : falseValue, `execute2, host.textContent`);

//       }, `$bind(fromBind), same scope`],

//       ([items, count, show, trueValue, falseValue]) => [(sut, host, lifecycle) => {
//         sut.$bind(LifecycleFlags.fromBind, createScopeForTest({ show }));

//         expect(sut.views.length).to.equal(count, `execute1, sut.views.length`);
//         verifyViewBindingContexts(sut.views, items);

//         expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? trueValue : falseValue, `execute2, host.textContent`);

//         lifecycle.processFlushQueue(LifecycleFlags.none);

//         expect(sut.$scope.bindingContext.show).to.equal(show);
//         expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? trueValue : falseValue, `execute2, host.textContent`);

//       }, `$bind(fromBind), new scope `],

//       ([items, count, show, trueValue, falseValue]) => [(sut, host, lifecycle) => {
//         sut.$bind(LifecycleFlags.fromFlush, createScopeForTest({ show }));

//         expect(sut.views.length).to.equal(count, `execute1, sut.views.length`);
//         verifyViewBindingContexts(sut.views, items);

//         expect(sut.$scope.bindingContext.show).to.equal(show);
//         expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? trueValue : falseValue, `execute2, host.textContent`);

//       }, `$bind(fromFlush), new scope`],

//       ([, ]) => [() => {

//       }, `noop                       `]
//     ] as (($1: [any, number, boolean, string, string, string]) => [(sut: Repeat, host: Node, lifecycle: Lifecycle) => void, string])[],
//     // third operation "execute3" (change value)
//     [

//       ([items, count, show, trueValue, falseValue]) => [(sut, host, lifecycle) => {
//         sut.$scope.bindingContext.show = !sut.$scope.bindingContext.show;

//         lifecycle.processFlushQueue(LifecycleFlags.none);

//         expect(sut.$scope.bindingContext.show).not.to.equal(show);
//         expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? trueValue : falseValue, `execute3, host.textContent`);

//       }, `show=!show    `],

//       ([items, count, show, trueValue, falseValue]) => [(sut, host, lifecycle) => {
//         sut.$scope.bindingContext.show = !sut.$scope.bindingContext.show;
//         expect(sut.$scope.bindingContext.show).not.to.equal(show);
//         sut.$scope.bindingContext.show = !sut.$scope.bindingContext.show;
//         expect(sut.$scope.bindingContext.show).to.equal(show);

//         lifecycle.processFlushQueue(LifecycleFlags.none);

//         expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? trueValue : falseValue, `execute3, host.textContent`);

//       }, `show=!show(x2)`],

//       // NOTE: these (and other tests) need to get fixed. Currently mutations don't appear to be picked up automatically.
//       // Not sure yet whether this is a repeater problem or an if/else problem (or perhaps both)

//       // ([items, count, show, trueValue, falseValue]) => [(sut, host, lifecycle) => {
//       //   const newItems = sut.items = [{if:'a',else:'b'}];
//       //   sut.itemsChanged(newItems, items, LifecycleFlags.updateTargetInstance);
//       //   verifyViewBindingContexts(sut.views, newItems);

//       //   lifecycle.processFlushQueue(LifecycleFlags.none)

//       //   expect(sut.views.length).to.equal(1, `execute3, sut.views.length`);
//       //   expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? 'a' : 'b', `execute3, host.textContent`);

//       // }, `assign=[{if:'a',else:'b'}]`],

//       // ([items, count, show, trueValue, falseValue]) => [(sut, host, lifecycle) => {
//       //   sut.items.push({if:'a',else:'b'});

//       //   lifecycle.processFlushQueue(LifecycleFlags.none)
//       //   verifyViewBindingContexts(sut.views, sut.items);

//       //   expect(sut.views.length).to.equal(count + 1, `execute3, sut.views.length`);
//       //   expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? `${trueValue}a` : `${falseValue}b`, `execute3, host.textContent`);

//       // }, `push={if:'a',else:'b'}`]
//     ] as (($1: [any, number, boolean, string, string, string]) => [(sut: Repeat, host: Node, lifecycle: Lifecycle) => void, string])[],
//   ],                       (
//     [items1, count, show, trueValue, falseValue, text1],
//     [exec1, exec1Text],
//     [exec2, exec2Text],
//     [exec3, exec3Text]) => {
//     it(`assign=${text1} -> ${exec1Text} -> ${exec2Text} -> ${exec3Text}`, function () {
//       const { sut, host, lifecycle } = setup<IObservedArray>();
//       sut.items = items1;

//       exec1(sut, host, lifecycle);
//       exec2(sut, host, lifecycle);
//       exec3(sut, host, lifecycle);
//     });
//   });
// });

// describe('ArrayRepeater - render html', function () {
//   let container: IContainer;
//   let lifecycle: ILifecycle;
//   let au: Aurelia;
//   let host: INode;

//   let aureliaConfig: any;
//   let component: ICustomElement;

//   beforeEach(function () {
//     container = DI.createContainer();
//     container.register(domRegistration);
//     lifecycle = container.get(ILifecycle);
//     au = new Aurelia(container as any);
//     host = document.createElement('app');
//     dom.appendChild(document.body, host);
//   });

//   it('triple nested repeater should render correctly', function () {
//     const initItems = [
//       {
//         id: 1,
//         innerTodos: [
//           { innerId: 10, innerInnerTodos: [ { innerInnerId: 100 }, { innerInnerId: 101 }, { innerInnerId: 102 } ] },
//           { innerId: 11, innerInnerTodos: [ { innerInnerId: 110 }, { innerInnerId: 111 }, { innerInnerId: 112 } ] },
//           { innerId: 12, innerInnerTodos: [ { innerInnerId: 120 }, { innerInnerId: 121 }, { innerInnerId: 122 } ] }
//         ]
//       },
//       { id: 2,
//         innerTodos: [
//           { innerId: 20, innerInnerTodos: [ { innerInnerId: 200 }, { innerInnerId: 201 }, { innerInnerId: 202 } ] },
//           { innerId: 21, innerInnerTodos: [ { innerInnerId: 210 }, { innerInnerId: 211 }, { innerInnerId: 212 } ] },
//           { innerId: 22, innerInnerTodos: [ { innerInnerId: 220 }, { innerInnerId: 221 }, { innerInnerId: 222 } ] }
//         ]
//       },
//       { id: 3,
//         innerTodos: [
//           { innerId: 30, innerInnerTodos: [ { innerInnerId: 300 }, { innerInnerId: 301 }, { innerInnerId: 302 } ] },
//           { innerId: 31, innerInnerTodos: [ { innerInnerId: 310 }, { innerInnerId: 311 }, { innerInnerId: 312 } ] },
//           { innerId: 32, innerInnerTodos: [ { innerInnerId: 320 }, { innerInnerId: 321 }, { innerInnerId: 322 } ] }
//         ]
//       },
//     ];
//     const expressionCache = {
//       todos: new ForOfStatement(new BindingIdentifier('todo'), new AccessScope('todos')),
//       id: new Interpolation(['', ''], [new AccessMember(new AccessScope('todo'), 'id')]),
//       length: new Interpolation(['', ''], [new AccessMember(new AccessMember(new AccessScope('todo'), 'innerTodos'), 'length')]),
//       innerTodos: new ForOfStatement(new BindingIdentifier('innerTodo'), new AccessMember(new AccessScope('todo'), 'innerTodos')),
//       innerId: new Interpolation(['', ''], [new AccessMember(new AccessScope('innerTodo'), 'innerId')]),
//       innerLength: new Interpolation(['', ''], [new AccessMember(new AccessMember(new AccessScope('innerTodo'), 'innerInnerTodos'), 'length')]),
//       innerInnerTodos: new ForOfStatement(new BindingIdentifier('innerInnerTodo'), new AccessMember(new AccessScope('innerTodo'), 'innerInnerTodos')),
//       innerInnerId: new Interpolation(['', ''], [new AccessMember(new AccessScope('innerInnerTodo'), 'innerInnerId')])
//     };
//     aureliaConfig = {
//       register(container: IContainer) {
//         (container.get(IExpressionParser) as IExpressionParser).cache(expressionCache);
//         container.register(domRegistration);
//         container.register(Repeat as any);
//         container.register(HtmlRenderer as any);
//       }
//     };
//     au.register(aureliaConfig as any);
//     const templateSource: ITemplateDefinition = {
//       name: 'app',
//       build: { required: false },
//       dependencies: [],
//       template: `<span class="au"></span> `,
//       instructions: [
//         [
//           {
//             type: TargetedInstructionType.hydrateTemplateController,
//             res: 'repeat',
//             def: {
//               cache: '*',
//               template: `<span class="au"></span> <span class="au"></span> <span class="au"></span> `,
//               instructions: [
//                 [ { type: TargetedInstructionType.textBinding, from: 'id' } ],
//                 [ { type: TargetedInstructionType.textBinding, from: 'length' } ],
//                 [
//                   {
//                     type: TargetedInstructionType.hydrateTemplateController,
//                     res: 'repeat',
//                     def: {
//                       cache: '*',
//                       template: `<span class="au"></span> <span class="au"></span> <span class="au"></span> `,
//                       instructions: [
//                         [ { type: TargetedInstructionType.textBinding, from: 'innerId' } ],
//                         [ { type: TargetedInstructionType.textBinding, from: 'innerLength' } ],
//                         [
//                           {
//                             type: TargetedInstructionType.hydrateTemplateController,
//                             res: 'repeat',
//                             def: {
//                               cache: '*',
//                               template: `<span class="au"></span> `,
//                               instructions: [
//                                 [ { type: TargetedInstructionType.textBinding, from: 'innerInnerId' } ]
//                               ]
//                             },
//                             instructions: [
//                               { type: TargetedInstructionType.iteratorBinding, from: 'innerInnerTodos', to: 'items' },
//                               { type: TargetedInstructionType.setProperty, value: 'innerInnerTodo', to: 'local' },
//                               { type: TargetedInstructionType.setProperty, value: false, to: 'visualsRequireLifecycle' }
//                             ]
//                           }
//                         ]
//                       ]
//                     },
//                     instructions: [
//                       { type: TargetedInstructionType.iteratorBinding, from: 'innerTodos', to: 'items' },
//                       { type: TargetedInstructionType.setProperty, value: 'innerTodo', to: 'local' },
//                       { type: TargetedInstructionType.setProperty, value: false, to: 'visualsRequireLifecycle' }
//                     ]
//                   }
//                 ]
//               ]
//             },
//             instructions: [
//               { type: TargetedInstructionType.iteratorBinding, from: 'todos', to: 'items' },
//               { type: TargetedInstructionType.setProperty, value: 'todo', to: 'local' },
//               { type: TargetedInstructionType.setProperty, value: false, to: 'visualsRequireLifecycle' }
//             ]
//           }
//         ]
//       ],
//       surrogates: []
//     };
//     component = createRepeater({ colName: 'todos' } as any, initItems, templateSource);

//     au.app({ host, component });
//     au.start();
//     lifecycle.processFlushQueue(LifecycleFlags.none);

//     const expectedText = initItems.map(i => `${i.id}${i.innerTodos.length}${i.innerTodos.map(ii => `${ii.innerId}${ii.innerInnerTodos.length}${ii.innerInnerTodos.map(iii => `${iii.innerInnerId}`).join('')}`).join(' ')}`).join(' ');
//     expect(host['textContent'].trim()).to.equal(expectedText);
//   });
// });
