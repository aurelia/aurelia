import { NavigationInstructionResolver } from '../type-resolvers';
import { customAttribute, INode, bindable, BindingMode, IDOM, DelegationStrategy, IObserverLocator, LifecycleFlags, CustomAttribute, ICustomAttributeController, ICustomAttributeViewModel } from '@aurelia/runtime';
import { IRouter } from '../router';
import { IEventManager } from '@aurelia/runtime-html';
import { IDisposable } from '@aurelia/kernel';

@customAttribute('goto')
export class GotoCustomAttribute implements ICustomAttributeViewModel<HTMLElement> {
  @bindable({ mode: BindingMode.toView })
  public value: unknown;

  private listener: IDisposable | null = null;
  private hasHref: boolean | null = null;

  private readonly element: HTMLElement;
  private observer: any;

  public readonly $controller!: ICustomAttributeController<HTMLElement, this>;

  private readonly activeClass: string = 'goto-active';
  public constructor(
    @IDOM private readonly dom: IDOM,
    @INode element: INode,
    @IRouter private readonly router: IRouter,
    @IEventManager private readonly eventManager: IEventManager,
  ) {
    this.element = element as HTMLElement;
  }

  public beforeBind(): void {
    this.listener = this.eventManager.addEventListener(
      this.dom, this.element, 'click', this.router.linkHandler.handler, DelegationStrategy.none);
    this.updateValue();

    const observerLocator = this.router.container.get(IObserverLocator);
    this.observer = observerLocator.getObserver(LifecycleFlags.none, this.router, 'activeComponents') as any;
    this.observer.subscribe(this);
  }

  public beforeUnbind(): void {
    if (this.listener !== null) {
      this.listener.dispose();
    }
    this.observer.unsubscribe(this);
  }

  public valueChanged(newValue: unknown): void {
    this.updateValue();
  }

  private updateValue(): void {
    if (this.hasHref === null) {
      this.hasHref = this.element.hasAttribute('href');
    }
    if (!this.hasHref) {
      // TODO: Figure out a better value here for non-strings (using InstructionResolver?)
      const value = typeof this.value === 'string' ? this.value : JSON.stringify(this.value);
      this.element.setAttribute('href', value);
    }
  }

  public handleChange(): void {
    const controller = CustomAttribute.for(this.element, 'goto')!.parent;
    const created = NavigationInstructionResolver.createViewportInstructions(this.router, this.value as any, { context: controller });
    const instructions = NavigationInstructionResolver.toViewportInstructions(this.router, created.instructions);
    for (const instruction of instructions) {
      if (instruction.scope === null) {
        instruction.scope = created.scope;
      }
    }
    // TODO: Use router configuration for class name and update target
    if (this.router.checkActive(instructions)) {
      this.element.classList.add(this.activeClass);
    } else {
      this.element.classList.remove(this.activeClass);
    }
  }
}
