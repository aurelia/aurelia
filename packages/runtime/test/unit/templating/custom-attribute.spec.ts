import { customAttribute, templateController, CustomAttributeResource, LifecycleState, ICustomAttribute, IRenderingEngine, Scope, BindingFlags, ICustomAttributeType, IAttachLifecycle, INode, IDetachLifecycle, IAttributeDefinition, BindingMode, IInternalCustomAttributeImplementation, IRuntimeBehavior, LifecycleHooks } from '../../../src/index';
import { expect } from 'chai';
import { defineComponentLifecycleMock, IComponentLifecycleMock } from '../mock';
import { Writable, PLATFORM } from '@aurelia/kernel';
import { eachCartesianJoin } from '../util';
import { Container } from '../../../../kernel/src';

type CustomAttribute = Writable<IInternalCustomAttributeImplementation> & IComponentLifecycleMock;

// Note regarding the expect() assertions:
// We're intentionally using the less declarative to.equal() syntax for true/false/null equality comparison
// because this allows us to add a message to the assertion describing which property was checked, making it
// easier to pin down the source of the error when a test fail.
describe('@customAttribute', () => {

  function createCustomAttribute(nameOrDef: string | IAttributeDefinition = 'foo') {
    const Type = customAttribute(nameOrDef)(defineComponentLifecycleMock());
    const sut: CustomAttribute = new (<any>Type)();

    return { Type, sut };
  }

  const descriptionKeys = ['name', 'aliases', 'defaultBindingMode', 'isTemplateController', 'bindables'];

  it('creates the default attribute description', () => {
    const { Type } = createCustomAttribute('foo');
    expect(Type.description).to.be.a('object', 'description');
    expect(Type.description.name).to.equal('foo', 'name');
    expect(Type.description.aliases).to.equal(PLATFORM.emptyArray, 'aliases');
    expect(Type.description.defaultBindingMode).to.equal(BindingMode.toView, 'defaultBindingMode');
    expect(Type.description.isTemplateController).to.equal(false, 'isTemplateController');
    expect(Type.description.bindables).to.deep.equal({}, 'bindables');
    expect(Object.keys(Type.description)).to.deep.equal(descriptionKeys);
  });

  const aliasesSpecs = [
    {
      description: 'aliases is null',
      expectation: 'uses PLATFORM.emptyArray',
      getAliases() { return null },
      getExpectedAliases(def: IAttributeDefinition) {
        return PLATFORM.emptyArray;
      }
    },
    {
      description: 'aliases is undefined',
      expectation: 'uses PLATFORM.emptyArray',
      getAliases() { return undefined },
      getExpectedAliases(def: IAttributeDefinition) {
        return PLATFORM.emptyArray;
      }
    },
    {
      description: 'aliases is empty array',
      expectation: 'uses the provided aliases',
      getAliases() { return [] },
      getExpectedAliases(def: IAttributeDefinition) {
        return def.aliases;
      }
    },
    {
      description: 'aliases has one item',
      expectation: 'uses the provided aliases',
      getAliases() { return ['a'] },
      getExpectedAliases(def: IAttributeDefinition) {
        return def.aliases;
      }
    },
    {
      description: 'aliases has three items',
      expectation: 'uses the provided aliases',
      getAliases() { return ['a', 'b', 'c'] },
      getExpectedAliases(def: IAttributeDefinition) {
        return def.aliases;
      }
    }
  ];

  eachCartesianJoin([aliasesSpecs], (aliasesSpec) => {
    it(`${aliasesSpec.expectation} if ${aliasesSpec.description}`, () => {
      // Arrange
      const def = {
        name: 'foo',
        aliases: aliasesSpec.getAliases(),
      };

      // Act
      const Type = customAttribute(def)(class {});

      // Assert
      const expectedAliases = aliasesSpec.getExpectedAliases(def);
      const description = Type.description;
      expect(description.name).to.equal('foo', 'name');
      expect(description.aliases).to.deep.equal(expectedAliases, 'aliases');
      expect(Type.description.defaultBindingMode).to.equal(BindingMode.toView, 'defaultBindingMode');
      expect(Type.description.isTemplateController).to.equal(false, 'isTemplateController');
      expect(Type.description.bindables).to.deep.equal({}, 'bindables');
      expect(Object.keys(Type.description)).to.deep.equal(descriptionKeys);
    });
  });

  const bindingModeSpecs = [
    {
      description: 'bindingMode is null',
      expectation: 'uses BindingMode.toView',
      getBindingMode() { return null },
      getExpectedBindingMode(def: IAttributeDefinition) {
        return BindingMode.toView;
      }
    },
    {
      description: 'bindingMode is undefined',
      expectation: 'uses BindingMode.toView',
      getBindingMode() { return undefined },
      getExpectedBindingMode(def: IAttributeDefinition) {
        return BindingMode.toView;
      }
    },
    {
      description: 'bindingMode is BindingMode.toView',
      expectation: 'uses the provided BindingMode',
      getBindingMode() { return BindingMode.toView },
      getExpectedBindingMode(def: IAttributeDefinition) {
        return def.defaultBindingMode;
      }
    },
    {
      description: 'bindingMode is BindingMode.oneTime',
      expectation: 'uses the provided BindingMode',
      getBindingMode() { return BindingMode.oneTime },
      getExpectedBindingMode(def: IAttributeDefinition) {
        return def.defaultBindingMode;
      }
    },
    {
      description: 'bindingMode is BindingMode.fromView',
      expectation: 'uses the provided BindingMode',
      getBindingMode() { return BindingMode.fromView },
      getExpectedBindingMode(def: IAttributeDefinition) {
        return def.defaultBindingMode;
      }
    },
    {
      description: 'bindingMode is BindingMode.twoWay',
      expectation: 'uses the provided BindingMode',
      getBindingMode() { return BindingMode.twoWay },
      getExpectedBindingMode(def: IAttributeDefinition) {
        return def.defaultBindingMode;
      }
    },
    {
      description: 'bindingMode is BindingMode.default',
      expectation: 'uses the provided BindingMode',
      getBindingMode() { return BindingMode.default },
      getExpectedBindingMode(def: IAttributeDefinition) {
        return def.defaultBindingMode;
      }
    }
  ];

  eachCartesianJoin([bindingModeSpecs], (bindingModeSpec) => {
    it(`${bindingModeSpec.expectation} if ${bindingModeSpec.description}`, () => {
      // Arrange
      const def = {
        name: 'foo',
        defaultBindingMode: bindingModeSpec.getBindingMode(),
      };

      // Act
      const Type = customAttribute(def)(class {});

      // Assert
      const expectedBindingMode = bindingModeSpec.getExpectedBindingMode(def);
      const description = Type.description;
      expect(Type.description.aliases).to.equal(PLATFORM.emptyArray, 'aliases');
      expect(description.name).to.equal('foo', 'name');
      expect(description.defaultBindingMode).to.equal(expectedBindingMode, 'defaultBindingMode');
      expect(Type.description.isTemplateController).to.equal(false, 'isTemplateController');
      expect(Type.description.bindables).to.deep.equal({}, 'bindables');
      expect(Object.keys(Type.description)).to.deep.equal(descriptionKeys);
    });
  });

  const bindablesSpecs = [
    {
      description: 'def.bindables is null, Type.bindables is null',
      expectation: 'does NOT yield any bindables',
      getDefBindables() { return null },
      getTypeBindables() { return null },
      getExpectedBindables() { return {} }
    },
    {
      description: 'def.bindables is undefined, Type.bindables is undefined',
      expectation: 'does NOT yield any bindables',
      getDefBindables() { return undefined },
      getTypeBindables() { return undefined },
      getExpectedBindables() { return {} }
    },
    {
      description: 'def.bindables is empty obj, Type.bindables is empty obj',
      expectation: 'does NOT yield any bindables',
      getDefBindables() { return {} },
      getTypeBindables() { return {} },
      getExpectedBindables() { return {} }
    },
    {
      description: 'def.bindables has bindables, Type.bindables is empty obj',
      expectation: 'yields bindables from def',
      getDefBindables() { return { 'foo': 1 } },
      getTypeBindables() { return {} },
      getExpectedBindables() { return { 'foo': 1 } }
    },
    {
      description: 'def.bindables has bindables, Type.bindables has different bindables',
      expectation: 'yields bindables from def and Type',
      getDefBindables() { return { 'foo': 1 } },
      getTypeBindables() { return { 'bar': 2 } },
      getExpectedBindables() { return { 'foo': 1, 'bar': 2 } }
    },
    {
      description: 'def.bindables is empty obj, Type.bindables has different bindables',
      expectation: 'yields bindables from Type',
      getDefBindables() { return { } },
      getTypeBindables() { return { 'bar': 2 } },
      getExpectedBindables() { return { 'bar': 2 } }
    },
    {
      description: 'def.bindables has bindables, Type.bindables has same bindables',
      expectation: 'yields bindables from def',
      getDefBindables() { return { 'foo': 1 } },
      getTypeBindables() { return { 'foo': 2 } },
      getExpectedBindables() { return { 'foo': 1 } }
    }
  ];

  eachCartesianJoin([bindablesSpecs], (bindablesSpec) => {
    it(`${bindablesSpec.expectation} if ${bindablesSpec.description}`, () => {
      // Arrange
      const def = {
        name: 'foo',
        bindables: bindablesSpec.getDefBindables(),
      };
      class Foo {
        static bindables = bindablesSpec.getTypeBindables();
      }

      // Act
      const Type = customAttribute(def)(Foo);

      // Assert
      const expectedBindables = bindablesSpec.getExpectedBindables();
      const description = Type.description;
      expect(Type.description.name).to.equal('foo', 'name');
      expect(Type.description.aliases).to.equal(PLATFORM.emptyArray, 'aliases');
      expect(Type.description.defaultBindingMode).to.equal(BindingMode.toView, 'defaultBindingMode');
      expect(Type.description.isTemplateController).to.equal(false, 'isTemplateController');
      expect(description.bindables).to.deep.equal(expectedBindables, 'bindables');
      expect(Object.keys(Type.description)).to.deep.equal(descriptionKeys);
    });
  });


  describe('register', () => {
    it('registers the custom attribute as transient', () => {
      const { Type } = createCustomAttribute();
      const container = new Container();

      Type.register(container);

      const resolved1 = container.get('custom-attribute:foo');
      const resolved2 = container.get('custom-attribute:foo');
      expect(resolved1).not.to.equal(resolved2);
    });

    it('registers the custom attribute with aliases that are transient', () => {
      const { Type } = createCustomAttribute({
        name: 'foo',
        aliases: ['bar', 'baz']
      });
      const container = new Container();

      Type.register(container);

      const resolved1 = container.get('custom-attribute:foo');
      const resolved2 = container.get('custom-attribute:bar');
      const resolved3 = container.get('custom-attribute:bar');
      const resolved4 = container.get('custom-attribute:baz');
      const resolved5 = container.get('custom-attribute:baz');
      expect(resolved1.constructor).to.equal(resolved2.constructor);
      expect(resolved1.constructor).to.equal(resolved4.constructor);
      expect(resolved2).not.to.equal(resolved3);
      expect(resolved4).not.to.equal(resolved5);
    });
  });

  // Note: the sut and the sut are the same polymorphic object in these tests.
  // This is because the "real" sut is the decorator that modifies the prototype of the sut
  describe('$hydrate', () => {

    const behaviorSpecs = [
      {
        description: '$behavior.hasCreated: true',
        expectation: 'calls created()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasCreated }; },
        verifyBehaviorInvocation(sut: CustomAttribute) {
          sut.verifyCreatedCalled();
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasCreated: false',
        expectation: 'does NOT call created()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.none }; },
        verifyBehaviorInvocation(sut: CustomAttribute) {
          sut.verifyNoFurtherCalls();
        }
      }
    ];

    eachCartesianJoin([behaviorSpecs],
      (behaviorSpec) => {

      it(`sets properties, applies runtime behavior and ${behaviorSpec.expectation} if ${behaviorSpec.description}`, () => {
        // Arrange
        const { Type, sut } = createCustomAttribute();

        let appliedType: ICustomAttributeType;
        let appliedInstance: CustomAttribute;
        const renderingEngine: IRenderingEngine = <any>{
          applyRuntimeBehavior(type: ICustomAttributeType, instance: CustomAttribute) {
            instance.$behavior = behaviorSpec.getBehavior();
            appliedType = type;
            appliedInstance = instance;
          }
        };

        // Act
        sut.$hydrate(renderingEngine);

        // Assert
        expect(sut.$isAttached).to.equal(false, 'sut.$isAttached');
        expect(sut.$state & LifecycleState.isBound).to.equal(0, 'sut.$isBound');
        expect(sut.$scope).to.equal(null, 'sut.$scope');

        expect(appliedType).to.equal(Type, 'appliedType');
        expect(appliedInstance).to.equal(sut, 'appliedInstance');
        behaviorSpec.verifyBehaviorInvocation(sut);
      });
    });
  });

  describe('$bind', () => {

    const propsAndScopeSpecs = [
      // $isBound: true, with 4 variants
      {
        description: '$isBound: true, $scope: null, different scope',
        expectation: 'calls $unbind, calls behaviors',
        callsUnbind: true,
        callsBehaviors: true,
        setProps(sut: CustomAttribute) {
          sut.$isAttached = false;
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
          sut.$isAttached = false;
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
          sut.$isAttached = false;
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
          sut.$isAttached = false;
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
          sut.$isAttached = false;
          sut.$state &= ~LifecycleState.isBound;
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
          sut.$isAttached = false;
          sut.$state &= ~LifecycleState.isBound;
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
          sut.$isAttached = false;
          sut.$state &= ~LifecycleState.isBound;
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
          sut.$isAttached = false;
          sut.$state &= ~LifecycleState.isBound;
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
        setProps(sut: CustomAttribute) {
          sut.$isAttached = false;
          sut.$state &= ~LifecycleState.isBound;
        }
      },
      {
        description: '$isBound: false, $scope !== null',
        expectation: 'calls behaviors',
        callsBehaviors: false,
        setProps(sut: CustomAttribute) {
          sut.$isAttached = false;
          sut.$state &= ~LifecycleState.isBound;
        }
      },
      {
        description: '$isBound: true, $scope: null',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomAttribute) {
          sut.$isAttached = false;
          sut.$state |= LifecycleState.isBound;
        }
      },
      {
        description: '$isBound: true, $scope !== null',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomAttribute) {
          sut.$isAttached = false;
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

  describe('$attach', () => {

    const propsSpecs = [
      {
        description: '$isAttached: false',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomAttribute) {
          sut.$isAttached = false;
          sut.$state |= LifecycleState.isBound;
        }
      },
      {
        description: '$isAttached: true',
        expectation: 'does NOT call behaviors',
        callsBehaviors: false,
        setProps(sut: CustomAttribute) {
          sut.$isAttached = true;
          sut.$state |= LifecycleState.isBound;
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
          sut.$isAttached = false;
          sut.$state |= LifecycleState.isBound;
        }
      },
      {
        description: '$isAttached: true',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomAttribute) {
          sut.$isAttached = true;
          sut.$state |= LifecycleState.isBound;
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

describe('@templateController', () => {

  function createTemplateController(nameOrDef: string | IAttributeDefinition = 'foo') {
    const Type = templateController(nameOrDef)(defineComponentLifecycleMock());
    const sut: CustomAttribute = new (<any>Type)();

    return { Type, sut };
  }

  it('marks the resource as a template controller if it only has a name', () => {
    const { Type } = createTemplateController('foo');
    expect(Type.description.isTemplateController).to.equal(true, 'isTemplateController');
  });

  it('marks the resource as a template controller if it has a def', () => {
    const { Type } = createTemplateController({ name: 'foo' });
    expect(Type.description.isTemplateController).to.equal(true, 'isTemplateController');
  });
});

describe('CustomAttributeResource', () => {
  it('name is custom-attribute', () => {
    expect(CustomAttributeResource.name).to.equal('custom-attribute');
  });

  it('keyFrom() returns the full key', () => {
    expect(CustomAttributeResource.keyFrom('foo')).to.equal('custom-attribute:foo');
  });

  it('isType returns true if it is a custom-attribute', () => {
    const Type = customAttribute('foo')(class {});
    expect(CustomAttributeResource.isType(Type)).to.equal(true, 'isTy[e');
  });

  it('isType returns false if it is NOT a custom-attribute', () => {
    expect(CustomAttributeResource.isType(class {})).to.equal(false, 'isType');
  });
});
