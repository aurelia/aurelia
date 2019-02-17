import {
  all,
  Class,
  IContainer,
  ImmutableArray,
  InjectArray,
  IRegistry,
  IResolver,
  Registration,
  Reporter,
  Tracer,
  Writable
} from '@aurelia/kernel';
import { AnyBindingExpression } from './ast';
import { Binding } from './binding/binding';
import { Call } from './binding/call';
import { BindingType, IExpressionParser } from './binding/expression-parser';
import { InterpolationBinding, MultiInterpolationBinding } from './binding/interpolation-binding';
import { LetBinding } from './binding/let-binding';
import { Ref } from './binding/ref';
import {
  customAttributeKey,
  customElementKey,
  ICallBindingInstruction,
  IElementHydrationOptions,
  IHydrateAttributeInstruction,
  IHydrateElementInstruction,
  IHydrateLetElementInstruction,
  IHydrateTemplateController,
  IInterpolationInstruction,
  IIteratorBindingInstruction,
  ILetBindingInstruction,
  InstructionTypeName,
  IPropertyBindingInstruction,
  IRefBindingInstruction,
  ISetPropertyInstruction,
  ITargetedInstruction,
  TargetedInstructionType,
  TemplateDefinition,
  TemplatePartDefinitions
} from './definitions';
import { IDOM, INode } from './dom';
import { BindingMode, LifecycleFlags } from './flags';
import {
  IBinding,
  IComponent,
  IRenderable,
  IRenderContext,
} from './lifecycle';
import { IObserverLocator } from './observation/observer-locator';
import {
  IInstructionRenderer,
  IInstructionTypeClassifier,
  IRenderer,
  IRenderingEngine
} from './rendering-engine';
import { ICustomAttribute } from './resources/custom-attribute';
import { ICustomElement } from './resources/custom-element';

const slice = Array.prototype.slice;

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
export class Renderer implements IRenderer {
  public static readonly inject: InjectArray = [all(IInstructionRenderer)];

  public instructionRenderers: Record<InstructionTypeName, IInstructionRenderer>;

  constructor(instructionRenderers: IInstructionRenderer[]) {
    const record = this.instructionRenderers = {};
    instructionRenderers.forEach(item => {
      record[item.instructionType] = item;
    });
  }

  public static register(container: IContainer): IResolver<IRenderer> {
    return Registration.singleton(IRenderer, this).register(container);
  }

  // tslint:disable-next-line:parameters-max-number
  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, targets: ArrayLike<INode>, definition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void {
    if (Tracer.enabled) { Tracer.enter('Renderer', 'render', slice.call(arguments)); }
    const targetInstructions = definition.instructions;
    const instructionRenderers = this.instructionRenderers;

    if (targets.length !== targetInstructions.length) {
      if (targets.length > targetInstructions.length) {
        throw Reporter.error(30);
      } else {
        throw Reporter.error(31);
      }
    }
    let instructions: ImmutableArray<ITargetedInstruction>;
    let target: INode;
    let current: ITargetedInstruction;
    for (let i = 0, ii = targets.length; i < ii; ++i) {
      instructions = targetInstructions[i];
      target = targets[i];

      for (let j = 0, jj = instructions.length; j < jj; ++j) {
        current = instructions[j];
        instructionRenderers[current.type].render(flags, dom, context, renderable, target, current, parts);
      }
    }

    if (host) {
      const surrogateInstructions = definition.surrogates;

      for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
        current = surrogateInstructions[i];
        instructionRenderers[current.type].render(flags, dom, context, renderable, host, current, parts);
      }
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

export function ensureExpression<TFrom>(parser: IExpressionParser, srcOrExpr: TFrom, bindingType: BindingType): Exclude<TFrom, string> {
  if (typeof srcOrExpr === 'string') {
    return parser.parse(srcOrExpr, bindingType) as unknown as Exclude<TFrom, string>;
  }
  return srcOrExpr as Exclude<TFrom, string>;
}

export function addBinding(renderable: IRenderable, binding: IBinding): void {
  if (Tracer.enabled) { Tracer.enter('Renderer', 'addBinding', slice.call(arguments)); }
  (binding as Writable<IBinding>).$prevBinding = renderable.$bindingTail;
  (binding as Writable<IBinding>).$nextBinding = null;
  if (renderable.$bindingTail === null) {
    renderable.$bindingHead = binding;
  } else {
    (renderable.$bindingTail as Writable<IBinding>).$nextBinding = binding;
  }
  renderable.$bindingTail = binding;
  if (Tracer.enabled) { Tracer.leave(); }
}

export function addComponent(renderable: IRenderable, component: IComponent): void {
  if (Tracer.enabled) { Tracer.enter('Renderer', 'addComponent', slice.call(arguments)); }
  (component as Writable<IComponent>).$prevComponent = renderable.$componentTail;
  (component as Writable<IComponent>).$nextComponent = null;
  if (renderable.$componentTail === null) {
    renderable.$componentHead = component;
  } else {
    (renderable.$componentTail as Writable<IComponent>).$nextComponent = component;
  }
  renderable.$componentTail = component;
  if (Tracer.enabled) { Tracer.leave(); }
}

@instructionRenderer(TargetedInstructionType.setProperty)
/** @internal */
export class SetPropertyRenderer implements IInstructionRenderer {
  public static readonly register: IRegistry['register'];

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: object, instruction: ISetPropertyInstruction): void {
    if (Tracer.enabled) { Tracer.enter('SetPropertyRenderer', 'render', slice.call(arguments)); }
    target[instruction.to] = instruction.value;
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@instructionRenderer(TargetedInstructionType.hydrateElement)
/** @internal */
export class CustomElementRenderer implements IInstructionRenderer {
  public static readonly register: IRegistry['register'];

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IHydrateElementInstruction): void {
    if (Tracer.enabled) { Tracer.enter('CustomElementRenderer', 'render', slice.call(arguments)); }
    const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target, true);
    const component = context.get<ICustomElement>(customElementKey(instruction.res));
    const instructionRenderers = context.get(IRenderer).instructionRenderers;
    const childInstructions = instruction.instructions;

    component.$hydrate(flags, context, target, instruction as IElementHydrationOptions);

    let current: ITargetedInstruction;
    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      current = childInstructions[i];
      instructionRenderers[current.type].render(flags, dom, context, renderable, component, current);
    }

    addComponent(renderable, component);

    operation.dispose();
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@instructionRenderer(TargetedInstructionType.hydrateAttribute)
/** @internal */
export class CustomAttributeRenderer implements IInstructionRenderer {
  public static readonly register: IRegistry['register'];

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IHydrateAttributeInstruction): void {
    if (Tracer.enabled) { Tracer.enter('CustomAttributeRenderer', 'render', slice.call(arguments)); }
    const operation = context.beginComponentOperation(renderable, target, instruction);
    const component = context.get<ICustomAttribute>(customAttributeKey(instruction.res));
    const instructionRenderers = context.get(IRenderer).instructionRenderers;
    const childInstructions = instruction.instructions;

    component.$hydrate(flags, context);

    let current: ITargetedInstruction;
    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      current = childInstructions[i];
      instructionRenderers[current.type].render(flags, dom, context, renderable, component, current);
    }

    addComponent(renderable, component);

    operation.dispose();
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@instructionRenderer(TargetedInstructionType.hydrateTemplateController)
/** @internal */
export class TemplateControllerRenderer implements IInstructionRenderer {
  public static readonly inject: InjectArray = [IRenderingEngine];
  public static readonly register: IRegistry['register'];

  private readonly renderingEngine: IRenderingEngine;

  constructor(renderingEngine: IRenderingEngine) {
    this.renderingEngine = renderingEngine;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IHydrateTemplateController, parts?: TemplatePartDefinitions): void {
    if (Tracer.enabled) { Tracer.enter('TemplateControllerRenderer', 'render', slice.call(arguments)); }
    const factory = this.renderingEngine.getViewFactory(dom, instruction.def, context);
    const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, dom.convertToRenderLocation(target), false);
    const component = context.get<ICustomAttribute>(customAttributeKey(instruction.res));
    const instructionRenderers = context.get(IRenderer).instructionRenderers;
    const childInstructions = instruction.instructions;

    component.$hydrate(flags, context);

    if (instruction.link) {
      (component as ICustomAttribute & { link(componentTail: IComponent): void}).link(renderable.$componentTail);
    }

    let current: ITargetedInstruction;
    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      current = childInstructions[i];
      instructionRenderers[current.type].render(flags, dom, context, renderable, component, current);
    }

    addComponent(renderable, component);

    operation.dispose();
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@instructionRenderer(TargetedInstructionType.hydrateLetElement)
/** @internal */
export class LetElementRenderer implements IInstructionRenderer {
  public static readonly inject: InjectArray = [IExpressionParser, IObserverLocator];
  public static readonly register: IRegistry['register'];

  private readonly parser: IExpressionParser;
  private readonly observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IHydrateLetElementInstruction): void {
    if (Tracer.enabled) { Tracer.enter('LetElementRenderer', 'render', slice.call(arguments)); }
    dom.remove(target);
    const childInstructions = instruction.instructions;
    const toViewModel = instruction.toViewModel;

    let childInstruction: ILetBindingInstruction;
    let expr: AnyBindingExpression;
    let binding: LetBinding;
    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      childInstruction = childInstructions[i];
      expr = ensureExpression(this.parser, childInstruction.from, BindingType.IsPropertyCommand);
      binding = new LetBinding(expr, childInstruction.to, this.observerLocator, context, toViewModel);
      addBinding(renderable, binding);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@instructionRenderer(TargetedInstructionType.callBinding)
/** @internal */
export class CallBindingRenderer implements IInstructionRenderer {
  public static readonly inject: InjectArray = [IExpressionParser, IObserverLocator];
  public static readonly register: IRegistry['register'];

  private readonly parser: IExpressionParser;
  private readonly observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: ICallBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('CallBindingRenderer', 'render', slice.call(arguments)); }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.CallCommand);
    const binding = new Call(expr, target, instruction.to, this.observerLocator, context);
    addBinding(renderable, binding);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@instructionRenderer(TargetedInstructionType.refBinding)
/** @internal */
export class RefBindingRenderer implements IInstructionRenderer {
  public static readonly inject: InjectArray = [IExpressionParser];
  public static readonly register: IRegistry['register'];

  private readonly parser: IExpressionParser;

  constructor(parser: IExpressionParser) {
    this.parser = parser;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IRefBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('RefBindingRenderer', 'render', slice.call(arguments)); }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsRef);
    const binding = new Ref(expr, target, context);
    addBinding(renderable, binding);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@instructionRenderer(TargetedInstructionType.interpolation)
/** @internal */
export class InterpolationBindingRenderer implements IInstructionRenderer {
  public static readonly inject: InjectArray = [IExpressionParser, IObserverLocator];
  public static readonly register: IRegistry['register'];

  private readonly parser: IExpressionParser;
  private readonly observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IInterpolationInstruction): void {
    if (Tracer.enabled) { Tracer.enter('InterpolationBindingRenderer', 'render', slice.call(arguments)); }
    let binding: MultiInterpolationBinding | InterpolationBinding;
    const expr = ensureExpression(this.parser, instruction.from, BindingType.Interpolation);
    if (expr.isMulti) {
      binding = new MultiInterpolationBinding(this.observerLocator, expr, target, instruction.to, BindingMode.toView, context);
    } else {
      binding = new InterpolationBinding(expr.firstExpression, expr, target, instruction.to, BindingMode.toView, this.observerLocator, context, true);
    }
    addBinding(renderable, binding);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@instructionRenderer(TargetedInstructionType.propertyBinding)
/** @internal */
export class PropertyBindingRenderer implements IInstructionRenderer {
  public static readonly inject: InjectArray = [IExpressionParser, IObserverLocator];
  public static readonly register: IRegistry['register'];

  private readonly parser: IExpressionParser;
  private readonly observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IPropertyBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('PropertyBindingRenderer', 'render', slice.call(arguments)); }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsPropertyCommand | instruction.mode);
    const binding = new Binding(expr, target, instruction.to, instruction.mode, this.observerLocator, context);
    addBinding(renderable, binding);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@instructionRenderer(TargetedInstructionType.iteratorBinding)
/** @internal */
export class IteratorBindingRenderer implements IInstructionRenderer {
  public static readonly inject: InjectArray = [IExpressionParser, IObserverLocator];
  public static readonly register: IRegistry['register'];

  private readonly parser: IExpressionParser;
  private readonly observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IIteratorBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('IteratorBindingRenderer', 'render', slice.call(arguments)); }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.ForCommand);
    const binding = new Binding(expr, target, instruction.to, BindingMode.toView, this.observerLocator, context);
    addBinding(renderable, binding);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}
