import { MockTextNodeSequence, MockRenderingEngine, IComponentLifecycleMock, defineComponentLifecycleMock } from './../mock';
import { Immutable, PLATFORM, Writable } from '@aurelia/kernel';
import {
  IDetachLifecycle, LifecycleHooks, BindingFlags, customElement,
  useShadowDOM, containerless, CustomElementResource, ShadowDOMProjector,
  ContainerlessProjector, HostProjector, CustomAttributeResource, INode,
  ITemplateDefinition, IAttachLifecycle, INodeSequence, ICustomElement, noViewTemplate,
  ICustomElementType, IRenderingEngine, Scope, ITemplate, IInternalCustomElementImplementation,
  IRuntimeBehavior, IElementProjector, LifecycleState
} from '../../../src/index';
import { expect } from 'chai';
import { eachCartesianJoin } from '../util';

type CustomElement = Writable<IInternalCustomElementImplementation> & IComponentLifecycleMock;

describe('@customElement', () => {

  function createCustomElement(nameOrDef: string | ITemplateDefinition) {
    if (arguments.length === 0) {
      nameOrDef = 'foo';
    }
    const Type = customElement(nameOrDef)(defineComponentLifecycleMock());
    const sut: CustomElement = new (<any>Type)();

    return { Type, sut };
  }

  // #region description verification
  it('throws if input is undefined', () => {
    expect(() => createCustomElement(undefined)).to.throw('Code 70');
  });
  it('throws if input is null', () => {
    expect(() => createCustomElement(null)).to.throw('Code 70');
  });
  it('throws if input is empty', () => {
    expect(() => createCustomElement('')).to.throw('Code 70');
  });

  const descriptionKeys = [
    'name',
    'template',
    'cache',
    'build',
    'bindables',
    'instructions',
    'dependencies',
    'surrogates',
    'containerless',
    'shadowOptions',
    'hasSlots'
  ];

  it('creates the default template description', () => {
    const { Type } = createCustomElement({});
    expect(Type.description).to.be.a('object', 'description');
    expect(Type.description.name).to.equal('unnamed', 'name');
    expect(Type.description.template).to.equal(null, 'template');
    expect(Type.description.cache).to.equal(0, 'cache');
    expect(Type.description.build).to.deep.equal({ required: true, compiler: 'default' }, 'build');
    expect(Type.description.bindables).to.deep.equal({}, 'bindables');
    expect(Type.description.instructions).to.equal(PLATFORM.emptyArray, 'instructions');
    expect(Type.description.dependencies).to.equal(PLATFORM.emptyArray, 'dependencies');
    expect(Type.description.surrogates).to.equal(PLATFORM.emptyArray, 'surrogates');
    expect(Type.description.containerless).to.equal(false, 'containerless');
    expect(Type.description.shadowOptions).to.equal(null, 'shadowOptions');
    expect(Type.description.hasSlots).to.equal(false, 'hasSlots');
    expect(Object.keys(Type.description)).to.deep.equal(descriptionKeys);
  });

  const nameSpecs = [
    {
      description: 'name is undefined',
      expectation: 'uses unnamed',
      getName() { return undefined; },
      getExpectedname() { return 'unnamed'; }
    },
    {
      description: 'name is null',
      expectation: 'uses unnamed',
      getName() { return null; },
      getExpectedname() { return 'unnamed'; }
    },
    {
      description: 'name is empty',
      expectation: 'uses unnamed',
      getName() { return ''; },
      getExpectedname() { return 'unnamed'; }
    },
    {
      description: 'name is foo',
      expectation: 'uses provided name',
      getName() { return 'foo'; },
      getExpectedname() { return 'foo'; }
    }
  ];

  eachCartesianJoin([nameSpecs], (nameSpec) => {
    it(`${nameSpec.expectation} if ${nameSpec.description}`, () => {
      const { Type } = createCustomElement({ name: nameSpec.getName() });
      expect(Type.description).to.be.a('object', 'description');
      expect(Type.description.name).to.equal(nameSpec.getExpectedname(), 'name');
      expect(Type.description.template).to.equal(null, 'template');
      expect(Type.description.cache).to.equal(0, 'cache');
      expect(Type.description.build).to.deep.equal({ required: true, compiler: 'default' }, 'build');
      expect(Type.description.bindables).to.deep.equal({}, 'bindables');
      expect(Type.description.instructions).to.equal(PLATFORM.emptyArray, 'instructions');
      expect(Type.description.dependencies).to.equal(PLATFORM.emptyArray, 'dependencies');
      expect(Type.description.surrogates).to.equal(PLATFORM.emptyArray, 'surrogates');
      expect(Type.description.containerless).to.equal(false, 'containerless');
      expect(Type.description.shadowOptions).to.equal(null, 'shadowOptions');
      expect(Type.description.hasSlots).to.equal(false, 'hasSlots');
      expect(Object.keys(Type.description)).to.deep.equal(descriptionKeys);
    });
  });

  const templateSpecs = [
    {
      description: 'template is undefined',
      expectation: 'uses null',
      getTemplate() { return undefined; },
      getExpectedTemplate() { return null; }
    },
    {
      description: 'template is null',
      expectation: 'uses null',
      getTemplate() { return null; },
      getExpectedTemplate() { return null; }
    },
    {
      description: 'template is empty',
      expectation: 'uses null',
      getTemplate() { return ''; },
      getExpectedTemplate() { return null; }
    },
    {
      description: 'template is non-empty',
      expectation: 'uses provided template',
      getTemplate() { return 'asdf'; },
      getExpectedTemplate() { return 'asdf'; }
    }
  ];

  eachCartesianJoin([templateSpecs], (templateSpec) => {
    it(`${templateSpec.expectation} if ${templateSpec.description}`, () => {
      const { Type } = createCustomElement({ template: templateSpec.getTemplate() });
      expect(Type.description).to.be.a('object', 'description');
      expect(Type.description.name).to.equal('unnamed', 'name');
      expect(Type.description.template).to.equal(templateSpec.getExpectedTemplate(), 'template');
      expect(Type.description.cache).to.equal(0, 'cache');
      expect(Type.description.build).to.deep.equal({ required: true, compiler: 'default' }, 'build');
      expect(Type.description.bindables).to.deep.equal({}, 'bindables');
      expect(Type.description.instructions).to.equal(PLATFORM.emptyArray, 'instructions');
      expect(Type.description.dependencies).to.equal(PLATFORM.emptyArray, 'dependencies');
      expect(Type.description.surrogates).to.equal(PLATFORM.emptyArray, 'surrogates');
      expect(Type.description.containerless).to.equal(false, 'containerless');
      expect(Type.description.shadowOptions).to.equal(null, 'shadowOptions');
      expect(Type.description.hasSlots).to.equal(false, 'hasSlots');
      expect(Object.keys(Type.description)).to.deep.equal(descriptionKeys);
    });
  });

  const cacheSpecs = [
    {
      description: 'cache is undefined',
      expectation: 'uses 0',
      getCache() { return undefined; },
      getExpectedCache() { return 0; }
    },
    {
      description: 'cache is null',
      expectation: 'uses 0',
      getCache() { return null; },
      getExpectedCache() { return 0; }
    },
    {
      description: 'cache is empty string',
      expectation: 'uses 0',
      getCache() { return ''; },
      getExpectedCache() { return 0; }
    },
    {
      description: 'cache is 0',
      expectation: 'uses 0',
      getCache() { return 0; },
      getExpectedCache() { return 0; }
    },
    {
      description: 'cache is *',
      expectation: 'uses provided cache',
      getCache() { return '*'; },
      getExpectedCache() { return '*'; }
    },
    {
      description: 'cache is 1',
      expectation: 'uses provided cache',
      getCache() { return 1; },
      getExpectedCache() { return 1; }
    }
  ];

  eachCartesianJoin([cacheSpecs], (cacheSpec) => {
    it(`${cacheSpec.expectation} if ${cacheSpec.description}`, () => {
      const { Type } = createCustomElement({ cache: cacheSpec.getCache() });
      expect(Type.description).to.be.a('object', 'description');
      expect(Type.description.name).to.equal('unnamed', 'name');
      expect(Type.description.template).to.equal(null, 'template');
      expect(Type.description.cache).to.equal(cacheSpec.getExpectedCache(), 'cache');
      expect(Type.description.build).to.deep.equal({ required: true, compiler: 'default' }, 'build');
      expect(Type.description.bindables).to.deep.equal({}, 'bindables');
      expect(Type.description.instructions).to.equal(PLATFORM.emptyArray, 'instructions');
      expect(Type.description.dependencies).to.equal(PLATFORM.emptyArray, 'dependencies');
      expect(Type.description.surrogates).to.equal(PLATFORM.emptyArray, 'surrogates');
      expect(Type.description.containerless).to.equal(false, 'containerless');
      expect(Type.description.shadowOptions).to.equal(null, 'shadowOptions');
      expect(Type.description.hasSlots).to.equal(false, 'hasSlots');
      expect(Object.keys(Type.description)).to.deep.equal(descriptionKeys);
    });
  });

  const buildSpecs = [
    {
      description: 'build is undefined',
      expectation: 'uses default build required=false',
      getBuild() { return undefined; },
      getExpectedBuild() { return { required: false, compiler: 'default' }; }
    },
    {
      description: 'build is null',
      expectation: 'uses default build required=false',
      getBuild() { return null; },
      getExpectedBuild() { return { required: false, compiler: 'default' }; }
    },
    {
      description: 'build property does not exist',
      expectation: 'uses default build required=true',
      getExpectedBuild() { return { required: true, compiler: 'default' }; }
    },
    {
      description: 'build is object',
      expectation: 'uses provided build',
      getBuild() { return { required: true, compiler: 'asdf' }; },
      getExpectedBuild() { return { required: true, compiler: 'asdf' }; }
    }
  ];

  eachCartesianJoin([buildSpecs], (buildSpec) => {
    it(`${buildSpec.expectation} if ${buildSpec.description}`, () => {
      const { Type } = createCustomElement( buildSpec.getBuild ? { build: buildSpec.getBuild() } : {});
      expect(Type.description).to.be.a('object', 'description');
      expect(Type.description.name).to.equal('unnamed', 'name');
      expect(Type.description.template).to.equal(null, 'template');
      expect(Type.description.cache).to.equal(0, 'cache');
      expect(Type.description.build).to.deep.equal(buildSpec.getExpectedBuild(), 'build');
      expect(Type.description.bindables).to.deep.equal({}, 'bindables');
      expect(Type.description.instructions).to.equal(PLATFORM.emptyArray, 'instructions');
      expect(Type.description.dependencies).to.equal(PLATFORM.emptyArray, 'dependencies');
      expect(Type.description.surrogates).to.equal(PLATFORM.emptyArray, 'surrogates');
      expect(Type.description.containerless).to.equal(false, 'containerless');
      expect(Type.description.shadowOptions).to.equal(null, 'shadowOptions');
      expect(Type.description.hasSlots).to.equal(false, 'hasSlots');
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
      const def = {
        bindables: bindablesSpec.getDefBindables(),
      };
      class Foo {
        static bindables = bindablesSpec.getTypeBindables();
      }
      const Type = customElement(def)(Foo);
      expect(Type.description).to.be.a('object', 'description');
      expect(Type.description.name).to.equal('unnamed', 'name');
      expect(Type.description.template).to.equal(null, 'template');
      expect(Type.description.cache).to.equal(0, 'cache');
      expect(Type.description.build).to.deep.equal({ required: true, compiler: 'default' }, 'build');
      expect(Type.description.bindables).to.deep.equal(bindablesSpec.getExpectedBindables(), 'bindables');
      expect(Type.description.instructions).to.equal(PLATFORM.emptyArray, 'instructions');
      expect(Type.description.dependencies).to.equal(PLATFORM.emptyArray, 'dependencies');
      expect(Type.description.surrogates).to.equal(PLATFORM.emptyArray, 'surrogates');
      expect(Type.description.containerless).to.equal(false, 'containerless');
      expect(Type.description.shadowOptions).to.equal(null, 'shadowOptions');
      expect(Type.description.hasSlots).to.equal(false, 'hasSlots');
      expect(Object.keys(Type.description)).to.deep.equal(descriptionKeys);
    });
  });

  const instructionsSpecs = [
    {
      description: 'instructions is undefined',
      expectation: 'uses PLATFORM.emptyArray',
      getInstructions() { return undefined; },
      canMutate: false,
      getExpectedInstructions() { return PLATFORM.emptyArray; }
    },
    {
      description: 'instructions is null',
      expectation: 'uses PLATFORM.emptyArray',
      canMutate: false,
      getInstructions() { return null; },
      getExpectedInstructions() { return PLATFORM.emptyArray; }
    },
    {
      description: 'instructions is empty array',
      expectation: 'uses provided instructions',
      canMutate: true,
      getInstructions() { return []; },
      getExpectedInstructions() { return []; }
    },
    {
      description: 'instructions has one item',
      expectation: 'uses provided instructions',
      canMutate: true,
      getInstructions() { return [{}]; },
      getExpectedInstructions() { return [{}];; }
    }
  ];

  eachCartesianJoin([instructionsSpecs], (instructionsSpec) => {
    it(`${instructionsSpec.expectation} if ${instructionsSpec.description}`, () => {
      const { Type } = createCustomElement({ instructions: instructionsSpec.getInstructions() });
      expect(Type.description).to.be.a('object', 'description');
      expect(Type.description.name).to.equal('unnamed', 'name');
      expect(Type.description.template).to.equal(null, 'template');
      expect(Type.description.cache).to.equal(0, 'cache');
      expect(Type.description.build).to.deep.equal({ required: true, compiler: 'default' }, 'build');
      expect(Type.description.bindables).to.deep.equal({}, 'bindables');
      expect(Type.description.instructions).to.deep.equal(instructionsSpec.getExpectedInstructions(), 'instructions');
      if (instructionsSpec.canMutate) {
        (<any>Type.description.instructions).push({})
      } else {
        expect(() => (<any>Type.description.instructions).push({})).to.throw;
      }
      expect(Type.description.dependencies).to.equal(PLATFORM.emptyArray, 'dependencies');
      expect(Type.description.surrogates).to.equal(PLATFORM.emptyArray, 'surrogates');
      expect(Type.description.containerless).to.equal(false, 'containerless');
      expect(Type.description.shadowOptions).to.equal(null, 'shadowOptions');
      expect(Type.description.hasSlots).to.equal(false, 'hasSlots');
      expect(Object.keys(Type.description)).to.deep.equal(descriptionKeys);
    });
  });

  const dependenciesSpecs = [
    {
      description: 'dependencies is undefined',
      expectation: 'uses PLATFORM.emptyArray',
      getDependencies() { return undefined; },
      canMutate: false,
      getExpectedDependencies() { return PLATFORM.emptyArray; }
    },
    {
      description: 'dependencies is null',
      expectation: 'uses PLATFORM.emptyArray',
      canMutate: false,
      getDependencies() { return null; },
      getExpectedDependencies() { return PLATFORM.emptyArray; }
    },
    {
      description: 'dependencies is empty array',
      expectation: 'uses provided dependencies',
      canMutate: true,
      getDependencies() { return []; },
      getExpectedDependencies() { return []; }
    },
    {
      description: 'dependencies has one item',
      expectation: 'uses provided dependencies',
      canMutate: true,
      getDependencies() { return [{}]; },
      getExpectedDependencies() { return [{}];; }
    }
  ];

  eachCartesianJoin([dependenciesSpecs], (dependenciesSpec) => {
    it(`${dependenciesSpec.expectation} if ${dependenciesSpec.description}`, () => {
      const { Type } = createCustomElement({ dependencies: dependenciesSpec.getDependencies() });
      expect(Type.description).to.be.a('object', 'description');
      expect(Type.description.name).to.equal('unnamed', 'name');
      expect(Type.description.template).to.equal(null, 'template');
      expect(Type.description.cache).to.equal(0, 'cache');
      expect(Type.description.build).to.deep.equal({ required: true, compiler: 'default' }, 'build');
      expect(Type.description.bindables).to.deep.equal({}, 'bindables');
      expect(Type.description.instructions).to.equal(PLATFORM.emptyArray, 'instructions');
      expect(Type.description.dependencies).to.deep.equal(dependenciesSpec.getExpectedDependencies(), 'dependencies');
      if (dependenciesSpec.canMutate) {
        (<any>Type.description.dependencies).push({})
      } else {
        expect(() => (<any>Type.description.dependencies).push({})).to.throw;
      }
      expect(Type.description.surrogates).to.equal(PLATFORM.emptyArray, 'surrogates');
      expect(Type.description.containerless).to.equal(false, 'containerless');
      expect(Type.description.shadowOptions).to.equal(null, 'shadowOptions');
      expect(Type.description.hasSlots).to.equal(false, 'hasSlots');
      expect(Object.keys(Type.description)).to.deep.equal(descriptionKeys);
    });
  });

  const surrogatesSpecs = [
    {
      description: 'surrogates is undefined',
      expectation: 'uses PLATFORM.emptyArray',
      getSurrogates() { return undefined; },
      canMutate: false,
      getExpectedSurrogates() { return PLATFORM.emptyArray; }
    },
    {
      description: 'surrogates is null',
      expectation: 'uses PLATFORM.emptyArray',
      canMutate: false,
      getSurrogates() { return null; },
      getExpectedSurrogates() { return PLATFORM.emptyArray; }
    },
    {
      description: 'surrogates is empty array',
      expectation: 'uses provided surrogates',
      canMutate: true,
      getSurrogates() { return []; },
      getExpectedSurrogates() { return []; }
    },
    {
      description: 'surrogates has one item',
      expectation: 'uses provided surrogates',
      canMutate: true,
      getSurrogates() { return [{}]; },
      getExpectedSurrogates() { return [{}];; }
    }
  ];

  eachCartesianJoin([surrogatesSpecs], (surrogatesSpec) => {
    it(`${surrogatesSpec.expectation} if ${surrogatesSpec.description}`, () => {
      const { Type } = createCustomElement({ surrogates: surrogatesSpec.getSurrogates() });
      expect(Type.description).to.be.a('object', 'description');
      expect(Type.description.name).to.equal('unnamed', 'name');
      expect(Type.description.template).to.equal(null, 'template');
      expect(Type.description.cache).to.equal(0, 'cache');
      expect(Type.description.build).to.deep.equal({ required: true, compiler: 'default' }, 'build');
      expect(Type.description.bindables).to.deep.equal({}, 'bindables');
      expect(Type.description.instructions).to.equal(PLATFORM.emptyArray, 'instructions');
      expect(Type.description.dependencies).to.equal(PLATFORM.emptyArray, 'dependencies');
      expect(Type.description.surrogates).to.deep.equal(surrogatesSpec.getExpectedSurrogates(), 'surrogates');
      if (surrogatesSpec.canMutate) {
        (<any>Type.description.surrogates).push({})
      } else {
        expect(() => (<any>Type.description.surrogates).push({})).to.throw;
      }
      expect(Type.description.containerless).to.equal(false, 'containerless');
      expect(Type.description.shadowOptions).to.equal(null, 'shadowOptions');
      expect(Type.description.hasSlots).to.equal(false, 'hasSlots');
      expect(Object.keys(Type.description)).to.deep.equal(descriptionKeys);
    });
  });

  const containerlessSpecs = [
    {
      description: 'def.containerless is undefined, Type.containerless is undefined',
      expectation: 'uses false',
      getDefContainerless() { return undefined; },
      getTypeContainerless() { return undefined; },
      getExpectedContainerless() { return false; }
    },
    {
      description: 'def.containerless is null, Type.containerless is null',
      expectation: 'uses false',
      getDefContainerless() { return null; },
      getTypeContainerless() { return null; },
      getExpectedContainerless() { return false; }
    },
    {
      description: 'def.containerless is false, Type.containerless is false',
      expectation: 'uses false',
      getDefContainerless() { return false; },
      getTypeContainerless() { return false; },
      getExpectedContainerless() { return false ; }
    },
    {
      description: 'def.containerless is true, Type.containerless is false',
      expectation: 'uses true',
      getDefContainerless() { return true; },
      getTypeContainerless() { return false; },
      getExpectedContainerless() { return true ; }
    },
    {
      description: 'def.containerless is true, Type.containerless is true',
      expectation: 'uses true',
      getDefContainerless() { return true; },
      getTypeContainerless() { return true; },
      getExpectedContainerless() { return true; }
    },
    {
      description: 'def.containerless is false, Type.containerless is true',
      expectation: 'uses true',
      getDefContainerless() { return false; },
      getTypeContainerless() { return true; },
      getExpectedContainerless() { return true; }
    }
  ];

  eachCartesianJoin([containerlessSpecs], (containerlessSpec) => {
    it(`${containerlessSpec.expectation} if ${containerlessSpec.description}`, () => {
      const def = {
        containerless: containerlessSpec.getDefContainerless(),
      };
      class Foo {
        static containerless = containerlessSpec.getTypeContainerless();
      }
      const Type = customElement(def)(Foo);
      expect(Type.description).to.be.a('object', 'description');
      expect(Type.description.name).to.equal('unnamed', 'name');
      expect(Type.description.template).to.equal(null, 'template');
      expect(Type.description.cache).to.equal(0, 'cache');
      expect(Type.description.build).to.deep.equal({ required: true, compiler: 'default' }, 'build');
      expect(Type.description.bindables).to.deep.equal({}, 'bindables');
      expect(Type.description.instructions).to.equal(PLATFORM.emptyArray, 'instructions');
      expect(Type.description.dependencies).to.equal(PLATFORM.emptyArray, 'dependencies');
      expect(Type.description.surrogates).to.equal(PLATFORM.emptyArray, 'surrogates');
      expect(Type.description.containerless).to.equal(containerlessSpec.getExpectedContainerless(), 'containerless');
      expect(Type.description.shadowOptions).to.equal(null, 'shadowOptions');
      expect(Type.description.hasSlots).to.equal(false, 'hasSlots');
      expect(Object.keys(Type.description)).to.deep.equal(descriptionKeys);
    });
  });

  const shadowOptionsSpecs = [
    {
      description: 'def.shadowOptions is undefined, Type.shadowOptions is undefined',
      expectation: 'uses null',
      getDefShadowOptions() { return undefined; },
      getTypeShadowOptions() { return undefined; },
      getExpectedShadowOptions() { return null; }
    },
    {
      description: 'def.shadowOptions is null, Type.shadowOptions is null',
      expectation: 'uses null',
      getDefShadowOptions() { return null; },
      getTypeShadowOptions() { return null; },
      getExpectedShadowOptions() { return null; }
    },
    {
      description: 'def.shadowOptions is object, Type.shadowOptions is null',
      expectation: 'uses object',
      getDefShadowOptions() { return { mode: 'a' }; },
      getTypeShadowOptions() { return null; },
      getExpectedShadowOptions() { return { mode: 'a' }; }
    },
    {
      description: 'def.shadowOptions is null, Type.shadowOptions is object',
      expectation: 'uses object',
      getDefShadowOptions() { return null; },
      getTypeShadowOptions() { return { mode: 'b' }; },
      getExpectedShadowOptions() { return { mode: 'b' }; }
    },
    {
      description: 'def.shadowOptions is object, Type.shadowOptions is object',
      expectation: 'uses def.object',
      getDefShadowOptions() { return { mode: 'a' }; },
      getTypeShadowOptions() { return { mode: 'b' }; },
      getExpectedShadowOptions() { return { mode: 'a' }; }
    }
  ];

  eachCartesianJoin([shadowOptionsSpecs], (shadowOptionsSpec) => {
    it(`${shadowOptionsSpec.expectation} if ${shadowOptionsSpec.description}`, () => {
      const def = {
        shadowOptions: shadowOptionsSpec.getDefShadowOptions(),
      };
      class Foo {
        static shadowOptions = shadowOptionsSpec.getTypeShadowOptions();
      }
      const Type = customElement(def)(Foo);
      expect(Type.description).to.be.a('object', 'description');
      expect(Type.description.name).to.equal('unnamed', 'name');
      expect(Type.description.template).to.equal(null, 'template');
      expect(Type.description.cache).to.equal(0, 'cache');
      expect(Type.description.build).to.deep.equal({ required: true, compiler: 'default' }, 'build');
      expect(Type.description.bindables).to.deep.equal({}, 'bindables');
      expect(Type.description.instructions).to.equal(PLATFORM.emptyArray, 'instructions');
      expect(Type.description.dependencies).to.equal(PLATFORM.emptyArray, 'dependencies');
      expect(Type.description.surrogates).to.equal(PLATFORM.emptyArray, 'surrogates');
      expect(Type.description.containerless).to.equal(false, 'containerless');
      expect(Type.description.shadowOptions).to.deep.equal(shadowOptionsSpec.getExpectedShadowOptions(), 'shadowOptions');
      expect(Type.description.hasSlots).to.equal(false, 'hasSlots');
      expect(Object.keys(Type.description)).to.deep.equal(descriptionKeys);
    });
  });

  const hasSlotsSpecs = [
    {
      description: 'hasSlots is undefined',
      expectation: 'uses false',
      getHasSlots() { return undefined; },
      getExpectedHasSlots() { return false; }
    },
    {
      description: 'hasSlots is null',
      expectation: 'uses false',
      getHasSlots() { return null; },
      getExpectedHasSlots() { return false; }
    },
    {
      description: 'hasSlots is false',
      expectation: 'uses false',
      getHasSlots() { return false; },
      getExpectedHasSlots() { return false; }
    },
    {
      description: 'hasSlots is true',
      expectation: 'uses true',
      getHasSlots() { return true; },
      getExpectedHasSlots() { return true; }
    }
  ];

  eachCartesianJoin([hasSlotsSpecs], (hasSlotsSpec) => {
    it(`${hasSlotsSpec.expectation} if ${hasSlotsSpec.description}`, () => {
      const { Type } = createCustomElement({ hasSlots: hasSlotsSpec.getHasSlots() });
      expect(Type.description).to.be.a('object', 'description');
      expect(Type.description.name).to.equal('unnamed', 'name');
      expect(Type.description.template).to.equal(null, 'template');
      expect(Type.description.cache).to.equal(0, 'cache');
      expect(Type.description.build).to.deep.equal({ required: true, compiler: 'default' }, 'build');
      expect(Type.description.bindables).to.deep.equal({}, 'bindables');
      expect(Type.description.instructions).to.equal(PLATFORM.emptyArray, 'instructions');
      expect(Type.description.dependencies).to.equal(PLATFORM.emptyArray, 'dependencies');
      expect(Type.description.surrogates).to.equal(PLATFORM.emptyArray, 'surrogates');
      expect(Type.description.containerless).to.equal(false, 'containerless');
      expect(Type.description.shadowOptions).to.equal(null, 'shadowOptions');
      expect(Type.description.hasSlots).to.equal(hasSlotsSpec.getExpectedHasSlots(), 'hasSlots');
      expect(Object.keys(Type.description)).to.deep.equal(descriptionKeys);
    });
  });

  // #endregion


  // TODO: the customElement lifecycle tests still lack most variations and assertions, below is just the skeleton
  describe('$hydrate', () => {

    const behaviorSpecs = [
      {
        description: '$behavior.hasCreated: true',
        expectation: 'calls created()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.hasCreated }; },
        verifyBehaviorInvocation(sut: CustomElement) {
          sut.verifyCreatedCalled();
          sut.verifyNoFurtherCalls();
        }
      },
      {
        description: '$behavior.hasCreated: false',
        expectation: 'does NOT call created()',
        getBehavior() { return <IRuntimeBehavior>{ hooks: LifecycleHooks.none }; },
        verifyBehaviorInvocation(sut: CustomElement) {
          sut.verifyNoFurtherCalls();
        }
      }
    ];

    eachCartesianJoin([behaviorSpecs],
      (behaviorSpec) => {

      it(`sets properties, applies runtime behavior and ${behaviorSpec.expectation} if ${behaviorSpec.description}`, () => {
        // Arrange
        const { Type, sut } = createCustomElement('foo');

        let renderCalled = false;
        let renderRenderable;
        let renderHost;
        let renderParts;
        const template: ITemplate = <any>{
          renderContext: <ITemplate['renderContext']>{},
          render: <ITemplate['render']>((renderable, host, parts) => {
            renderCalled = true;
            renderRenderable = renderable;
            renderHost = host;
            renderParts = parts;
          })
        };
        let appliedType: ICustomElementType;
        let appliedInstance: CustomElement;
        let getElementTemplateCalled = false;
        let getElementTemplateDescription;
        let getElementTemplateType;
        const renderingEngine: IRenderingEngine = <any>{
          applyRuntimeBehavior(type: ICustomElementType, instance: CustomElement) {
            instance.$behavior = behaviorSpec.getBehavior();
            appliedType = type;
            appliedInstance = instance;
          },
          getElementTemplate(description: ICustomElementType['description'], type: ICustomElementType) {
            getElementTemplateCalled = true;
            getElementTemplateDescription = description;
            getElementTemplateType = type;
            return template;
          }
        };
        let host: INode = <any>{};

        // Act
        sut.$hydrate(renderingEngine, host);

        // Assert
        expect(sut).to.not.have.$state.isAttached('sut.$isAttached');
        expect(sut).to.not.have.$state.isBound();
        expect(sut.$scope.bindingContext).to.equal(sut, 'sut.$scope');

        expect(appliedType).to.equal(Type, 'appliedType');
        expect(appliedInstance).to.equal(sut, 'appliedInstance');
        behaviorSpec.verifyBehaviorInvocation(sut);
      });
    });
  });

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

  describe('$attach', () => {

    const propsSpecs = [
      {
        description: '$isAttached: false',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomElement) { }
      },
      {
        description: '$isAttached: true',
        expectation: 'does NOT call behaviors',
        callsBehaviors: false,
        setProps(sut: CustomElement) {
          sut.$state |= LifecycleState.isAttached;
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
        const { sut } = createCustomElement('foo');
        sut.$state |= LifecycleState.isBound;
        sut.$scope = Scope.create(sut, null);
        sut.$bindableHead = sut.$bindableTail = null;
        sut.$attachableHead = sut.$attachableTail = null;
        propsSpec.setProps(sut);
        const behavior = behaviorSpec.getBehavior();
        sut.$behavior = behavior;
        const encapsulationSource: INode = <any>{};

        let provideEncapsulationSourceCalled = false;
        const projector: IElementProjector = <any> {
          provideEncapsulationSource($encapsulationSource: INode) {
            provideEncapsulationSourceCalled = true;
            return $encapsulationSource;
          }
        };
        sut.$projector = projector;
        let queueAttachedCallbackCalled = false;
        let queueAttachedCallbackRequestor;
        let queueMountCalled = false;
        let queueMountRequestor;
        const lifecycle: IAttachLifecycle = <any>{
          queueAttachedCallback(requestor: CustomElement) {
            queueAttachedCallbackCalled = true;
            queueAttachedCallbackRequestor = requestor;
            requestor.attached();
          },
          queueMount(requestor: CustomElement) {
            queueMountCalled = true;
            queueMountRequestor = requestor;
            requestor.$mount();
          }
        };
        let addNodesCalled = false;
        sut.$mount = () => {
          addNodesCalled = true;
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
        setProps(sut: CustomElement) { }
      },
      {
        description: '$isAttached: true',
        expectation: 'calls behaviors',
        callsBehaviors: true,
        setProps(sut: CustomElement) {
          sut.$state |= LifecycleState.isAttached;
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
        const { sut } = createCustomElement('foo');
        sut.$state |= LifecycleState.isBound;
        sut.$scope = Scope.create(sut, null);
        sut.$bindableHead = sut.$bindableTail = null;
        sut.$attachableHead = sut.$attachableTail = null;
        propsSpec.setProps(sut);
        const behavior = behaviorSpec.getBehavior();
        sut.$behavior = behavior;
        const encapsulationSource: INode = <any>{};

        let queueDetachedCallbackCalled = false;
        let queueDetachedCallbackRequestor;
        let queueUnmountCalled = false;
        let queueUnmountRequestor;
        const lifecycle: IDetachLifecycle = <any>{
          queueDetachedCallback(requestor: CustomElement) {
            queueDetachedCallbackCalled = true;
            queueDetachedCallbackRequestor = requestor;
            requestor.detached();
          },
          queueUnmount(requestor: CustomElement) {
            queueUnmountCalled = true;
            queueUnmountRequestor = requestor;
            requestor.$unmount();
          }
        };
        let removeNodesCalled = false;
        sut.$unmount = () => {
          removeNodesCalled = true;
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
        const { sut } = createCustomElement('foo');
        sut.$state |= LifecycleState.isBound;
        sut.$scope = Scope.create(sut, null);
        sut.$bindableHead = sut.$bindableTail = null;
        sut.$attachableHead = sut.$attachableTail = null;
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

  describe('$mount', () => {
    it('calls $projector.project()', () => {
      const { sut } = createCustomElement('foo');

      const nodes = sut.$nodes = <any>{};
      let projectCalled = false;
      let projectNodes;
      sut.$projector = <any> {
        project(nodes) {
          projectCalled = true;
          projectNodes = nodes;
        }
      };

      sut.$mount();

      expect(projectCalled).to.equal(true, 'projectCalled');
      expect(projectNodes).to.equal(nodes, 'projectNodes');
    });
  });

  describe('$unmount', () => {
    it('calls $projector.take()', () => {
      const { sut } = createCustomElement('foo');

      const nodes = sut.$nodes = <any>{};
      let takeCalled = false;
      let takeNodes;
      sut.$projector = <any> {
        take(nodes) {
          takeCalled = true;
          takeNodes = nodes;
        }
      };

      sut.$unmount();

      expect(takeCalled).to.equal(true, 'takeCalled');
      expect(takeNodes).to.equal(nodes, 'takeNodes');
    });
  });

  describe(`determineProjector`, () => {
    it(`@useShadowDOM yields ShadowDOMProjector`, () => {
      @customElement('foo')
      @useShadowDOM()
      class Foo {}

      const renderingEngine = new MockRenderingEngine(noViewTemplate, null, null, (type, instance) => {
        instance.$behavior = {};
      });
      const host = document.createElement('div');

      const sut = new Foo() as ICustomElement;
      sut.$hydrate(<any>renderingEngine, host);

      expect(sut.$projector).to.be.instanceof(ShadowDOMProjector);
      expect(sut.$projector['shadowRoot']).to.be.instanceof(Node);
      expect(sut.$projector['shadowRoot'].$customElement).to.equal(sut);
      expect(host['$customElement']).to.equal(sut);
      expect(sut.$projector.children).to.equal(sut.$projector.host['childNodes']);
    });

    it(`hasSlots=true yields ShadowDOMProjector`, () => {
      @customElement('foo')
      class Foo {}

      Foo['description'].hasSlots = true;

      const renderingEngine = new MockRenderingEngine(noViewTemplate, null, null, (type, instance) => {
        instance.$behavior = {};
      });
      const host = document.createElement('div');

      const sut = new Foo() as ICustomElement;
      sut.$hydrate(<any>renderingEngine, host);

      expect(sut.$projector).to.be.instanceof(ShadowDOMProjector);
      expect(sut.$projector['shadowRoot']).to.be.instanceof(Node);
      expect(sut.$projector['shadowRoot'].$customElement).to.equal(sut);
      expect(host['$customElement']).to.equal(sut);
      expect(sut.$projector.children).to.equal(sut.$projector.host['childNodes']);
      expect(sut.$projector.provideEncapsulationSource(null)).to.equal(sut.$projector['shadowRoot']);
    });

    it(`@containerless yields ContainerlessProjector`, () => {
      @customElement('foo')
      @containerless()
      class Foo {}

      const renderingEngine = new MockRenderingEngine(noViewTemplate, null, null, (type, instance) => {
        instance.$behavior = {};
      });
      const parent = document.createElement('div')
      const host = document.createElement('div');
      parent.appendChild(host);

      const sut = new Foo() as ICustomElement;
      sut.$hydrate(<any>renderingEngine, host);

      expect(sut.$projector).to.be.instanceof(ContainerlessProjector);
      expect(sut.$projector['childNodes'].length).to.equal(0);
      expect(host.parentNode).to.be.null;
      expect(parent.firstChild).to.be.instanceof(Comment);
      expect(parent.firstChild.textContent).to.equal('au-loc');
      expect(parent.firstChild['$customElement']).to.equal(sut);
      expect(sut.$projector.children).to.equal(sut.$projector['childNodes']);
    });

    it(`@containerless yields ContainerlessProjector (with child)`, () => {
      @customElement('foo')
      @containerless()
      class Foo {}

      const renderingEngine = new MockRenderingEngine(noViewTemplate, null, null, (type, instance) => {
        instance.$behavior = {};
      });
      const parent = document.createElement('div')
      const host = document.createElement('div');
      const child = document.createElement('div');
      parent.appendChild(host);
      host.appendChild(child);

      const sut = new Foo() as ICustomElement;
      sut.$hydrate(<any>renderingEngine, host);

      expect(sut.$projector).to.be.instanceof(ContainerlessProjector);
      expect(sut.$projector['childNodes'][0]).to.equal(child);
      expect(host.parentNode).to.be.null;
      expect(parent.firstChild).to.be.instanceof(Comment);
      expect(parent.firstChild.textContent).to.equal('au-loc');
      expect(parent.firstChild['$customElement']).to.equal(sut);
      expect(sut.$projector.children).to.equal(sut.$projector['childNodes']);
    });

    it(`no shadowDOM, slots or containerless yields HostProjector`, () => {
      @customElement('foo')
      class Foo {}

      const renderingEngine = new MockRenderingEngine(noViewTemplate, null, null, (type, instance) => {
        instance.$behavior = {};
      });
      const host = document.createElement('div');
      const sut = new Foo() as ICustomElement;
      sut.$hydrate(<any>renderingEngine, host);
      expect(host['$customElement']).to.equal(sut);
      expect(sut.$projector).to.be.instanceof(HostProjector);
      expect(sut.$projector.children).to.equal(PLATFORM.emptyArray);
    });

    it(`@containerless + @useShadowDOM throws`, () => {
      @customElement('foo')
      @useShadowDOM()
      @containerless()
      class Foo {}

      const renderingEngine = new MockRenderingEngine(noViewTemplate, null, null, (type, instance) => {
        instance.$behavior = {};
      });
      const host = document.createElement('div');
      const sut = new Foo() as ICustomElement;
      expect(() => sut.$hydrate(<any>renderingEngine, host)).to.throw(/21/);
    });

    it(`@containerless + hasSlots throws`, () => {
      @customElement('foo')
      @containerless()
      class Foo {}

      Foo['description'].hasSlots = true;

      const renderingEngine = new MockRenderingEngine(noViewTemplate, null, null, (type, instance) => {
        instance.$behavior = {};
      });
      const host = document.createElement('div');
      const sut = new Foo() as ICustomElement;
      expect(() => sut.$hydrate(<any>renderingEngine, host)).to.throw(/21/);
    });
  });
});

describe('@useShadowDOM', () => {
  it(`non-invocation`, () => {
    @useShadowDOM
    class Foo {}

    expect(Foo['shadowOptions'].mode).to.equal('open');
  });

  it(`invocation without options`, () => {
    @useShadowDOM()
    class Foo {}

    expect(Foo['shadowOptions'].mode).to.equal('open');
  });

  it(`invocation with options mode=open`, () => {
    @useShadowDOM({ mode: 'open' })
    class Foo {}

    expect(Foo['shadowOptions'].mode).to.equal('open');
  });

  it(`invocation with options mode=closed`, () => {
    @useShadowDOM({ mode: 'closed' })
    class Foo {}

    expect(Foo['shadowOptions'].mode).to.equal('closed');
  });
});

describe('@containerless', () => {
  it(`non-invocation`, () => {
    @containerless
    class Foo {}

    expect(Foo['containerless']).to.be.true;
  });

  it(`invocation`, () => {
    @containerless()
    class Foo {}

    expect(Foo['containerless']).to.be.true;
  });
});

describe('CustomElementResource', () => {
  describe(`define`, () => {
    it(`creates a new class when applied to null`, () => {
      const type = CustomElementResource.define('foo', null);
      expect(typeof type).to.equal('function');
      expect(typeof type.constructor).to.equal('function');
      expect(type.name).to.equal('HTMLOnlyElement');
      expect(typeof type.prototype).to.equal('object');
    });

    it(`creates a new class when applied to undefined`, () => { // how though?? it explicitly checks for null??
      const type = (<any>CustomElementResource).define('foo');
      expect(typeof type).to.equal('function');
      expect(typeof type.constructor).to.equal('function');
      expect(type.name).to.equal('HTMLOnlyElement');
      expect(typeof type.prototype).to.equal('object');
    });

    it(`names the resource 'unnamed' if no name is provided`, () => {
      const type = CustomElementResource.define({}, class Foo {});
      expect(type.description.name).to.equal('unnamed');
    });
  });

  describe(`keyFrom`, () => {
    it(`returns the correct key`, () => {
      expect(CustomElementResource.keyFrom('foo')).to.equal('custom-element:foo');
    });
  });

  describe(`isType`, () => {
    it(`returns true when given a resource with the correct kind`, () => {
      const type = CustomElementResource.define('foo', class Foo{});
      expect(CustomElementResource.isType(type)).to.be.true;
    });

    it(`returns false when given a resource with the wrong kind`, () => {
      const type = CustomAttributeResource.define('foo', class Foo{});
      expect(CustomElementResource.isType(type)).to.be.false;
    });
  });

  describe(`behaviorFor`, () => {
    it(`returns $customElement variable if it exists`, () => {
      expect(CustomElementResource.behaviorFor(<any>{$customElement: 'foo'})).to.equal('foo');
    });

    it(`returns null if the $customElement variable does nots`, () => {
      expect(CustomElementResource.behaviorFor(<any>{})).to.be.null;
    });
  });
});

describe('createCustomElementDescription', () => {

});

describe('ShadowDOMProjector', () => {

});

describe('ContainerlessProjector', () => {

});

describe('HostProjector', () => {

});
