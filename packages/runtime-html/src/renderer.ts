import { Metadata, Registration, DI, emptyArray, InstanceProvider, Constructable, IResolver } from '@aurelia/kernel';
import {
  BindingMode,
  BindingType,
  IExpressionParser,
  IObserverLocator,
  LifecycleFlags,
  BindingBehaviorExpression,
  BindingBehaviorFactory,
  ExpressionKind,
} from '@aurelia/runtime';
import { CallBinding } from './binding/call-binding.js';
import { AttributeBinding } from './binding/attribute.js';
import { InterpolationBinding, InterpolationPartBinding, ContentBinding } from './binding/interpolation-binding.js';
import { LetBinding } from './binding/let-binding.js';
import { PropertyBinding } from './binding/property-binding.js';
import { RefBinding } from './binding/ref-binding.js';
import { Listener } from './binding/listener.js';
import { IEventDelegator } from './observation/event-delegator.js';
import { CustomElement, CustomElementDefinition } from './resources/custom-element.js';
import { getRenderContext } from './templating/render-context.js';
import { AuSlotsInfo, IAuSlotsInfo, IProjections } from './resources/slot-injectables.js';
import { CustomAttribute, CustomAttributeDefinition } from './resources/custom-attribute.js';
import { convertToRenderLocation, IRenderLocation, INode, setRef } from './dom.js';
import { Controller, ICustomElementController, ICustomElementViewModel, IController, ICustomAttributeViewModel } from './templating/controller.js';
import { IPlatform } from './platform.js';
import { IViewFactory } from './templating/view.js';

import type { IServiceLocator, IContainer, Class, IRegistry } from '@aurelia/kernel';
import type {
  Interpolation,
  IsBindingBehavior,
  AnyBindingExpression,
  BindingBehaviorInstance,
  IInterceptableBinding,
  IObservable,
  ForOfStatement,
  DelegationStrategy,
} from '@aurelia/runtime';
import type { IHydratableController } from './templating/controller.js';
import type { PartialCustomElementDefinition } from './resources/custom-element.js';
import type { ICompiledRenderContext } from './templating/render-context.js';

export const enum InstructionType {
  hydrateElement = 'ra',
  hydrateAttribute = 'rb',
  hydrateTemplateController = 'rc',
  hydrateLetElement = 'rd',
  setProperty = 're',
  interpolation = 'rf',
  propertyBinding = 'rg',
  callBinding = 'rh',
  letBinding = 'ri',
  refBinding = 'rj',
  iteratorBinding = 'rk',
  textBinding = 'ha',
  listenerBinding = 'hb',
  attributeBinding = 'hc',
  stylePropertyBinding = 'hd',
  setAttribute = 'he',
  setClassAttribute = 'hf',
  setStyleAttribute = 'hg',
}

export type NodeInstruction =
  HydrateElementInstruction |
  HydrateTemplateController |
  HydrateLetElementInstruction |
  TextBindingInstruction;

export type AttributeInstruction =
  InterpolationInstruction |
  PropertyBindingInstruction |
  IteratorBindingInstruction |
  CallBindingInstruction |
  RefBindingInstruction |
  SetPropertyInstruction |
  LetBindingInstruction |
  HydrateAttributeInstruction |
  ListenerBindingInstruction |
  AttributeBindingInstruction |
  StylePropertyBindingInstruction |
  SetAttributeInstruction |
  SetClassAttributeInstruction |
  SetStyleAttributeInstruction;

export type Instruction = NodeInstruction | AttributeInstruction;
export type InstructionRow = [Instruction, ...AttributeInstruction[]];

export type InstructionTypeName = string;

export interface IInstruction {
  readonly type: InstructionTypeName;
}
export const IInstruction = DI.createInterface<IInstruction>('Instruction');

export function isInstruction(value: unknown): value is IInstruction {
  const type = (value as { type?: string }).type;
  return typeof type === 'string' && type.length === 2;
}

export class InterpolationInstruction {
  public get type(): InstructionType.interpolation { return InstructionType.interpolation; }

  public constructor(
    public from: string | Interpolation,
    public to: string,
  ) {}
}

export class PropertyBindingInstruction {
  public get type(): InstructionType.propertyBinding { return InstructionType.propertyBinding; }

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
    public mode: BindingMode,
  ) {}
}

export class IteratorBindingInstruction {
  public get type(): InstructionType.iteratorBinding { return InstructionType.iteratorBinding; }

  public constructor(
    public from: string | ForOfStatement,
    public to: string,
  ) {}
}

export class CallBindingInstruction {
  public get type(): InstructionType.callBinding { return InstructionType.callBinding; }

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class RefBindingInstruction {
  public get type(): InstructionType.refBinding { return InstructionType.refBinding; }

  public constructor(
    public readonly from: string | IsBindingBehavior,
    public readonly to: string
  ) {}
}

export class SetPropertyInstruction {
  public get type(): InstructionType.setProperty { return InstructionType.setProperty; }

  public constructor(
    public value: unknown,
    public to: string,
  ) {}
}

export class HydrateElementInstruction {
  public get type(): InstructionType.hydrateElement { return InstructionType.hydrateElement; }

  /**
   * A special property that can be used to store <au-slot/> usage information
   */
  public auSlot: { name: string; fallback: CustomElementDefinition } | null = null;

  public constructor(
    /**
     * The name of the custom element this instruction is associated with
     */
    // in theory, Constructor of resources should be accepted too
    // though it would be unnecessary right now
    public res: string | /* Constructable |  */CustomElementDefinition,
    public alias: string | undefined,
    /**
     * Bindable instructions for the custom element instance
     */
    public instructions: IInstruction[],
    /**
     * Indicates what projections are associated with the element usage
     */
    public projections: Record<string, CustomElementDefinition> | null,
    /**
     * Indicates whether the usage of the custom element was with a containerless attribute or not
     */
    public containerless: boolean,
  ) {
  }
}

export class HydrateAttributeInstruction {
  public get type(): InstructionType.hydrateAttribute { return InstructionType.hydrateAttribute; }

  public constructor(
    // in theory, Constructor of resources should be accepted too
    // though it would be unnecessary right now
    public res: string | /* Constructable |  */CustomAttributeDefinition,
    public alias: string | undefined,
    /**
     * Bindable instructions for the custom attribute instance
     */
    public instructions: IInstruction[],
  ) {}
}

export class HydrateTemplateController {
  public get type(): InstructionType.hydrateTemplateController { return InstructionType.hydrateTemplateController; }

  public constructor(
    public def: PartialCustomElementDefinition,
    // in theory, Constructor of resources should be accepted too
    // though it would be unnecessary right now
    public res: string | /* Constructable |  */CustomAttributeDefinition,
    public alias: string | undefined,
    /**
     * Bindable instructions for the template controller instance
     */
    public instructions: IInstruction[],
  ) {}
}

export class HydrateLetElementInstruction {
  public get type(): InstructionType.hydrateLetElement { return InstructionType.hydrateLetElement; }

  public constructor(
    public instructions: LetBindingInstruction[],
    public toBindingContext: boolean,
  ) {}
}

export class LetBindingInstruction {
  public get type(): InstructionType.letBinding { return InstructionType.letBinding; }

  public constructor(
    public from: string | IsBindingBehavior | Interpolation,
    public to: string,
  ) {}
}

export class TextBindingInstruction {
  public get type(): InstructionType.textBinding { return InstructionType.textBinding; }

  public constructor(
    public from: string | Interpolation,
    /**
     * Indicates whether the value of the expression "from"
     * should be evaluated in strict mode.
     *
     * In none strict mode, "undefined" and "null" are coerced into empty string
     */
    public strict: boolean,
  ) {}
}

export class ListenerBindingInstruction {
  public get type(): InstructionType.listenerBinding { return InstructionType.listenerBinding; }

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
    public preventDefault: boolean,
    public strategy: DelegationStrategy,
  ) {}
}
export class StylePropertyBindingInstruction {
  public get type(): InstructionType.stylePropertyBinding { return InstructionType.stylePropertyBinding; }

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class SetAttributeInstruction {
  public get type(): InstructionType.setAttribute { return InstructionType.setAttribute; }

  public constructor(
    public value: string,
    public to: string,
  ) {}
}

export class SetClassAttributeInstruction {
  public readonly type: InstructionType.setClassAttribute = InstructionType.setClassAttribute;

  public constructor(
    public readonly value: string,
  ) {}
}

export class SetStyleAttributeInstruction {
  public readonly type: InstructionType.setStyleAttribute = InstructionType.setStyleAttribute;

  public constructor(
    public readonly value: string,
  ) {}
}

export class AttributeBindingInstruction {
  public get type(): InstructionType.attributeBinding { return InstructionType.attributeBinding; }

  public constructor(
    /**
     * `attr` and `to` have the same value on a normal attribute
     * Will be different on `class` and `style`
     * on `class`: attr = `class` (from binding command), to = attribute name
     * on `style`: attr = `style` (from binding command), to = attribute name
     */
    public attr: string,
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export const ITemplateCompiler = DI.createInterface<ITemplateCompiler>('ITemplateCompiler');
export interface ITemplateCompiler {
  /**
   * Indicates whether this compiler should compile template in debug mode
   *
   * For the default compiler, this means all expressions are kept as is on the template
   */
  debug: boolean;
  /**
   * Experimental API, for optimization.
   *
   * `true` to create CustomElement/CustomAttribute instructions
   * with resolved resources constructor during compilation, instead of name
   */
  resolveResources: boolean;
  compile(
    partialDefinition: PartialCustomElementDefinition,
    context: IContainer,
    compilationInstruction: ICompliationInstruction | null,
  ): CustomElementDefinition;
}

export interface ICompliationInstruction {
  /**
   * A record of projections available for compiling a template.
   * Where each key is the matching slot name for <au-slot/> inside,
   * and each value is the definition to render and project
   */
  projections: IProjections | null;
}

export interface IInstructionTypeClassifier<TType extends string = string> {
  instructionType: TType;
}
export interface IRenderer<
  TType extends InstructionTypeName = InstructionTypeName
> extends Partial<IInstructionTypeClassifier<TType>> {
  render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    /**
     * The controller that is current invoking this renderer
     */
    renderingController: IHydratableController,
    target: unknown,
    instruction: IInstruction,
  ): void;
}

export const IRenderer = DI.createInterface<IRenderer>('IRenderer');

type DecoratableInstructionRenderer<TType extends string, TProto, TClass> = Class<TProto & Partial<IInstructionTypeClassifier<TType> & Pick<IRenderer, 'render'>>, TClass> & Partial<IRegistry>;
type DecoratedInstructionRenderer<TType extends string, TProto, TClass> =  Class<TProto & IInstructionTypeClassifier<TType> & Pick<IRenderer, 'render'>, TClass> & IRegistry;

type InstructionRendererDecorator<TType extends string> = <TProto, TClass>(target: DecoratableInstructionRenderer<TType, TProto, TClass>) => DecoratedInstructionRenderer<TType, TProto, TClass>;

export function renderer<TType extends string>(instructionType: TType): InstructionRendererDecorator<TType> {
  return function decorator<TProto, TClass>(target: DecoratableInstructionRenderer<TType, TProto, TClass>): DecoratedInstructionRenderer<TType, TProto, TClass> {
    // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
    const decoratedTarget = function (...args: unknown[]): TProto {
      const instance = new target(...args);
      instance.instructionType = instructionType;
      return instance;
    } as unknown as DecoratedInstructionRenderer<TType, TProto, TClass>;
    // make sure we register the decorated constructor with DI
    decoratedTarget.register = function register(container: IContainer): void {
      Registration.singleton(IRenderer, decoratedTarget).register(container);
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

function ensureExpression<TFrom>(parser: IExpressionParser, srcOrExpr: TFrom, bindingType: BindingType): Exclude<TFrom, string> {
  if (typeof srcOrExpr === 'string') {
    return parser.parse(srcOrExpr, bindingType) as unknown as Exclude<TFrom, string>;
  }
  return srcOrExpr as Exclude<TFrom, string>;
}

function getTarget(potentialTarget: object): object {
  if ((potentialTarget as { viewModel?: object }).viewModel != null) {
    return (potentialTarget as { viewModel: object }).viewModel;
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
      return CustomElement.for(refHost)!.viewModel;
    default: {
      const caController = CustomAttribute.for(refHost, refTargetName);
      if (caController !== void 0) {
        return caController.viewModel;
      }
      const ceController = CustomElement.for(refHost, { name: refTargetName });
      if (ceController === void 0) {
        throw new Error(`Attempted to reference "${refTargetName}", but it was not found amongst the target's API.`);
      }
      return ceController.viewModel;
    }
  }
}

@renderer(InstructionType.setProperty)
/** @internal */
export class SetPropertyRenderer implements IRenderer {
  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    renderingController: IHydratableController,
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

@renderer(InstructionType.hydrateElement)
/** @internal */
export class CustomElementRenderer implements IRenderer {
  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    renderingController: IHydratableController,
    target: HTMLElement,
    instruction: HydrateElementInstruction,
  ): void {
    /* eslint-disable prefer-const */
    let def: CustomElementDefinition | null;
    let Ctor: Constructable<ICustomElementViewModel>;
    let component: ICustomElementViewModel;
    let childController: ICustomElementController;
    const res = instruction.res;
    const projections = instruction.projections;
    const ctxContainer = renderingController.container;
    const container = createElementContainer(
      /* parentController */renderingController,
      /* host             */target,
      /* instruction      */instruction,
      /* location         */target,
      /* auSlotsInfo      */projections == null ? void 0 : new AuSlotsInfo(Object.keys(projections)),
    );
    switch (typeof res) {
      case 'string':
        def = ctxContainer.find(CustomElement, res);
        if (def == null) {
          throw new Error(`Element ${res} is not registered in ${(renderingController as Controller)['name']}.`);
        }
        break;
      // constructor based instruction
      // will be enabled later if needed.
      // As both AOT + runtime based can use definition for perf
      // -----------------
      // case 'function':
      //   def = CustomElement.getDefinition(res);
      //   break;
      default:
        def = res;
    }
    Ctor = def.Type;
    component = container.invoke(Ctor);
    container.registerResolver(Ctor, new InstanceProvider<typeof Ctor>(def.key, component));
    childController = Controller.forCustomElement(
      /* root                */renderingController.root,
      /* context ct          */renderingController.container,
      /* own container       */container,
      /* viewModel           */component,
      /* host                */target,
      /* instructions        */instruction,
      /* flags               */flags,
      /* hydrate             */true,
      /* definition          */def,
    );

    flags = childController.flags;
    setRef(target, def.key, childController);

    context.renderChildren(
      /* flags        */flags,
      /* instructions */instruction.instructions,
      /* controller   */renderingController,
      /* target       */childController,
    );

    renderingController.addChild(childController);
    /* eslint-enable prefer-const */
  }
}

@renderer(InstructionType.hydrateAttribute)
/** @internal */
export class CustomAttributeRenderer implements IRenderer {
  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    /**
     * The cotroller that is currently invoking this renderer
     */
    renderingController: IHydratableController,
    target: HTMLElement,
    instruction: HydrateAttributeInstruction,
  ): void {
    /* eslint-disable prefer-const */
    let ctxContainer = renderingController.container;
    let def: CustomAttributeDefinition | null;
    switch (typeof instruction.res) {
      case 'string':
        def = ctxContainer.find(CustomAttribute, instruction.res);
        if (def == null) {
          throw new Error(`Attribute ${instruction.res} is not registered in ${(renderingController as Controller)['name']}.`);
        }
        break;
      // constructor based instruction
      // will be enabled later if needed.
      // As both AOT + runtime based can use definition for perf
      // -----------------
      // case 'function':
      //   def = CustomAttribute.getDefinition(instruction.res);
      //   break;
      default:
        def = instruction.res;
    }
    const component = invokeAttribute(
      /* attr definition  */def,
      /* parentController */renderingController,
      /* host             */target,
      /* instruction      */instruction,
      /* viewFactory      */void 0,
      /* location         */void 0,
    );
    const childController = Controller.forCustomAttribute(
      /* root       */renderingController.root,
      /* context ct */renderingController.container,
      /* viewModel  */component,
      /* host       */target,
      /* flags      */flags,
      /* definition */def,
    );

    setRef(target, def.key, childController);

    context.renderChildren(
      /* flags        */flags,
      /* instructions */instruction.instructions,
      /* controller   */renderingController,
      /* target       */childController,
    );

    renderingController.addChild(childController);
    /* eslint-enable prefer-const */
  }
}

@renderer(InstructionType.hydrateTemplateController)
/** @internal */
export class TemplateControllerRenderer implements IRenderer {
  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    renderingController: IHydratableController,
    target: HTMLElement,
    instruction: HydrateTemplateController,
  ): void {
    /* eslint-disable prefer-const */
    let ctxContainer = renderingController.container;
    let def: CustomAttributeDefinition | null;
    switch (typeof instruction.res) {
      case 'string':
        def = ctxContainer.find(CustomAttribute, instruction.res);
        if (def == null) {
          throw new Error(`Attribute ${instruction.res} is not registered in ${(renderingController as Controller)['name']}.`);
        }
        break;
      // constructor based instruction
      // will be enabled later if needed.
      // As both AOT + runtime based can use definition for perf
      // -----------------
      // case 'function':
      //   def = CustomAttribute.getDefinition(instruction.res);
      //   break;
      default:
        def = instruction.res;
    }
    const viewFactory = getRenderContext(instruction.def, ctxContainer).getViewFactory();
    const renderLocation = convertToRenderLocation(target);
    const component = invokeAttribute(
      /* attr definition  */def,
      /* parentController */renderingController,
      /* host             */target,
      /* instruction      */instruction,
      /* viewFactory      */viewFactory,
      /* location         */renderLocation,
    );
    const childController = Controller.forCustomAttribute(
      /* root         */renderingController.root,
      /* container ct */renderingController.container,
      /* viewModel    */component,
      /* host         */target,
      /* flags        */flags,
      /* definition   */def,
    );

    setRef(renderLocation, def.key, childController);

    component.link?.(flags, context, renderingController, childController, target, instruction);

    context.renderChildren(
      /* flags        */flags,
      /* instructions */instruction.instructions,
      /* controller   */renderingController,
      /* target       */childController,
    );

    renderingController.addChild(childController);
    /* eslint-enable prefer-const */
  }
}

@renderer(InstructionType.hydrateLetElement)
/** @internal */
export class LetElementRenderer implements IRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly oL: IObserverLocator,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    renderingController: IHydratableController,
    target: Node & ChildNode,
    instruction: HydrateLetElementInstruction,
  ): void {
    target.remove();
    const childInstructions = instruction.instructions;
    const toBindingContext = instruction.toBindingContext;
    const container = renderingController.container;

    let childInstruction: LetBindingInstruction;
    let expr: AnyBindingExpression;
    let binding: LetBinding;
    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      childInstruction = childInstructions[i];
      expr = ensureExpression(this.parser, childInstruction.from, BindingType.IsPropertyCommand);
      binding = new LetBinding(expr, childInstruction.to, this.oL, container, toBindingContext);
      renderingController.addBinding(expr.$kind === ExpressionKind.BindingBehavior
        ? applyBindingBehavior(binding, expr, container)
        : binding
      );
    }
  }
}

@renderer(InstructionType.callBinding)
/** @internal */
export class CallBindingRenderer implements IRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    rendererController: IHydratableController,
    target: IController,
    instruction: CallBindingInstruction,
  ): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.CallCommand);
    const binding = new CallBinding(expr, getTarget(target), instruction.to, this.observerLocator, rendererController.container);
    rendererController.addBinding(expr.$kind === ExpressionKind.BindingBehavior
      ? applyBindingBehavior(binding, expr, rendererController.container)
      : binding
    );
  }
}

@renderer(InstructionType.refBinding)
/** @internal */
export class RefBindingRenderer implements IRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    rendererController: IHydratableController,
    target: INode,
    instruction: RefBindingInstruction,
  ): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsRef);
    const binding = new RefBinding(expr, getRefTarget(target, instruction.to), rendererController.container);
    rendererController.addBinding(expr.$kind === ExpressionKind.BindingBehavior
      ? applyBindingBehavior(binding, expr, rendererController.container)
      : binding
    );
  }
}

@renderer(InstructionType.interpolation)
/** @internal */
export class InterpolationBindingRenderer implements IRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly oL: IObserverLocator,
    @IPlatform private readonly platform: IPlatform,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    renderingController: IHydratableController,
    target: IController,
    instruction: InterpolationInstruction,
  ): void {
    const container = renderingController.container;
    const expr = ensureExpression(this.parser, instruction.from, BindingType.Interpolation);
    const binding = new InterpolationBinding(
      this.oL,
      expr,
      getTarget(target),
      instruction.to,
      BindingMode.toView,
      container,
      this.platform.domWriteQueue,
    );
    const partBindings = binding.partBindings;
    const ii = partBindings.length;
    let i = 0;
    let partBinding: InterpolationPartBinding;
    for (; ii > i; ++i) {
      partBinding = partBindings[i];
      if (partBinding.sourceExpression.$kind === ExpressionKind.BindingBehavior) {
        partBindings[i] = applyBindingBehavior(
          partBinding,
          partBinding.sourceExpression as unknown as IsBindingBehavior,
          container
        );
      }
    }
    renderingController.addBinding(binding);
  }
}

@renderer(InstructionType.propertyBinding)
/** @internal */
export class PropertyBindingRenderer implements IRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly oL: IObserverLocator,
    @IPlatform private readonly platform: IPlatform,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    renderingController: IHydratableController,
    target: IController,
    instruction: PropertyBindingInstruction,
  ): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsPropertyCommand | instruction.mode);
    const binding = new PropertyBinding(expr, getTarget(target), instruction.to, instruction.mode, this.oL, renderingController.container, this.platform.domWriteQueue);
    renderingController.addBinding(expr.$kind === ExpressionKind.BindingBehavior
      ? applyBindingBehavior(binding, expr, renderingController.container)
      : binding
    );
  }
}

@renderer(InstructionType.iteratorBinding)
/** @internal */
export class IteratorBindingRenderer implements IRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly oL: IObserverLocator,
    @IPlatform private readonly p: IPlatform,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    renderingController: IHydratableController,
    target: IController,
    instruction: IteratorBindingInstruction,
  ): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.ForCommand);
    const binding = new PropertyBinding(expr, getTarget(target), instruction.to, BindingMode.toView, this.oL, renderingController.container, this.p.domWriteQueue);
    renderingController.addBinding(binding);
    // renderingController.addBinding(expr.iterable.$kind === ExpressionKind.BindingBehavior
    //   ? applyBindingBehavior(binding, expr.iterable, renderingController.container)
    //   : binding);
  }
}

let behaviorExpressionIndex = 0;
const behaviorExpressions: BindingBehaviorExpression[] = [];

export function applyBindingBehavior<T extends IInterceptableBinding>(
  binding: T,
  expression: IsBindingBehavior,
  locator: IServiceLocator,
): T {
  while (expression instanceof BindingBehaviorExpression) {
    behaviorExpressions[behaviorExpressionIndex++] = expression;
    expression = expression.expression;
  }
  while (behaviorExpressionIndex > 0) {
    const behaviorExpression = behaviorExpressions[--behaviorExpressionIndex];
    const behaviorOrFactory = locator.get<BindingBehaviorFactory | BindingBehaviorInstance>(behaviorExpression.behaviorKey);
    if (behaviorOrFactory instanceof BindingBehaviorFactory) {
      binding = behaviorOrFactory.construct(binding, behaviorExpression) as T;
    }
  }
  behaviorExpressions.length = 0;
  return binding;
}

@renderer(InstructionType.textBinding)
/** @internal */
export class TextBindingRenderer implements IRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly oL: IObserverLocator,
    @IPlatform private readonly p: IPlatform,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    renderingController: IHydratableController,
    target: ChildNode,
    instruction: TextBindingInstruction,
  ): void {
    const container = renderingController.container;
    const next = target.nextSibling!;
    const parent = target.parentNode!;
    const doc = this.p.document;
    const expr = ensureExpression(this.parser, instruction.from, BindingType.Interpolation);
    const staticParts = expr.parts;
    const dynamicParts = expr.expressions;

    const ii = dynamicParts.length;
    let i = 0;
    let text = staticParts[0];
    let binding: ContentBinding;
    let part: IsBindingBehavior;
    if (text !== '') {
      parent.insertBefore(doc.createTextNode(text), next);
    }
    for (; ii > i; ++i) {
      part = dynamicParts[i];
      binding = new ContentBinding(
        part,
        // using a text node instead of comment, as a mean to:
        // support seamless transition between a html node, or a text
        // reduce the noise in the template, caused by html comment
        parent.insertBefore(doc.createTextNode(''), next),
        container,
        this.oL,
        this.p,
        instruction.strict
      );
      renderingController.addBinding(part.$kind === ExpressionKind.BindingBehavior
        // each of the dynamic expression of an interpolation
        // will be mapped to a ContentBinding
        ? applyBindingBehavior(binding, part, container)
        : binding
      );
      // while each of the static part of an interpolation
      // will just be a text node
      text = staticParts[i + 1];
      if (text !== '') {
        parent.insertBefore(doc.createTextNode(text), next);
      }
    }
    if (target.nodeName === 'AU-M') {
      target.remove();
    }
  }
}

@renderer(InstructionType.listenerBinding)
/** @internal */
export class ListenerBindingRenderer implements IRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IEventDelegator private readonly eventDelegator: IEventDelegator,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    renderingController: IHydratableController,
    target: HTMLElement,
    instruction: ListenerBindingInstruction,
  ): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsEventCommand | (instruction.strategy + BindingType.DelegationStrategyDelta));
    const binding = new Listener(renderingController.platform, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventDelegator, renderingController.container);
    renderingController.addBinding(expr.$kind === ExpressionKind.BindingBehavior
      ? applyBindingBehavior(binding, expr, renderingController.container)
      : binding
    );
  }
}

@renderer(InstructionType.setAttribute)
/** @internal */
export class SetAttributeRenderer implements IRenderer {
  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    renderingController: IHydratableController,
    target: HTMLElement,
    instruction: SetAttributeInstruction,
  ): void {
    target.setAttribute(instruction.to, instruction.value);
  }
}

@renderer(InstructionType.setClassAttribute)
export class SetClassAttributeRenderer implements IRenderer {
  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    renderingController: IHydratableController,
    target: HTMLElement,
    instruction: SetClassAttributeInstruction,
  ): void {
    addClasses(target.classList, instruction.value);
  }
}

@renderer(InstructionType.setStyleAttribute)
export class SetStyleAttributeRenderer implements IRenderer {
  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    renderingController: IHydratableController,
    target: HTMLElement,
    instruction: SetStyleAttributeInstruction,
  ): void {
    target.style.cssText += instruction.value;
  }
}

@renderer(InstructionType.stylePropertyBinding)
/** @internal */
export class StylePropertyBindingRenderer implements IRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly oL: IObserverLocator,
    @IPlatform private readonly p: IPlatform,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    renderingController: IHydratableController,
    target: HTMLElement,
    instruction: StylePropertyBindingInstruction,
  ): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsPropertyCommand | BindingMode.toView);
    const binding = new PropertyBinding(expr, target.style, instruction.to, BindingMode.toView, this.oL, renderingController.container, this.p.domWriteQueue);
    renderingController.addBinding(expr.$kind === ExpressionKind.BindingBehavior
      ? applyBindingBehavior(binding, expr, renderingController.container)
      : binding
    );
  }
}

@renderer(InstructionType.attributeBinding)
/** @internal */
export class AttributeBindingRenderer implements IRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly oL: IObserverLocator,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    renderingController: IHydratableController,
    target: HTMLElement,
    instruction: AttributeBindingInstruction,
  ): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsPropertyCommand | BindingMode.toView);
    const binding = new AttributeBinding(
      expr,
      target,
      instruction.attr/* targetAttribute */,
      instruction.to/* targetKey */,
      BindingMode.toView,
      this.oL,
      renderingController.container
    );
    renderingController.addBinding(expr.$kind === ExpressionKind.BindingBehavior
      ? applyBindingBehavior(binding, expr, renderingController.container)
      : binding
    );
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

const elProviderName = 'ElementProvider';
const controllerProviderName = 'IController';
const instructionProviderName = 'IInstruction';
const locationProviderName = 'IRenderLocation';
const slotInfoProviderName = 'IAuSlotsInfo';

function createElementContainer(
  renderingController: IController,
  host: HTMLElement,
  instruction: HydrateElementInstruction,
  location?: IRenderLocation,
  auSlotsInfo?: IAuSlotsInfo,
): IContainer {
  const p = renderingController.platform;
  const container = renderingController.container.createChild();

  // todo:
  // both node provider and location provider may not be allowed to throw
  // if there's no value associated, unlike InstanceProvider
  // reason being some custom element can have `containerless` attribute on them
  // causing the host to disappear, and replace by a location instead
  container.registerResolver(p.HTMLElement,
    container.registerResolver(p.Element,
      container.registerResolver(p.Node,
        container.registerResolver(INode, new InstanceProvider<INode>(elProviderName, host))
      )
    )
  );
  container.registerResolver(IController, new InstanceProvider(controllerProviderName, renderingController));
  container.registerResolver(IInstruction, new InstanceProvider(instructionProviderName, instruction));
  container.registerResolver(IRenderLocation, location == null
    ? noLocationProvider
    : new InstanceProvider(locationProviderName, location));
  container.registerResolver(IViewFactory, noViewFactoryProvider);
  container.registerResolver(IAuSlotsInfo, auSlotsInfo == null
    ? noAuSlotProvider
    : new InstanceProvider(slotInfoProviderName, auSlotsInfo)
  );

  return container;
}

class ViewFactoryProvider implements IResolver {
  private readonly f: IViewFactory | null;
  public get $isResolver(): true { return true; }

  public constructor(
    /**
     * The factory instance that this provider will resolves to,
     * until explicitly overridden by prepare call
     */
    factory: IViewFactory | null
  ) {
    this.f = factory;
  }

  public resolve(): IViewFactory {
    const f = this.f;
    if (f === null) {
      throw new Error('Cannot resolve ViewFactory before the provider was prepared.');
    }
    if (typeof f.name !== 'string' || f.name.length === 0) {
      throw new Error('Cannot resolve ViewFactory without a (valid) name.');
    }
    return f;
  }
}

function invokeAttribute(
  definition: CustomAttributeDefinition,
  renderingController: IController,
  host: HTMLElement,
  instruction: HydrateAttributeInstruction | HydrateTemplateController,
  viewFactory?: IViewFactory,
  location?: IRenderLocation,
  auSlotsInfo?: IAuSlotsInfo,
): ICustomAttributeViewModel {
  const p = renderingController.platform;
  const container = renderingController.container.createChild();
  container.registerResolver(p.HTMLElement,
    container.registerResolver(p.Element,
      container.registerResolver(p.Node,
        container.registerResolver(INode, new InstanceProvider<INode>(elProviderName, host))
      )
    )
  );
  container.registerResolver(IController, new InstanceProvider(controllerProviderName, renderingController));
  container.registerResolver(IInstruction, new InstanceProvider<IInstruction>(instructionProviderName, instruction));
  container.registerResolver(IRenderLocation, location == null
    ? noLocationProvider
    : new InstanceProvider(locationProviderName, location));
  container.registerResolver(IViewFactory, viewFactory == null
    ? noViewFactoryProvider
    : new ViewFactoryProvider(viewFactory));
  container.registerResolver(IAuSlotsInfo, auSlotsInfo == null
    ? noAuSlotProvider
    : new InstanceProvider(slotInfoProviderName, auSlotsInfo));

  return container.invoke(definition.Type);
}

const noLocationProvider = new InstanceProvider<IRenderLocation>(locationProviderName);
const noViewFactoryProvider = new ViewFactoryProvider(null);
const noAuSlotProvider = new InstanceProvider<IAuSlotsInfo>(slotInfoProviderName, new AuSlotsInfo(emptyArray));
