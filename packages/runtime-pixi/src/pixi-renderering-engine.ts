import { inject, Immutable, all, IContainer, IIndexable, Reporter, Writable, Registration, IDisposable, IResolver, Class, DI, IRegistry } from '@aurelia/kernel';
import {
  ILifecycle,
  ITemplateCompiler, ITemplateDefinition,
  IRenderingEngine,
  TemplateDefinition, ITemplate,
  ICustomElementType, ICustomAttributeType,
  IViewFactory,
  ICustomAttribute,
  ICustomElement,
  Observer,
  LifecycleFlags,
  BindableDefinitions,
  buildTemplateDefinition,
  RuntimeCompilationResources,
  INodeSequenceFactory,
  IRenderContext,
  NodeSequenceFactory,
  createRenderContext,
  IRenderable,
  INode,
  TemplatePartDefinitions,
  ViewCompileFlags,
  IRenderer,
  ITargetedInstruction,
  NodeSequence
} from '@aurelia/runtime';
import { ViewFactory } from './view';

const defaultCompilerName = 'pixiCompiler';

export type ExposedContext = IRenderContext & IDisposable & IContainer;

@inject(IContainer, ILifecycle, all(ITemplateCompiler))
/*@internal*/
export class PixiRenderingEngine implements IRenderingEngine {

  private templateLookup: Map<TemplateDefinition, ITemplate> = new Map();
  private factoryLookup: Map<Immutable<ITemplateDefinition>, IViewFactory> = new Map();
  private behaviorLookup: Map<ICustomElementType | ICustomAttributeType, RuntimeBehavior> = new Map();
  private compilers: Record<string, ITemplateCompiler>;

  constructor(private container: IContainer, private lifecycle: ILifecycle, templateCompilers: ITemplateCompiler[]) {
    this.compilers = templateCompilers.reduce(
      (acc, item) => {
        acc[item.name] = item;
        return acc;
      },
      Object.create(null)
    );
  }

  public getElementTemplate(definition: TemplateDefinition, componentType?: ICustomElementType): ITemplate {
    if (!definition) {
      return null;
    }

    let found = this.templateLookup.get(definition);

    if (!found) {
      found = this.templateFromSource(definition);

      //If the element has a view, support Recursive Components by adding self to own view template container.
      if (found.renderContext !== null && componentType) {
        componentType.register(<ExposedContext>found.renderContext);
      }

      this.templateLookup.set(definition, found);
    }

    return found;
  }

  public getViewFactory(definition: Immutable<ITemplateDefinition>, parentContext?: IRenderContext): IViewFactory {
    if (!definition) {
      return null;
    }

    let factory = this.factoryLookup.get(definition);

    if (!factory) {
      const validSource = buildTemplateDefinition(null, definition);
      const template = this.templateFromSource(validSource, parentContext);
      factory = new ViewFactory(validSource.name, template, this.lifecycle);
      factory.setCacheSize(validSource.cache, true);
      this.factoryLookup.set(definition, factory);
    }

    return factory;
  }

  public applyRuntimeBehavior(Type: ICustomAttributeType | ICustomElementType, instance: ICustomAttribute | ICustomElement): void {
    let found = this.behaviorLookup.get(Type);

    if (!found) {
      found = RuntimeBehavior.create(Type, instance);
      this.behaviorLookup.set(Type, found);
    }

    found.applyTo(instance, this.lifecycle);
  }

  private templateFromSource(definition: TemplateDefinition, parentContext?: IRenderContext): ITemplate {
    parentContext = parentContext || <ExposedContext>this.container;

    if (definition && definition.template) {
      if (definition.build.required) {
        const compilerName = definition.build.compiler || defaultCompilerName;
        const compiler = this.compilers[compilerName];

        if (!compiler) {
          throw Reporter.error(20, compilerName);
        }

        definition = compiler.compile(<ITemplateDefinition>definition, new RuntimeCompilationResources(<ExposedContext>parentContext), ViewCompileFlags.surrogate);
      }

      return new CompiledTemplate(this, parentContext, definition);
    }

    return noViewTemplate;
  }
}

// This is an implementation of ITemplate that always returns a node sequence representing "no DOM" to render.
/*@internal*/
export const noViewTemplate: ITemplate = {
  renderContext: null,
  render(renderable: IRenderable): void {
    (<Writable<IRenderable>>renderable).$nodes = NodeSequence.empty;
    (<Writable<IRenderable>>renderable).$context = null;
  }
};


/** @internal */
export class RuntimeBehavior {
  public bindables: BindableDefinitions;

  private constructor() {}

  public static create(Component: ICustomElementType | ICustomAttributeType, instance: ICustomAttribute | ICustomElement): RuntimeBehavior {
    const behavior = new RuntimeBehavior();

    behavior.bindables = Component.description.bindables;

    return behavior;
  }

  public applyTo(instance: ICustomAttribute | ICustomElement, lifecycle: ILifecycle): void {
    instance.$lifecycle = lifecycle;
    if ('$projector' in instance) {
      this.applyToElement(lifecycle, instance);
    } else {
      this.applyToCore(instance);
    }
  }

  private applyToElement(lifecycle: ILifecycle, instance: ICustomElement): void {
    const observers = this.applyToCore(instance);

    // observers.$children = new ChildrenObserver(lifecycle, instance);

    Reflect.defineProperty(instance, '$children', {
      enumerable: false,
      get: function(): unknown {
        return this['$observers'].$children.getValue();
      }
    });
  }

  private applyToCore(instance: ICustomAttribute | ICustomElement): IIndexable {
    const observers = {};
    const bindables = this.bindables;
    const observableNames = Object.getOwnPropertyNames(bindables);

    for (let i = 0, ii = observableNames.length; i < ii; ++i) {
      const name = observableNames[i];

      observers[name] = new Observer(
        instance,
        name,
        bindables[name].callback
      );

      createGetterSetter(instance, name);
    }

    Reflect.defineProperty(instance, '$observers', {
      enumerable: false,
      value: observers
    });

    return observers;
  }
}

function createGetterSetter(instance: ICustomAttribute | ICustomElement, name: string): void {
  Reflect.defineProperty(instance, name, {
    enumerable: true,
    get: function(): unknown { return this['$observers'][name].getValue(); },
    set: function(value: unknown): void { this['$observers'][name].setValue(value, LifecycleFlags.updateTargetInstance); }
  });
}

// This is the main implementation of ITemplate.
// It is used to create instances of IView based on a compiled TemplateDefinition.
// TemplateDefinitions are hand-coded today, but will ultimately be the output of the
// TemplateCompiler either through a JIT or AOT process.
// Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a TemplateDefinition
// and create instances of it on demand.
/*@internal*/
export class CompiledTemplate implements ITemplate {
  public readonly factory: INodeSequenceFactory;
  public readonly renderContext: IRenderContext;

  constructor(renderingEngine: IRenderingEngine, parentRenderContext: IRenderContext, private templateDefinition: TemplateDefinition) {
    this.factory = NodeSequenceFactory.createFor(templateDefinition.template);
    this.renderContext = createRenderContext(renderingEngine, parentRenderContext, templateDefinition.dependencies);
  }

  public render(renderable: IRenderable, host?: INode, parts?: TemplatePartDefinitions): void {
    const nodes = (<Writable<IRenderable>>renderable).$nodes = this.factory.createNodeSequence();
    (<Writable<IRenderable>>renderable).$context = this.renderContext;
    this.renderContext.render(renderable, nodes.findTargets(), this.templateDefinition, host, parts);
  }
}


export interface IInstructionTypeClassifier<TType extends string = string> {
  instructionType: TType;
}

export interface IInstructionRenderer<TType extends string = string> extends Partial<IInstructionTypeClassifier<TType>> {
  render(context: IRenderContext, renderable: IRenderable, target: unknown, instruction: ITargetedInstruction, ...rest: unknown[]): void;
}

export const IInstructionRenderer = DI.createInterface<IInstructionRenderer>().noDefault();

type DecoratableInstructionRenderer<TType extends string, TProto, TClass> = Class<TProto & Partial<IInstructionTypeClassifier<TType> & Pick<IInstructionRenderer, 'render'>>, TClass> & Partial<IRegistry>;
type DecoratedInstructionRenderer<TType extends string, TProto, TClass> =  Class<TProto & IInstructionTypeClassifier<TType> & Pick<IInstructionRenderer, 'render'>, TClass> & IRegistry;

type InstructionRendererDecorator<TType extends string> = <TProto, TClass>(target: DecoratableInstructionRenderer<TType, TProto, TClass>) => DecoratedInstructionRenderer<TType, TProto, TClass>;

export function instructionRenderer<TType extends string>(instructionType: TType): InstructionRendererDecorator<TType> {
  return function decorator<TProto, TClass>(target: DecoratableInstructionRenderer<TType, TProto, TClass>): DecoratedInstructionRenderer<TType, TProto, TClass> {
    // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
    const decoratedTarget = function(...args: unknown[]): TProto {
      const instance = new target(...args);
      instance.instructionType = instructionType;
      return instance;
    } as unknown as DecoratedInstructionRenderer<TType, TProto, TClass>;
    // make sure we register the decorated constructor with DI
    decoratedTarget.register = function register(container: IContainer): IResolver {
      return Registration.singleton(IInstructionRenderer, decoratedTarget).register(container, IInstructionRenderer);
    };
    // copy over any static properties such as inject (set by preceding decorators)
    // also copy the name, to be less confusing to users (so they can still use constructor.name for whatever reason)
    // the length (number of ctor arguments) is copied for the same reason
    const ownProperties = Object.getOwnPropertyDescriptors(target);
    Object.keys(ownProperties).filter(prop => prop !== 'prototype').forEach(prop => {
      Reflect.defineProperty(decoratedTarget, prop, ownProperties[prop]);
    });
    return decoratedTarget;
  };
}

/* @internal */
@inject(all(IInstructionRenderer))
export class PixiRenderer implements IRenderer {
  public instructionRenderers: Record<string, IInstructionRenderer>;

  constructor(instructionRenderers: IInstructionRenderer[]) {
    const record = this.instructionRenderers = {};
    instructionRenderers.forEach(item => {
      record[item.instructionType] = item;
    });
  }

  public render(context: IRenderContext, renderable: IRenderable, targets: ArrayLike<INode>, definition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void {
    const targetInstructions = definition.instructions;
    const instructionRenderers = this.instructionRenderers;

    if (targets.length !== targetInstructions.length) {
      if (targets.length > targetInstructions.length) {
        throw Reporter.error(30);
      } else {
        throw Reporter.error(31);
      }
    }
    for (let i = 0, ii = targets.length; i < ii; ++i) {
      const instructions = targetInstructions[i];
      const target = targets[i];

      for (let j = 0, jj = instructions.length; j < jj; ++j) {
        const current = instructions[j];
        instructionRenderers[current.type].render(context, renderable, target, current, parts);
      }
    }

    if (host) {
      const surrogateInstructions = definition.surrogates;

      for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
        const current = surrogateInstructions[i];
        instructionRenderers[current.type].render(context, renderable, host, current, parts);
      }
    }
  }
}

