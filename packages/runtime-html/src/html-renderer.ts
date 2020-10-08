import {
  BindingMode,
  BindingType,
  ContentBinding,
  ICompiledRenderContext,
  IExpressionParser,
  IInstructionRenderer,
  IObserverLocator,
  IRenderableController,
  IScheduler,
  Interpolation,
  IsBindingBehavior,
  LifecycleFlags,
  MultiInterpolationBinding,
  PropertyBinding,
  applyBindingBehavior,
  ensureExpression,
  instructionRenderer,
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
  ISetStyleAttributeInstruction,
} from './definitions';
import { IEventManager } from './observation/event-manager';

@instructionRenderer(HTMLTargetedInstructionType.textBinding)
/** @internal */
export class TextBindingRenderer implements IInstructionRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
    @IScheduler private readonly scheduler: IScheduler,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    target: ChildNode,
    instruction: ITextBindingInstruction,
  ): void {
    const next = target.nextSibling;
    if (context.dom.isMarker(target)) {
      context.dom.remove(target);
    }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.Interpolation) as Interpolation;
    const binding = new MultiInterpolationBinding(
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

@instructionRenderer(HTMLTargetedInstructionType.listenerBinding)
/** @internal */
export class ListenerBindingRenderer implements IInstructionRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IEventManager private readonly eventManager: IEventManager,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    target: HTMLElement,
    instruction: IListenerBindingInstruction,
  ): void {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsEventCommand | (instruction.strategy + BindingType.DelegationStrategyDelta));
    const binding = applyBindingBehavior(
      new Listener(context.dom, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventManager, context),
      expr,
      context,
    );
    controller.addBinding(binding);
  }
}

@instructionRenderer(HTMLTargetedInstructionType.setAttribute)
/** @internal */
export class SetAttributeRenderer implements IInstructionRenderer {
  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    target: HTMLElement,
    instruction: ISetAttributeInstruction,
  ): void {
    target.setAttribute(instruction.to, instruction.value);
  }
}

@instructionRenderer(HTMLTargetedInstructionType.setClassAttribute)
export class SetClassAttributeRenderer implements IInstructionRenderer {
  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    target: HTMLElement,
    instruction: ISetClassAttributeInstruction,
  ): void {
    addClasses(target.classList, instruction.value);
  }
}

@instructionRenderer(HTMLTargetedInstructionType.setStyleAttribute)
export class SetStyleAttributeRenderer implements IInstructionRenderer {
  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    target: HTMLElement,
    instruction: ISetStyleAttributeInstruction,
  ): void {
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

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    target: HTMLElement,
    instruction: IStylePropertyBindingInstruction,
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

@instructionRenderer(HTMLTargetedInstructionType.attributeBinding)
/** @internal */
export class AttributeBindingRenderer implements IInstructionRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly observerLocator: IObserverLocator,
  ) {}

  public render(
    flags: LifecycleFlags,
    context: ICompiledRenderContext,
    controller: IRenderableController,
    target: HTMLElement,
    instruction: IAttributeBindingInstruction,
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
