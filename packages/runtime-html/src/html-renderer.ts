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
  ITextBindingInstruction,
  ISetClassAttributeInstruction,
  ISetStyleAttributeInstruction
} from './definitions';
import { IEventManager } from './observation/event-manager';

@instructionRenderer(HTMLTargetedInstructionType.textBinding)
/** @internal */
export class TextBindingRenderer implements IInstructionRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) {}

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
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IEventManager private readonly eventManager: IEventManager,
  ) {}

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: IListenerBindingInstruction): void {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsEventCommand | (instruction.strategy + BindingType.DelegationStrategyDelta));
    const binding = new Listener(dom, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventManager, context);
    addBinding(renderable, binding);
  }
}

@instructionRenderer(HTMLTargetedInstructionType.setAttribute)
/** @internal */
export class SetAttributeRenderer implements IInstructionRenderer {
  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: ISetAttributeInstruction): void {
    target.setAttribute(instruction.to, instruction.value);
  }
}

@instructionRenderer(HTMLTargetedInstructionType.setClassAttribute)
export class SetClassAttributeRenderer implements IInstructionRenderer {
  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: ISetClassAttributeInstruction): void {
    addClasses(target.classList, instruction.value);
  }
}

@instructionRenderer(HTMLTargetedInstructionType.setStyleAttribute)
export class SetStyleAttributeRenderer implements IInstructionRenderer {
  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: ISetStyleAttributeInstruction): void {
    target.style.cssText += instruction.value;
  }
}

@instructionRenderer(HTMLTargetedInstructionType.stylePropertyBinding)
/** @internal */
export class StylePropertyBindingRenderer implements IInstructionRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) {}

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: IStylePropertyBindingInstruction): void {
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsPropertyCommand | BindingMode.toView);
    const binding = new PropertyBinding(expr, target.style, instruction.to, BindingMode.toView, this.observerLocator, context);
    addBinding(renderable, binding);
  }
}

@instructionRenderer(HTMLTargetedInstructionType.attributeBinding)
/** @internal */
export class AttributeBindingRenderer implements IInstructionRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) {}

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
