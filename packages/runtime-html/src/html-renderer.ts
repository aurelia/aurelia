import { InterfaceSymbol, IRegistry, Key } from '@aurelia/kernel';
import {
  addBinding,
  BindingMode,
  BindingType,
  ensureExpression,
  IController,
  IDOM,
  IExpressionParser,
  IInstructionRenderer,
  instructionRenderer,
  InterpolationBinding,
  IObserverLocator,
  IRenderContext,
  LifecycleFlags,
  MultiInterpolationBinding,
  PropertyBinding
} from '@aurelia/runtime';
import { AttributeBinding } from './binding/attribute';
import { Listener } from './binding/listener';
import {
  HTMLTargetedInstructionType,
  IAttributeBindingInstruction,
  IListenerBindingInstruction,
  ISetAttributeInstruction,
  IStylePropertyBindingInstruction,
  ITextBindingInstruction
} from './definitions';
import { IEventManager } from './observation/event-manager';

const slice = Array.prototype.slice;

@instructionRenderer(HTMLTargetedInstructionType.textBinding)
/** @internal */
export class TextBindingRenderer implements IInstructionRenderer {
  public static readonly inject: readonly Key[] = [IExpressionParser, IObserverLocator];
  public static readonly register: IRegistry['register'];

  private readonly parser: IExpressionParser;
  private readonly observerLocator: IObserverLocator;

  public constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: ChildNode, instruction: ITextBindingInstruction): void {
    const next = target.nextSibling;
    if (dom.isMarker(target)) {
      dom.remove(target);
    }
    let binding: MultiInterpolationBinding | InterpolationBinding;
    const expr = ensureExpression(this.parser, instruction.from, BindingType.Interpolation);
    if (expr.isMulti) {
      binding = new MultiInterpolationBinding(this.observerLocator, expr, next!, 'textContent', BindingMode.toView, context);
    } else {
      binding = new InterpolationBinding(expr.firstExpression, expr, next!, 'textContent', BindingMode.toView, this.observerLocator, context, true);
    }
    addBinding(renderable, binding);
  }
}

@instructionRenderer(HTMLTargetedInstructionType.listenerBinding)
/** @internal */
export class ListenerBindingRenderer implements IInstructionRenderer {
  public static readonly inject: readonly Key[] = [IExpressionParser, IEventManager];
  public static readonly register: IRegistry['register'];

  private readonly parser: IExpressionParser;
  private readonly eventManager: IEventManager;

  public constructor(parser: IExpressionParser, eventManager: IEventManager) {
    this.parser = parser;
    this.eventManager = eventManager;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: IListenerBindingInstruction): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsEventCommand | (instruction.strategy + BindingType.DelegationStrategyDelta));
    const binding = new Listener(dom, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventManager, context);
    addBinding(renderable, binding);
  }
}

@instructionRenderer(HTMLTargetedInstructionType.setAttribute)
/** @internal */
export class SetAttributeRenderer implements IInstructionRenderer {
  public static readonly register: IRegistry['register'];

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: ISetAttributeInstruction): void {
    target.setAttribute(instruction.to, instruction.value);
  }
}

@instructionRenderer(HTMLTargetedInstructionType.stylePropertyBinding)
/** @internal */
export class StylePropertyBindingRenderer implements IInstructionRenderer {
  public static readonly inject: readonly Key[] = [IExpressionParser, IObserverLocator];
  public static readonly register: IRegistry['register'];

  private readonly parser: IExpressionParser;
  private readonly observerLocator: IObserverLocator;

  public constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: IStylePropertyBindingInstruction): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsPropertyCommand | BindingMode.toView);
    const binding = new PropertyBinding(expr, target.style, instruction.to, BindingMode.toView, this.observerLocator, context);
    addBinding(renderable, binding);
  }
}

@instructionRenderer(HTMLTargetedInstructionType.attributeBinding)
/** @internal */
export class AttributeBindingRenderer implements IInstructionRenderer {
  public static readonly inject: readonly InterfaceSymbol[] = [IExpressionParser, IObserverLocator];
  public static readonly register: IRegistry['register'];

  private readonly parser: IExpressionParser;
  private readonly observerLocator: IObserverLocator;

  public constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: IAttributeBindingInstruction): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsPropertyCommand | BindingMode.toView);
    const binding = new AttributeBinding(
      expr,
      target,
      instruction.attr/* targetAttribute */,
      instruction.to/* targetKey */,
      BindingMode.toView,
      this.observerLocator,
      context
    );
    addBinding(renderable, binding);
  }
}
