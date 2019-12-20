import {
  bindable,
  INode,
  LifecycleFlags,
  customElement,
  CustomElement,
  ICompiledCustomElementController,
  ICustomElementViewModel,
  ICustomElementController,
  CustomElementDefinition,
  IDryCustomElementController,
  PartialCustomElementDefinitionParts,
  PartialCustomElementDefinition,
  IController,
  IHydratedController,
} from '@aurelia/runtime';
import { IRouter } from '../router';
import { IViewportScopeOptions, ViewportScope } from '../viewport-scope';
import { IContainer, Writable } from '@aurelia/kernel';

export const ParentViewportScope = CustomElement.createInjectable();

@customElement({
  name: 'au-viewport-scope',
  template: '<template></template>',
  containerless: true,
  injectable: ParentViewportScope
})
export class ViewportScopeCustomElement implements ICustomElementViewModel<Element> {
  @bindable public name: string = 'default';
  @bindable public catches: string = '';
  @bindable public collection: boolean = false;
  @bindable public source: unknown[] | null = null;
  public viewportScope: ViewportScope | null = null;

  public readonly $controller!: ICustomElementController<Element, this>;

  private readonly element: Element;

  private isBound: boolean = false;

  public constructor(
    @IRouter private readonly router: IRouter,
    @INode element: INode,
    @IContainer private container: IContainer,
    @ParentViewportScope private readonly parent: ViewportScopeCustomElement,
    @IController private readonly parentController: IHydratedController,
  ) {
    this.element = element as HTMLElement;
  }

  public create(
    controller: IDryCustomElementController<Element, this>,
    parentContainer: IContainer,
    definition: CustomElementDefinition,
    parts: PartialCustomElementDefinitionParts | undefined,
  ): PartialCustomElementDefinition {
    // TODO(fkleuver): describe this somewhere in the docs instead
    // Under the condition that there is no `replace` attribute on this custom element's declaration,
    // and this custom element is containerless, its content will be placed in a part named 'default'
    // See packages/jit-html/src/template-binder.ts line 411 (`replace = 'default';`) for the logic that governs this.

    // We could tidy this up into a formal api in the future. For now, there are two ways to do this:
    // 1. inject the `@ITargetedInstruction` (IHydrateElementInstruction) and grab .parts['default'] from there, manually creating a view factory from that, etc.
    // 2. what we're doing right here: grab the 'default' part from the create hook and return it as the definition, telling the render context to use that part to compile this element instead
    // This effectively causes this element to render its declared content as if it was its own template.

    // We do need to set `containerless` to true on the part definition so that the correct projector is used since parts default to non-containerless.
    // Otherwise, the controller will try to do `appendChild` on a comment node when it has to do `insertBefore`.

    // Also, in this particular scenario (specific to viewport-scope) we need to clone the part so as to prevent the resulting compiled definition
    // from ever being cached. That's the only reason why we're spreading the part into a new object for `getOrCreate`. If we didn't clone the object, this specific element wouldn't work correctly.

    const part = parts!['default'];
    return CustomElementDefinition.getOrCreate({ ...part, containerless: true });
  }

  public afterCompile(controller: ICompiledCustomElementController) {
    this.container = controller.context.get(IContainer);
    // console.log('ViewportScope creating', this.getAttribute('name', this.name), this.container, this.parent, controller, this);
    // this.connect();
  }
  public afterUnbound(): void {
    this.isBound = false;
  }

  public connect(): void {
    if (this.router.rootScope === null) {
      return;
    }
    const name: string = this.getAttribute('name', this.name) as string;
    const options: IViewportScopeOptions = {};
    let value: string | boolean | undefined = this.getAttribute('catches', this.catches);
    if (value !== void 0) {
      options.catches = value as string;
    }
    value = this.getAttribute('collection', this.collection, true);
    if (value !== void 0) {
      options.collection = value as boolean;
    }

    // TODO: Needs to be bound? How to solve?
    options.source = this.source || null;

    this.viewportScope = this.router.connectViewportScope(this.viewportScope, name, this.container, this.element, options);
  }
  public disconnect(): void {
    if (this.viewportScope) {
      this.router.disconnectViewportScope(this.viewportScope, this.container);
    }
    this.viewportScope = null;
  }

  public beforeBind(flags: LifecycleFlags): void {
    this.isBound = true;

    (this.$controller as Writable<ICustomElementController>).scope = this.parentController.scope!;

    this.connect();
    if (this.viewportScope !== null) {
      this.viewportScope.beforeBind();
    }
  }
  public async beforeUnbind(flags: LifecycleFlags): Promise<void> {
    if (this.viewportScope !== null) {
      this.viewportScope.beforeUnbind();
    }
    this.disconnect();
    return Promise.resolve();
  }

  private getAttribute(key: string, value: string | boolean, checkExists: boolean = false): string | boolean | undefined {
    const result: Record<string, string | boolean> = {};
    if (this.isBound) {
      return value;
    } else {
      if (this.element.hasAttribute(key)) {
        if (checkExists) {
          return true;
        } else {
          value = this.element.getAttribute(key) as string;
          if (value.length > 0) {
            return value;
          }
        }
      }
    }
    return void 0;
  }
}
