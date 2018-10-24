import { LifecycleHooks, BindingFlags, Scope, IRuntimeBehavior, LifecycleState } from '../../../src/index';
import { eachCartesianJoin } from '../util';
import { CustomElement, createCustomElement } from './custom-element._builder';

describe('@customElement', () => {

  describe('$bind', () => {

    const propsAndScopeSpecs = [
      {
        description: '$isBound: true',
        expectation: 'does NOT call behaviors',
        callsBehaviors: false,
        setProps(sut: CustomElement) {
          sut.$state |= LifecycleState.isBound;
        }
      },
      {
        description: '$isBound: false',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomElement) {
          sut.$state &= ~LifecycleState.isBound;
        }
      }
    ];

    const flagsSpecs = [
      {
        description: 'flags: BindingFlags.fromBind',
        expectation: 'passed-through flags: fromBind',
        getFlags() {
          return BindingFlags.fromBind;
        },
        getExpectedFlags() {
          return BindingFlags.fromBind;
        }
      },
      {
        description: 'flags: BindingFlags.fromUnbind',
        expectation: 'passed-through flags: fromBind|fromUnbind',
        getFlags() {
          return BindingFlags.fromUnbind;
        },
        getExpectedFlags() {
          return BindingFlags.fromBind | BindingFlags.fromUnbind;
        }
      },
      {
        description: 'flags: BindingFlags.updateTargetInstance',
        expectation: 'passed-through flags: fromBind|updateTargetInstance',
        getFlags() {
          return BindingFlags.updateTargetInstance;
        },
        getExpectedFlags() {
          return BindingFlags.fromBind | BindingFlags.updateTargetInstance;
        }
      }
    ];

    const behaviorSpecs = [
      {
        description: '$behavior.hasBinding: true, $behavior.hasBound: false',
        expectation: 'calls binding(), does NOT call bound()',
        getBehavior() {
          return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasBinding };
        },
        verifyBehaviorInvocation(sut: CustomElement, flags: BindingFlags) {
          sut.verifyBindingCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasBinding: false, $behavior.hasBound: false',
        expectation: 'does NOT call binding(), does NOT call bound()',
        getBehavior() {
          return <IRuntimeBehavior>{ hooks: LifecycleHooks.none};
        },
        verifyBehaviorInvocation(sut: CustomElement, flags: BindingFlags) {
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasBinding: true, $behavior.hasBound: true',
        expectation: 'calls binding(), calls bound()',
        getBehavior() {
          return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasBinding | LifecycleHooks.hasBound };
        },
        verifyBehaviorInvocation(sut: CustomElement, flags: BindingFlags) {
          sut.verifyBoundCalled(flags);
          sut.verifyBindingCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasBinding: false, $behavior.hasBound: true',
        expectation: 'does NOT call binding(), calls bound()',
        getBehavior() {
          return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasBound};
        },
        verifyBehaviorInvocation(sut: CustomElement, flags: BindingFlags) {
          sut.verifyBoundCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      }
    ];

    eachCartesianJoin([propsAndScopeSpecs, flagsSpecs, behaviorSpecs],
      (psSpec, flagsSpec, behaviorSpec) => {

      it(`${psSpec.expectation} if ${psSpec.description} AND ${behaviorSpec.expectation} if ${behaviorSpec.description} AND ${flagsSpec.expectation} if ${flagsSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomElement('foo');
        psSpec.setProps(sut);
        sut.$scope = Scope.create(sut, null);
        sut.$bindableHead = sut.$bindableTail = null;
        sut.$attachableHead = sut.$attachableTail = null;
        sut.$behavior = behaviorSpec.getBehavior();
        const expectedFlags = flagsSpec.getExpectedFlags();
        const flags = flagsSpec.getFlags();

        // Act
        sut.$bind(flags);

        // Assert
        if (psSpec.callsBehaviors) {
          behaviorSpec.verifyBehaviorInvocation(sut, expectedFlags);
        } else {
          sut.verifyNoFurtherCalls();
        }
      });
    });
  });

  describe('$unbind', () => {

    const propsAndScopeSpecs = [
      {
        description: '$isBound: false',
        expectation: 'does NOT call behaviors',
        callsBehaviors: false,
        setProps(sut: CustomElement) {
          sut.$state &= ~LifecycleState.isBound;
        }
      },
      {
        description: '$isBound: true',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomElement) {
          sut.$state |= LifecycleState.isBound;
        }
      }
    ];

    const flagsSpec = [
      {
        description: 'flags: BindingFlags.fromBind',
        expectation: 'passed-through flags: fromUnbind|fromBind',
        getFlags() { return BindingFlags.fromUnbind; },
        getExpectedFlags() { return BindingFlags.fromUnbind; }
      },
      {
        description: 'flags: BindingFlags.fromUnbind',
        expectation: 'passed-through flags: fromUnbind',
        getFlags() { return BindingFlags.fromUnbind; },
        getExpectedFlags() { return BindingFlags.fromUnbind | BindingFlags.fromUnbind; }
      },
      {
        description: 'flags: BindingFlags.updateTargetInstance',
        expectation: 'passed-through flags: fromUnbind|updateTargetInstance',
        getFlags() { return BindingFlags.updateTargetInstance; },
        getExpectedFlags() { return BindingFlags.fromUnbind | BindingFlags.updateTargetInstance; }
      }
    ];

    const behaviorSpecs = [
      {
        description: '$behavior.hasUnbinding: true, $behavior.hasUnbound: false',
        expectation: 'calls unbinding(), does NOT call unbound()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasUnbinding }; },
        verifyBehaviorInvocation(sut: CustomElement, flags: BindingFlags) {
          sut.verifyUnbindingCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasUnbinding: false, $behavior.hasUnbound: false',
        expectation: 'does NOT call unbinding(), does NOT call unbound()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.none }; },
        verifyBehaviorInvocation(sut: CustomElement, flags: BindingFlags) {
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasUnbinding: true, $behavior.hasUnbound: true',
        expectation: 'calls unbinding(), calls unbound()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasUnbinding | LifecycleHooks.hasUnbound }; },
        verifyBehaviorInvocation(sut: CustomElement, flags: BindingFlags) {
          sut.verifyUnboundCalled(flags);
          sut.verifyUnbindingCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasUnbinding: false, $behavior.hasUnbound: true',
        expectation: 'does NOT call unbinding(), calls unbound()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasUnbound}; },
        verifyBehaviorInvocation(sut: CustomElement, flags: BindingFlags) {
          sut.verifyUnboundCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      }
    ];


    eachCartesianJoin([propsAndScopeSpecs, flagsSpec, behaviorSpecs],
      (psSpec, flagsSpec, behaviorSpec) => {

      it(`${psSpec.expectation} if ${psSpec.description} AND ${behaviorSpec.expectation} if ${behaviorSpec.description} AND ${flagsSpec.expectation} if ${flagsSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomElement('foo');
        psSpec.setProps(sut);
        sut.$scope = Scope.create(sut, null);
        sut.$bindableHead = sut.$bindableTail = null;
        sut.$attachableHead = sut.$attachableTail = null;
        sut.$behavior = behaviorSpec.getBehavior();
        const expectedFlags = flagsSpec.getExpectedFlags();
        const flags = flagsSpec.getFlags();

        // Act
        sut.$unbind(flags);

        // Assert
        if (psSpec.callsBehaviors) {
          behaviorSpec.verifyBehaviorInvocation(sut, expectedFlags);
        } else {
          sut.verifyNoFurtherCalls();
        }
      });
    });
  });
});
