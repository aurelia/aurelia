import {
  emptyArray,
  type IDisposable,
  InstanceProvider,
  type Key,
  type IServiceLocator,
  type IContainer,
  type Class,
  type IRegistry,
  type Constructable,
  type IResolver,
} from '@aurelia/kernel';
import {
  ExpressionType,
  IExpressionParser,
  IObserverLocator,
  type IBinding,
  Scope,
  type Interpolation,
  type IsBindingBehavior,
  type AnyBindingExpression,
  type IObservable,
  type ForOfStatement,
} from '@aurelia/runtime';
import { BindingMode } from './binding/interfaces-bindings';
import { AttributeBinding } from './binding/attribute';
import { InterpolationBinding, ContentBinding } from './binding/interpolation-binding';
import { LetBinding } from './binding/let-binding';
import { PropertyBinding } from './binding/property-binding';
import { RefBinding } from './binding/ref-binding';
import { ListenerBinding, ListenerBindingOptions } from './binding/listener-binding';
import { CustomElement, CustomElementDefinition, findElementControllerFor } from './resources/custom-element';
import { AuSlotsInfo, IAuSlotsInfo, IProjections } from './resources/slot-injectables';
import { CustomAttribute, CustomAttributeDefinition, findAttributeControllerFor } from './resources/custom-attribute';
import { convertToRenderLocation, IRenderLocation, INode, setRef, ICssModulesMapping } from './dom';
import { Controller, ICustomElementController, ICustomElementViewModel, IController, ICustomAttributeViewModel, IHydrationContext, ViewModelKind } from './templating/controller';
import { IPlatform } from './platform';
import { IViewFactory } from './templating/view';
import { IRendering } from './templating/rendering';
import type { AttrSyntax } from './resources/attribute-pattern';
import { createError, defineProp, objectKeys, isString } from './utilities';
import { createInterface, registerResolver, singletonRegistration } from './utilities-di';

import type { IHydratableController } from './templating/controller';
import type { PartialCustomElementDefinition } from './resources/custom-element';
import { createText, insertBefore } from './utilities-dom';

export const enum InstructionType {
  hydrateElement = 'ra',
  hydrateAttribute = 'rb',
  hydrateTemplateController = 'rc',
  hydrateLetElement = 'rd',
  setProperty = 're',
  interpolation = 'rf',
  propertyBinding = 'rg',
  letBinding = 'ri',
  refBinding = 'rj',
  iteratorBinding = 'rk',
  multiAttr = 'rl',
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
export const IInstruction = createInterface<IInstruction>('Instruction');

export function isInstruction(value: unknown): value is IInstruction {
  const type = (value as { type?: string }).type;
  return isString(type) && type.length === 2;
}

export class InterpolationInstruction {
  public readonly type = InstructionType.interpolation;

  public constructor(
    public from: string | Interpolation,
    public to: string,
  ) {}
}

export class PropertyBindingInstruction {
  public readonly type = InstructionType.propertyBinding;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
    public mode: BindingMode,
  ) {}
}

export class IteratorBindingInstruction {
  public readonly type = InstructionType.iteratorBinding;

  public constructor(
    public forOf: string | ForOfStatement,
    public to: string,
    public props: MultiAttrInstruction[],
  ) {}
}

export class RefBindingInstruction {
  public readonly type = InstructionType.refBinding;

  public constructor(
    public readonly from: string | IsBindingBehavior,
    public readonly to: string
  ) {}
}

export class SetPropertyInstruction {
  public readonly type = InstructionType.setProperty;

  public constructor(
    public value: unknown,
    public to: string,
  ) {}
}

export class MultiAttrInstruction {
  public readonly type = InstructionType.multiAttr;

  public constructor(
    public value: string,
    public to: string,
    public command: string | null,
  ) {}
}

export class HydrateElementInstruction {
  public readonly type = InstructionType.hydrateElement;

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
  public readonly type = InstructionType.hydrateAttribute;

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
  public readonly type = InstructionType.hydrateTemplateController;

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
  public readonly type = InstructionType.hydrateLetElement;

  public constructor(
    public instructions: LetBindingInstruction[],
    public toBindingContext: boolean,
  ) {}
}

export class LetBindingInstruction {
  public readonly type = InstructionType.letBinding;

  public constructor(
    public from: string | IsBindingBehavior | Interpolation,
    public to: string,
  ) {}
}

export class TextBindingInstruction {
  public readonly type = InstructionType.textBinding;

  public constructor(
    public from: string | IsBindingBehavior,
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
  public readonly type = InstructionType.listenerBinding;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
    public preventDefault: boolean,
    public capture: boolean,
  ) {}
}
export class StylePropertyBindingInstruction {
  public readonly type = InstructionType.stylePropertyBinding;

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
  ) {}
}

export class SetAttributeInstruction {
  public readonly type = InstructionType.setAttribute;

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
  public readonly type = InstructionType.attributeBinding;

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
  public readonly type = InstructionType.spreadBinding;
}

export class SpreadElementPropBindingInstruction {
  public readonly type = InstructionType.spreadElementProp;
  public constructor(
    public readonly instructions: IInstruction,
  ) {}
}

export const ITemplateCompiler = createInterface<ITemplateCompiler>('ITemplateCompiler');
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
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void;
}

export const IRenderer = createInterface<IRenderer>('IRenderer');

type DecoratableInstructionRenderer<TType extends string, TProto, TClass> = Class<TProto & Partial<IInstructionTypeClassifier<TType> & Pick<IRenderer, 'render'>>, TClass> & Partial<IRegistry>;
type DecoratedInstructionRenderer<TType extends string, TProto, TClass> =  Class<TProto & IInstructionTypeClassifier<TType> & Pick<IRenderer, 'render'>, TClass> & IRegistry;

type InstructionRendererDecorator<TType extends string> = <TProto, TClass>(target: DecoratableInstructionRenderer<TType, TProto, TClass>) => DecoratedInstructionRenderer<TType, TProto, TClass>;

export function renderer<TType extends string>(targetType: TType): InstructionRendererDecorator<TType> {
  return function decorator<TProto, TClass>(target: DecoratableInstructionRenderer<TType, TProto, TClass>): DecoratedInstructionRenderer<TType, TProto, TClass> {
    target.register = function (container: IContainer): void {
      singletonRegistration(IRenderer, this).register(container);
    };
    defineProp(target.prototype, 'target', {
      configurable: true,
      get: function () { return targetType; }
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
      return findElementControllerFor(refHost)!;
    case 'view':
      // todo: returns node sequences for fun?
      if (__DEV__)
        throw createError(`AUR0750: Not supported API`);
      else
        throw createError(`AUR0750`);
    case 'view-model':
      // this means it supports returning undefined
      return findElementControllerFor(refHost)!.viewModel;
    default: {
      const caController = findAttributeControllerFor(refHost, refTargetName);
      if (caController !== void 0) {
        return caController.viewModel;
      }
      const ceController = findElementControllerFor(refHost, { name: refTargetName });
      if (ceController === void 0) {
        if (__DEV__)
          throw createError(`AUR0751: Attempted to reference "${refTargetName}", but it was not found amongst the target's API.`);
        else
          throw createError(`AUR0751:${refTargetName}`);
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
    if (obj.$observers?.[instruction.to] !== void 0) {
      obj.$observers[instruction.to].setValue(instruction.value);
    } else {
      obj[instruction.to] = instruction.value;
    }
  }
}

@renderer(InstructionType.hydrateElement)
/** @internal */
export class CustomElementRenderer implements IRenderer {
  /** @internal */ protected static get inject(): unknown[] { return [IRendering]; }
  /** @internal */ private readonly _rendering: IRendering;

  public target!: InstructionType.hydrateElement;

  public constructor(rendering: IRendering) {
    this._rendering = rendering;
  }

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: HydrateElementInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
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
            throw createError(`AUR0752: Element ${res} is not registered in ${(renderingCtrl as Controller)['name']}.`);
          else
            throw createError(`AUR0752:${res}@${(renderingCtrl as Controller)['name']}`);
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
      /* platform         */platform,
      /* parentController */renderingCtrl,
      /* host             */target,
      /* instruction      */instruction,
      /* location         */location,
      /* auSlotsInfo      */projections == null ? void 0 : new AuSlotsInfo(objectKeys(projections)),
    );
    Ctor = def.Type;
    component = container.invoke(Ctor);
    registerResolver(container, Ctor, new InstanceProvider<typeof Ctor>(def.key, component));
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
      renderers[propInst.type].render(renderingCtrl, childCtrl, propInst, platform, exprParser, observerLocator);
      ++i;
    }

    renderingCtrl.addChild(childCtrl);
    /* eslint-enable prefer-const */
  }
}

@renderer(InstructionType.hydrateAttribute)
/** @internal */
export class CustomAttributeRenderer implements IRenderer {
  /** @internal */ protected static get inject(): unknown[] { return [IRendering]; }
  /** @internal */ private readonly _rendering: IRendering;

  public target!: InstructionType.hydrateAttribute;

  public constructor(rendering: IRendering) {
    this._rendering = rendering;
  }

  public render(
    /**
     * The cotroller that is currently invoking this renderer
     */
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: HydrateAttributeInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    /* eslint-disable prefer-const */
    let ctxContainer = renderingCtrl.container;
    let def: CustomAttributeDefinition | null;
    switch (typeof instruction.res) {
      case 'string':
        def = ctxContainer.find(CustomAttribute, instruction.res);
        if (def == null) {
          if (__DEV__)
            throw createError(`AUR0753: Attribute ${instruction.res} is not registered in ${(renderingCtrl as Controller)['name']}.`);
          else
            throw createError(`AUR0753:${instruction.res}@${(renderingCtrl as Controller)['name']}`);
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
    const results = invokeAttribute(
      /* platform         */platform,
      /* attr definition  */def,
      /* parentController */renderingCtrl,
      /* host             */target,
      /* instruction      */instruction,
      /* viewFactory      */void 0,
      /* location         */void 0,
    );
    const childController = Controller.$attr(
      /* context ct */results.ctn,
      /* viewModel  */results.vm,
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
      renderers[propInst.type].render(renderingCtrl, childController, propInst, platform, exprParser, observerLocator);
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
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    /* eslint-disable prefer-const */
    let ctxContainer = renderingCtrl.container;
    let def: CustomAttributeDefinition | null;
    switch (typeof instruction.res) {
      case 'string':
        def = ctxContainer.find(CustomAttribute, instruction.res);
        if (def == null) {
          if (__DEV__)
            throw createError(`AUR0754: Attribute ${instruction.res} is not registered in ${(renderingCtrl as Controller)['name']}.`);
          else
            throw createError(`AUR0754:${instruction.res}@${(renderingCtrl as Controller)['name']}`);
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
    const results = invokeAttribute(
      /* platform         */this._platform,
      /* attr definition  */def,
      /* parentController */renderingCtrl,
      /* host             */target,
      /* instruction      */instruction,
      /* viewFactory      */viewFactory,
      /* location         */renderLocation,
    );
    const childController = Controller.$attr(
      /* container ct */results.ctn,
      /* viewModel    */results.vm,
      /* host         */target,
      /* definition   */def,
    );

    setRef(renderLocation, def.key, childController);

    results.vm.link?.(renderingCtrl, childController, target, instruction);

    const renderers = this._rendering.renderers;
    const props = instruction.props;
    const ii = props.length;
    let i = 0;
    let propInst: IInstruction;
    while (ii > i) {
      propInst = props[i];
      renderers[propInst.type].render(renderingCtrl, childController, propInst, platform, exprParser, observerLocator);
      ++i;
    }

    renderingCtrl.addChild(childController);
    /* eslint-enable prefer-const */
  }
}

@renderer(InstructionType.hydrateLetElement)
/** @internal */
export class LetElementRenderer implements IRenderer {
  public target!: InstructionType.hydrateLetElement;
  public render(
    renderingCtrl: IHydratableController,
    target: Node & ChildNode,
    instruction: HydrateLetElementInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    target.remove();
    const childInstructions = instruction.instructions;
    const toBindingContext = instruction.toBindingContext;
    const container = renderingCtrl.container;
    const ii = childInstructions.length;

    let childInstruction: LetBindingInstruction;
    let expr: AnyBindingExpression;
    let i = 0;
    while (ii > i) {
      childInstruction = childInstructions[i];
      expr = ensureExpression(exprParser, childInstruction.from, ExpressionType.IsProperty);
      renderingCtrl.addBinding(new LetBinding(
        container,
        observerLocator,
        expr,
        childInstruction.to,
        toBindingContext,
      ));
      ++i;
    }
  }
}

@renderer(InstructionType.refBinding)
/** @internal */
export class RefBindingRenderer implements IRenderer {
  public target!: InstructionType.refBinding;
  public render(
    renderingCtrl: IHydratableController,
    target: INode,
    instruction: RefBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
  ): void {
    renderingCtrl.addBinding(new RefBinding(
      renderingCtrl.container,
      ensureExpression(exprParser, instruction.from, ExpressionType.IsProperty),
      getRefTarget(target, instruction.to)
    ));
  }
}

@renderer(InstructionType.interpolation)
/** @internal */
export class InterpolationBindingRenderer implements IRenderer {
  public target!: InstructionType.interpolation;
  public render(
    renderingCtrl: IHydratableController,
    target: IController,
    instruction: InterpolationInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    renderingCtrl.addBinding(new InterpolationBinding(
      renderingCtrl,
      renderingCtrl.container,
      observerLocator,
      platform.domWriteQueue,
      ensureExpression(exprParser, instruction.from, ExpressionType.Interpolation),
      getTarget(target),
      instruction.to,
      BindingMode.toView,
    ));
  }
}

@renderer(InstructionType.propertyBinding)
/** @internal */
export class PropertyBindingRenderer implements IRenderer {
  public target!: InstructionType.propertyBinding;
  public render(
    renderingCtrl: IHydratableController,
    target: IController,
    instruction: PropertyBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    renderingCtrl.addBinding(new PropertyBinding(
      renderingCtrl,
      renderingCtrl.container,
      observerLocator,
      platform.domWriteQueue,
      ensureExpression(exprParser, instruction.from, ExpressionType.IsProperty),
      getTarget(target),
      instruction.to,
      instruction.mode,
    ));
  }
}

@renderer(InstructionType.iteratorBinding)
/** @internal */
export class IteratorBindingRenderer implements IRenderer {
  public target!: InstructionType.iteratorBinding;
  public render(
    renderingCtrl: IHydratableController,
    target: IController,
    instruction: IteratorBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    renderingCtrl.addBinding(new PropertyBinding(
      renderingCtrl,
      renderingCtrl.container,
      observerLocator,
      platform.domWriteQueue,
      ensureExpression(exprParser, instruction.forOf, ExpressionType.IsIterator),
      getTarget(target),
      instruction.to,
      BindingMode.toView,
    ));
  }
}

@renderer(InstructionType.textBinding)
/** @internal */
export class TextBindingRenderer implements IRenderer {
  public target!: InstructionType.textBinding;
  public render(
    renderingCtrl: IHydratableController,
    target: ChildNode,
    instruction: TextBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    renderingCtrl.addBinding(new ContentBinding(
      renderingCtrl,
      renderingCtrl.container,
      observerLocator,
      platform.domWriteQueue,
      platform,
      ensureExpression(exprParser, instruction.from, ExpressionType.IsProperty),
      insertBefore(target.parentNode!, createText(platform, ''), target),
      instruction.strict,
    ));
  }
}

@renderer(InstructionType.listenerBinding)
/** @internal */
export class ListenerBindingRenderer implements IRenderer {
  public target!: InstructionType.listenerBinding;
  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: ListenerBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
  ): void {
    renderingCtrl.addBinding(new ListenerBinding(
      renderingCtrl.container,
      ensureExpression(exprParser, instruction.from, ExpressionType.IsFunction),
      target,
      instruction.to,
      new ListenerBindingOptions(instruction.preventDefault, instruction.capture),
    ));
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
  public target!: InstructionType.stylePropertyBinding;
  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: StylePropertyBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    renderingCtrl.addBinding(new PropertyBinding(
      renderingCtrl,
      renderingCtrl.container,
      observerLocator,
      platform.domWriteQueue,
      ensureExpression(exprParser, instruction.from, ExpressionType.IsProperty),
      target.style,
      instruction.to,
      BindingMode.toView,
    ));
  }
}

@renderer(InstructionType.attributeBinding)
/** @internal */
export class AttributeBindingRenderer implements IRenderer {
  public target!: InstructionType.attributeBinding;
  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: AttributeBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    // if there's a class custom attribute
    // and this attribute binding is targeting class attribute
    // then its targetted class should be re-mapped
    // solution 1: ...
    // if (renderingCtrl.container.find(CustomAttribute, 'class'))

    // solution 2:
    // add a css module interface registration token somewhere
    // and let css module register that when they are registered
    let classMapping: Record<string, string> | null = null;
    if (renderingCtrl.container.has(ICssModulesMapping, false)) {
      classMapping = renderingCtrl.container.get(ICssModulesMapping);
    }
    renderingCtrl.addBinding(new AttributeBinding(
      renderingCtrl,
      renderingCtrl.container,
      observerLocator,
      platform.domWriteQueue,
      ensureExpression(exprParser, instruction.from, ExpressionType.IsProperty),
      target,
      instruction.attr/* targetAttribute */,
      classMapping == null
        ? instruction.to/* targetKey */
        : instruction.to.split(/\s/g).map(c => classMapping![c] ?? c).join(' '),
      BindingMode.toView,
    ));
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
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
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
        throw createError('No scope context for spread binding.');
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
              findElementControllerFor(target),
              (inst as SpreadElementPropBindingInstruction).instructions,
              platform,
              exprParser,
              observerLocator,
            );
            break;
          default:
            renderers[inst.type].render(spreadBinding, target, inst, platform, exprParser, observerLocator);
        }
      }
      renderingCtrl.addBinding(spreadBinding);
    };
    renderSpreadInstruction(0);
  }
}

class SpreadBinding implements IBinding {
  public scope?: Scope | undefined;
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

  public get state() {
    return this.ctrl.state;
  }

  public constructor(
    /** @internal */ private readonly _innerBindings: IBinding[],
    /** @internal */ private readonly _hydrationContext: IHydrationContext<object>,
  ) {
    this.ctrl = _hydrationContext.controller;
    this.locator = this.ctrl.container;
  }

  public get(key: Key) {
    return this.locator.get(key);
  }

  public bind(_scope: Scope): void {
    if (this.isBound) {
      return;
    }
    this.isBound = true;
    const innerScope = this.scope = this._hydrationContext.controller.scope.parent ?? void 0;
    if (innerScope == null) {
      throw createError('Invalid spreading. Context scope is null/undefined');
    }

    this._innerBindings.forEach(b => b.bind(innerScope));
  }

  public unbind(): void {
    this._innerBindings.forEach(b => b.unbind());
    this.isBound = false;
  }

  public addBinding(binding: IBinding) {
    this._innerBindings.push(binding);
  }

  public addChild(controller: IController) {
    if (controller.vmKind !== ViewModelKind.customAttribute) {
      throw createError('Spread binding does not support spreading custom attributes/template controllers');
    }
    this.ctrl.addChild(controller);
  }

  public limit(): IDisposable {
    throw createError('not implemented');
  }

  public useScope(): void {
    throw createError('not implemented');
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
  registerResolver(
    ctn,
    p.HTMLElement,
    registerResolver(
      ctn,
      p.Element,
      registerResolver(ctn, INode, new InstanceProvider('ElementResolver', host))
    )
  );
  registerResolver(ctn, IController, new InstanceProvider(controllerProviderName, renderingCtrl));
  registerResolver(ctn, IInstruction, new InstanceProvider(instructionProviderName, instruction));
  registerResolver(ctn, IRenderLocation, location == null
    ? noLocationProvider
    : new RenderLocationProvider(location));
  registerResolver(ctn, IViewFactory, noViewFactoryProvider);
  registerResolver(ctn, IAuSlotsInfo, auSlotsInfo == null
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
        throw createError(`AUR7055: Cannot resolve ViewFactory before the provider was prepared.`);
      else
        throw createError(`AUR7055`);
    }
    if (!isString(f.name) || f.name.length === 0) {
      if (__DEV__)
        throw createError(`AUR0756: Cannot resolve ViewFactory without a (valid) name.`);
      else
        throw createError(`AUR0756`);
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
): { vm: ICustomAttributeViewModel; ctn: IContainer } {
  const ctn = renderingCtrl.container.createChild();
  registerResolver(
    ctn,
    p.HTMLElement,
    registerResolver(
      ctn,
      p.Element,
      registerResolver(ctn, INode, new InstanceProvider('ElementResolver', host))
    )
  );
  renderingCtrl = renderingCtrl instanceof Controller
    ? renderingCtrl
    : (renderingCtrl as unknown as SpreadBinding).ctrl;
  registerResolver(ctn, IController, new InstanceProvider(controllerProviderName, renderingCtrl));
  registerResolver(ctn, IInstruction, new InstanceProvider<IInstruction>(instructionProviderName, instruction));
  registerResolver(ctn, IRenderLocation, location == null
    ? noLocationProvider
    : new InstanceProvider(locationProviderName, location));
  registerResolver(ctn, IViewFactory, viewFactory == null
    ? noViewFactoryProvider
    : new ViewFactoryProvider(viewFactory));
  registerResolver(ctn, IAuSlotsInfo, auSlotsInfo == null
    ? noAuSlotProvider
    : new InstanceProvider(slotInfoProviderName, auSlotsInfo));

  return { vm: ctn.invoke(definition.Type), ctn };
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
