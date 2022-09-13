// import { DI, IContainer } from '@aurelia/kernel';
// import { LetBinding, LifecycleFlags, ExpressionKind, IBindingTarget, IExpression, IObserverLocator, Scope, Scope, State } from '@aurelia/runtime';
// import { BindingMode } from '@aurelia/runtime-html';
// import { MockExpression } from '../mock.js';
// import { assert } from '@aurelia/testing';

// const getName = (o: any) => Object.prototype.toString.call(o).slice(8, -1);

// describe('LetBinding', function () {
//   let container: IContainer;
//   let observerLocator: IObserverLocator;
//   let sut: LetBinding;
//   let dummySourceExpression: IExpression;
//   let dummyTarget: IBindingTarget;
//   let dummyTargetProperty: string;
//   let dummyMode: BindingMode;

//   beforeEach(function () {
//     container = DI.createContainer();
//     observerLocator = container.get(IObserverLocator);
//     dummySourceExpression = <any>{};
//     dummyTarget = <any>{ foo: 'bar' };
//     dummyTargetProperty = 'foo';
//     dummyMode = BindingMode.twoWay;
//     sut = new LetBinding(dummySourceExpression, dummyTargetProperty, observerLocator, container);
//   });

//   describe('constructor', function () {
//     const invalidInputs: any[] = [null, undefined, {}];

//     for (const ii of invalidInputs) {
//       it(`does not throw on invalid input parameters of type ${getName(ii)}`, function () {
//         sut = new LetBinding(ii, ii, ii, ii, ii);
//       });
//     }
//   });

//   describe('$bind()', function () {
//     it('does not change target if scope was not changed', function () {
//       const vm = {};
//       const ast = new MockExpression();
//       const scope = Scope.create(vm, null);
//       sut = new LetBinding(<any>ast, 'foo', observerLocator, container);
//       sut.$bind(LifecycleFlags.none, scope);
//       const target = sut.target;
//       sut.$bind(LifecycleFlags.none, scope);
//       assert.strictEqual(sut.target, target, 'It should have not recreated target');
//     });

//     it('creates right target with toBindingContext === true', function () {
//       const vm = { vm: 5 };
//       const ast = new MockExpression();
//       sut = new LetBinding(<any>ast, 'foo', observerLocator, container, true);
//       sut.$bind(LifecycleFlags.none, Scope.create(vm, null));
//       assert.strictEqual(sut.target, vm, 'It should have used bindingContext to create target.');
//     });

//     it('creates right target with toBindingContext === false', function () {
//       const vm = { vm: 5 };
//       const view = { view: 6 };
//       const ast = new MockExpression();
//       sut = new LetBinding(<any>ast, 'foo', observerLocator, container);
//       sut.$bind(LifecycleFlags.none, Scope.create(vm, <any>view));
//       assert.strictEqual(sut.target, view, 'It should have used overrideContext to create target.');
//     });
//   });

//   describe('handleChange()', function () {
//     it('handles changes', function () {
//       const vm = { vm: 5, foo: false };
//       const ast = new MockExpression();
//       sut = new LetBinding(<any>ast, 'foo', observerLocator, container, true);
//       sut.$bind(LifecycleFlags.none, Scope.create(vm, null));
//       vm.foo = true;
//       expect(ast.connect).to.have.been.callCount(1);
//     });
//   });

//   describe('$unbind()', function () {
//     it('should not unbind if it is not already bound', function () {
//       const ast = new MockExpression();
//       const scope: any = {};
//       sut = new LetBinding(<any>ast, 'foo', observerLocator, container, true);
//       sut['$scope'] = scope;
//       sut.$unbind(LifecycleFlags.fromUnbind);
//       assert.strictEqual(sut['$scope'] === scope, true, `sut['$scope'] === scope`);
//     });

//     it('should unbind if it is bound', function () {
//       const ast = new MockExpression();
//       const scope: any = {};
//       sut = new LetBinding(<any>ast, 'foo', observerLocator, container, true);
//       sut['$scope'] = scope;
//       sut.$state |= State.isBound;
//       // const unobserveSpy = spy(sut, 'unobserve');
//       // const unbindSpy = ast.unbind = spy();
//       sut.$unbind(LifecycleFlags.fromUnbind);
//       assert.strictEqual(sut['$scope'], null, `sut['$scope']`);
//       assert.strictEqual(sut['$state'] & State.isBound, 0, `sut['$state'] & State.isBound`);
//       assert.deepStrictEqual(
//         unobserveSpy.calls,
//         [
//           [true],
//         ],
//         `unobserveSpy`,
//       );
//       assert.deepStrictEqual(
//         unbindSpy.calls,
//         [
//           [LifecycleFlags.fromUnbind, scope, sut],
//         ],
//         `unbindSpy`,
//       );
//     });
//   });
// });
