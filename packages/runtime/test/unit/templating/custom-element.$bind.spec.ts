// import { Hooks, LifecycleFlags, Scope, IRuntimeBehavior, State } from '../../../src/index';
// import { eachCartesianJoin } from '../util';
// import { CustomElement, createCustomElement } from './custom-element._builder';

// describe('@customElement', () => {

//   describe('$bind', () => {

//     const propsAndScopeSpecs = [
//       {
//         description: '$isBound: true',
//         expectation: 'does NOT call behaviors',
//         callsBehaviors: false,
//         setProps(sut: CustomElement) {
//           sut.$state |= State.isBound;
//         }
//       },
//       {
//         description: '$isBound: false',
//         expectation: 'calls behaviors',
//         callsBehaviors: true,
//         setProps(sut: CustomElement) {
//           sut.$state &= ~State.isBound;
//         }
//       }
//     ];

//     const flagsSpecs = [
//       {
//         description: 'flags: LifecycleFlags.fromBind',
//         expectation: 'passed-through flags: fromBind',
//         getFlags() {
//           return LifecycleFlags.fromBind;
//         },
//         getExpectedFlags() {
//           return LifecycleFlags.fromBind;
//         }
//       },
//       {
//         description: 'flags: LifecycleFlags.fromUnbind',
//         expectation: 'passed-through flags: fromBind|fromUnbind',
//         getFlags() {
//           return LifecycleFlags.fromUnbind;
//         },
//         getExpectedFlags() {
//           return LifecycleFlags.fromBind | LifecycleFlags.fromUnbind;
//         }
//       },
//       {
//         description: 'flags: LifecycleFlags.updateTargetInstance',
//         expectation: 'passed-through flags: fromBind|updateTargetInstance',
//         getFlags() {
//           return LifecycleFlags.updateTargetInstance;
//         },
//         getExpectedFlags() {
//           return LifecycleFlags.fromBind | LifecycleFlags.updateTargetInstance;
//         }
//       }
//     ];

//     const behaviorSpecs = [
//       {
//         description: '$behavior.hasBinding: true, $behavior.hasBound: false',
//         expectation: 'calls binding(), does NOT call bound()',
//         getBehavior() {
//           return <IRuntimeBehavior>{ hooks: Hooks.hasBinding };
//         },
//         verifyBehaviorInvocation(sut: CustomElement, flags: LifecycleFlags) {
//           sut.verifyBindingCalled(flags);
//           sut.verifyNoFurtherCalls();
//         }
//       },
//       {
//         description: '$behavior.hasBinding: false, $behavior.hasBound: false',
//         expectation: 'does NOT call binding(), does NOT call bound()',
//         getBehavior() {
//           return <IRuntimeBehavior>{ hooks: Hooks.none};
//         },
//         verifyBehaviorInvocation(sut: CustomElement, flags: LifecycleFlags) {
//           sut.verifyNoFurtherCalls();
//         }
//       },
//       {
//         description: '$behavior.hasBinding: true, $behavior.hasBound: true',
//         expectation: 'calls binding(), calls bound()',
//         getBehavior() {
//           return <IRuntimeBehavior>{ hooks: Hooks.hasBinding | Hooks.hasBound };
//         },
//         verifyBehaviorInvocation(sut: CustomElement, flags: LifecycleFlags) {
//           sut.verifyBoundCalled(flags);
//           sut.verifyBindingCalled(flags);
//           sut.verifyNoFurtherCalls();
//         }
//       },
//       {
//         description: '$behavior.hasBinding: false, $behavior.hasBound: true',
//         expectation: 'does NOT call binding(), calls bound()',
//         getBehavior() {
//           return <IRuntimeBehavior>{ hooks: Hooks.hasBound};
//         },
//         verifyBehaviorInvocation(sut: CustomElement, flags: LifecycleFlags) {
//           sut.verifyBoundCalled(flags);
//           sut.verifyNoFurtherCalls();
//         }
//       }
//     ];

//     eachCartesianJoin([propsAndScopeSpecs, flagsSpecs, behaviorSpecs],
//       (psSpec, flagsSpec, behaviorSpec) => {

//       it(`${psSpec.expectation} if ${psSpec.description} AND ${behaviorSpec.expectation} if ${behaviorSpec.description} AND ${flagsSpec.expectation} if ${flagsSpec.description}`, () => {
//         // Arrange
//         const { sut } = createCustomElement('foo');
//         psSpec.setProps(sut);
//         sut.$scope = Scope.create(sut, null);
//         sut.$bindableHead = sut.$bindableTail = null;
//         sut.$attachableHead = sut.$attachableTail = null;
//         sut.$behavior = behaviorSpec.getBehavior();
//         const expectedFlags = flagsSpec.getExpectedFlags();
//         const flags = flagsSpec.getFlags();

//         // Act
//         sut.$bind(flags);

//         // Assert
//         if (psSpec.callsBehaviors) {
//           behaviorSpec.verifyBehaviorInvocation(sut, expectedFlags);
//         } else {
//           sut.verifyNoFurtherCalls();
//         }
//       });
//     });
//   });

//   describe('$unbind', () => {

//     const propsAndScopeSpecs = [
//       {
//         description: '$isBound: false',
//         expectation: 'does NOT call behaviors',
//         callsBehaviors: false,
//         setProps(sut: CustomElement) {
//           sut.$state &= ~State.isBound;
//         }
//       },
//       {
//         description: '$isBound: true',
//         expectation: 'calls behaviors',
//         callsBehaviors: true,
//         setProps(sut: CustomElement) {
//           sut.$state |= State.isBound;
//         }
//       }
//     ];

//     const flagsSpec = [
//       {
//         description: 'flags: LifecycleFlags.fromBind',
//         expectation: 'passed-through flags: fromUnbind|fromBind',
//         getFlags() { return LifecycleFlags.fromUnbind; },
//         getExpectedFlags() { return LifecycleFlags.fromUnbind; }
//       },
//       {
//         description: 'flags: LifecycleFlags.fromUnbind',
//         expectation: 'passed-through flags: fromUnbind',
//         getFlags() { return LifecycleFlags.fromUnbind; },
//         getExpectedFlags() { return LifecycleFlags.fromUnbind | LifecycleFlags.fromUnbind; }
//       },
//       {
//         description: 'flags: LifecycleFlags.updateTargetInstance',
//         expectation: 'passed-through flags: fromUnbind|updateTargetInstance',
//         getFlags() { return LifecycleFlags.updateTargetInstance; },
//         getExpectedFlags() { return LifecycleFlags.fromUnbind | LifecycleFlags.updateTargetInstance; }
//       }
//     ];

//     const behaviorSpecs = [
//       {
//         description: '$behavior.hasUnbinding: true, $behavior.hasUnbound: false',
//         expectation: 'calls unbinding(), does NOT call unbound()',
//         getBehavior() { return <IRuntimeBehavior>{ hooks: Hooks.hasUnbinding }; },
//         verifyBehaviorInvocation(sut: CustomElement, flags: LifecycleFlags) {
//           sut.verifyUnbindingCalled(flags);
//           sut.verifyNoFurtherCalls();
//         }
//       },
//       {
//         description: '$behavior.hasUnbinding: false, $behavior.hasUnbound: false',
//         expectation: 'does NOT call unbinding(), does NOT call unbound()',
//         getBehavior() { return <IRuntimeBehavior>{ hooks: Hooks.none }; },
//         verifyBehaviorInvocation(sut: CustomElement, flags: LifecycleFlags) {
//           sut.verifyNoFurtherCalls();
//         }
//       },
//       {
//         description: '$behavior.hasUnbinding: true, $behavior.hasUnbound: true',
//         expectation: 'calls unbinding(), calls unbound()',
//         getBehavior() { return <IRuntimeBehavior>{ hooks: Hooks.hasUnbinding | Hooks.hasUnbound }; },
//         verifyBehaviorInvocation(sut: CustomElement, flags: LifecycleFlags) {
//           sut.verifyUnboundCalled(flags);
//           sut.verifyUnbindingCalled(flags);
//           sut.verifyNoFurtherCalls();
//         }
//       },
//       {
//         description: '$behavior.hasUnbinding: false, $behavior.hasUnbound: true',
//         expectation: 'does NOT call unbinding(), calls unbound()',
//         getBehavior() { return <IRuntimeBehavior>{ hooks: Hooks.hasUnbound}; },
//         verifyBehaviorInvocation(sut: CustomElement, flags: LifecycleFlags) {
//           sut.verifyUnboundCalled(flags);
//           sut.verifyNoFurtherCalls();
//         }
//       }
//     ];


//     eachCartesianJoin([propsAndScopeSpecs, flagsSpec, behaviorSpecs],
//       (psSpec, flagsSpec, behaviorSpec) => {

//       it(`${psSpec.expectation} if ${psSpec.description} AND ${behaviorSpec.expectation} if ${behaviorSpec.description} AND ${flagsSpec.expectation} if ${flagsSpec.description}`, () => {
//         // Arrange
//         const { sut } = createCustomElement('foo');
//         psSpec.setProps(sut);
//         sut.$scope = Scope.create(sut, null);
//         sut.$bindableHead = sut.$bindableTail = null;
//         sut.$attachableHead = sut.$attachableTail = null;
//         sut.$behavior = behaviorSpec.getBehavior();
//         const expectedFlags = flagsSpec.getExpectedFlags();
//         const flags = flagsSpec.getFlags();

//         // Act
//         sut.$unbind(flags);

//         // Assert
//         if (psSpec.callsBehaviors) {
//           behaviorSpec.verifyBehaviorInvocation(sut, expectedFlags);
//         } else {
//           sut.verifyNoFurtherCalls();
//         }
//       });
//     });
//   });
// });
