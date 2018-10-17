import { customAttribute, templateController, CustomAttributeResource, createCustomAttributeDescription, ICustomAttribute, IRenderingEngine, RenderingEngine, Scope, BindingFlags, ICustomAttributeType } from '../../../src/index';
import { expect } from 'chai';
import { defineComponentLifecycleMock, IComponentLifecycleMock } from '../mock';
import { Writable } from '@aurelia/kernel';
import { eachCartesianJoin } from '../util';

// Note regarding the expect() assertions:
// We're intentionally using the less declarative to.equal() syntax for true/false/null equality comparison
// because this allows us to add a message to the assertion describing which property was checked, making it
// easier to pin down the source of the error when a test fail.
describe('@customAttribute', () => {

  function setupBase() {
    const decorate = customAttribute('foo');
    const Type = decorate(defineComponentLifecycleMock());
    const sut: ICustomAttribute & IComponentLifecycleMock = new (<any>Type)();

    return { Type, sut };
  }

  // Note: the sut and the mock are the same polymorphic object in these tests.
  // This is because the "real" sut is the decorator that modifies the prototype of the mock
  describe('$hydrate', () => {

    const behaviorPossibilities = [
      {
        description: '$behavior.hasCreated: true',
        expectation: 'calls created()',
        getBehavior() {
          return { hasCreated: true };
        },
        verifyBehaviorInvocation(mock: IComponentLifecycleMock) {
          mock.verifyCreatedCalled();
          mock.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasCreated: false',
        expectation: 'does NOT call created()',
        getBehavior() {
          return { hasCreated: false };
        },
        verifyBehaviorInvocation(mock: IComponentLifecycleMock) {
          mock.verifyNoFurtherCalls();
        }
      }
    ];

    function setup(behavior) {
      const { Type, sut } = setupBase();

      let appliedType: ICustomAttributeType;
      let appliedInstance: ICustomAttribute;
      const renderingEngine: IRenderingEngine = <any>{
        applyRuntimeBehavior(type: ICustomAttributeType, instance: ICustomAttribute) {
          instance['$behavior'] = behavior;
          appliedType = type;
          appliedInstance = instance;
        }
      };
      function verifyBehaviorApplication() {
        expect(appliedType).to.equal(Type, 'appliedType');
        expect(appliedInstance).to.equal(sut, 'appliedInstance');
      }

      return { sut, renderingEngine, verifyBehaviorApplication };
    }

    for (const behaviorPossibility of behaviorPossibilities) {
      const { description, getBehavior, expectation, verifyBehaviorInvocation } = behaviorPossibility;

      it(`sets properties, applies runtime behavior and ${expectation} if ${description}`, () => {
        const behavior = getBehavior();
        const { sut, renderingEngine, verifyBehaviorApplication } = setup(behavior);

        sut.$hydrate(renderingEngine);

        expect(sut.$isAttached).to.equal(false, 'sut.$isAttached');
        expect(sut.$isBound).to.equal(false, 'sut.$isBound');
        expect(sut.$scope).to.equal(null, 'sut.$scope');

        verifyBehaviorApplication();
        verifyBehaviorInvocation(sut);
      });
    }
  });

  describe('$bind', () => {
    const initialStateAndInputScopePossibilities = [
      // $isBound: true, with 4 variants
      {
        description: '$isBound: true, $scope: null, different scope',
        expectation: 'calls $unbind, calls behaviors',
        callsUnbind: true,
        callsBehaviors: true,
        setInitialProperties(sut: ICustomAttribute) {
          const $sut = sut as Writable<ICustomAttribute>;
          $sut.$isBound = true;
          $sut.$scope = null;
        },
        getScope(sut: ICustomAttribute) {
          return Scope.create(sut, null);
        }
      },
      {
        description: '$isBound: true, $scope: null, same scope',
        expectation: 'does NOT call $unbind, does NOT call behaviors',
        callsUnbind: false,
        callsBehaviors: false,
        setInitialProperties(sut: ICustomAttribute) {
          const $sut = sut as Writable<ICustomAttribute>;
          $sut.$isBound = true;
          $sut.$scope = null;
        },
        getScope(sut: ICustomAttribute) {
          return sut.$scope;
        }
      },
      {
        description: '$isBound: true, $scope !== null, different scope',
        expectation: 'calls $unbind, calls behaviors',
        callsUnbind: true,
        callsBehaviors: true,
        setInitialProperties(sut: ICustomAttribute) {
          const $sut = sut as Writable<ICustomAttribute>;
          $sut.$isBound = true;
          $sut.$scope = Scope.create(sut, null);
        },
        getScope(sut: ICustomAttribute) {
          return Scope.create(sut, null);
        }
      },
      {
        description: '$isBound: true, $scope !== null, same scope',
        expectation: 'does NOT call $unbind, does NOT call behaviors',
        callsUnbind: false,
        callsBehaviors: false,
        setInitialProperties(sut: ICustomAttribute) {
          const $sut = sut as Writable<ICustomAttribute>;
          $sut.$isBound = true;
          $sut.$scope = Scope.create(sut, null);
        },
        getScope(sut: ICustomAttribute) {
          return sut.$scope;
        }
      },
      // $isBound: false, with otherwise the same 4 variants
      {
        description: '$isBound: false, $scope: null, different scope',
        expectation: 'does NOT call $unbind, calls behaviors',
        callsUnbind: false,
        callsBehaviors: true,
        setInitialProperties(sut: ICustomAttribute) {
          const $sut = sut as Writable<ICustomAttribute>;
          $sut.$isBound = false;
          $sut.$scope = null;
        },
        getScope(sut: ICustomAttribute) {
          return Scope.create(sut, null);
        }
      },
      {
        description: '$isBound: false, $scope: null, same scope',
        expectation: 'does NOT call $unbind, calls behaviors',
        callsUnbind: false,
        callsBehaviors: true,
        setInitialProperties(sut: ICustomAttribute) {
          const $sut = sut as Writable<ICustomAttribute>;
          $sut.$isBound = false;
          $sut.$scope = null;
        },
        getScope(sut: ICustomAttribute) {
          return sut.$scope;
        }
      },
      {
        description: '$isBound: false, $scope !== null, different scope',
        expectation: 'does NOT call $unbind, calls behaviors',
        callsUnbind: false,
        callsBehaviors: true,
        setInitialProperties(sut: ICustomAttribute) {
          const $sut = sut as Writable<ICustomAttribute>;
          $sut.$isBound = false;
          $sut.$scope = Scope.create(sut, null);
        },
        getScope(sut: ICustomAttribute) {
          return Scope.create(sut, null);
        }
      },
      {
        description: '$isBound: false, $scope !== null, same scope',
        expectation: 'does NOT call $unbind, calls behaviors',
        callsUnbind: false,
        callsBehaviors: true,
        setInitialProperties(sut: ICustomAttribute) {
          const $sut = sut as Writable<ICustomAttribute>;
          $sut.$isBound = false;
          $sut.$scope = Scope.create(sut, null);
        },
        getScope(sut: ICustomAttribute) {
          return sut.$scope;
        }
      }
    ];

    const flagsPossibilities = [
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

    const behaviorPossibilities = [
      {
        description: '$behavior.hasBinding: true, $behavior.hasBound: false',
        expectation: 'calls binding(), does NOT call bound()',
        getBehavior() {
          return { hasBinding: true, hasBound: false };
        },
        verifyBehaviorInvocation(mock: IComponentLifecycleMock, flags: BindingFlags) {
          mock.verifyBindingCalled(flags);
          mock.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasBinding: false, $behavior.hasBound: false',
        expectation: 'does NOT call binding(), does NOT call bound()',
        getBehavior() {
          return { hasBinding: false, hasBound: false };
        },
        verifyBehaviorInvocation(mock: IComponentLifecycleMock, flags: BindingFlags) {
          mock.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasBinding: true, $behavior.hasBound: true',
        expectation: 'calls binding(), calls bound()',
        getBehavior() {
          return { hasBinding: true, hasBound: true };
        },
        verifyBehaviorInvocation(mock: IComponentLifecycleMock, flags: BindingFlags) {
          mock.verifyBoundCalled(flags);
          mock.verifyBindingCalled(flags);
          mock.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasBinding: false, $behavior.hasBound: true',
        expectation: 'does NOT call binding(), calls bound()',
        getBehavior() {
          return { hasBinding: false, hasBound: true };
        },
        verifyBehaviorInvocation(mock: IComponentLifecycleMock, flags: BindingFlags) {
          mock.verifyBoundCalled(flags);
          mock.verifyNoFurtherCalls();
        }
      }
    ];

    function setup(behavior, callsUnbind, expectedFlags) {
      const { sut } = setupBase();

      sut['$behavior'] = behavior;

      let unbindCalled = false;
      let unbindFlags;
      sut.$unbind = flags => {
        unbindCalled = true;
        unbindFlags = flags;
      };
      function verifyLifecycleInvocation() {
        expect(unbindCalled).to.equal(callsUnbind, 'unbindCalled');
        if (unbindCalled) {
          expect(unbindFlags).to.equal(expectedFlags, 'unbindFlags')
        }
      }

      return { sut, verifyLifecycleInvocation };
    }

    eachCartesianJoin([
      initialStateAndInputScopePossibilities,
      flagsPossibilities,
      behaviorPossibilities,
    ], (initialStatePossibility, flagsPossibility, behaviorPossibility) => {
      const {
        description: initialStateDescription,
        expectation: initialStateExpectation,
        callsUnbind,
        callsBehaviors,
        setInitialProperties,
        getScope
      } = initialStatePossibility;
      const {
        description: flagsDescription,
        expectation: flagsExpectation,
        getFlags,
        getExpectedFlags
      } = flagsPossibility;
      const {
        description: behaviorDescription,
        expectation: behaviorExpectation,
        getBehavior,
        verifyBehaviorInvocation
      } = behaviorPossibility;

      if (callsBehaviors) {
        it(`${initialStateExpectation} if ${initialStateDescription} AND ${behaviorExpectation} if ${behaviorDescription} AND ${flagsExpectation} if ${flagsDescription}`, () => {
          const behavior = getBehavior();
          const expectedFlags = getExpectedFlags();

          const { sut, verifyLifecycleInvocation } = setup(behavior, callsUnbind, expectedFlags);

          setInitialProperties(sut);

          const scope = getScope(sut);
          const flags = getFlags();

          sut.$bind(flags, scope);

          verifyLifecycleInvocation();
          verifyBehaviorInvocation(sut, expectedFlags);
        });
      } else {
        it(`${initialStateExpectation} if ${initialStateDescription} AND ${flagsExpectation} if ${flagsDescription}`, () => {
          const behavior = getBehavior();
          const expectedFlags = getExpectedFlags();

          const { sut, verifyLifecycleInvocation } = setup(behavior, callsUnbind, expectedFlags);

          setInitialProperties(sut);

          const scope = getScope(sut);
          const flags = getFlags();

          sut.$bind(flags, scope);

          verifyLifecycleInvocation();
          sut.verifyNoFurtherCalls();
        });
      }
    });
  });

  describe('$unbind', () => {

  });

  describe('$attach', () => {

  });

  describe('$detach', () => {

  });

  describe('$cache', () => {

  });
});

describe('@templateController', () => {

});

describe('CustomAttributeResource', () => {

});

describe('createCustomAttributeDescription', () => {

});
