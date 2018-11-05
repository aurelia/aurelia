// import { State, ILifecycle, INode, IRuntimeBehavior, Hooks } from '../../../src/index';
// import { expect } from 'chai';
// import { eachCartesianJoin } from '../util';
// import { CustomAttribute, createCustomAttribute } from './custom-attribute._builder';

// describe('@customAttribute', () => {

//   describe('$attach', () => {

//     const propsSpecs = [
//       {
//         description: '$isAttached: false',
//         expectation: 'calls behaviors',
//         callsBehaviors: true,
//         setProps(sut: CustomAttribute) {
//           sut.$state |= State.isBound;
//         }
//       },
//       {
//         description: '$isAttached: true',
//         expectation: 'does NOT call behaviors',
//         callsBehaviors: false,
//         setProps(sut: CustomAttribute) {
//           sut.$state |= State.isBound | State.isAttached;
//         }
//       }
//     ];

//     const behaviorSpecs = [
//       {
//         description: '$behavior.hasAttaching: true, $behavior.hasAttached: false',
//         expectation: 'calls attaching(), does NOT call attached()',
//         getBehavior() { return <IRuntimeBehavior>{ hooks: Hooks.hasAttaching }; }
//       },
//       {
//         description: '$behavior.hasAttaching: false, $behavior.hasAttached: false',
//         expectation: 'does NOT call attaching(), does NOT call attached()',
//         getBehavior() { return <IRuntimeBehavior>{ hooks: Hooks.none }; }
//       },
//       {
//         description: '$behavior.hasAttaching: true, $behavior.hasAttached: true',
//         expectation: 'calls attaching(), calls attached()',
//         getBehavior() { return <IRuntimeBehavior>{ hooks: Hooks.hasAttaching | Hooks.hasAttached }; }
//       },
//       {
//         description: '$behavior.hasAttaching: false, $behavior.hasAttached: true',
//         expectation: 'does NOT call attaching(), calls attached()',
//         getBehavior() { return <IRuntimeBehavior>{ hooks: Hooks.hasAttached }; }
//       }
//     ];

//     eachCartesianJoin([propsSpecs, behaviorSpecs],
//       (propsSpec, behaviorSpec) => {

//       it(`${propsSpec.expectation} if ${propsSpec.description} AND ${behaviorSpec.expectation} if ${behaviorSpec.description}`, () => {
//         // Arrange
//         const { sut } = createCustomAttribute();
//         propsSpec.setProps(sut);
//         const behavior = behaviorSpec.getBehavior();
//         sut.$behavior = behavior;
//         const encapsulationSource: INode = <any>{};

//         let queueAttachedCallbackCalled = false;
//         let queueAttachedCallbackRequestor;
//         const lifecycle: ILifecycle = <any>{
//           queueAttachedCallback(requestor: CustomAttribute) {
//             queueAttachedCallbackCalled = true;
//             queueAttachedCallbackRequestor = requestor;
//             requestor.attached();
//           }
//         };

//         // Act
//         sut.$attach();

//         // Assert
//         if (propsSpec.callsBehaviors) {
//           if (behavior.hooks & Hooks.hasAttached) {
//             sut.verifyAttachedCalled();
//             expect(queueAttachedCallbackCalled).to.equal(true, 'queueAttachedCallbackCalled');
//             expect(queueAttachedCallbackRequestor).to.equal(sut, 'queueAttachedCallbackRequestor')
//           }
//           if (behavior.hooks & Hooks.hasAttaching) {
//             sut.verifyAttachingCalled();
//           }
//         } else {
//           expect(queueAttachedCallbackCalled).to.equal(false, 'queueAttachedCallbackCalled');
//         }
//         sut.verifyNoFurtherCalls();
//       });
//     });
//   });

//   describe('$detach', () => {

//     const propsSpecs = [
//       {
//         description: '$isAttached: false',
//         expectation: 'does NOT call behaviors',
//         callsBehaviors: false,
//         setProps(sut: CustomAttribute) {
//           sut.$state |= State.isBound;
//         }
//       },
//       {
//         description: '$isAttached: true',
//         expectation: 'calls behaviors',
//         callsBehaviors: true,
//         setProps(sut: CustomAttribute) {
//           sut.$state |= State.isBound | State.isAttached;
//         }
//       }
//     ];

//     const behaviorSpecs = [
//       {
//         description: '$behavior.hasDetaching: true, $behavior.hasDetached: false',
//         expectation: 'calls detaching(), does NOT call detached()',
//         getBehavior() { return <IRuntimeBehavior>{ hooks: Hooks.hasDetaching }; }
//       },
//       {
//         description: '$behavior.hasDetaching: false, $behavior.hasDetached: false',
//         expectation: 'does NOT call detaching(), does NOT call detached()',
//         getBehavior() { return <IRuntimeBehavior>{ hooks: Hooks.none }; }
//       },
//       {
//         description: '$behavior.hasDetaching: true, $behavior.hasDetached: true',
//         expectation: 'calls detaching(), calls detached()',
//         getBehavior() { return <IRuntimeBehavior>{ hooks: Hooks.hasDetaching | Hooks.hasDetaching }; }
//       },
//       {
//         description: '$behavior.hasDetaching: false, $behavior.hasDetached: true',
//         expectation: 'does NOT call detaching(), calls detached()',
//         getBehavior() { return <IRuntimeBehavior>{ hooks: Hooks.hasDetached }; }
//       }
//     ];

//     eachCartesianJoin([propsSpecs, behaviorSpecs],
//       (propsSpec, behaviorSpec) => {

//       it(`${propsSpec.expectation} if ${propsSpec.description} AND ${behaviorSpec.expectation} if ${behaviorSpec.description}`, () => {
//         // Arrange
//         const { sut } = createCustomAttribute();
//         propsSpec.setProps(sut);
//         const behavior = behaviorSpec.getBehavior();
//         sut.$behavior = behavior;
//         const encapsulationSource: INode = <any>{};

//         let queueDetachedCallbackCalled = false;
//         let queueDetachedCallbackRequestor;
//         const lifecycle: ILifecycle = <any>{
//           queueDetachedCallback(requestor: CustomAttribute) {
//             queueDetachedCallbackCalled = true;
//             queueDetachedCallbackRequestor = requestor;
//             requestor.detached();
//           }
//         };

//         // Act
//         sut.$detach();

//         // Assert
//         if (propsSpec.callsBehaviors) {
//           if (behavior.hooks & Hooks.hasDetached) {
//             sut.verifyDetachedCalled();
//             expect(queueDetachedCallbackCalled).to.equal(true, 'queueDetachedCallbackCalled');
//             expect(queueDetachedCallbackRequestor).to.equal(sut, 'queueDetachedCallbackRequestor')
//           }
//           if (behavior.hooks & Hooks.hasDetaching) {
//             sut.verifyDetachingCalled();
//           }
//         } else {
//           expect(queueDetachedCallbackCalled).to.equal(false, 'queueDetachedCallbackCalled');
//         }
//         sut.verifyNoFurtherCalls();
//       });
//     });
//   });

//   describe('$cache', () => {

//     const behaviorSpecs = [
//       {
//         description: '$behavior.hasCaching: true',
//         expectation: 'calls hasCaching()',
//         getBehavior() { return <IRuntimeBehavior>{ hooks: Hooks.hasCaching }; }
//       },
//       {
//         description: '$behavior.hasCaching: false',
//         expectation: 'does NOT call hasCaching()',
//         getBehavior() { return <IRuntimeBehavior>{ hooks: Hooks.none }; }
//       }
//     ];

//     eachCartesianJoin([behaviorSpecs],
//       (behaviorSpec) => {

//       it(`${behaviorSpec.expectation} if ${behaviorSpec.description}`, () => {
//         // Arrange
//         const { sut } = createCustomAttribute();
//         const behavior = behaviorSpec.getBehavior();
//         sut.$behavior = behavior;

//         // Act
//         sut.$cache();

//         // Assert
//         if (behavior.hooks & Hooks.hasCaching) {
//           sut.verifyCachingCalled();
//         }
//         sut.verifyNoFurtherCalls();
//       });
//     });
//   });
// });
