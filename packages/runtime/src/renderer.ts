import {
  all,
  Class,
  IContainer,
  IRegistry,
  IResolver,
  Key,
  Registration,
  Reporter,
  Tracer
} from '@aurelia/kernel';
import { AnyBindingExpression } from './ast';
import { CallBinding } from './binding/call-binding';
import { BindingType, IExpressionParser } from './binding/expression-parser';
import { InterpolationBinding, MultiInterpolationBinding } from './binding/interpolation-binding';
import { LetBinding } from './binding/let-binding';
import { PropertyBinding } from './binding/property-binding';
import { RefBinding } from './binding/ref-binding';
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
  IController,
  IRenderContext,
} from './lifecycle';
import { IObserverLocator } from './observation/observer-locator';
import {
  IInstructionRenderer,
  IInstructionTypeClassifier,
  IRenderer,
  IRenderingEngine
} from './rendering-engine';
import {
  Controller,
} from './templating/controller';

const slice = Array.prototype.slice;

type DecoratableInstructionRenderer<TType extends string, TProto, TClass> = Class<TProto & Partial<IInstructionTypeClassifier<TType> & Pick<IInstructionRenderer, 'render'>>, TClass> & Partial<IRegistry>;
type DecoratedInstructionRenderer<TType extends string, TProto, TClass> =  Class<TProto & IInstructionTypeClassifier<TType> & Pick<IInstructionRenderer, 'render'>, TClass> & IRegistry;

type InstructionRendererDecorator<TType extends string> = <TProto, TClass>(target: DecoratableInstructionRenderer<TType, TProto, TClass>) => DecoratedInstructionRenderer<TType, TProto, TClass>;

export function instructionRenderer<TType extends string>(instructionType: TType): InstructionRendererDecorator<TType> {
  return function decorator<TProto, TClass>(target: DecoratableInstructionRenderer<TType, TProto, TClass>): DecoratedInstructionRenderer<TType, TProto, TClass> {
    // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
    const decoratedTarget = function(...args: unknown[]): TProto {
      // TODO: fix this
      // @ts-ignore
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
  // TODO: fix this
  // @ts-ignore
  public static readonly inject: readonly Key[] = [all(IInstructionRenderer)];

  public instructionRenderers: Record<InstructionTypeName, IInstructionRenderer>;

  constructor(instructionRenderers: IInstructionRenderer[]) {
    const record: Record<InstructionTypeName, IInstructionRenderer> = this.instructionRenderers = {};
    instructionRenderers.forEach(item => {
      record[item.instructionType!] = item;
    });
  }

  public static register(container: IContainer): IResolver<IRenderer> {
    return Registration.singleton(IRenderer, this).register(container);
  }

  // tslint:disable-next-line:parameters-max-number
  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, targets: ArrayLike<INode>, definition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void {
    const targetInstructions = definition.instructions;
    const instructionRenderers = this.instructionRenderers;

    if (targets.length !== targetInstructions.length) {
      if (targets.length > targetInstructions.length) {
        throw Reporter.error(30);
      } else {
        throw Reporter.error(31);
      }
    }
    let instructions: ITargetedInstruction[];
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
  }
}

export function ensureExpression<TFrom>(parser: IExpressionParser, srcOrExpr: TFrom, bindingType: BindingType): Exclude<TFrom, string> {
  if (typeof srcOrExpr === 'string') {
    return parser.parse(srcOrExpr, bindingType) as unknown as Exclude<TFrom, string>;
  }
  return srcOrExpr as Exclude<TFrom, string>;
}

export function addBinding(renderable: IController, binding: IBinding): void {
  if (renderable.bindings == void 0) {
    renderable.bindings = [binding];
  } else {
    renderable.bindings.push(binding);
  }
}

export function addComponent(renderable: IController, component: IController): void {
  if (renderable.controllers == void 0) {
    renderable.controllers = [component];
  } else {
    renderable.controllers.push(component);
  }
}

export function getTarget(potentialTarget: object): object {
  if ((potentialTarget as { bindingContext?: object }).bindingContext !== void 0) {
    return (potentialTarget as { bindingContext: object }).bindingContext;
  }
  return potentialTarget;
}

@instructionRenderer(TargetedInstructionType.setProperty)
/** @internal */
export class SetPropertyRenderer implements IInstructionRenderer {
  public static readonly register: IRegistry['register'];

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: IController, instruction: ISetPropertyInstruction): void {
    getTarget(target)[instruction.to as keyof object] = (instruction.value === '' ? true : instruction.value) as never; // Yeah, yeah..
  }
}

@instructionRenderer(TargetedInstructionType.hydrateElement)
/** @internal */
export class CustomElementRenderer implements IInstructionRenderer {
  public static readonly register: IRegistry['register'];

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: INode, instruction: IHydrateElementInstruction): void {
    const operation = context.beginComponentOperation(renderable, target, instruction, null!, null!, target, true);
    const component = context.get<object>(customElementKey(instruction.res));
    const instructionRenderers = context.get(IRenderer).instructionRenderers;
    const childInstructions = instruction.instructions;

    const controller = Controller.forCustomElement(
      component,
      context,
      target,
      flags,
      instruction as IElementHydrationOptions,
    );

    let current: ITargetedInstruction;
    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      current = childInstructions[i];
      instructionRenderers[current.type].render(flags, dom, context, renderable, controller, current);
    }

    addComponent(renderable, controller);

    operation.dispose();
  }
}

@instructionRenderer(TargetedInstructionType.hydrateAttribute)
/** @internal */
export class CustomAttributeRenderer implements IInstructionRenderer {
  public static readonly register: IRegistry['register'];

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: INode, instruction: IHydrateAttributeInstruction): void {
    const operation = context.beginComponentOperation(renderable, target, instruction);
    const component = context.get<object>(customAttributeKey(instruction.res));
    const instructionRenderers = context.get(IRenderer).instructionRenderers;
    const childInstructions = instruction.instructions;

    const controller = Controller.forCustomAttribute(
      component,
      context,
      flags,
    );

    let current: ITargetedInstruction;
    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      current = childInstructions[i];
      instructionRenderers[current.type].render(flags, dom, context, renderable, controller, current);
    }

    addComponent(renderable, controller);

    operation.dispose();
  }
}

@instructionRenderer(TargetedInstructionType.hydrateTemplateController)
/** @internal */
export class TemplateControllerRenderer implements IInstructionRenderer {
  public static readonly inject: readonly Key[] = [IRenderingEngine];
  public static readonly register: IRegistry['register'];

  private readonly renderingEngine: IRenderingEngine;

  constructor(renderingEngine: IRenderingEngine) {
    this.renderingEngine = renderingEngine;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: INode, instruction: IHydrateTemplateController, parts?: TemplatePartDefinitions): void {
    const factory = this.renderingEngine.getViewFactory(dom, instruction.def, context);
    const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, dom.convertToRenderLocation(target), false);
    const component = context.get<object>(customAttributeKey(instruction.res));
    const instructionRenderers = context.get(IRenderer).instructionRenderers;
    const childInstructions = instruction.instructions;
    if (instruction.parts !== void 0) {
      if (parts === void 0) {
        // Just assign it, no need to create new variables
        parts = instruction.parts;
      } else {
        // Create a new object because we shouldn't accidentally put child information in the parent part object.
        // If the parts conflict, the instruction's parts overwrite the passed-in parts because they were declared last.
        parts = {
          ...parts,
          ...instruction.parts,
        };
      }
    }

    const controller = Controller.forCustomAttribute(component, context, flags);

    if (instruction.link) {
      const controllers = renderable.controllers!;
      (component as { link(componentTail: IController): void}).link(controllers[controllers.length - 1]);
    }

    let current: ITargetedInstruction;
    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      current = childInstructions[i];
      instructionRenderers[current.type].render(flags, dom, context, renderable, controller, current);
    }

    addComponent(renderable, controller);

    operation.dispose();
  }
}

@instructionRenderer(TargetedInstructionType.hydrateLetElement)
/** @internal */
export class LetElementRenderer implements IInstructionRenderer {
  public static readonly inject: readonly Key[] = [IExpressionParser, IObserverLocator];
  public static readonly register: IRegistry['register'];

  private readonly parser: IExpressionParser;
  private readonly observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: INode, instruction: IHydrateLetElementInstruction): void {
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
  }
}

@instructionRenderer(TargetedInstructionType.callBinding)
/** @internal */
export class CallBindingRenderer implements IInstructionRenderer {
  public static readonly inject: readonly Key[] = [IExpressionParser, IObserverLocator];
  public static readonly register: IRegistry['register'];

  private readonly parser: IExpressionParser;
  private readonly observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: IController, instruction: ICallBindingInstruction): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.CallCommand);
    const binding = new CallBinding(expr, getTarget(target), instruction.to, this.observerLocator, context);
    addBinding(renderable, binding);
  }
}

@instructionRenderer(TargetedInstructionType.refBinding)
/** @internal */
export class RefBindingRenderer implements IInstructionRenderer {
  public static readonly inject: readonly Key[] = [IExpressionParser];
  public static readonly register: IRegistry['register'];

  private readonly parser: IExpressionParser;

  constructor(parser: IExpressionParser) {
    this.parser = parser;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: IController, instruction: IRefBindingInstruction): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsRef);
    const binding = new RefBinding(expr, getTarget(target), context);
    addBinding(renderable, binding);
  }
}

@instructionRenderer(TargetedInstructionType.interpolation)
/** @internal */
export class InterpolationBindingRenderer implements IInstructionRenderer {
  public static readonly inject: readonly Key[] = [IExpressionParser, IObserverLocator];
  public static readonly register: IRegistry['register'];

  private readonly parser: IExpressionParser;
  private readonly observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: IController, instruction: IInterpolationInstruction): void {
    let binding: MultiInterpolationBinding | InterpolationBinding;
    const expr = ensureExpression(this.parser, instruction.from, BindingType.Interpolation);
    if (expr.isMulti) {
      binding = new MultiInterpolationBinding(this.observerLocator, expr, getTarget(target), instruction.to, BindingMode.toView, context);
    } else {
      binding = new InterpolationBinding(expr.firstExpression, expr, getTarget(target), instruction.to, BindingMode.toView, this.observerLocator, context, true);
    }
    addBinding(renderable, binding);
  }
}

@instructionRenderer(TargetedInstructionType.propertyBinding)
/** @internal */
export class PropertyBindingRenderer implements IInstructionRenderer {
  public static readonly inject: readonly Key[] = [IExpressionParser, IObserverLocator];
  public static readonly register: IRegistry['register'];

  private readonly parser: IExpressionParser;
  private readonly observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: IController, instruction: IPropertyBindingInstruction): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsPropertyCommand | instruction.mode);
    const binding = new PropertyBinding(expr, getTarget(target), instruction.to, instruction.mode, this.observerLocator, context);
    addBinding(renderable, binding);
  }
}

@instructionRenderer(TargetedInstructionType.iteratorBinding)
/** @internal */
export class IteratorBindingRenderer implements IInstructionRenderer {
  public static readonly inject: readonly Key[] = [IExpressionParser, IObserverLocator];
  public static readonly register: IRegistry['register'];

  private readonly parser: IExpressionParser;
  private readonly observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: IController, instruction: IIteratorBindingInstruction): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.ForCommand);
    const binding = new PropertyBinding(expr, getTarget(target), instruction.to, BindingMode.toView, this.observerLocator, context);
    addBinding(renderable, binding);
  }
}
