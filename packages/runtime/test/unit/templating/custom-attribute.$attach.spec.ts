import { LifecycleState, IAttachLifecycle, INode, IRuntimeBehavior, LifecycleHooks, IDetachLifecycle } from '../../../src/index';
import { expect } from 'chai';
import { eachCartesianJoin } from '../util';
import { CustomAttribute, createCustomAttribute } from './custom-attribute._builder';

describe('@customAttribute', () => {

  describe('$attach', () => {

    const propsSpecs = [
      {
        description: '$isAttached: false',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomAttribute) {
          sut.$state |= LifecycleState.isBound;
        }
      },
      {
        description: '$isAttached: true',
        expectation: 'does NOT call behaviors',
        callsBehaviors: false,
        setProps(sut: CustomAttribute) {
          sut.$state |= LifecycleState.isBound | LifecycleState.isAttached;
        }
      }
    ];

    const behaviorSpecs = [
      {
        description: '$behavior.hasAttaching: true, $behavior.hasAttached: false',
        expectation: 'calls attaching(), does NOT call attached()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasAttaching }; }
      },
      {
        description: '$behavior.hasAttaching: false, $behavior.hasAttached: false',
        expectation: 'does NOT call attaching(), does NOT call attached()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.none }; }
      },
      {
        description: '$behavior.hasAttaching: true, $behavior.hasAttached: true',
        expectation: 'calls attaching(), calls attached()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasAttaching | LifecycleHooks.hasAttached }; }
      },
      {
        description: '$behavior.hasAttaching: false, $behavior.hasAttached: true',
        expectation: 'does NOT call attaching(), calls attached()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasAttached }; }
      }
    ];

    eachCartesianJoin([propsSpecs, behaviorSpecs],
      (propsSpec, behaviorSpec) => {

      it(`${propsSpec.expectation} if ${propsSpec.description} AND ${behaviorSpec.expectation} if ${behaviorSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomAttribute();
        propsSpec.setProps(sut);
        const behavior = behaviorSpec.getBehavior();
        sut.$behavior = behavior;
        const encapsulationSource: INode = <any>{};

        let queueAttachedCallbackCalled = false;
        let queueAttachedCallbackRequestor;
        const lifecycle: IAttachLifecycle = <any>{
          queueAttachedCallback(requestor: CustomAttribute) {
            queueAttachedCallbackCalled = true;
            queueAttachedCallbackRequestor = requestor;
            requestor.attached();
          }
        };

        // Act
        sut.$attach(encapsulationSource, lifecycle);

        // Assert
        if (propsSpec.callsBehaviors) {
          if (behavior.hooks & LifecycleHooks.hasAttached) {
            sut.verifyAttachedCalled();
            expect(queueAttachedCallbackCalled).to.equal(true, 'queueAttachedCallbackCalled');
            expect(queueAttachedCallbackRequestor).to.equal(sut, 'queueAttachedCallbackRequestor')
          }
          if (behavior.hooks & LifecycleHooks.hasAttaching) {
            sut.verifyAttachingCalled(encapsulationSource, lifecycle);
          }
        } else {
          expect(queueAttachedCallbackCalled).to.equal(false, 'queueAttachedCallbackCalled');
        }
        sut.verifyNoFurtherCalls();
      });
    });
  });

  describe('$detach', () => {

    const propsSpecs = [
      {
        description: '$isAttached: false',
        expectation: 'does NOT call behaviors',
        callsBehaviors: false,
        setProps(sut: CustomAttribute) {
          sut.$state |= LifecycleState.isBound;
        }
      },
      {
        description: '$isAttached: true',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomAttribute) {
          sut.$state |= LifecycleState.isBound | LifecycleState.isAttached;
        }
      }
    ];

    const behaviorSpecs = [
      {
        description: '$behavior.hasDetaching: true, $behavior.hasDetached: false',
        expectation: 'calls detaching(), does NOT call detached()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasDetaching }; }
      },
      {
        description: '$behavior.hasDetaching: false, $behavior.hasDetached: false',
        expectation: 'does NOT call detaching(), does NOT call detached()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.none }; }
      },
      {
        description: '$behavior.hasDetaching: true, $behavior.hasDetached: true',
        expectation: 'calls detaching(), calls detached()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasDetaching | LifecycleHooks.hasDetaching }; }
      },
      {
        description: '$behavior.hasDetaching: false, $behavior.hasDetached: true',
        expectation: 'does NOT call detaching(), calls detached()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasDetached }; }
      }
    ];

    eachCartesianJoin([propsSpecs, behaviorSpecs],
      (propsSpec, behaviorSpec) => {

      it(`${propsSpec.expectation} if ${propsSpec.description} AND ${behaviorSpec.expectation} if ${behaviorSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomAttribute();
        propsSpec.setProps(sut);
        const behavior = behaviorSpec.getBehavior();
        sut.$behavior = behavior;
        const encapsulationSource: INode = <any>{};

        let queueDetachedCallbackCalled = false;
        let queueDetachedCallbackRequestor;
        const lifecycle: IDetachLifecycle = <any>{
          queueDetachedCallback(requestor: CustomAttribute) {
            queueDetachedCallbackCalled = true;
            queueDetachedCallbackRequestor = requestor;
            requestor.detached();
          }
        };

        // Act
        sut.$detach(lifecycle);

        // Assert
        if (propsSpec.callsBehaviors) {
          if (behavior.hooks & LifecycleHooks.hasDetached) {
            sut.verifyDetachedCalled();
            expect(queueDetachedCallbackCalled).to.equal(true, 'queueDetachedCallbackCalled');
            expect(queueDetachedCallbackRequestor).to.equal(sut, 'queueDetachedCallbackRequestor')
          }
          if (behavior.hooks & LifecycleHooks.hasDetaching) {
            sut.verifyDetachingCalled(lifecycle);
          }
        } else {
          expect(queueDetachedCallbackCalled).to.equal(false, 'queueDetachedCallbackCalled');
        }
        sut.verifyNoFurtherCalls();
      });
    });
  });

  describe('$cache', () => {

    const behaviorSpecs = [
      {
        description: '$behavior.hasCaching: true',
        expectation: 'calls hasCaching()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasCaching }; }
      },
      {
        description: '$behavior.hasCaching: false',
        expectation: 'does NOT call hasCaching()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.none }; }
      }
    ];

    eachCartesianJoin([behaviorSpecs],
      (behaviorSpec) => {

      it(`${behaviorSpec.expectation} if ${behaviorSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomAttribute();
        const behavior = behaviorSpec.getBehavior();
        sut.$behavior = behavior;

        // Act
        sut.$cache();

        // Assert
        if (behavior.hooks & LifecycleHooks.hasCaching) {
          sut.verifyCachingCalled();
        }
        sut.verifyNoFurtherCalls();
      });
    });
  });
});
