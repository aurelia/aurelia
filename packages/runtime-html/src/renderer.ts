import { Registration, DI, emptyArray, InstanceProvider } from '@aurelia/kernel';
import {
  BindingMode,
  ExpressionType,
  IExpressionParser,
  IObserverLocator,
  LifecycleFlags,
  BindingBehaviorExpression,
  BindingBehaviorFactory,
  ExpressionKind,
  IBinding,
  Scope,
} from '@aurelia/runtime';
import { CallBinding } from './binding/call-binding';
import { AttributeBinding } from './binding/attribute';
import { InterpolationBinding, InterpolationPartBinding, ContentBinding } from './binding/interpolation-binding';
import { LetBinding } from './binding/let-binding';
import { PropertyBinding } from './binding/property-binding';
import { RefBinding } from './binding/ref-binding';
import { Listener, ListenerOptions } from './binding/listener';
import { IEventDelegator } from './observation/event-delegator';
import { CustomElement, CustomElementDefinition } from './resources/custom-element';
import { AuSlotsInfo, IAuSlotsInfo, IProjections } from './resources/slot-injectables';
import { CustomAttribute, CustomAttributeDefinition } from './resources/custom-attribute';
import { convertToRenderLocation, IRenderLocation, INode, setRef } from './dom';
import { Controller, ICustomElementController, ICustomElementViewModel, IController, ICustomAttributeViewModel, IHydrationContext, ViewModelKind } from './templating/controller';
import { IPlatform } from './platform';
import { IViewFactory } from './templating/view';
import { IRendering } from './templating/rendering';
import { AttrSyntax } from './resources/attribute-pattern';
import { defineProp, isString } from './utilities';

import type { IServiceLocator, IContainer, Class, IRegistry, Constructable, IResolver } from '@aurelia/kernel';
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
import type { IHydratableController } from './templating/controller';
import type { PartialCustomElementDefinition } from './resources/custom-element';

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
  spreadBinding = 'hs',
  spreadElementProp = 'hp',
}

export type InstructionTypeName = string;

export interface IInstruction {
  readonly type: InstructionTypeName;
}
export const IInstruction = DI.createInterface<IInstruction>('Instruction');

export function isInstruction(value: unknown): value is IInstruction {
  const type = (value as { type?: string }).type;
  return isString(type) && type.length === 2;
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
    public props: IInstruction[],
    /**
     * Indicates what projections are associated with the element usage
     */
    public projections: Record<string, CustomElementDefinition> | null,
    /**
     * Indicates whether the usage of the custom element was with a containerless attribute or not
     */
    public containerless: boolean,
    /**
     * A list of captured attr syntaxes
     */
    public captures: AttrSyntax[] | undefined,
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
    public props: IInstruction[],
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
    public props: IInstruction[],
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

export class SpreadBindingInstruction {
  public get type(): InstructionType.spreadBinding { return InstructionType.spreadBinding; }
}

export class SpreadElementPropBindingInstruction {
  public get type(): InstructionType.spreadElementProp { return InstructionType.spreadElementProp; }
  public constructor(
    public readonly instructions: IInstruction,
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

  /**
   * Compile a list of captured attributes as if they are declared in a template
   *
   * @param requestor - the context definition where the attributes is compiled
   * @param attrSyntaxes - the attributes captured
   * @param container - the container containing information for the compilation
   * @param host - the host element where the attributes are spreaded on
   */
  compileSpread(
    requestor: PartialCustomElementDefinition,
    attrSyntaxes: AttrSyntax[],
    container: IContainer,
    host: Element,
  ): IInstruction[];
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
  target: TType;
}
export interface IRenderer<
  TType extends InstructionTypeName = InstructionTypeName
> extends IInstructionTypeClassifier<TType> {
  render(
    /**
     * The controller that is current invoking this renderer
     */
    renderingCtrl: IHydratableController,
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
    target.register = function register(container: IContainer): void {
      Registration.singleton(IRenderer, this).register(container);
    };
    defineProp(target.prototype, 'target', {
      configurable: true,
      get: function () { return instructionType; }
    });
    return target as DecoratedInstructionRenderer<TType, TProto, TClass>;
  };
}

function ensureExpression<TFrom>(parser: IExpressionParser, srcOrExpr: TFrom, expressionType: ExpressionType): Exclude<TFrom, string> {
  if (isString(srcOrExpr)) {
    return parser.parse(srcOrExpr, expressionType) as unknown as Exclude<TFrom, string>;
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
      if (__DEV__)
        throw new Error('Not supported API');
      else
        throw new Error('AUR0750');
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
        if (__DEV__)
          throw new Error(`Attempted to reference "${refTargetName}", but it was not found amongst the target's API.`);
        else
          throw new Error(`AUR0751:${refTargetName}`);
      }
      return ceController.viewModel;
    }
  }
}

@renderer(InstructionType.setProperty)
/** @internal */
export class SetPropertyRenderer implements IRenderer {
  public target!: InstructionType.setProperty;

  public render(
    renderingCtrl: IHydratableController,
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
  /** @internal */ protected static get inject(): unknown[] { return [IRendering, IPlatform]; }
  /** @internal */ private readonly _rendering: IRendering;
  /** @internal */ private readonly _platform: IPlatform;

  public target!: InstructionType.hydrateElement;

  public constructor(rendering: IRendering, platform: IPlatform) {
    this._rendering = rendering;
    this._platform = platform;
  }

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: HydrateElementInstruction,
  ): void {
    /* eslint-disable prefer-const */
    let def: CustomElementDefinition | null;
    let Ctor: Constructable<ICustomElementViewModel>;
    let component: ICustomElementViewModel;
    let childCtrl: ICustomElementController;
    const res = instruction.res;
    const projections = instruction.projections;
    const ctxContainer = renderingCtrl.container;
    switch (typeof res) {
      case 'string':
        def = ctxContainer.find(CustomElement, res);
        if (def == null) {
          if (__DEV__)
            throw new Error(`Element ${res} is not registered in ${(renderingCtrl as Controller)['name']}.`);
          else
            throw new Error(`AUR0752:${res}@${(renderingCtrl as Controller)['name']}`);
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
    const containerless = instruction.containerless || def.containerless;
    const location = containerless ? convertToRenderLocation(target) : null;
    const container = createElementContainer(
      /* platform         */this._platform,
      /* parentController */renderingCtrl,
      /* host             */target,
      /* instruction      */instruction,
      /* location         */location,
      /* auSlotsInfo      */projections == null ? void 0 : new AuSlotsInfo(Object.keys(projections)),
    );
    Ctor = def.Type;
    component = container.invoke(Ctor);
    container.registerResolver(Ctor, new InstanceProvider<typeof Ctor>(def.key, component));
    childCtrl = Controller.$el(
      /* own container       */container,
      /* viewModel           */component,
      /* host                */target,
      /* instruction         */instruction,
      /* definition          */def,
      /* location            */location
    );

    setRef(target, def.key, childCtrl);

    const renderers = this._rendering.renderers;
    const props = instruction.props;
    const ii = props.length;
    let i = 0;
    let propInst: IInstruction;
    while (ii > i) {
      propInst = props[i];
      renderers[propInst.type].render(renderingCtrl, childCtrl, propInst);
      ++i;
    }

    renderingCtrl.addChild(childCtrl);
    /* eslint-enable prefer-const */
  }
}

@renderer(InstructionType.hydrateAttribute)
/** @internal */
export class CustomAttributeRenderer implements IRenderer {
  /** @internal */ protected static get inject(): unknown[] { return [IRendering, IPlatform]; }
  /** @internal */ private readonly _rendering: IRendering;
  /** @internal */ private readonly _platform: IPlatform;

  public target!: InstructionType.hydrateAttribute;

  public constructor(rendering: IRendering, platform: IPlatform) {
    this._rendering = rendering;
    this._platform = platform;
  }

  public render(
    /**
     * The cotroller that is currently invoking this renderer
     */
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: HydrateAttributeInstruction,
  ): void {
    /* eslint-disable prefer-const */
    let ctxContainer = renderingCtrl.container;
    let def: CustomAttributeDefinition | null;
    switch (typeof instruction.res) {
      case 'string':
        def = ctxContainer.find(CustomAttribute, instruction.res);
        if (def == null) {
          if (__DEV__)
            throw new Error(`Attribute ${instruction.res} is not registered in ${(renderingCtrl as Controller)['name']}.`);
          else
            throw new Error(`AUR0753:${instruction.res}@${(renderingCtrl as Controller)['name']}`);
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
      /* platform         */this._platform,
      /* attr definition  */def,
      /* parentController */renderingCtrl,
      /* host             */target,
      /* instruction      */instruction,
      /* viewFactory      */void 0,
      /* location         */void 0,
    );
    const childController = Controller.$attr(
      /* context ct */renderingCtrl.container,
      /* viewModel  */component,
      /* host       */target,
      /* definition */def,
    );

    setRef(target, def.key, childController);

    const renderers = this._rendering.renderers;
    const props = instruction.props;
    const ii = props.length;
    let i = 0;
    let propInst: IInstruction;
    while (ii > i) {
      propInst = props[i];
      renderers[propInst.type].render(renderingCtrl, childController, propInst);
      ++i;
    }

    renderingCtrl.addChild(childController);
    /* eslint-enable prefer-const */
  }
}

@renderer(InstructionType.hydrateTemplateController)
/** @internal */
export class TemplateControllerRenderer implements IRenderer {
  /** @internal */ protected static get inject(): unknown[] { return [IRendering, IPlatform]; }
  /** @internal */ private readonly _rendering: IRendering;
  /** @internal */ private readonly _platform: IPlatform;

  public target!: InstructionType.hydrateTemplateController;
  public constructor(rendering: IRendering, platform: IPlatform) {
    this._rendering = rendering;
    this._platform = platform;
  }

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: HydrateTemplateController,
  ): void {
    /* eslint-disable prefer-const */
    let ctxContainer = renderingCtrl.container;
    let def: CustomAttributeDefinition | null;
    switch (typeof instruction.res) {
      case 'string':
        def = ctxContainer.find(CustomAttribute, instruction.res);
        if (def == null) {
          if (__DEV__)
            throw new Error(`Attribute ${instruction.res} is not registered in ${(renderingCtrl as Controller)['name']}.`);
          else
            throw new Error(`AUR0754:${instruction.res}@${(renderingCtrl as Controller)['name']}`);
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
    const viewFactory = this._rendering.getViewFactory(instruction.def, ctxContainer);
    const renderLocation = convertToRenderLocation(target);
    const component = invokeAttribute(
      /* platform         */this._platform,
      /* attr definition  */def,
      /* parentController */renderingCtrl,
      /* host             */target,
      /* instruction      */instruction,
      /* viewFactory      */viewFactory,
      /* location         */renderLocation,
    );
    const childController = Controller.$attr(
      /* container ct */renderingCtrl.container,
      /* viewModel    */component,
      /* host         */target,
      /* definition   */def,
    );

    setRef(renderLocation, def.key, childController);

    component.link?.(renderingCtrl, childController, target, instruction);

    const renderers = this._rendering.renderers;
    const props = instruction.props;
    const ii = props.length;
    let i = 0;
    let propInst: IInstruction;
    while (ii > i) {
      propInst = props[i];
      renderers[propInst.type].render(renderingCtrl, childController, propInst);
      ++i;
    }

    renderingCtrl.addChild(childController);
    /* eslint-enable prefer-const */
  }
}

@renderer(InstructionType.hydrateLetElement)
/** @internal */
export class LetElementRenderer implements IRenderer {
  /** @internal */ protected static inject = [IExpressionParser, IObserverLocator];
  /** @internal */ private readonly _exprParser: IExpressionParser;
  /** @internal */ private readonly _observerLocator: IObserverLocator;

  public target!: InstructionType.hydrateLetElement;
  public constructor(
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ) {
    this._exprParser = exprParser;
    this._observerLocator = observerLocator;
  }

  public render(
    renderingCtrl: IHydratableController,
    target: Node & ChildNode,
    instruction: HydrateLetElementInstruction,
  ): void {
    target.remove();
    const childInstructions = instruction.instructions;
    const toBindingContext = instruction.toBindingContext;
    const container = renderingCtrl.container;
    const ii = childInstructions.length;

    let childInstruction: LetBindingInstruction;
    let expr: AnyBindingExpression;
    let binding: LetBinding;
    let i = 0;
    while (ii > i) {
      childInstruction = childInstructions[i];
      expr = ensureExpression(this._exprParser, childInstruction.from, ExpressionType.IsProperty);
      binding = new LetBinding(expr, childInstruction.to, this._observerLocator, container, toBindingContext);
      renderingCtrl.addBinding(expr.$kind === ExpressionKind.BindingBehavior
        ? applyBindingBehavior(binding, expr, container)
        : binding
      );
      ++i;
    }
  }
}

@renderer(InstructionType.callBinding)
/** @internal */
export class CallBindingRenderer implements IRenderer {
  /** @internal */ protected static inject = [IExpressionParser, IObserverLocator];
  /** @internal */ private readonly _exprParser: IExpressionParser;
  /** @internal */ private readonly _observerLocator: IObserverLocator;

  public target!: InstructionType.callBinding;
  public constructor(
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ) {
    this._exprParser = exprParser;
    this._observerLocator = observerLocator;
  }

  public render(
    renderingCtrl: IHydratableController,
    target: IController,
    instruction: CallBindingInstruction,
  ): void {
    const expr = ensureExpression(this._exprParser, instruction.from, ExpressionType.IsProperty | ExpressionType.IsFunction);
    const binding = new CallBinding(expr, getTarget(target), instruction.to, this._observerLocator, renderingCtrl.container);
    renderingCtrl.addBinding(expr.$kind === ExpressionKind.BindingBehavior
      ? applyBindingBehavior(binding, expr, renderingCtrl.container)
      : binding
    );
  }
}

@renderer(InstructionType.refBinding)
/** @internal */
export class RefBindingRenderer implements IRenderer {
  /** @internal */ protected static inject = [IExpressionParser];
  /** @internal */ private readonly _exprParser: IExpressionParser;

  public target!: InstructionType.refBinding;
  public constructor(exprParser: IExpressionParser) {
    this._exprParser = exprParser;
  }

  public render(
    renderingCtrl: IHydratableController,
    target: INode,
    instruction: RefBindingInstruction,
  ): void {
    const expr = ensureExpression(this._exprParser, instruction.from, ExpressionType.IsProperty);
    const binding = new RefBinding(expr, getRefTarget(target, instruction.to), renderingCtrl.container);
    renderingCtrl.addBinding(expr.$kind === ExpressionKind.BindingBehavior
      ? applyBindingBehavior(binding, expr, renderingCtrl.container)
      : binding
    );
  }
}

@renderer(InstructionType.interpolation)
/** @internal */
export class InterpolationBindingRenderer implements IRenderer {
  /** @internal */ protected static inject = [IExpressionParser, IObserverLocator, IPlatform];
  /** @internal */ private readonly _exprParser: IExpressionParser;
  /** @internal */ private readonly _observerLocator: IObserverLocator;
  /** @internal */ private readonly _platform: IPlatform;

  public target!: InstructionType.interpolation;
  public constructor(
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
    p: IPlatform,
  ) {
    this._exprParser = exprParser;
    this._observerLocator = observerLocator;
    this._platform = p;
  }

  public render(
    renderingCtrl: IHydratableController,
    target: IController,
    instruction: InterpolationInstruction,
  ): void {
    const container = renderingCtrl.container;
    const expr = ensureExpression(this._exprParser, instruction.from, ExpressionType.Interpolation);
    const binding = new InterpolationBinding(
      this._observerLocator,
      expr,
      getTarget(target),
      instruction.to,
      BindingMode.toView,
      container,
      this._platform.domWriteQueue,
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
    renderingCtrl.addBinding(binding);
  }
}

@renderer(InstructionType.propertyBinding)
/** @internal */
export class PropertyBindingRenderer implements IRenderer {
  /** @internal */ protected static inject = [IExpressionParser, IObserverLocator, IPlatform];
  /** @internal */ private readonly _exprParser: IExpressionParser;
  /** @internal */ private readonly _observerLocator: IObserverLocator;
  /** @internal */ private readonly _platform: IPlatform;

  public target!: InstructionType.propertyBinding;
  public constructor(
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
    p: IPlatform,
  ) {
    this._exprParser = exprParser;
    this._observerLocator = observerLocator;
    this._platform = p;
  }

  public render(
    renderingCtrl: IHydratableController,
    target: IController,
    instruction: PropertyBindingInstruction,
  ): void {
    const expr = ensureExpression(this._exprParser, instruction.from, ExpressionType.IsProperty);
    const binding = new PropertyBinding(expr, getTarget(target), instruction.to, instruction.mode, this._observerLocator, renderingCtrl.container, this._platform.domWriteQueue);
    renderingCtrl.addBinding(expr.$kind === ExpressionKind.BindingBehavior
      ? applyBindingBehavior(binding, expr, renderingCtrl.container)
      : binding
    );
  }
}

@renderer(InstructionType.iteratorBinding)
/** @internal */
export class IteratorBindingRenderer implements IRenderer {
  /** @internal */ protected static inject = [IExpressionParser, IObserverLocator, IPlatform];
  /** @internal */ private readonly _exprParser: IExpressionParser;
  /** @internal */ private readonly _observerLocator: IObserverLocator;
  /** @internal */ private readonly _platform: IPlatform;

  public target!: InstructionType.iteratorBinding;
  public constructor(
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
    p: IPlatform,
  ) {
    this._exprParser = exprParser;
    this._observerLocator = observerLocator;
    this._platform = p;
  }

  public render(
    renderingCtrl: IHydratableController,
    target: IController,
    instruction: IteratorBindingInstruction,
  ): void {
    const expr = ensureExpression(this._exprParser, instruction.from, ExpressionType.IsIterator);
    const binding = new PropertyBinding(expr, getTarget(target), instruction.to, BindingMode.toView, this._observerLocator, renderingCtrl.container, this._platform.domWriteQueue);
    renderingCtrl.addBinding(expr.iterable.$kind === ExpressionKind.BindingBehavior
      ? applyBindingBehavior(binding, expr.iterable, renderingCtrl.container)
      : binding);
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
  /** @internal */ protected static inject = [IExpressionParser, IObserverLocator, IPlatform];
  /** @internal */ private readonly _exprParser: IExpressionParser;
  /** @internal */ private readonly _observerLocator: IObserverLocator;
  /** @internal */ private readonly _platform: IPlatform;

  public target!: InstructionType.textBinding;
  public constructor(
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
    p: IPlatform,
  ) {
    this._exprParser = exprParser;
    this._observerLocator = observerLocator;
    this._platform = p;
  }

  public render(
    renderingCtrl: IHydratableController,
    target: ChildNode,
    instruction: TextBindingInstruction,
  ): void {
    const container = renderingCtrl.container;
    const next = target.nextSibling!;
    const parent = target.parentNode!;
    const doc = this._platform.document;
    const expr = ensureExpression(this._exprParser, instruction.from, ExpressionType.Interpolation);
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
        this._observerLocator,
        this._platform,
        instruction.strict
      );
      renderingCtrl.addBinding(part.$kind === ExpressionKind.BindingBehavior
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

export interface IListenerBehaviorOptions {
  /**
   * `true` if the expression specified in the template is meant to be treated as a handler
   */
  expAsHandler: boolean;
}
export const IListenerBehaviorOptions = DI.createInterface<IListenerBehaviorOptions>('IListenerBehaviorOptions', x => x.singleton(ListenerBehaviorOptions));

class ListenerBehaviorOptions implements IListenerBehaviorOptions {
  public expAsHandler = false;
}

@renderer(InstructionType.listenerBinding)
/** @internal */
export class ListenerBindingRenderer implements IRenderer {
  /** @internal */ protected static inject = [IExpressionParser, IEventDelegator, IPlatform, IListenerBehaviorOptions];
  /** @internal */ private readonly _exprParser: IExpressionParser;
  /** @internal */ private readonly _eventDelegator: IEventDelegator;
  /** @internal */ private readonly _platform: IPlatform;
  /** @internal */ private readonly _listenerBehaviorOptions: IListenerBehaviorOptions;

  public target!: InstructionType.listenerBinding;
  public constructor(
    parser: IExpressionParser,
    eventDelegator: IEventDelegator,
    p: IPlatform,
    listenerBehaviorOptions: IListenerBehaviorOptions,
  ) {
    this._exprParser = parser;
    this._eventDelegator = eventDelegator;
    this._platform = p;
    this._listenerBehaviorOptions = listenerBehaviorOptions;
  }

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: ListenerBindingInstruction,
  ): void {
    const expr = ensureExpression(this._exprParser, instruction.from, ExpressionType.IsFunction);
    const binding = new Listener(
      this._platform,
      instruction.to,
      expr,
      target,
      this._eventDelegator,
      renderingCtrl.container,
      new ListenerOptions(instruction.preventDefault, instruction.strategy, this._listenerBehaviorOptions.expAsHandler),
    );
    renderingCtrl.addBinding(expr.$kind === ExpressionKind.BindingBehavior
      ? applyBindingBehavior(binding, expr, renderingCtrl.container)
      : binding
    );
  }
}

@renderer(InstructionType.setAttribute)
/** @internal */
export class SetAttributeRenderer implements IRenderer {

  public target!: InstructionType.setAttribute;
  public render(
    _: IHydratableController,
    target: HTMLElement,
    instruction: SetAttributeInstruction,
  ): void {
    target.setAttribute(instruction.to, instruction.value);
  }
}

@renderer(InstructionType.setClassAttribute)
export class SetClassAttributeRenderer implements IRenderer {
  public target!: InstructionType.setClassAttribute;
  public render(
    _: IHydratableController,
    target: HTMLElement,
    instruction: SetClassAttributeInstruction,
  ): void {
    addClasses(target.classList, instruction.value);
  }
}

@renderer(InstructionType.setStyleAttribute)
export class SetStyleAttributeRenderer implements IRenderer {
  public target!: InstructionType.setStyleAttribute;
  public render(
    _: IHydratableController,
    target: HTMLElement,
    instruction: SetStyleAttributeInstruction,
  ): void {
    target.style.cssText += instruction.value;
  }
}

@renderer(InstructionType.stylePropertyBinding)
/** @internal */
export class StylePropertyBindingRenderer implements IRenderer {
  /** @internal */ protected static inject = [IExpressionParser, IObserverLocator, IPlatform];

  public target!: InstructionType.stylePropertyBinding;
  public constructor(
    /** @internal */ private readonly _exprParser: IExpressionParser,
    /** @internal */ private readonly _observerLocator: IObserverLocator,
    /** @internal */ private readonly _platform: IPlatform,
  ) {}

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: StylePropertyBindingInstruction,
  ): void {
    const expr = ensureExpression(this._exprParser, instruction.from, ExpressionType.IsProperty);
    const binding = new PropertyBinding(expr, target.style, instruction.to, BindingMode.toView, this._observerLocator, renderingCtrl.container, this._platform.domWriteQueue);
    renderingCtrl.addBinding(expr.$kind === ExpressionKind.BindingBehavior
      ? applyBindingBehavior(binding, expr, renderingCtrl.container)
      : binding
    );
  }
}

@renderer(InstructionType.attributeBinding)
/** @internal */
export class AttributeBindingRenderer implements IRenderer {
  /** @internal */ protected static inject = [IExpressionParser, IObserverLocator];

  public target!: InstructionType.attributeBinding;
  public constructor(
    /** @internal */ private readonly _exprParser: IExpressionParser,
    /** @internal */ private readonly _observerLocator: IObserverLocator,
  ) {}

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: AttributeBindingInstruction,
  ): void {
    const expr = ensureExpression(this._exprParser, instruction.from, ExpressionType.IsProperty);
    const binding = new AttributeBinding(
      expr,
      target,
      instruction.attr/* targetAttribute */,
      instruction.to/* targetKey */,
      BindingMode.toView,
      this._observerLocator,
      renderingCtrl.container
    );
    renderingCtrl.addBinding(expr.$kind === ExpressionKind.BindingBehavior
      ? applyBindingBehavior(binding, expr, renderingCtrl.container)
      : binding
    );
  }
}

@renderer(InstructionType.spreadBinding)
export class SpreadRenderer implements IRenderer {
  /** @internal */ protected static get inject() { return [ITemplateCompiler, IRendering]; }

  public target!: InstructionType.spreadBinding;
  public constructor(
    /** @internal */ private readonly _compiler: ITemplateCompiler,
    /** @internal */ private readonly _rendering: IRendering,
  ) {}

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    _instruction: SpreadBindingInstruction,
  ): void {
    const container = renderingCtrl.container;
    const hydrationContext = container.get(IHydrationContext);
    const renderers = this._rendering.renderers;
    const getHydrationContext = (ancestor: number) => {
      let currentLevel = ancestor;
      let currentContext: IHydrationContext | undefined = hydrationContext;
      while (currentContext != null && currentLevel > 0) {
        currentContext = currentContext.parent;
        --currentLevel;
      }
      if (currentContext == null) {
        throw new Error('No scope context for spread binding.');
      }
      return currentContext as IHydrationContext<object>;
    };
    const renderSpreadInstruction = (ancestor: number) => {
      const context = getHydrationContext(ancestor);
      const spreadBinding = createSurrogateBinding(context);
      const instructions = this._compiler.compileSpread(
        context.controller.definition,
        context.instruction?.captures ?? emptyArray,
        context.controller.container,
        target,
      );
      let inst: IInstruction;
      for (inst of instructions) {
        switch (inst.type) {
          case InstructionType.spreadBinding:
            renderSpreadInstruction(ancestor + 1);
            break;
          case InstructionType.spreadElementProp:
            renderers[(inst as SpreadElementPropBindingInstruction).instructions.type].render(
              spreadBinding,
              CustomElement.for(target),
              (inst as SpreadElementPropBindingInstruction).instructions,
            );
            break;
          default:
            renderers[inst.type].render(spreadBinding, target, inst);
        }
      }
      renderingCtrl.addBinding(spreadBinding);
    };
    renderSpreadInstruction(0);
  }
}

class SpreadBinding implements IBinding {
  public interceptor = this;
  public $scope?: Scope | undefined;
  public isBound: boolean = false;
  public readonly locator: IServiceLocator;

  public readonly ctrl: ICustomElementController;

  public get container() {
    return this.locator;
  }

  public get definition(): CustomElementDefinition | CustomElementDefinition {
    return this.ctrl.definition;
  }

  public get isStrictBinding() {
    return this.ctrl.isStrictBinding;
  }

  public constructor(
    /** @internal */ private readonly _innerBindings: IBinding[],
    /** @internal */ private readonly _hydrationContext: IHydrationContext<object>,
  ) {
    this.ctrl = _hydrationContext.controller;
    this.locator = this.ctrl.container;
  }

  public $bind(flags: LifecycleFlags, _scope: Scope): void {
    if (this.isBound) {
      return;
    }
    this.isBound = true;
    const innerScope = this.$scope = this._hydrationContext.controller.scope.parentScope ?? void 0;
    if (innerScope == null) {
      throw new Error('Invalid spreading. Context scope is null/undefined');
    }

    this._innerBindings.forEach(b => b.$bind(flags, innerScope));
  }

  public $unbind(flags: LifecycleFlags): void {
    this._innerBindings.forEach(b => b.$unbind(flags));
    this.isBound = false;
  }

  public addBinding(binding: IBinding) {
    this._innerBindings.push(binding);
  }

  public addChild(controller: IController) {
    if (controller.vmKind !== ViewModelKind.customAttribute) {
      throw new Error('Spread binding does not support spreading custom attributes/template controllers');
    }
    this.ctrl.addChild(controller);
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

const createSurrogateBinding = (context: IHydrationContext<object>) =>
  new SpreadBinding([], context) as SpreadBinding & IHydratableController;
const controllerProviderName = 'IController';
const instructionProviderName = 'IInstruction';
const locationProviderName = 'IRenderLocation';
const slotInfoProviderName = 'IAuSlotsInfo';

function createElementContainer(
  p: IPlatform,
  renderingCtrl: IController,
  host: HTMLElement,
  instruction: HydrateElementInstruction,
  location: IRenderLocation | null,
  auSlotsInfo?: IAuSlotsInfo,
): IContainer {
  const ctn = renderingCtrl.container.createChild();

  // todo:
  // both node provider and location provider may not be allowed to throw
  // if there's no value associated, unlike InstanceProvider
  // reason being some custom element can have `containerless` attribute on them
  // causing the host to disappear, and replace by a location instead
  ctn.registerResolver(
    p.HTMLElement,
    ctn.registerResolver(
      p.Element,
      ctn.registerResolver(INode, new InstanceProvider('ElementResolver', host))
    )
  );
  ctn.registerResolver(IController, new InstanceProvider(controllerProviderName, renderingCtrl));
  ctn.registerResolver(IInstruction, new InstanceProvider(instructionProviderName, instruction));
  ctn.registerResolver(IRenderLocation, location == null
    ? noLocationProvider
    : new RenderLocationProvider(location));
  ctn.registerResolver(IViewFactory, noViewFactoryProvider);
  ctn.registerResolver(IAuSlotsInfo, auSlotsInfo == null
    ? noAuSlotProvider
    : new InstanceProvider(slotInfoProviderName, auSlotsInfo)
  );

  return ctn;
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
      if (__DEV__)
        throw new Error('Cannot resolve ViewFactory before the provider was prepared.');
      else
        throw new Error('AUR7055');
    }
    if (!isString(f.name) || f.name.length === 0) {
      if (__DEV__)
        throw new Error('Cannot resolve ViewFactory without a (valid) name.');
      else
        throw new Error('AUR0756');
    }
    return f;
  }
}

function invokeAttribute(
  p: IPlatform,
  definition: CustomAttributeDefinition,
  renderingCtrl: IController,
  host: HTMLElement,
  instruction: HydrateAttributeInstruction | HydrateTemplateController,
  viewFactory?: IViewFactory,
  location?: IRenderLocation,
  auSlotsInfo?: IAuSlotsInfo,
): ICustomAttributeViewModel {
  const ctn = renderingCtrl.container.createChild();
  ctn.registerResolver(
    p.HTMLElement,
    ctn.registerResolver(
      p.Element,
      ctn.registerResolver(INode, new InstanceProvider('ElementResolver', host))
    )
  );
  renderingCtrl = renderingCtrl instanceof Controller
    ? renderingCtrl
    : (renderingCtrl as unknown as SpreadBinding).ctrl;
  ctn.registerResolver(IController, new InstanceProvider(controllerProviderName, renderingCtrl));
  ctn.registerResolver(IInstruction, new InstanceProvider<IInstruction>(instructionProviderName, instruction));
  ctn.registerResolver(IRenderLocation, location == null
    ? noLocationProvider
    : new InstanceProvider(locationProviderName, location));
  ctn.registerResolver(IViewFactory, viewFactory == null
    ? noViewFactoryProvider
    : new ViewFactoryProvider(viewFactory));
  ctn.registerResolver(IAuSlotsInfo, auSlotsInfo == null
    ? noAuSlotProvider
    : new InstanceProvider(slotInfoProviderName, auSlotsInfo));

  return ctn.invoke(definition.Type);
}

class RenderLocationProvider implements IResolver {
  public get name() { return 'IRenderLocation'; }
  public get $isResolver(): true { return true; }

  public constructor(
    private readonly _location: IRenderLocation | null
  ) {}

  public resolve(): IRenderLocation | null {
    return this._location;
  }
}

const noLocationProvider = new RenderLocationProvider(null);
const noViewFactoryProvider = new ViewFactoryProvider(null);
const noAuSlotProvider = new InstanceProvider<IAuSlotsInfo>(slotInfoProviderName, new AuSlotsInfo(emptyArray));
