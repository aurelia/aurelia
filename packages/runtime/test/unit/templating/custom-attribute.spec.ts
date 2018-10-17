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

  function setup() {
    const decorate = customAttribute('foo');
    const Type = decorate(defineComponentLifecycleMock());
    const sut: ICustomAttribute & IComponentLifecycleMock = new (<any>Type)();

    return { Type, sut };
  }

  // Note: the sut and the mock are the same polymorphic object in these tests.
  // This is because the "real" sut is the decorator that modifies the prototype of the mock
  describe('$hydrate', () => {

    const behaviorSpecs = [
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

    for (const behaviorSpec of behaviorSpecs) {

      it(`sets properties, applies runtime behavior and ${behaviorSpec.expectation} if ${behaviorSpec.description}`, () => {
        // Arrange
        const { Type, sut } = setup();

        let appliedType: ICustomAttributeType;
        let appliedInstance: ICustomAttribute;
        const renderingEngine: IRenderingEngine = <any>{
          applyRuntimeBehavior(type: ICustomAttributeType, instance: ICustomAttribute) {
            instance['$behavior'] = behaviorSpec.getBehavior();
            appliedType = type;
            appliedInstance = instance;
          }
        };

        // Act
        sut.$hydrate(renderingEngine);

        // Assert
        expect(sut.$isAttached).to.equal(false, 'sut.$isAttached');
        expect(sut.$isBound).to.equal(false, 'sut.$isBound');
        expect(sut.$scope).to.equal(null, 'sut.$scope');

        expect(appliedType).to.equal(Type, 'appliedType');
        expect(appliedInstance).to.equal(sut, 'appliedInstance');
        behaviorSpec.verifyBehaviorInvocation(sut);
      });
    }
  });

  describe('$bind', () => {
    const propsAndScopeSpecs = [
      // $isBound: true, with 4 variants
      {
        description: '$isBound: true, $scope: null, different scope',
        expectation: 'calls $unbind, calls behaviors',
        callsUnbind: true,
        callsBehaviors: true,
        setProps(sut: ICustomAttribute) {
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
        setProps(sut: ICustomAttribute) {
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
        setProps(sut: ICustomAttribute) {
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
        setProps(sut: ICustomAttribute) {
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
        setProps(sut: ICustomAttribute) {
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
        setProps(sut: ICustomAttribute) {
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
        setProps(sut: ICustomAttribute) {
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
        setProps(sut: ICustomAttribute) {
          const $sut = sut as Writable<ICustomAttribute>;
          $sut.$isBound = false;
          $sut.$scope = Scope.create(sut, null);
        },
        getScope(sut: ICustomAttribute) {
          return sut.$scope;
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

    eachCartesianJoin([
      propsAndScopeSpecs,
      flagsSpecs,
      behaviorSpecs,
    ], (psSpec, flagsSpec, behaviorSpec) => {

      it(`${psSpec.expectation} if ${psSpec.description} AND ${behaviorSpec.expectation} if ${behaviorSpec.description} AND ${flagsSpec.expectation} if ${flagsSpec.description}`, () => {
        // Arrange
        const expectedFlags = flagsSpec.getExpectedFlags();
        const { sut } = setup();
        sut['$behavior'] = behaviorSpec.getBehavior();

        let unbindCalled = false;
        let unbindFlags;
        sut.$unbind = flags => {
          unbindCalled = true;
          unbindFlags = flags;
        };

        psSpec.setProps(sut);

        const scope = psSpec.getScope(sut);
        const flags = flagsSpec.getFlags();

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
        setProps(sut: ICustomAttribute) {
          const $sut = sut as Writable<ICustomAttribute>;
          $sut.$isBound = false;
        }
      },
      {
        description: '$isBound: false, $scope !== null',
        expectation: 'calls behaviors',
        callsBehaviors: false,
        setProps(sut: ICustomAttribute) {
          const $sut = sut as Writable<ICustomAttribute>;
          $sut.$isBound = false;
        }
      },
      {
        description: '$isBound: true, $scope: null',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: ICustomAttribute) {
          const $sut = sut as Writable<ICustomAttribute>;
          $sut.$isBound = true;
        }
      },
      {
        description: '$isBound: true, $scope !== null',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: ICustomAttribute) {
          const $sut = sut as Writable<ICustomAttribute>;
          $sut.$isBound = true;
        }
      }
    ];

    const flagsSpec = [
      {
        description: 'flags: BindingFlags.fromBind',
        expectation: 'passed-through flags: fromUnbind|fromBind',
        getFlags() {
          return BindingFlags.fromUnbind;
        },
        getExpectedFlags() {
          return BindingFlags.fromUnbind;
        }
      },
      {
        description: 'flags: BindingFlags.fromUnbind',
        expectation: 'passed-through flags: fromUnbind',
        getFlags() {
          return BindingFlags.fromUnbind;
        },
        getExpectedFlags() {
          return BindingFlags.fromUnbind | BindingFlags.fromUnbind;
        }
      },
      {
        description: 'flags: BindingFlags.updateTargetInstance',
        expectation: 'passed-through flags: fromUnbind|updateTargetInstance',
        getFlags() {
          return BindingFlags.updateTargetInstance;
        },
        getExpectedFlags() {
          return BindingFlags.fromUnbind | BindingFlags.updateTargetInstance;
        }
      }
    ];

    const behaviorSpecs = [
      {
        description: '$behavior.hasUnbinding: true, $behavior.hasUnbound: false',
        expectation: 'calls binding(), does NOT call bound()',
        getBehavior() {
          return { hasUnbinding: true, hasUnbound: false };
        },
        verifyBehaviorInvocation(mock: IComponentLifecycleMock, flags: BindingFlags) {
          mock.verifyUnbindingCalled(flags);
          mock.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasUnbinding: false, $behavior.hasUnbound: false',
        expectation: 'does NOT call binding(), does NOT call bound()',
        getBehavior() {
          return { hasUnbinding: false, hasUnbound: false };
        },
        verifyBehaviorInvocation(mock: IComponentLifecycleMock, flags: BindingFlags) {
          mock.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasUnbinding: true, $behavior.hasUnbound: true',
        expectation: 'calls binding(), calls bound()',
        getBehavior() {
          return { hasUnbinding: true, hasUnbound: true };
        },
        verifyBehaviorInvocation(mock: IComponentLifecycleMock, flags: BindingFlags) {
          mock.verifyUnboundCalled(flags);
          mock.verifyUnbindingCalled(flags);
          mock.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasUnbinding: false, $behavior.hasUnbound: true',
        expectation: 'does NOT call binding(), calls bound()',
        getBehavior() {
          return { hasUnbinding: false, hasUnbound: true };
        },
        verifyBehaviorInvocation(mock: IComponentLifecycleMock, flags: BindingFlags) {
          mock.verifyUnboundCalled(flags);
          mock.verifyNoFurtherCalls();
        }
      }
    ];


    eachCartesianJoin([
      propsAndScopeSpecs,
      flagsSpec,
      behaviorSpecs,
  ], (psSpec, flagsSpec, behaviorSpec) => {

      it(`${psSpec.expectation} if ${psSpec.description} AND ${behaviorSpec.expectation} if ${behaviorSpec.description} AND ${flagsSpec.expectation} if ${flagsSpec.description}`, () => {
        // Arrange
        const behavior = behaviorSpec.getBehavior();
        const expectedFlags = flagsSpec.getExpectedFlags();

        const { sut } = setup();
        sut['$behavior'] = behavior;

        psSpec.setProps(sut);

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
