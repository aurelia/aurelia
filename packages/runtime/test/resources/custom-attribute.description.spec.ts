import { customAttribute, IAttributeDefinition, BindingMode } from '../../src/index';
import { expect } from 'chai';
import { PLATFORM } from '@aurelia/kernel';
import { eachCartesianJoin } from '../util';
import { createCustomAttribute } from './custom-attribute._builder';

// Note regarding the expect() assertions:
// We're intentionally using the less declarative to.equal() syntax for true/false/null equality comparison
// because this allows us to add a message to the assertion describing which property was checked, making it
// easier to pin down the source of the error when a test fail.
describe('@customAttribute', () => {
  const descriptionKeys = ['name', 'aliases', 'defaultBindingMode', 'hasDynamicOptions', 'isTemplateController', 'bindables'];

  it('creates the default attribute description', () => {
    const { Type } = createCustomAttribute('foo');
    expect(Type.description).to.be.a('object', 'description');
    expect(Type.description.name).to.equal('foo', 'name');
    expect(Type.description.aliases).to.equal(PLATFORM.emptyArray, 'aliases');
    expect(Type.description.defaultBindingMode).to.equal(BindingMode.toView, 'defaultBindingMode');
    expect(Type.description.hasDynamicOptions).to.equal(false, 'hasDynamicOptions');
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
      expect(Type.description.hasDynamicOptions).to.equal(false, 'hasDynamicOptions');
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
      expect(Type.description.hasDynamicOptions).to.equal(false, 'hasDynamicOptions');
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
      expect(Type.description.hasDynamicOptions).to.equal(false, 'hasDynamicOptions');
      expect(Type.description.isTemplateController).to.equal(false, 'isTemplateController');
      expect(description.bindables).to.deep.equal(expectedBindables, 'bindables');
      expect(Object.keys(Type.description)).to.deep.equal(descriptionKeys);
    });
  });
});
