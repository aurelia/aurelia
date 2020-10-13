import {
  BindingMode,
  BindingType,
  ContentBinding,
  ICompiledRenderContext,
  IExpressionParser,
  IInstructionComposer,
  IObserverLocator,
  IRenderableController,
  instructionComposer,
  IScheduler,
  Interpolation,
  IsBindingBehavior,
  LifecycleFlags,
  InterpolationBinding,
  PropertyBinding,
  applyBindingBehavior,
  ensureExpression,
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

@instructionComposer(HTMLTargetedInstructionType.textBinding)
/** @internal */
export class TextBindingComposer implements IInstructionComposer {
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

@instructionComposer(HTMLTargetedInstructionType.listenerBinding)
/** @internal */
export class ListenerBindingComposer implements IInstructionComposer {
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

@instructionComposer(HTMLTargetedInstructionType.setAttribute)
/** @internal */
export class SetAttributeComposer implements IInstructionComposer {
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

@instructionComposer(HTMLTargetedInstructionType.setClassAttribute)
export class SetClassAttributeComposer implements IInstructionComposer {
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

@instructionComposer(HTMLTargetedInstructionType.setStyleAttribute)
export class SetStyleAttributeComposer implements IInstructionComposer {
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

@instructionComposer(HTMLTargetedInstructionType.stylePropertyBinding)
/** @internal */
export class StylePropertyBindingComposer implements IInstructionComposer {
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

@instructionComposer(HTMLTargetedInstructionType.attributeBinding)
/** @internal */
export class AttributeBindingComposer implements IInstructionComposer {
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
