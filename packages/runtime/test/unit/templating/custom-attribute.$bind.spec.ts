import { LifecycleState, Scope, BindingFlags, IRuntimeBehavior, LifecycleHooks } from '../../../src/index';
import { expect } from 'chai';
import { eachCartesianJoin } from '../util';
import { CustomAttribute, createCustomAttribute } from './custom-attribute._builder';

describe('@customAttribute', () => {

  describe('$bind', () => {

    const propsAndScopeSpecs = [
      // $isBound: true, with 4 variants
      {
        description: '$isBound: true, $scope: null, different scope',
        expectation: 'calls $unbind, calls behaviors',
        callsUnbind: true,
        callsBehaviors: true,
        setProps(sut: CustomAttribute) {
          sut.$state |= LifecycleState.isBound;
          sut.$scope = null;
        },
        getScope(sut: CustomAttribute) { return Scope.create(sut, null); }
      },
      {
        description: '$isBound: true, $scope: null, same scope',
        expectation: 'does NOT call $unbind, does NOT call behaviors',
        callsUnbind: false,
        callsBehaviors: false,
        setProps(sut: CustomAttribute) {
          sut.$state |= LifecycleState.isBound;
          sut.$scope = null;
        },
        getScope(sut: CustomAttribute) { return sut.$scope; }
      },
      {
        description: '$isBound: true, $scope !== null, different scope',
        expectation: 'calls $unbind, calls behaviors',
        callsUnbind: true,
        callsBehaviors: true,
        setProps(sut: CustomAttribute) {
          sut.$state |= LifecycleState.isBound;
          sut.$scope = Scope.create(sut, null);
        },
        getScope(sut: CustomAttribute) { return Scope.create(sut, null); }
      },
      {
        description: '$isBound: true, $scope !== null, same scope',
        expectation: 'does NOT call $unbind, does NOT call behaviors',
        callsUnbind: false,
        callsBehaviors: false,
        setProps(sut: CustomAttribute) {
          sut.$state |= LifecycleState.isBound;
          sut.$scope = Scope.create(sut, null);
        },
        getScope(sut: CustomAttribute) { return sut.$scope; }
      },
      // $isBound: false, with otherwise the same 4 variants
      {
        description: '$isBound: false, $scope: null, different scope',
        expectation: 'does NOT call $unbind, calls behaviors',
        callsUnbind: false,
        callsBehaviors: true,
        setProps(sut: CustomAttribute) {
          sut.$scope = null;
        },
        getScope(sut: CustomAttribute) { return Scope.create(sut, null); }
      },
      {
        description: '$isBound: false, $scope: null, same scope',
        expectation: 'does NOT call $unbind, calls behaviors',
        callsUnbind: false,
        callsBehaviors: true,
        setProps(sut: CustomAttribute) {
          sut.$scope = null;
        },
        getScope(sut: CustomAttribute) { return sut.$scope; }
      },
      {
        description: '$isBound: false, $scope !== null, different scope',
        expectation: 'does NOT call $unbind, calls behaviors',
        callsUnbind: false,
        callsBehaviors: true,
        setProps(sut: CustomAttribute) {
          sut.$scope = Scope.create(sut, null);
        },
        getScope(sut: CustomAttribute) { return Scope.create(sut, null); }
      },
      {
        description: '$isBound: false, $scope !== null, same scope',
        expectation: 'does NOT call $unbind, calls behaviors',
        callsUnbind: false,
        callsBehaviors: true,
        setProps(sut: CustomAttribute) {
          sut.$scope = Scope.create(sut, null);
        },
        getScope(sut: CustomAttribute) { return sut.$scope; }
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
        verifyBehaviorInvocation(sut: CustomAttribute, flags: BindingFlags) {
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
        verifyBehaviorInvocation(sut: CustomAttribute, flags: BindingFlags) {
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasBinding: true, $behavior.hasBound: true',
        expectation: 'calls binding(), calls bound()',
        getBehavior() {
          return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasBinding | LifecycleHooks.hasBound };
        },
        verifyBehaviorInvocation(sut: CustomAttribute, flags: BindingFlags) {
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
        verifyBehaviorInvocation(sut: CustomAttribute, flags: BindingFlags) {
          sut.verifyBoundCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      }
    ];

    eachCartesianJoin([propsAndScopeSpecs, flagsSpecs, behaviorSpecs],
      (psSpec, flagsSpec, behaviorSpec) => {

      it(`${psSpec.expectation} if ${psSpec.description} AND ${behaviorSpec.expectation} if ${behaviorSpec.description} AND ${flagsSpec.expectation} if ${flagsSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomAttribute();
        psSpec.setProps(sut);
        sut.$behavior = behaviorSpec.getBehavior();
        const expectedFlags = flagsSpec.getExpectedFlags();
        const flags = flagsSpec.getFlags();
        const scope = psSpec.getScope(sut);

        let unbindCalled = false;
        let unbindFlags;
        sut.$unbind = flags => {
          unbindCalled = true;
          unbindFlags = flags;
        };

        // Act
        sut.$bind(flags, scope);

        // Assert
        expect(unbindCalled).to.equal(psSpec.callsUnbind, 'unbindCalled');
        if (unbindCalled) {
          expect(unbindFlags).to.equal(expectedFlags, 'unbindFlags')
        }
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
        description: '$isBound: false, $scope: null',
        expectation: 'calls behaviors',
        callsBehaviors: false,
        setProps(sut: CustomAttribute) { }
      },
      {
        description: '$isBound: false, $scope !== null',
        expectation: 'calls behaviors',
        callsBehaviors: false,
        setProps(sut: CustomAttribute) { }
      },
      {
        description: '$isBound: true, $scope: null',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomAttribute) {
          sut.$state |= LifecycleState.isBound;
        }
      },
      {
        description: '$isBound: true, $scope !== null',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomAttribute) {
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
        verifyBehaviorInvocation(sut: CustomAttribute, flags: BindingFlags) {
          sut.verifyUnbindingCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasUnbinding: false, $behavior.hasUnbound: false',
        expectation: 'does NOT call unbinding(), does NOT call unbound()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.none }; },
        verifyBehaviorInvocation(sut: CustomAttribute, flags: BindingFlags) {
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasUnbinding: true, $behavior.hasUnbound: true',
        expectation: 'calls unbinding(), calls unbound()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasUnbinding | LifecycleHooks.hasUnbound }; },
        verifyBehaviorInvocation(sut: CustomAttribute, flags: BindingFlags) {
          sut.verifyUnboundCalled(flags);
          sut.verifyUnbindingCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasUnbinding: false, $behavior.hasUnbound: true',
        expectation: 'does NOT call unbinding(), calls unbound()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasUnbound}; },
        verifyBehaviorInvocation(sut: CustomAttribute, flags: BindingFlags) {
          sut.verifyUnboundCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      }
    ];


    eachCartesianJoin([propsAndScopeSpecs, flagsSpec, behaviorSpecs],
      (psSpec, flagsSpec, behaviorSpec) => {

      it(`${psSpec.expectation} if ${psSpec.description} AND ${behaviorSpec.expectation} if ${behaviorSpec.description} AND ${flagsSpec.expectation} if ${flagsSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomAttribute();
        psSpec.setProps(sut);
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
