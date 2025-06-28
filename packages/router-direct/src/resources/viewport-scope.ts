/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import {
  INode,
  CustomElement,
  ICompiledCustomElementController,
  ICustomElementViewModel,
  ICustomElementController,
  IController,
  IHydratedController,
  ISyntheticView,
} from '@aurelia/runtime-html';
import { IContainer, Writable, resolve } from '@aurelia/kernel';
import { IRouter } from '../index';
import { ViewportScope, IViewportScopeOptions } from '../endpoints/viewport-scope';

const ParentViewportScope = CustomElement.createInjectable<ViewportScopeCustomElement>();

export class ViewportScopeCustomElement implements ICustomElementViewModel {
  public name: string = 'default';
  public catches: string = '';
  public collection: boolean = false;
  public source: unknown[] | null = null;
  public viewportScope: ViewportScope | null = null;

  public readonly $controller!: ICustomElementController<this>;

  public controller!: ICustomElementController;

  private isBound: boolean = false;

  private readonly router = resolve(IRouter);
  public readonly element = resolve(INode) as HTMLElement;
  public container = resolve(IContainer);
  private readonly parent = resolve(ParentViewportScope);
  private readonly parentController = resolve(IController) as IHydratedController;

  // Maybe this really should be here. Check with Binh.
  // public create(
  //   controller: IDryCustomElementController<this>,
  //   parentContainer: IContainer,
  //   definition: CustomElementDefinition,
  //   parts: PartialCustomElementDefinitionParts | undefined,
  // ): PartialCustomElementDefinition {
  //   // TODO(fkleuver): describe this somewhere in the docs instead
  //   // Under the condition that there is no `replace` attribute on this custom element's declaration,
  //   // and this custom element is containerless, its content will be placed in a part named 'default'
  //   // See packages/jit-html/src/template-binder.ts line 411 (`replace = 'default';`) for the logic that governs this.

  //   // We could tidy this up into a formal api in the future. For now, there are two ways to do this:
  //   // 1. inject the `@IInstruction` (IHydrateElementInstruction) and grab .parts['default'] from there, manually creating a view factory from that, etc.
  //   // 2. what we're doing right here: grab the 'default' part from the create hook and return it as the definition, telling the render context to use that part to compile this element instead
  //   // This effectively causes this element to render its declared content as if it was its own template.

  //   // We do need to set `containerless` to true on the part definition so that the correct projector is used since parts default to non-containerless.
  //   // Otherwise, the controller will try to do `appendChild` on a comment node when it has to do `insertBefore`.

  //   // Also, in this particular scenario (specific to viewport-scope) we need to clone the part so as to prevent the resulting compiled definition
  //   // from ever being cached. That's the only reason why we're spreading the part into a new object for `getOrCreate`. If we didn't clone the object, this specific element wouldn't work correctly.

  //   const part = parts!['default'];
  //   return CustomElementDefinition.getOrCreate({ ...part, containerless: true });
  // }

  public hydrated(controller: ICompiledCustomElementController): void {
    this.controller = controller as ICustomElementController;
  }
  public bound(_initiator: IHydratedController, _parent: ISyntheticView | ICustomElementController | null): void {
    this.isBound = true;

    (this.$controller as Writable<ICustomElementController>).scope = this.parentController.scope!;

    this.connect();
    if (this.viewportScope !== null) {
      this.viewportScope.binding();
    }
  }
  public unbinding(_initiator: IHydratedController, _parent: ISyntheticView | ICustomElementController | null): void | Promise<void> {
    if (this.viewportScope !== null) {
      this.viewportScope.unbinding();
    }
    return Promise.resolve();
  }

  public connect(): void {
    if (this.router.rootScope === null) {
      return;
    }
    const name = this.getAttribute('name', this.name) as string;
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
    options.source = this.source ?? null;

    this.viewportScope = this.router.connectEndpoint(this.viewportScope, 'ViewportScope', this, name, options) as ViewportScope;
  }
  public disconnect(): void {
    if (this.viewportScope) {
      this.router.disconnectEndpoint(null, this.viewportScope, this);
    }
    this.viewportScope = null;
  }

  private getAttribute(key: string, value: string | boolean, checkExists: boolean = false): string | boolean | undefined {
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
CustomElement.define({
  name: 'au-viewport-scope',
  template: '<template></template>',
  containerless: false,
  injectable: ParentViewportScope,
  bindables: ['name', 'catches', 'collection', 'source'],
}, ViewportScopeCustomElement);
