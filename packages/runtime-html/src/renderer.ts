import {
  emptyArray,
  InstanceProvider,
  type IContainer,
  type Constructable,
  type IResolver,
  resolve,
  Registrable,
} from '@aurelia/kernel';
import {
  IExpressionParser,
  type ExpressionType,
  type AnyBindingExpression,
} from '@aurelia/expression-parser';
import {
  IObserverLocator,
  type IObservable,
} from '@aurelia/runtime';
import { toView } from './binding/interfaces-bindings';
import { AttributeBinding } from './binding/attribute-binding';
import { InterpolationBinding, InterpolationPartBinding } from './binding/interpolation-binding';
import { ContentBinding } from "./binding/content-binding";
import { LetBinding } from './binding/let-binding';
import { PropertyBinding } from './binding/property-binding';
import { RefBinding } from './binding/ref-binding';
import { IEventModifier, ListenerBinding, ListenerBindingOptions } from './binding/listener-binding';
import { CustomElement, CustomElementDefinition, findElementControllerFor } from './resources/custom-element';
import { CustomAttribute, CustomAttributeDefinition, findAttributeControllerFor } from './resources/custom-attribute';
import { convertToRenderLocation, IRenderLocation, INode, setRef, ICssModulesMapping, registerHostNode } from './dom';
import { Controller, ICustomElementController, ICustomElementViewModel, IController, ICustomAttributeViewModel, IHydrationContext } from './templating/controller';
import { IPlatform } from './platform';
import { IViewFactory } from './templating/view';
import { IRendering } from './templating/rendering';
import { objectKeys, isString, etIsProperty, etInterpolation, etIsIterator, etIsFunction } from './utilities';
import { createInterface, registerResolver, singletonRegistration } from './utilities-di';
import { IAuSlotsInfo, AuSlotsInfo } from './templating/controller.projection';

import type { IHydratableController } from './templating/controller';
import { ErrorNames, createMappedError } from './errors';
import { SpreadBinding } from './binding/spread-binding';
import { AttributeBindingInstruction, HydrateAttributeInstruction, HydrateElementInstruction, HydrateLetElementInstruction, HydrateTemplateController, IInstruction, ITemplateCompiler, InstructionType, InterpolationInstruction, IteratorBindingInstruction, LetBindingInstruction, ListenerBindingInstruction, PropertyBindingInstruction, RefBindingInstruction, SetAttributeInstruction, SetClassAttributeInstruction, SetPropertyInstruction, SetStyleAttributeInstruction, SpreadBindingInstruction, StylePropertyBindingInstruction, TextBindingInstruction } from '@aurelia/template-compiler';

/**
 * An interface describing an instruction renderer
 * its target property will be used to match instruction types dynamically at render time
 */
export interface IRenderer {
  target: string;
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

export const IRenderer = /*@__PURE__*/createInterface<IRenderer>('IRenderer');

export function renderer<T extends IRenderer, C extends Constructable<T>>(target: C, context: ClassDecoratorContext): C {
  return Registrable.define(target, function (this: typeof target, container: IContainer): void {
    singletonRegistration(IRenderer, this).register(container);
  });
}

function ensureExpression<TFrom>(parser: IExpressionParser, srcOrExpr: TFrom | string, expressionType: ExpressionType): TFrom {
  if (isString(srcOrExpr)) {
    return parser.parse(srcOrExpr, expressionType) as TFrom;
  }
  return srcOrExpr;
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
      throw createMappedError(ErrorNames.not_supported_view_ref_api);
    case 'component':
      // this means it supports returning undefined
      return findElementControllerFor(refHost)!.viewModel;
    default: {
      const caController = findAttributeControllerFor(refHost, refTargetName);
      if (caController !== void 0) {
        return caController.viewModel;
      }
      const ceController = findElementControllerFor(refHost, { name: refTargetName });
      if (ceController === void 0) {
        throw createMappedError(ErrorNames.ref_not_found, refTargetName);
      }
      return ceController.viewModel;
    }
  }
}

export const SetPropertyRenderer = /*@__PURE__*/ renderer(class SetPropertyRenderer implements IRenderer {
  public readonly target = InstructionType.setProperty;

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
}, null!);

export const CustomElementRenderer = /*@__PURE__*/ renderer(class CustomElementRenderer implements IRenderer {
  /** @internal */ public readonly _rendering = resolve(IRendering);

  public readonly target = InstructionType.hydrateElement;

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: HydrateElementInstruction<Record<PropertyKey, unknown>, CustomElementDefinition>,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    /* eslint-disable prefer-const */
    let def: CustomElementDefinition | null;
    let component: ICustomElementViewModel;
    let childCtrl: ICustomElementController;
    const res = instruction.res;
    const projections = instruction.projections;
    const ctxContainer = renderingCtrl.container;
    switch (typeof res) {
      case 'string':
        def = CustomElement.find(ctxContainer, res);
        if (def == null) {
          throw createMappedError(ErrorNames.element_res_not_found, instruction, renderingCtrl);
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
      /* SlotsInfo      */projections == null ? void 0 : new AuSlotsInfo(objectKeys(projections)),
    );
    component = container.invoke(def.Type);
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
}, null!);

export const CustomAttributeRenderer = /*@__PURE__*/ renderer(class CustomAttributeRenderer implements IRenderer {
  /** @internal */ public readonly _rendering = resolve(IRendering);

  public readonly target = InstructionType.hydrateAttribute;

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
        def = CustomAttribute.find(ctxContainer, instruction.res);
        if (def == null) {
          throw createMappedError(ErrorNames.attribute_res_not_found, instruction, renderingCtrl);
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
        def = instruction.res as CustomAttributeDefinition;
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
}, null!);

export const TemplateControllerRenderer = /*@__PURE__*/ renderer(class TemplateControllerRenderer implements IRenderer {
  /** @internal */ public readonly _rendering = resolve(IRendering);

  public readonly target = InstructionType.hydrateTemplateController;

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
        def = CustomAttribute.find(ctxContainer, instruction.res);
        if (def == null) {
          throw createMappedError(ErrorNames.attribute_tc_res_not_found, instruction, renderingCtrl);
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
        def = instruction.res as CustomAttributeDefinition;
    }
    // const viewFactory = this._rendering.getViewFactory(
    //   instruction.def,
    //   ctxContainer
    // );
    const viewFactory = this._rendering.getViewFactory(
      instruction.def,
      def.containerStrategy === 'new'
        ? ctxContainer.createChild({ inheritParentResources: true })
        : ctxContainer
    );
    const renderLocation = convertToRenderLocation(target);
    const results = invokeAttribute(
      /* platform         */platform,
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
}, null!);

export const LetElementRenderer = /*@__PURE__*/ renderer(class LetElementRenderer implements IRenderer {
  public readonly target = InstructionType.hydrateLetElement;
  public constructor() {
    LetBinding.mix();
  }
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
      expr = ensureExpression(exprParser, childInstruction.from, etIsProperty);
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
}, null!);

export const RefBindingRenderer = /*@__PURE__*/ renderer(class RefBindingRenderer implements IRenderer {
  public readonly target = InstructionType.refBinding;
  public render(
    renderingCtrl: IHydratableController,
    target: INode,
    instruction: RefBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
  ): void {
    renderingCtrl.addBinding(new RefBinding(
      renderingCtrl.container,
      ensureExpression(exprParser, instruction.from, etIsProperty),
      getRefTarget(target, instruction.to)
    ));
  }
}, null!);

export const InterpolationBindingRenderer = /*@__PURE__*/ renderer(class InterpolationBindingRenderer implements IRenderer {
  public readonly target = InstructionType.interpolation;
  public constructor() {
    InterpolationPartBinding.mix();
  }
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
      ensureExpression(exprParser, instruction.from, etInterpolation),
      getTarget(target),
      instruction.to,
      toView,
    ));
  }
}, null!);

export const PropertyBindingRenderer = /*@__PURE__*/ renderer(class PropertyBindingRenderer implements IRenderer {
  public readonly target = InstructionType.propertyBinding;
  public constructor() {
    PropertyBinding.mix();
  }
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
      ensureExpression(exprParser, instruction.from, etIsProperty),
      getTarget(target),
      instruction.to,
      instruction.mode,
    ));
  }
}, null!);

export const IteratorBindingRenderer = /*@__PURE__*/ renderer(class IteratorBindingRenderer implements IRenderer {
  public readonly target = InstructionType.iteratorBinding;
  public constructor() {
    PropertyBinding.mix();
  }
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
      ensureExpression(exprParser, instruction.forOf, etIsIterator),
      getTarget(target),
      instruction.to,
      toView,
    ));
  }
}, null!);

export const TextBindingRenderer = /*@__PURE__*/ renderer(class TextBindingRenderer implements IRenderer {
  public readonly target = InstructionType.textBinding;
  public constructor() {
    ContentBinding.mix();
  }
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
      ensureExpression(exprParser, instruction.from, etIsProperty),
      target as Text,
    ));
  }
}, null!);

/**
 * An interface describing configuration for listener bindings
 */
export interface IListenerBindingOptions {
  /**
   * Indicate whether listener should by default call preventDefault on all the events
   */
  prevent: boolean;
}
export const IListenerBindingOptions = createInterface<IListenerBindingOptions>('IListenerBindingOptions', x => x.instance({
  prevent: false,
}));

export const ListenerBindingRenderer = /*@__PURE__*/ renderer(class ListenerBindingRenderer implements IRenderer {
  public readonly target = InstructionType.listenerBinding;

  /** @internal */
  public readonly _modifierHandler = resolve(IEventModifier);
  /** @internal */
  public readonly _defaultOptions = resolve(IListenerBindingOptions);

  public constructor() {
    ListenerBinding.mix();
  }

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: ListenerBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
  ): void {
    renderingCtrl.addBinding(new ListenerBinding(
      renderingCtrl.container,
      ensureExpression(exprParser, instruction.from, etIsFunction),
      target,
      instruction.to,
      new ListenerBindingOptions(this._defaultOptions.prevent, instruction.capture),
      this._modifierHandler.getHandler(instruction.to, instruction.modifier),
    ));
  }
}, null!);

export const SetAttributeRenderer = /*@__PURE__*/ renderer(class SetAttributeRenderer implements IRenderer {
  public readonly target = InstructionType.setAttribute;
  public render(
    _: IHydratableController,
    target: HTMLElement,
    instruction: SetAttributeInstruction,
  ): void {
    target.setAttribute(instruction.to, instruction.value);
  }
}, null!);

export const SetClassAttributeRenderer = /*@__PURE__*/ renderer(class SetClassAttributeRenderer implements IRenderer {
  public readonly target = InstructionType.setClassAttribute;
  public render(
    _: IHydratableController,
    target: HTMLElement,
    instruction: SetClassAttributeInstruction,
  ): void {
    addClasses(target.classList, instruction.value);
  }
}, null!);

export const SetStyleAttributeRenderer = /*@__PURE__*/ renderer(class SetStyleAttributeRenderer implements IRenderer {
  public readonly target = InstructionType.setStyleAttribute;
  public render(
    _: IHydratableController,
    target: HTMLElement,
    instruction: SetStyleAttributeInstruction,
  ): void {
    target.style.cssText += instruction.value;
  }
}, null!);

/* istanbul ignore next */
const ambiguousStyles = [
  'height',
  'width',
  'border-width',
  'padding',
  'padding-left',
  'padding-right',
  'padding-top',
  'padding-right',
  'padding-inline',
  'padding-block',
  'margin',
  'margin-left',
  'margin-right',
  'margin-top',
  'margin-bottom',
  'margin-inline',
  'margin-block',
  'top',
  'right',
  'bottom',
  'left',
];

export const StylePropertyBindingRenderer = /*@__PURE__*/ renderer(class StylePropertyBindingRenderer implements IRenderer {
  public readonly target = InstructionType.stylePropertyBinding;
  public constructor() {
    PropertyBinding.mix();
  }
  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: StylePropertyBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    if (__DEV__) {
      /* istanbul ignore next */
      if (ambiguousStyles.includes(instruction.to)) {
        renderingCtrl.addBinding(new DevStylePropertyBinding(
          renderingCtrl,
          renderingCtrl.container,
          observerLocator,
          platform.domWriteQueue,
          ensureExpression(exprParser, instruction.from, etIsProperty),
          target.style,
          instruction.to,
          toView,
        ));
        return;
      }
    }
    renderingCtrl.addBinding(new PropertyBinding(
      renderingCtrl,
      renderingCtrl.container,
      observerLocator,
      platform.domWriteQueue,
      ensureExpression(exprParser, instruction.from, etIsProperty),
      target.style,
      instruction.to,
      toView,
    ));
  }
}, null!);

/* istanbul ignore next */
class DevStylePropertyBinding extends PropertyBinding {
  public updateTarget(value: unknown): void {
    if (typeof value === 'number' && value > 0) {
      // eslint-disable-next-line no-console
      console.warn(`[DEV]: Setting number ${value} as value for style.${this.targetProperty}. Did you meant "${value}px"?`);
    }
    return super.updateTarget(value);
  }
}

export const AttributeBindingRenderer = /*@__PURE__*/ renderer(class AttributeBindingRenderer implements IRenderer {
  public readonly target = InstructionType.attributeBinding;
  public constructor() {
    AttributeBinding.mix();
  }
  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: AttributeBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    const container = renderingCtrl.container;
    const classMapping =
      container.has(ICssModulesMapping, false)
        ? container.get(ICssModulesMapping)
        : null;
    renderingCtrl.addBinding(new AttributeBinding(
      renderingCtrl,
      container,
      observerLocator,
      platform.domWriteQueue,
      ensureExpression(exprParser, instruction.from, etIsProperty),
      target,
      instruction.attr/* targetAttribute */,
      classMapping == null
        ? instruction.to/* targetKey */
        : instruction.to.split(/\s/g).map(c => classMapping[c] ?? c).join(' '),
      toView,
    ));
  }
}, null!);

export const SpreadRenderer = /*@__PURE__*/ renderer(class SpreadRenderer implements IRenderer {
  /** @internal */ public readonly _compiler = resolve(ITemplateCompiler);
  /** @internal */ public readonly _rendering = resolve(IRendering);

  public readonly target = InstructionType.spreadBinding;

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    _instruction: SpreadBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    SpreadBinding
      .create(
        renderingCtrl.container.get(IHydrationContext),
        target,
        void 0,
        this._rendering,
        this._compiler,
        platform,
        exprParser,
        observerLocator
      )
      .forEach(b => renderingCtrl.addBinding(b));
  }
}, null!);

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

// const createSurrogateBinding = (context: IHydrationContext<object>) =>
//   new SpreadBinding([], context) as SpreadBinding & IHydratableController;
const controllerProviderName = 'IController';
const instructionProviderName = 'IInstruction';
const locationProviderName = 'IRenderLocation';
const slotInfoProviderName = 'ISlotsInfo';

function createElementContainer(
  p: IPlatform,
  renderingCtrl: IController,
  host: HTMLElement,
  instruction: HydrateElementInstruction,
  location: IRenderLocation | null,
  auSlotsInfo?: IAuSlotsInfo,
): IContainer {
  const ctn = renderingCtrl.container.createChild();

  registerHostNode(ctn, p, host);
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
      throw createMappedError(ErrorNames.view_factory_provider_not_ready);
    }
    if (!isString(f.name) || f.name.length === 0) {
      throw createMappedError(ErrorNames.view_factory_invalid_name);
    }
    return f;
  }
}

/** @internal */
export interface IHasController {
  $controller: IController;
}

function invokeAttribute(
  p: IPlatform,
  definition: CustomAttributeDefinition,
  $renderingCtrl: IController | IHasController,
  host: HTMLElement,
  instruction: HydrateAttributeInstruction | HydrateTemplateController,
  viewFactory?: IViewFactory,
  location?: IRenderLocation,
  auSlotsInfo?: IAuSlotsInfo,
): { vm: ICustomAttributeViewModel; ctn: IContainer } {
  const renderingCtrl = $renderingCtrl instanceof Controller
    ? $renderingCtrl
    : ($renderingCtrl as IHasController).$controller;
  const ctn = renderingCtrl.container.createChild();
  registerHostNode(ctn, p, host);
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
