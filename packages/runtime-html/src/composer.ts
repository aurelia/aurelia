import { all, Metadata, IServiceLocator, IResolver, IContainer, Registration, Class, DI, IRegistry } from '@aurelia/kernel';
import {
  BindingMode,
  BindingType,
  ContentBinding,
  IExpressionParser,
  IObserverLocator,
  IScheduler,
  Interpolation,
  IsBindingBehavior,
  LifecycleFlags,
  InterpolationBinding,
  PropertyBinding,
  AnyBindingExpression,
  BindingBehaviorExpression,
  BindingBehaviorInstance,
  CallBinding,
  IInterceptableBinding,
  ILifecycle,
  IObservable,
  LetBinding,
  RefBinding,
  BindingBehaviorFactory,
} from '@aurelia/runtime';
import { AttributeBinding } from './binding/attribute';
import { Listener } from './binding/listener';
import { IEventDelegator } from './observation/event-delegator';
import {
  AttributeBindingInstruction,
  CallBindingInstruction,
  HydrateAttributeInstruction,
  HydrateElementInstruction,
  HydrateLetElementInstruction,
  HydrateTemplateController,
  InterpolationInstruction,
  IteratorBindingInstruction,
  LetBindingInstruction,
  ListenerBindingInstruction,
  PropertyBindingInstruction,
  RefBindingInstruction,
  SetAttributeInstruction,
  SetClassAttributeInstruction,
  SetPropertyInstruction,
  SetStyleAttributeInstruction,
  StylePropertyBindingInstruction,
  Instruction,
  InstructionType,
  TextBindingInstruction,
} from './instructions';
import { InstructionTypeName, IInstruction } from './definitions';
import { IComposableController, IController, ICustomAttributeViewModel, ICustomElementViewModel, IViewFactory } from './lifecycle';
import { CustomElement, CustomElementDefinition, PartialCustomElementDefinition } from './resources/custom-element';
import { getCompositionContext, ICompiledCompositionContext } from './templating/composition-context';
import { RegisteredProjections } from './resources/custom-elements/au-slot';
import { CustomAttribute } from './resources/custom-attribute';
import { HTMLDOM, INode } from './dom';
import { Controller } from './templating/controller';

export interface ITemplateCompiler {
  compile(
    partialDefinition: PartialCustomElementDefinition,
    context: IContainer,
    targetedProjections: RegisteredProjections | null,
  ): CustomElementDefinition;
}

export const ITemplateCompiler = DI.createInterface<ITemplateCompiler>('ITemplateCompiler').noDefault();

export interface IComposer {
  compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    targets: ArrayLike<INode>,
    definition: CustomElementDefinition,
    host: INode | null | undefined,
  ): void;

  composeChildren(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    instructions: readonly IInstruction[],
    controller: IComposableController,
    target: unknown,
  ): void ;
}
export const IComposer = DI.createInterface<IComposer>('IComposer').noDefault();

export interface IInstructionTypeClassifier<TType extends string = string> {
  instructionType: TType;
}
export interface IInstructionComposer<
  TType extends InstructionTypeName = InstructionTypeName
> extends Partial<IInstructionTypeClassifier<TType>> {
  compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    target: unknown,
    instruction: IInstruction,
  ): void;
}

export const IInstructionComposer = DI.createInterface<IInstructionComposer>('IInstructionComposer').noDefault();

type DecoratableInstructionComposer<TType extends string, TProto, TClass> = Class<TProto & Partial<IInstructionTypeClassifier<TType> & Pick<IInstructionComposer, 'compose'>>, TClass> & Partial<IRegistry>;
type DecoratedInstructionComposer<TType extends string, TProto, TClass> =  Class<TProto & IInstructionTypeClassifier<TType> & Pick<IInstructionComposer, 'compose'>, TClass> & IRegistry;

type InstructionComposerDecorator<TType extends string> = <TProto, TClass>(target: DecoratableInstructionComposer<TType, TProto, TClass>) => DecoratedInstructionComposer<TType, TProto, TClass>;

export function instructionComposer<TType extends string>(instructionType: TType): InstructionComposerDecorator<TType> {
  return function decorator<TProto, TClass>(target: DecoratableInstructionComposer<TType, TProto, TClass>): DecoratedInstructionComposer<TType, TProto, TClass> {
    // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
    const decoratedTarget = function (...args: unknown[]): TProto {
      const instance = new target(...args);
      instance.instructionType = instructionType;
      return instance;
    } as unknown as DecoratedInstructionComposer<TType, TProto, TClass>;
    // make sure we register the decorated constructor with DI
    decoratedTarget.register = function register(container: IContainer): void {
      Registration.singleton(IInstructionComposer, decoratedTarget).register(container);
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

export class Composer implements IComposer {
  private readonly instructionComposers: Record<InstructionTypeName, IInstructionComposer['compose']>;

  public static register(container: IContainer): IResolver<IComposer> {
    return Registration.singleton(IComposer, this).register(container);
  }

  public constructor(@all(IInstructionComposer) instructionComposers: IInstructionComposer[]) {
    const record: Record<InstructionTypeName, IInstructionComposer['compose']> = this.instructionComposers = {};
    instructionComposers.forEach(item => {
      // Binding the functions to the composer instances and calling the functions directly,
      // prevents the `compose` call sites from going megamorphic.
      // Consumes slightly more memory but significantly less CPU.
      record[item.instructionType as string] = item.compose.bind(item);
    });
  }

  public compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    targets: ArrayLike<INode>,
    definition: CustomElementDefinition,
    host: INode | null | undefined,
  ): void {
    const targetInstructions = definition.instructions;

    if (targets.length !== targetInstructions.length) {
      throw new Error(`The compiled template is not aligned with the compose instructions. There are ${targets.length} targets and ${targetInstructions.length} instructions.`);
    }

    for (let i = 0, ii = targets.length; i < ii; ++i) {
      this.composeChildren(
        /* flags        */flags,
        /* context      */context,
        /* instructions */targetInstructions[i] as readonly Instruction[],
        /* controller   */controller,
        /* target       */targets[i],
      );
    }

    if (host !== void 0 && host !== null) {
      this.composeChildren(
        /* flags        */flags,
        /* context      */context,
        /* instructions */definition.surrogates as readonly Instruction[],
        /* controller   */controller,
        /* target       */host,
      );
    }
  }

  public composeChildren(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    instructions: readonly Instruction[],
    controller: IComposableController,
    target: unknown,
  ): void {
    const instructionComposers = this.instructionComposers;
    let current: Instruction;
    for (let i = 0, ii = instructions.length; i < ii; ++i) {
      current = instructions[i];
      instructionComposers[current.type](flags, context, controller, target, current);
    }
  }
}

function ensureExpression<TFrom>(parser: IExpressionParser, srcOrExpr: TFrom, bindingType: BindingType): Exclude<TFrom, string> {
  if (typeof srcOrExpr === 'string') {
    return parser.parse(srcOrExpr, bindingType) as unknown as Exclude<TFrom, string>;
  }
  return srcOrExpr as Exclude<TFrom, string>;
}

function getTarget(potentialTarget: object): object {
  if ((potentialTarget as { bindingContext?: object }).bindingContext !== void 0) {
    return (potentialTarget as { bindingContext: object }).bindingContext;
  }
  return potentialTarget;
}

function getRefTarget(refHost: INode, refTargetName: string): object {
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
      const ceController = CustomElement.for(refHost, { name: refTargetName });
      if (ceController === void 0) {
        throw new Error(`Attempted to reference "${refTargetName}", but it was not found amongst the target's API.`);
      }
      return ceController.viewModel!;
    }
  }
}

@instructionComposer(InstructionType.setProperty)
/** @internal */
export class SetPropertyComposer implements IInstructionComposer {
  public compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    target: IController,
    instruction: SetPropertyInstruction,
  ): void {
    const obj = getTarget(target) as IObservable;
    if (obj.$observers !== void 0 && obj.$observers[instruction.to] !== void 0) {
      obj.$observers[instruction.to].setValue(instruction.value, LifecycleFlags.fromBind);
    } else {
      obj[instruction.to] = instruction.value;
    }
  }
}

@instructionComposer(InstructionType.composeElement)
/** @internal */
export class CustomElementComposer implements IInstructionComposer {
  public compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    target: INode,
    instruction: HydrateElementInstruction,
  ): void {

    let viewFactory: IViewFactory | undefined;

    const slotInfo = instruction.slotInfo;
    if (slotInfo!==null) {
      const projectionCtx = slotInfo.projectionContext;
      viewFactory = getCompositionContext(projectionCtx.content, context).getViewFactory(void 0, slotInfo.type, projectionCtx.scope);
    }

    const factory = context.getComponentFactory(
      /* parentController */controller,
      /* host             */target,
      /* instruction      */instruction,
      /* viewFactory      */viewFactory,
      /* location         */target,
    );

    const key = CustomElement.keyFrom(instruction.res);
    const component = factory.createComponent<ICustomElementViewModel>(key);

    const lifecycle = context.get(ILifecycle);
    const childController = Controller.forCustomElement(
      /* root                */controller.root,
      /* container           */context,
      /* viewModel           */component,
      /* lifecycle           */lifecycle,
      /* host                */target,
      /* targetedProjections */context.getProjectionFor(instruction),
      /* flags               */flags,
    );

    flags = childController.flags;
    Metadata.define(key, childController, target);

    context.composeChildren(
      /* flags        */flags,
      /* instructions */instruction.instructions,
      /* controller   */controller,
      /* target       */childController,
    );

    controller.addController(childController);

    factory.dispose();
  }
}

@instructionComposer(InstructionType.composeAttribute)
/** @internal */
export class CustomAttributeComposer implements IInstructionComposer {
  public compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    target: Node,
    instruction: HydrateAttributeInstruction,
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
      /* root      */controller.root,
      /* container */context,
      /* viewModel */component,
      /* lifecycle */lifecycle,
      /* host      */target,
      /* flags     */flags,
    );

    Metadata.define(key, childController, target);

    context.composeChildren(
      /* flags        */flags,
      /* instructions */instruction.instructions,
      /* controller   */controller,
      /* target       */childController,
    );

    controller.addController(childController);

    factory.dispose();
  }
}

@instructionComposer(InstructionType.composeTemplateController)
/** @internal */
export class TemplateControllerComposer implements IInstructionComposer {
  public compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    target: INode,
    instruction: HydrateTemplateController,
  ): void {

    const viewFactory = getCompositionContext(instruction.def, context).getViewFactory();
    const renderLocation = context.dom.convertToRenderLocation(target);

    const componentFactory = context.getComponentFactory(
      /* parentController */controller,
      /* host             */target,
      /* instruction      */instruction,
      /* viewFactory      */viewFactory,
      /* location         */renderLocation,
    );

    const key = CustomAttribute.keyFrom(instruction.res);
    const component = componentFactory.createComponent<ICustomAttributeViewModel>(key);

    const lifecycle = context.get(ILifecycle);
    const childController = Controller.forCustomAttribute(
      /* root      */controller.root,
      /* container */context,
      /* viewModel */component,
      /* lifecycle */lifecycle,
      /* host      */target,
      /* flags     */flags,
    );

    Metadata.define(key, childController, renderLocation);

    component.link?.(flags, context, controller, childController, target, instruction);

    context.composeChildren(
      /* flags        */flags,
      /* instructions */instruction.instructions,
      /* controller   */controller,
      /* target       */childController,
    );

    controller.addController(childController);

    componentFactory.dispose();
  }
}

@instructionComposer(InstructionType.composeLetElement)
/** @internal */
export class LetElementComposer implements IInstructionComposer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) {}

  public compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    target: INode,
    instruction: HydrateLetElementInstruction,
  ): void {
    context.dom.remove(target);
    const childInstructions = instruction.instructions;
    const toBindingContext = instruction.toBindingContext;

    let childInstruction: LetBindingInstruction;
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

@instructionComposer(InstructionType.callBinding)
/** @internal */
export class CallBindingComposer implements IInstructionComposer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) {}

  public compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    target: IController,
    instruction: CallBindingInstruction,
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

@instructionComposer(InstructionType.refBinding)
/** @internal */
export class RefBindingComposer implements IInstructionComposer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
  ) {}

  public compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    target: INode,
    instruction: RefBindingInstruction,
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

@instructionComposer(InstructionType.interpolation)
/** @internal */
export class InterpolationBindingComposer implements IInstructionComposer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
    @IScheduler private readonly scheduler: IScheduler,
  ) {}

  public compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    target: IController,
    instruction: InterpolationInstruction,
  ): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.Interpolation) as Interpolation;
    const binding = new InterpolationBinding(
      this.observerLocator,
      expr,
      getTarget(target),
      instruction.to,
      BindingMode.toView,
      context,
      this.scheduler,
    );
    const partBindings = binding.partBindings;
    let partBinding: ContentBinding;
    for (let i = 0, ii = partBindings.length; ii > i; ++i) {
      partBinding = partBindings[i];
      partBindings[i] = applyBindingBehavior(
        partBinding,
        partBinding.sourceExpression as unknown as IsBindingBehavior,
        context
      ) as ContentBinding;
    }
    controller.addBinding(binding);
  }
}

@instructionComposer(InstructionType.propertyBinding)
/** @internal */
export class PropertyBindingComposer implements IInstructionComposer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) {}

  public compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    target: IController,
    instruction: PropertyBindingInstruction,
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

@instructionComposer(InstructionType.iteratorBinding)
/** @internal */
export class IteratorBindingComposer implements IInstructionComposer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) {}

  public compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    target: IController,
    instruction: IteratorBindingInstruction,
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

@instructionComposer(InstructionType.textBinding)
/** @internal */
export class TextBindingComposer implements IInstructionComposer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
    @IScheduler private readonly scheduler: IScheduler,
  ) {}

  public compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    target: ChildNode,
    instruction: TextBindingInstruction,
  ): void {
    const next = target.nextSibling;
    if (context.dom.isMarker(target)) {
      context.dom.remove(target);
    }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.Interpolation) as Interpolation;
    const binding = new InterpolationBinding(
      this.observerLocator,
      expr,
      next!,
      'textContent',
      BindingMode.toView,
      context,
      this.scheduler,
    );
    const partBindings = binding.partBindings;
    let partBinding: ContentBinding;
    for (let i = 0, ii = partBindings.length; ii > i; ++i) {
      partBinding = partBindings[i];
      partBindings[i] = applyBindingBehavior(
        partBinding,
        partBinding.sourceExpression as unknown as IsBindingBehavior,
        context
      ) as ContentBinding;
    }
    controller.addBinding(binding);
  }
}

@instructionComposer(InstructionType.listenerBinding)
/** @internal */
export class ListenerBindingComposer implements IInstructionComposer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IEventDelegator private readonly eventDelegator: IEventDelegator,
  ) {}

  public compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    target: HTMLElement,
    instruction: ListenerBindingInstruction,
  ): void {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsEventCommand | (instruction.strategy + BindingType.DelegationStrategyDelta));
    const binding = applyBindingBehavior(
      new Listener(context.dom as HTMLDOM, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventDelegator, context),
      expr,
      context,
    );
    controller.addBinding(binding);
  }
}

@instructionComposer(InstructionType.setAttribute)
/** @internal */
export class SetAttributeComposer implements IInstructionComposer {
  public compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    target: HTMLElement,
    instruction: SetAttributeInstruction,
  ): void {
    target.setAttribute(instruction.to, instruction.value);
  }
}

@instructionComposer(InstructionType.setClassAttribute)
export class SetClassAttributeComposer implements IInstructionComposer {
  public compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    target: HTMLElement,
    instruction: SetClassAttributeInstruction,
  ): void {
    addClasses(target.classList, instruction.value);
  }
}

@instructionComposer(InstructionType.setStyleAttribute)
export class SetStyleAttributeComposer implements IInstructionComposer {
  public compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    target: HTMLElement,
    instruction: SetStyleAttributeInstruction,
  ): void {
    target.style.cssText += instruction.value;
  }
}

@instructionComposer(InstructionType.stylePropertyBinding)
/** @internal */
export class StylePropertyBindingComposer implements IInstructionComposer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) {}

  public compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    target: HTMLElement,
    instruction: StylePropertyBindingInstruction,
  ): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsPropertyCommand | BindingMode.toView);
    const binding = applyBindingBehavior(
      new PropertyBinding(expr, target.style, instruction.to, BindingMode.toView, this.observerLocator, context),
      expr,
      context,
    );
    controller.addBinding(binding);
  }
}

@instructionComposer(InstructionType.attributeBinding)
/** @internal */
export class AttributeBindingComposer implements IInstructionComposer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) {}

  public compose(
    flags: LifecycleFlags,
    context: ICompiledCompositionContext,
    controller: IComposableController,
    target: HTMLElement,
    instruction: AttributeBindingInstruction,
  ): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsPropertyCommand | BindingMode.toView);
    const binding = applyBindingBehavior(
      new AttributeBinding(
        expr,
        target,
        instruction.attr/* targetAttribute */,
        instruction.to/* targetKey */,
        BindingMode.toView,
        this.observerLocator,
        context
      ),
      expr,
      context,
    );
    controller.addBinding(binding);
  }
}

// http://jsben.ch/7n5Kt
function addClasses(classList: DOMTokenList, className: string): void {
  const len = className.length;
  let start = 0;
  for (let i = 0; i < len; ++i) {
    if (className.charCodeAt(i) === 0x20) {
      if (i !== start) {
        classList.add(className.slice(start, i));
      }
      start = i + 1;
    } else if (i + 1 === len) {
      classList.add(className.slice(start));
    }
  }
}
