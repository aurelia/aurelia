import { Hooks, LifecycleFlags as LF, Scope, State } from '../../src/index';
import { createCustomElement, CustomElement } from '../resources/custom-element._builder';
import { eachCartesianJoin } from '../util';

describe('@customElement', () => {

  describe('$bind', () => {

    const propsAndScopeSpecs = [
      {
        description: '$isBound: true',
        expectation: 'does NOT call behaviors',
        callsBehaviors: false,
        setProps(sut: CustomElement) {
          sut.$state |= State.isBound;
        }
      },
      {
        description: '$isBound: false',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomElement) {
          sut.$state &= ~State.isBound;
        }
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
        verifyBehaviorInvocation(sut: CustomElement, flags: LF) {
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
        verifyBehaviorInvocation(sut: CustomElement, flags: LF) {
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: 'Hooks.hasBinding | Hooks.hasBound',
        expectation: 'calls binding(), calls bound()',
        getHooks() {
          return Hooks.hasBinding | Hooks.hasBound;
        },
        verifyBehaviorInvocation(sut: CustomElement, flags: LF) {
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
        verifyBehaviorInvocation(sut: CustomElement, flags: LF) {
          sut.verifyBoundCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      }
    ];

    eachCartesianJoin([propsAndScopeSpecs, flagsSpecs, hooksSpecs],
                      (psSpec, flagsSpec, hooksSpec) => {

      it(`${psSpec.expectation} if ${psSpec.description} AND ${hooksSpec.expectation} if ${hooksSpec.description} AND ${flagsSpec.expectation} if ${flagsSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomElement('foo');
        psSpec.setProps(sut);
        sut.$scope = Scope.create(LF.none, sut, null);
        sut.$bindableHead = sut.$bindableTail = null;
        sut.$attachableHead = sut.$attachableTail = null;
        sut.$hooks = hooksSpec.getHooks();
        const expectedFlags = flagsSpec.getExpectedFlags();
        const flags = flagsSpec.getFlags();

        // Act
        sut.$bind(flags);

        // Assert
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
        description: '$isBound: false',
        expectation: 'does NOT call behaviors',
        callsBehaviors: false,
        setProps(sut: CustomElement) {
          sut.$state &= ~State.isBound;
        }
      },
      {
        description: '$isBound: true',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomElement) {
          sut.$state |= State.isBound;
        }
      }
    ];

    const flagsSpecs = [
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
        verifyBehaviorInvocation(sut: CustomElement, flags: LF) {
          sut.verifyUnbindingCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: 'Hooks.none',
        expectation: 'does NOT call unbinding(), does NOT call unbound()',
        getHooks() { return Hooks.none; },
        verifyBehaviorInvocation(sut: CustomElement, flags: LF) {
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: 'Hooks.hasUnbinding | Hooks.hasUnbound',
        expectation: 'calls unbinding(), calls unbound()',
        getHooks() { return Hooks.hasUnbinding | Hooks.hasUnbound; },
        verifyBehaviorInvocation(sut: CustomElement, flags: LF) {
          sut.verifyUnboundCalled(flags);
          sut.verifyUnbindingCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: 'Hooks.hasUnbound',
        expectation: 'does NOT call unbinding(), calls unbound()',
        getHooks() { return Hooks.hasUnbound; },
        verifyBehaviorInvocation(sut: CustomElement, flags: LF) {
          sut.verifyUnboundCalled(flags);
          sut.verifyNoFurtherCalls();
        }
      }
    ];

    eachCartesianJoin([propsAndScopeSpecs, flagsSpecs, hooksSpecs],
                      (psSpec, flagsSpec, hooksSpec) => {

      it(`${psSpec.expectation} if ${psSpec.description} AND ${hooksSpec.expectation} if ${hooksSpec.description} AND ${flagsSpec.expectation} if ${flagsSpec.description}`, () => {
        // Arrange
        const { sut } = createCustomElement('foo');
        psSpec.setProps(sut);
        sut.$scope = Scope.create(LF.none, sut, null);
        sut.$bindableHead = sut.$bindableTail = null;
        sut.$attachableHead = sut.$attachableTail = null;
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
