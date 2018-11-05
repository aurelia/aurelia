// import { State, IRuntimeBehavior, Hooks, ICustomAttributeType, IRenderingEngine } from '../../../src/index';
// import { eachCartesianJoin } from '../util';
// import { CustomAttribute, createCustomAttribute } from './custom-attribute._builder';
// import { expect } from 'chai';

// describe('@customAttribute', () => {

//   describe('$hydrate', () => {

//     const behaviorSpecs = [
//       {
//         description: '$behavior.hasCreated: true',
//         expectation: 'calls created()',
//         getBehavior() { return <IRuntimeBehavior>{ hooks: Hooks.hasCreated }; },
//         verifyBehaviorInvocation(sut: CustomAttribute) {
//           sut.verifyCreatedCalled();
//           sut.verifyNoFurtherCalls();
//         }
//       },
//       {
//         description: '$behavior.hasCreated: false',
//         expectation: 'does NOT call created()',
//         getBehavior() { return <IRuntimeBehavior>{ hooks: Hooks.none }; },
//         verifyBehaviorInvocation(sut: CustomAttribute) {
//           sut.verifyNoFurtherCalls();
//         }
//       }
//     ];

//     eachCartesianJoin([behaviorSpecs],
//       (behaviorSpec) => {

//       it(`sets properties, applies runtime behavior and ${behaviorSpec.expectation} if ${behaviorSpec.description}`, () => {
//         // Arrange
//         const { Type, sut } = createCustomAttribute();

//         let appliedType: ICustomAttributeType;
//         let appliedInstance: CustomAttribute;
//         const renderingEngine: IRenderingEngine = <any>{
//           applyRuntimeBehavior(type: ICustomAttributeType, instance: CustomAttribute) {
//             instance.$behavior = behaviorSpec.getBehavior();
//             appliedType = type;
//             appliedInstance = instance;
//           }
//         };

//         // Act
//         sut.$hydrate(renderingEngine);

//         // Assert
//         expect(sut).to.not.have.$state.isAttached('sut.$isAttached');
//         expect(sut.$state & State.isBound).to.equal(0, 'sut.$isBound');
//         expect(sut.$scope).to.equal(null, 'sut.$scope');

//         expect(appliedType).to.equal(Type, 'appliedType');
//         expect(appliedInstance).to.equal(sut, 'appliedInstance');
//         behaviorSpec.verifyBehaviorInvocation(sut);
//       });
//     });
//   });
// });
