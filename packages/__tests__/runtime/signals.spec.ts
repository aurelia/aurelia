// import {
//   DI,
//   IContainer
// } from '@aurelia/kernel';
// import {
//   Binding,
//   BindingMode,
//   IObserverLocator,
//   IsBindingBehavior,
//   IScope,
//   ISignaler,
//   LifecycleFlags,
//   SignalBindingBehavior
// } from '@aurelia/runtime';

// describe('SignalBindingBehavior', function () {
//   const container: IContainer = DI.createContainer();
//   let sut: SignalBindingBehavior;
//   let binding: Binding;
//   let signaler: ISignaler;
//   let name: string;

//   beforeEach(function () {
//     name = 'foo';
//     signaler = new MockSignaler() as any;
//     sut = new SignalBindingBehavior(signaler);
//     binding = new Binding(undefined, undefined, undefined, undefined, undefined, container as any);
//     (sut as any).bind(undefined, undefined, binding as any, name);
//   });

//   // TODO: test properly (multiple names etc)
//   it('bind()   should apply the correct behavior', function () {
//     assert.deepStrictEqual(
//       signaler.addSignalListener.calls,
//       [
//         [name, binding],
//       ],
//       `signaler.addSignalListener`,
//     );
//   });

//   it('unbind() should revert the original behavior', function () {
//     sut.unbind(undefined, undefined, binding as any);
//     assert.deepStrictEqual(
//       signaler.removeSignalListener.calls,
//       [
//         [name, binding],
//       ],
//       `signaler.removeSignalListener`,
//     );
//   });
// });

// class MockSignaler {
//   public addSignalListener = spy();
//   public removeSignalListener = spy();
// }
