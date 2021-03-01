import { IDisposable, IEventAggregator } from '@aurelia/kernel';
import { customAttribute, INode, bindable, BindingMode, ViewModelKind, ICustomAttributeViewModel, ICustomAttributeController, CustomAttribute } from '@aurelia/runtime-html';
import { IRouter, RouterNavigationEndEvent } from '../router.js';
import { LoadCustomAttribute, RouterConfiguration } from '../index.js';
import { ILinkHandler } from './link-handler.js';
import { RoutingInstruction } from '../instructions/routing-instruction.js';

@customAttribute({ name: 'href', noMultiBindings: true })
export class HrefCustomAttribute implements ICustomAttributeViewModel {
  @bindable({ mode: BindingMode.toView })
  public value: unknown;

  private eventListener: IDisposable | null = null;
  private isInitialized: boolean = false;
  private isEnabled: boolean;

  public readonly $controller!: ICustomAttributeController<this>;

  private routerNavigationSubscription?: IDisposable;
  private readonly activeClass: string = 'load-active';

  public constructor(
    @IEventTarget private readonly target: IEventTarget,
    @INode private readonly el: INode<HTMLElement>,
    @IRouter private readonly router: IRouter,
    @ILinkHandler private readonly linkHandler: ILinkHandler,
    @IEventAggregator private readonly ea: IEventAggregator,
  ) { }

  public binding(): void {
    if (RouterConfiguration.options.useHref && !this.hasLoad()) {
      this.element.addEventListener('click', this.linkHandler.handler);
      this.routerNavigationSubscription = this.ea.subscribe(RouterNavigationEndEvent.eventName, this.navigationEndHandler);
    }
  }
  public unbinding(): void {
    this.element.removeEventListener('click', this.linkHandler.handler);
    this.routerNavigationSubscription?.dispose();
  }

  public valueChanged(newValue: unknown): void {
    this.el.setAttribute('href', newValue as string);
  }

  private readonly onClick = (e: MouseEvent): void => {
    // Ensure this is an ordinary left-button click.
    if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey || e.button !== 0) {
      return;
    }

  private readonly navigationEndHandler = (_navigation: RouterNavigationEndEvent): void => {
    const controller = CustomAttribute.for(this.element, 'href')!.parent!;
    const created = this.router.applyLoadOptions(this.value as any, { context: controller });
    const instructions = RoutingInstruction.from(created.instructions);
    for (const instruction of instructions) {
      if (instruction.scope === null) {
        instruction.scope = created.scope;
      }
    }
    // TODO: Use router configuration for class name and update target
    if (this.router.checkActive(instructions, { context: controller })) {
      this.element.classList.add(this.activeClass);
    } else {
      this.element.classList.remove(this.activeClass);
    }
  };

  private hasLoad(): boolean {
    const parent = this.$controller.parent!;
    const siblings = parent.children;
    return siblings?.some(c => c.vmKind === ViewModelKind.customAttribute && c.viewModel instanceof LoadCustomAttribute) ?? false;
  }
}
