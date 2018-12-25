import { State, Scope, LifecycleFlags, Hooks } from '../../src/index';
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
          sut.$state |= State.isBound;
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
          sut.$state |= State.isBound;
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
          sut.$state |= State.isBound;
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
          sut.$state |= State.isBound;
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
        description: 'flags: LifecycleFlags.fromBind',
        expectation: 'passed-through flags: fromBind',
        getFlags() {
          return LifecycleFlags.fromBind;
        },
        getExpectedFlags() {
          return LifecycleFlags.fromBind;
        }
      },
      {
        description: 'flags: LifecycleFlags.fromUnbind',
        expectation: 'passed-through flags: fromBind|fromUnbind',
        getFlags() {
          return LifecycleFlags.fromUnbind;
        },
        getExpectedFlags() {
          return LifecycleFlags.fromBind | LifecycleFlags.fromUnbind;
        }
      },
      {
        description: 'flags: LifecycleFlags.updateTargetInstance',
        expectation: 'passed-through flags: fromBind|updateTargetInstance',
        getFlags() {
          return LifecycleFlags.updateTargetInstance;
        },
        getExpectedFlags() {
          return LifecycleFlags.fromBind | LifecycleFlags.updateTargetInstance;
        }
      }
    ];

    const hooksSpecs = [
      {
        description: 'Hooks.hasBinding',
        expectation: 'calls binding(), does NOT call bound()',
        getHooks() {
          return Hooks.hasBinding;
        },
        verifyBehaviorInvocation(sut: CustomAttribute, flags: LifecycleFlags) {
          sut.verifyBindingCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: 'Hooks.none',
        expectation: 'does NOT call binding(), does NOT call bound()',
        getHooks() {
          return Hooks.none;
        },
        verifyBehaviorInvocation(sut: CustomAttribute, flags: LifecycleFlags) {
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: 'Hooks.hasBinding | Hooks.hasBound',
        expectation: 'calls binding(), calls bound()',
        getHooks() {
          return Hooks.hasBinding | Hooks.hasBound;
        },
        verifyBehaviorInvocation(sut: CustomAttribute, flags: LifecycleFlags) {
          sut.verifyBoundCalled(flags);
          sut.verifyBindingCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: 'Hooks.hasBound',
        expectation: 'does NOT call binding(), calls bound()',
        getHooks() {
          return Hooks.hasBound;
        },
        verifyBehaviorInvocation(sut: CustomAttribute, flags: LifecycleFlags) {
          sut.verifyBoundCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      }
    ];

    eachCartesianJoin([propsAndScopeSpecs, flagsSpecs, hooksSpecs],
      (psSpec, flagsSpec, hooksSpec) => {

      it(`${psSpec.expectation} if ${psSpec.description} AND ${hooksSpec.expectation} if ${hooksSpec.description} AND ${flagsSpec.expectation} if ${flagsSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomAttribute();
        psSpec.setProps(sut);
        sut.$hooks = hooksSpec.getHooks();
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
          hooksSpec.verifyBehaviorInvocation(sut, expectedFlags);
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
          sut.$state |= State.isBound;
        }
      },
      {
        description: '$isBound: true, $scope !== null',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomAttribute) {
          sut.$state |= State.isBound;
        }
      }
    ];

    const flagsSpec = [
      {
        description: 'flags: LifecycleFlags.fromBind',
        expectation: 'passed-through flags: fromUnbind|fromBind',
        getFlags() { return LifecycleFlags.fromUnbind; },
        getExpectedFlags() { return LifecycleFlags.fromUnbind; }
      },
      {
        description: 'flags: LifecycleFlags.fromUnbind',
        expectation: 'passed-through flags: fromUnbind',
        getFlags() { return LifecycleFlags.fromUnbind; },
        getExpectedFlags() { return LifecycleFlags.fromUnbind | LifecycleFlags.fromUnbind; }
      },
      {
        description: 'flags: LifecycleFlags.updateTargetInstance',
        expectation: 'passed-through flags: fromUnbind|updateTargetInstance',
        getFlags() { return LifecycleFlags.updateTargetInstance; },
        getExpectedFlags() { return LifecycleFlags.fromUnbind | LifecycleFlags.updateTargetInstance; }
      }
    ];

    const hooksSpecs = [
      {
        description: 'Hooks.hasUnbinding',
        expectation: 'calls unbinding(), does NOT call unbound()',
        getHooks() { return Hooks.hasUnbinding },
        verifyBehaviorInvocation(sut: CustomAttribute, flags: LifecycleFlags) {
          sut.verifyUnbindingCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: 'Hooks.none',
        expectation: 'does NOT call unbinding(), does NOT call unbound()',
        getHooks() { return Hooks.none },
        verifyBehaviorInvocation(sut: CustomAttribute, flags: LifecycleFlags) {
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: 'Hooks.hasUnbinding | Hooks.hasUnbound',
        expectation: 'calls unbinding(), calls unbound()',
        getHooks() { return Hooks.hasUnbinding | Hooks.hasUnbound },
        verifyBehaviorInvocation(sut: CustomAttribute, flags: LifecycleFlags) {
          sut.verifyUnboundCalled(flags);
          sut.verifyUnbindingCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: 'Hooks.hasUnbound',
        expectation: 'does NOT call unbinding(), calls unbound()',
        getHooks() { return Hooks.hasUnbound},
        verifyBehaviorInvocation(sut: CustomAttribute, flags: LifecycleFlags) {
          sut.verifyUnboundCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      }
    ];


    eachCartesianJoin([propsAndScopeSpecs, flagsSpec, hooksSpecs],
      (psSpec, flagsSpec, hooksSpec) => {

      it(`${psSpec.expectation} if ${psSpec.description} AND ${hooksSpec.expectation} if ${hooksSpec.description} AND ${flagsSpec.expectation} if ${flagsSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomAttribute();
        psSpec.setProps(sut);
        sut.$hooks = hooksSpec.getHooks();
        const expectedFlags = flagsSpec.getExpectedFlags();
        const flags = flagsSpec.getFlags();

        // Act
        sut.$unbind(flags);

        // Assert
        if (psSpec.callsBehaviors) {
          hooksSpec.verifyBehaviorInvocation(sut, expectedFlags);
        } else {
          sut.verifyNoFurtherCalls();
        }
      });
    });
  });
});
