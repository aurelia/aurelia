import {
  all,
  Class,
  IContainer,
  IRegistry,
  IResolver,
  Registration,
  Metadata,
  IIndexable,
  DI,
  IServiceLocator,
} from '@aurelia/kernel';
import { AnyBindingExpression, IsBindingBehavior } from './ast';
import { CallBinding } from './binding/call-binding';
import { BindingType, IExpressionParser } from './binding/expression-parser';
import { InterpolationBinding, MultiInterpolationBinding } from './binding/interpolation-binding';
import { LetBinding } from './binding/let-binding';
import { PropertyBinding } from './binding/property-binding';
import { RefBinding } from './binding/ref-binding';
import {
  ICallBindingInstruction,
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
  PartialCustomElementDefinitionParts,
  mergeParts
} from './definitions';
import { INode } from './dom';
import { BindingMode, LifecycleFlags } from './flags';
import {
  IController,
  ILifecycle,
  IRenderableController,
  ICustomAttributeViewModel,
  ICustomElementViewModel,
} from './lifecycle';
import { IObserverLocator } from './observation/observer-locator';
import {
  CustomAttribute,
} from './resources/custom-attribute';
import {
  CustomElement, CustomElementDefinition, PartialCustomElementDefinition,
} from './resources/custom-element';
import { Controller } from './templating/controller';
import { ObserversLookup } from './observation';
import { ICompiledRenderContext, getRenderContext } from './templating/render-context';
import { BindingBehaviorExpression } from './binding/ast';
import { BindingBehaviorFactory, BindingBehaviorInstance, IInterceptableBinding } from './resources/binding-behavior';

export interface ITemplateCompiler {
  compile(partialDefinition: PartialCustomElementDefinition, context: IContainer): CustomElementDefinition;
}

export const ITemplateCompiler = DI.createInterface<ITemplateCompiler>('ITemplateCompiler').noDefault();

export interface IInstructionTypeClassifier<TType extends string = string> {
  instructionType: TType;
}

export interface IInstructionRenderer<
  TType extends InstructionTypeName = InstructionTypeName
> extends Partial<IInstructionTypeClassifier<TType>> {
  render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    target: unknown,
    instruction: ITargetedInstruction,
    parts: PartialCustomElementDefinitionParts | undefined,
  ): void;
}

export const IInstructionRenderer = DI.createInterface<IInstructionRenderer>('IInstructionRenderer').noDefault();

export interface IRenderer {
  render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    targets: ArrayLike<INode>,
    templateDefinition: CustomElementDefinition,
    host: INode | null | undefined,
    parts: PartialCustomElementDefinitionParts | undefined,
  ): void;

  renderInstructions(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    instructions: readonly ITargetedInstruction[],
    controller: IRenderableController,
    target: unknown,
    parts: PartialCustomElementDefinitionParts | undefined,
  ): void;
}

export const IRenderer = DI.createInterface<IRenderer>('IRenderer').noDefault();

type DecoratableInstructionRenderer<TType extends string, TProto, TClass> = Class<TProto & Partial<IInstructionTypeClassifier<TType> & Pick<IInstructionRenderer, 'render'>>, TClass> & Partial<IRegistry>;
type DecoratedInstructionRenderer<TType extends string, TProto, TClass> =  Class<TProto & IInstructionTypeClassifier<TType> & Pick<IInstructionRenderer, 'render'>, TClass> & IRegistry;

type InstructionRendererDecorator<TType extends string> = <TProto, TClass>(target: DecoratableInstructionRenderer<TType, TProto, TClass>) => DecoratedInstructionRenderer<TType, TProto, TClass>;

export function instructionRenderer<TType extends string>(instructionType: TType): InstructionRendererDecorator<TType> {
  return function decorator<TProto, TClass>(target: DecoratableInstructionRenderer<TType, TProto, TClass>): DecoratedInstructionRenderer<TType, TProto, TClass> {
    // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
    const decoratedTarget = function (...args: unknown[]): TProto {
      const instance = new target(...args);
      instance.instructionType = instructionType;
      return instance;
    } as unknown as DecoratedInstructionRenderer<TType, TProto, TClass>;
    // make sure we register the decorated constructor with DI
    decoratedTarget.register = function register(container: IContainer): void {
      Registration.singleton(IInstructionRenderer, decoratedTarget).register(container);
    };
    // copy over any metadata such as annotations (set by preceding decorators) as well as static properties set by the user
    // also copy the name, to be less confusing to users (so they can still use constructor.name for whatever reason)
    // the length (number of ctor arguments) is copied for the same reason
    const metadataKeys = Metadata.getOwnKeys(target);
    for (const key of metadataKeys) {
      Metadata.define(key, Metadata.getOwn(key, target), decoratedTarget);
    }
    const ownProperties = Object.getOwnPropertyDescriptors(target);
    Object.keys(ownProperties).filter(prop => prop !== 'prototype').forEach(prop => {
      Reflect.defineProperty(decoratedTarget, prop, ownProperties[prop]);
    });
    return decoratedTarget;
  };
}

/* @internal */
export class Renderer implements IRenderer {
  public instructionRenderers: Record<InstructionTypeName, IInstructionRenderer['render']>;

  public constructor(@all(IInstructionRenderer) instructionRenderers: IInstructionRenderer[]) {
    const record: Record<InstructionTypeName, IInstructionRenderer['render']> = this.instructionRenderers = {};
    instructionRenderers.forEach(item => {
      // Binding the functions to the renderer instances and calling the functions directly,
      // prevents the `render` call sites from going megamorphic.
      // Consumes slightly more memory but significantly less CPU.
      record[item.instructionType as string] = item.render.bind(item);
    });
  }

  public static register(container: IContainer): IResolver<IRenderer> {
    return Registration.singleton(IRenderer, this).register(container);
  }

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    targets: ArrayLike<INode>,
    definition: CustomElementDefinition,
    host: INode | null | undefined,
    parts: PartialCustomElementDefinitionParts | undefined,
  ): void {
    const targetInstructions = definition.instructions;

    if (targets.length !== targetInstructions.length) {
      throw new Error(`The compiled template is not aligned with the render instructions. There are ${targets.length} targets and ${targetInstructions.length} instructions.`);
    }

    for (let i = 0, ii = targets.length; i < ii; ++i) {
      this.renderInstructions(
        /* flags        */flags,
        /* context      */context,
        /* instructions */targetInstructions[i],
        /* controller   */controller,
        /* target       */targets[i],
        /* parts        */parts,
      );
    }

    if (host !== void 0 && host !== null) {
      this.renderInstructions(
        /* flags        */flags,
        /* context      */context,
        /* instructions */definition.surrogates,
        /* controller   */controller,
        /* target       */host,
        /* parts        */parts,
      );
    }
  }

  public renderInstructions(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    instructions: readonly ITargetedInstruction[],
    controller: IRenderableController,
    target: unknown,
    parts: PartialCustomElementDefinitionParts | undefined,
  ): void {
    const instructionRenderers = this.instructionRenderers;
    let current: ITargetedInstruction;
    for (let i = 0, ii = instructions.length; i < ii; ++i) {
      current = instructions[i];
      instructionRenderers[current.type](flags, context, controller, target, current, parts);
    }
  }
}

export function ensureExpression<TFrom>(parser: IExpressionParser, srcOrExpr: TFrom, bindingType: BindingType): Exclude<TFrom, string> {
  if (typeof srcOrExpr === 'string') {
    return parser.parse(srcOrExpr, bindingType) as unknown as Exclude<TFrom, string>;
  }
  return srcOrExpr as Exclude<TFrom, string>;
}

export function getTarget(potentialTarget: object): object {
  if ((potentialTarget as { bindingContext?: object }).bindingContext !== void 0) {
    return (potentialTarget as { bindingContext: object }).bindingContext;
  }
  return potentialTarget;
}

export function getRefTarget(refHost: INode, refTargetName: string): object {
  if (refTargetName === 'element') {
    return refHost;
  }
  switch (refTargetName) {
    case 'controller':
      // this means it supports returning undefined
      return CustomElement.for(refHost)!;
    case 'view':
      // todo: returns node sequences for fun?
      throw new Error('Not supported API');
    case 'view-model':
      // this means it supports returning undefined
      return CustomElement.for(refHost)!.viewModel!;
    default: {
      const caController = CustomAttribute.for(refHost, refTargetName);
      if (caController !== void 0) {
        return caController.viewModel!;
      }
      const ceController = CustomElement.for(refHost, refTargetName);
      if (ceController === void 0) {
        throw new Error(`Attempted to reference "${refTargetName}", but it was not found amongst the target's API.`);
      }
      return ceController.viewModel!;
    }
  }
}

@instructionRenderer(TargetedInstructionType.setProperty)
/** @internal */
export class SetPropertyRenderer implements IInstructionRenderer {
  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    target: IController,
    instruction: ISetPropertyInstruction,
  ): void {
    const obj = getTarget(target) as IIndexable & { $observers: ObserversLookup };
    if (obj.$observers !== void 0 && obj.$observers[instruction.to] !== void 0) {
      obj.$observers[instruction.to].setValue(instruction.value, LifecycleFlags.fromBind);
    } else {
      obj[instruction.to] = instruction.value;
    }
  }
}

@instructionRenderer(TargetedInstructionType.hydrateElement)
/** @internal */
export class CustomElementRenderer implements IInstructionRenderer {
  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    target: INode,
    instruction: IHydrateElementInstruction,
    parts: PartialCustomElementDefinitionParts | undefined,
  ): void {
    parts = mergeParts(parts, instruction.parts);

    const factory = context.getComponentFactory(
      /* parentController */controller,
      /* host             */target,
      /* instruction      */instruction,
      /* viewFactory      */void 0,
      /* location         */target,
    );

    const key = CustomElement.keyFrom(instruction.res);
    const component = factory.createComponent<ICustomElementViewModel>(key);

    const lifecycle = context.get(ILifecycle);
    const childController = Controller.forCustomElement(
      /* viewModel       */component,
      /* lifecycle       */lifecycle,
      /* host            */target,
      /* parentContainer */context,
      /* parts           */parts,
      /* flags           */flags,
    );

    flags = childController.flags;
    Metadata.define(key, childController, target);

    context.renderInstructions(
      /* flags        */flags,
      /* instructions */instruction.instructions,
      /* controller   */controller,
      /* target       */childController,
      /* parts        */parts,
    );

    controller.addController(childController);

    factory.dispose();
  }
}

@instructionRenderer(TargetedInstructionType.hydrateAttribute)
/** @internal */
export class CustomAttributeRenderer implements IInstructionRenderer {
  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    target: INode,
    instruction: IHydrateAttributeInstruction,
    parts: PartialCustomElementDefinitionParts | undefined,
  ): void {
    const factory = context.getComponentFactory(
      /* parentController */controller,
      /* host             */target,
      /* instruction      */instruction,
      /* viewFactory      */void 0,
      /* location         */void 0,
    );

    const key = CustomAttribute.keyFrom(instruction.res);
    const component = factory.createComponent<ICustomAttributeViewModel>(key);

    const lifecycle = context.get(ILifecycle);
    const childController = Controller.forCustomAttribute(
      /* viewModel */component,
      /* lifecycle */lifecycle,
      /* host      */target,
      /* flags     */flags,
    );

    Metadata.define(key, childController, target);

    context.renderInstructions(
      /* flags        */flags,
      /* instructions */instruction.instructions,
      /* controller   */controller,
      /* target       */childController,
      /* parts        */parts,
    );

    controller.addController(childController);

    factory.dispose();
  }
}

@instructionRenderer(TargetedInstructionType.hydrateTemplateController)
/** @internal */
export class TemplateControllerRenderer implements IInstructionRenderer {
  public render(
    flags: LifecycleFlags,
    parentContext: ICompiledRenderContext,
    controller: IRenderableController,
    target: INode,
    instruction: IHydrateTemplateController,
    parts: PartialCustomElementDefinitionParts | undefined,
  ): void {
    parts = mergeParts(parts, instruction.parts);

    const viewFactory = getRenderContext(instruction.def, parentContext, parts).getViewFactory();
    const renderLocation = parentContext.dom.convertToRenderLocation(target);

    const componentFactory = parentContext.getComponentFactory(
      /* parentController */controller,
      /* host             */target,
      /* instruction      */instruction,
      /* viewFactory      */viewFactory,
      /* location         */renderLocation,
    );

    const key = CustomAttribute.keyFrom(instruction.res);
    const component = componentFactory.createComponent<ICustomAttributeViewModel>(key);

    const lifecycle = parentContext.get(ILifecycle);
    const childController = Controller.forCustomAttribute(
      /* viewModel */component,
      /* lifecycle */lifecycle,
      /* host      */target,
      /* flags     */flags,
    );

    Metadata.define(key, childController, renderLocation);

    if (instruction.link) {
      const controllers = controller.controllers!;
      (component as { link(componentTail: IController): void}).link(controllers[controllers.length - 1]);
    }

    parentContext.renderInstructions(
      /* flags        */flags,
      /* instructions */instruction.instructions,
      /* controller   */controller,
      /* target       */childController,
      /* parts        */parts,
    );

    controller.addController(childController);

    componentFactory.dispose();
  }
}

@instructionRenderer(TargetedInstructionType.hydrateLetElement)
/** @internal */
export class LetElementRenderer implements IInstructionRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    target: INode,
    instruction: IHydrateLetElementInstruction,
  ): void {
    context.dom.remove(target);
    const childInstructions = instruction.instructions;
    const toBindingContext = instruction.toBindingContext;

    let childInstruction: ILetBindingInstruction;
    let expr: AnyBindingExpression;
    let binding: LetBinding;
    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      childInstruction = childInstructions[i];
      expr = ensureExpression(this.parser, childInstruction.from, BindingType.IsPropertyCommand);
      binding = applyBindingBehavior(
        new LetBinding(expr, childInstruction.to, this.observerLocator, context, toBindingContext),
        expr as unknown as IsBindingBehavior,
        context,
      ) as LetBinding;
      controller.addBinding(binding);
    }
  }
}

@instructionRenderer(TargetedInstructionType.callBinding)
/** @internal */
export class CallBindingRenderer implements IInstructionRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    target: IController,
    instruction: ICallBindingInstruction,
  ): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.CallCommand);
    const binding = applyBindingBehavior(
      new CallBinding(expr, getTarget(target), instruction.to, this.observerLocator, context),
      expr,
      context,
    );
    controller.addBinding(binding);
  }
}

@instructionRenderer(TargetedInstructionType.refBinding)
/** @internal */
export class RefBindingRenderer implements IInstructionRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    target: INode,
    instruction: IRefBindingInstruction,
  ): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsRef);
    const binding = applyBindingBehavior(
      new RefBinding(expr, getRefTarget(target, instruction.to), context),
      expr,
      context,
    );
    controller.addBinding(binding);
  }
}

@instructionRenderer(TargetedInstructionType.interpolation)
/** @internal */
export class InterpolationBindingRenderer implements IInstructionRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    target: IController,
    instruction: IInterpolationInstruction,
  ): void {
    let binding: MultiInterpolationBinding | InterpolationBinding;
    const expr = ensureExpression(this.parser, instruction.from, BindingType.Interpolation);
    if (expr.isMulti) {
      binding = applyBindingBehavior(
        new MultiInterpolationBinding(this.observerLocator, expr, getTarget(target), instruction.to, BindingMode.toView, context),
        expr as unknown as IsBindingBehavior,
        context,
      ) as MultiInterpolationBinding;
    } else {
      binding = applyBindingBehavior(
        new InterpolationBinding(expr.firstExpression, expr, getTarget(target), instruction.to, BindingMode.toView, this.observerLocator, context, true),
        expr as unknown as IsBindingBehavior,
        context,
      ) as InterpolationBinding;
    }
    controller.addBinding(binding);
  }
}

@instructionRenderer(TargetedInstructionType.propertyBinding)
/** @internal */
export class PropertyBindingRenderer implements IInstructionRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    target: IController,
    instruction: IPropertyBindingInstruction,
  ): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsPropertyCommand | instruction.mode);
    const binding = applyBindingBehavior(
      new PropertyBinding(expr, getTarget(target), instruction.to, instruction.mode, this.observerLocator, context),
      expr,
      context,
    );
    controller.addBinding(binding);
  }
}

@instructionRenderer(TargetedInstructionType.iteratorBinding)
/** @internal */
export class IteratorBindingRenderer implements IInstructionRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    target: IController,
    instruction: IIteratorBindingInstruction,
  ): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.ForCommand);
    const binding = applyBindingBehavior(
      new PropertyBinding(expr, getTarget(target), instruction.to, BindingMode.toView, this.observerLocator, context),
      expr as unknown as IsBindingBehavior,
      context,
    );
    controller.addBinding(binding);
  }
}

let behaviorExpressionIndex = 0;
const behaviorExpressions: BindingBehaviorExpression[] = [];

export function applyBindingBehavior(
  binding: IInterceptableBinding,
  expression: IsBindingBehavior,
  locator: IServiceLocator,
): IInterceptableBinding {
  while (expression instanceof BindingBehaviorExpression) {
    behaviorExpressions[behaviorExpressionIndex++] = expression;
    expression = expression.expression;
  }
  while (behaviorExpressionIndex > 0) {
    const behaviorExpression = behaviorExpressions[--behaviorExpressionIndex];
    const behaviorOrFactory = locator.get<BindingBehaviorFactory | BindingBehaviorInstance>(behaviorExpression.behaviorKey);
    if (behaviorOrFactory instanceof BindingBehaviorFactory) {
      binding = behaviorOrFactory.construct(binding, behaviorExpression);
    }
  }
  behaviorExpressions.length = 0;
  return binding;
}
