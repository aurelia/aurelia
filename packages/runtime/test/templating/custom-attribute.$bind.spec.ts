import { expect } from 'chai';
import { Hooks, LifecycleFlags as LF, Scope, State } from '../../src/index';
import { createCustomAttribute, CustomAttribute } from '../resources/custom-attribute._builder';
import { eachCartesianJoin } from '../util';

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
        getScope(sut: CustomAttribute) { return Scope.create(LF.none, sut, null); }
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
          sut.$scope = Scope.create(LF.none, sut, null);
        },
        getScope(sut: CustomAttribute) { return Scope.create(LF.none, sut, null); }
      },
      {
        description: '$isBound: true, $scope !== null, same scope',
        expectation: 'does NOT call $unbind, does NOT call behaviors',
        callsUnbind: false,
        callsBehaviors: false,
        setProps(sut: CustomAttribute) {
          sut.$state |= State.isBound;
          sut.$scope = Scope.create(LF.none, sut, null);
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
        getScope(sut: CustomAttribute) { return Scope.create(LF.none, sut, null); }
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
          sut.$scope = Scope.create(LF.none, sut, null);
        },
        getScope(sut: CustomAttribute) { return Scope.create(LF.none, sut, null); }
      },
      {
        description: '$isBound: false, $scope !== null, same scope',
        expectation: 'does NOT call $unbind, calls behaviors',
        callsUnbind: false,
        callsBehaviors: true,
        setProps(sut: CustomAttribute) {
          sut.$scope = Scope.create(LF.none, sut, null);
        },
        getScope(sut: CustomAttribute) { return sut.$scope; }
      }
    ];

    const flagsSpecs = [
      {
        description: 'flags: LF.fromBind',
        expectation: 'passed-through flags: fromBind',
        getFlags() {
          return LF.fromBind;
        },
        getExpectedFlags() {
          return LF.fromBind;
        }
      },
      {
        description: 'flags: LF.fromUnbind',
        expectation: 'passed-through flags: fromBind|fromUnbind',
        getFlags() {
          return LF.fromUnbind;
        },
        getExpectedFlags() {
          return LF.fromBind | LF.fromUnbind;
        }
      },
      {
        description: 'flags: LF.updateTargetInstance',
        expectation: 'passed-through flags: fromBind|updateTargetInstance',
        getFlags() {
          return LF.updateTargetInstance;
        },
        getExpectedFlags() {
          return LF.fromBind | LF.updateTargetInstance;
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
        verifyBehaviorInvocation(sut: CustomAttribute, flags: LF) {
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
        verifyBehaviorInvocation(sut: CustomAttribute, flags: LF) {
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: 'Hooks.hasBinding | Hooks.hasBound',
        expectation: 'calls binding(), calls bound()',
        getHooks() {
          return Hooks.hasBinding | Hooks.hasBound;
        },
        verifyBehaviorInvocation(sut: CustomAttribute, flags: LF) {
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
        verifyBehaviorInvocation(sut: CustomAttribute, flags: LF) {
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
        sut.$unbind = flags2 => {
          unbindCalled = true;
          unbindFlags = flags2;
        };

        // Act
        sut.$bind(flags, scope);

        // Assert
        expect(unbindCalled).to.equal(psSpec.callsUnbind, 'unbindCalled');
        if (unbindCalled) {
          expect(unbindFlags).to.equal(expectedFlags, 'unbindFlags');
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
        setProps(sut: CustomAttribute) { return; }
      },
      {
        description: '$isBound: false, $scope !== null',
        expectation: 'calls behaviors',
        callsBehaviors: false,
        setProps(sut: CustomAttribute) { return; }
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
        description: 'flags: LF.fromBind',
        expectation: 'passed-through flags: fromUnbind|fromBind',
        getFlags() { return LF.fromUnbind; },
        getExpectedFlags() { return LF.fromUnbind; }
      },
      {
        description: 'flags: LF.fromUnbind',
        expectation: 'passed-through flags: fromUnbind',
        getFlags() { return LF.fromUnbind; },
        getExpectedFlags() { return LF.fromUnbind | LF.fromUnbind; }
      },
      {
        description: 'flags: LF.updateTargetInstance',
        expectation: 'passed-through flags: fromUnbind|updateTargetInstance',
        getFlags() { return LF.updateTargetInstance; },
        getExpectedFlags() { return LF.fromUnbind | LF.updateTargetInstance; }
      }
    ];

    const hooksSpecs = [
      {
        description: 'Hooks.hasUnbinding',
        expectation: 'calls unbinding(), does NOT call unbound()',
        getHooks() { return Hooks.hasUnbinding; },
        verifyBehaviorInvocation(sut: CustomAttribute, flags: LF) {
          sut.verifyUnbindingCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: 'Hooks.none',
        expectation: 'does NOT call unbinding(), does NOT call unbound()',
        getHooks() { return Hooks.none; },
        verifyBehaviorInvocation(sut: CustomAttribute, flags: LF) {
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: 'Hooks.hasUnbinding | Hooks.hasUnbound',
        expectation: 'calls unbinding(), calls unbound()',
        getHooks() { return Hooks.hasUnbinding | Hooks.hasUnbound; },
        verifyBehaviorInvocation(sut: CustomAttribute, flags: LF) {
          sut.verifyUnboundCalled(flags);
          sut.verifyUnbindingCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: 'Hooks.hasUnbound',
        expectation: 'does NOT call unbinding(), calls unbound()',
        getHooks() { return Hooks.hasUnbound; },
        verifyBehaviorInvocation(sut: CustomAttribute, flags: LF) {
          sut.verifyUnboundCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      }
    ];

    eachCartesianJoin([propsAndScopeSpecs, flagsSpec, hooksSpecs],
                      (psSpec, flagsSpec2, hooksSpec) => {

      it(`${psSpec.expectation} if ${psSpec.description} AND ${hooksSpec.expectation} if ${hooksSpec.description} AND ${flagsSpec2.expectation} if ${flagsSpec2.description}`, () => {
        // Arrange
        const { sut } = createCustomAttribute();
        psSpec.setProps(sut);
        sut.$hooks = hooksSpec.getHooks();
        const expectedFlags = flagsSpec2.getExpectedFlags();
        const flags = flagsSpec2.getFlags();

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
