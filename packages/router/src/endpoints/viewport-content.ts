import { Constructable, IContainer } from '@aurelia/kernel';
import { LifecycleFlags, Controller, IHydratedController, ICustomElementController, ICustomElementViewModel, LifecycleHooksEntry } from '@aurelia/runtime-html';
import { ComponentAppellation, IRouteableComponent, RouteableComponentType, ReloadBehavior, LoadInstruction } from '../interfaces';
import { Viewport } from './viewport';
import { RoutingInstruction } from '../instructions/routing-instruction';
import { Navigation } from '../navigation';
import { IConnectedCustomElement } from './endpoint';
import { Runner, Step } from '../utilities/runner';
import { AwaitableMap } from '../utilities/awaitable-map';
import { EndpointContent, RoutingScope } from '../index';
import { IRouter } from '../router';
import { FoundRoute } from '../found-route';
import { FallbackAction } from '../router-options';

/**
 * The viewport content encapsulates the component loaded into a viewport
 * and keeps track of the component's lifecycle and routing states, meaning
 * that the callers don't have to query (internal) content state to know if
 * a "state method" can be called.
 *
 * During a transition, a viewport has two viewport contents, the current
 * and the next, which is turned back into one when the transition is either
 * finalized or aborted.
 *
 * Viewport contents are used to represent the full component state
 * and can be used for caching.
 */

/**
 * The content states for the viewport content content.
 */
export type ContentState = 'created' | 'checkedUnload' | 'checkedLoad' | 'loaded' | 'activating' | 'activated';

// This should really be an export from runtime-html/lifecycle-hooks
type FuncPropNames<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]: K extends 'constructor' ? never : Required<T>[K] extends Function ? K : never;
}[keyof T];

/**
 * @internal
 */
export class ViewportContent extends EndpointContent {
  /**
   * The current content states
   */
  public contentStates: AwaitableMap<ContentState, void> = new AwaitableMap();

  /**
   * Whether the viewport content is from the endpoint cache
   */
  public fromCache: boolean = false;

  /**
   * Whether the viewport content is from the history cache
   */
  public fromHistory: boolean = false;

  /**
   * Whether content is currently being reloaded
   */
  public reload: boolean = false;

  /**
   * Resolved when content is activated (and can be deactivated)
   */
  public activatedResolve?: ((value?: void | PromiseLike<void>) => void) | null = null;

  public constructor(
    public readonly router: IRouter,

    /**
     * The viewport the viewport content belongs to
     */
    viewport: Viewport,

    /**
     * The routing scope the viewport content belongs to/is owned by
     */
    owningScope: RoutingScope | null,

    /**
     * Whether the viewport has its own routing scope, containing
     * endpoints it owns
     */
    hasScope: boolean,

    /**
     * The routing instruction that created the viewport content
     */
    public instruction: RoutingInstruction = RoutingInstruction.create('') as RoutingInstruction,

    /**
     * The navigation that created the viewport content
     */
    public navigation = Navigation.create({
      instruction: '',
      fullStateInstruction: '',
    }),

    /**
     * The connected viewport custom element
     */
    connectedCE: IConnectedCustomElement | null = null
  ) {
    super(router, viewport, owningScope, hasScope, instruction, navigation);
    // If we've got a container, we're good to resolve type
    if (!this.instruction.component.isType() && connectedCE?.container != null) {
      this.instruction.component.type = this.toComponentType(connectedCE!.container!);
    }
  }

  /**
   * The viewport content's component instance
   */
  public get componentInstance(): IRouteableComponent | null {
    return this.instruction.component.instance;
  }

  /**
   * The viewport content's reload behavior, as in how it behaves
   * when the content is loaded again.
   */
  public get reloadBehavior(): ReloadBehavior {
    if (this.instruction.route instanceof FoundRoute
      && this.instruction.route.match?.reloadBehavior !== null
    ) {
      return this.instruction.route.match?.reloadBehavior as ReloadBehavior;
    }
    return (this.instruction.component.instance !== null &&
      'reloadBehavior' in this.instruction.component.instance &&
      this.instruction.component.instance.reloadBehavior !== void 0)
      ? this.instruction.component.instance.reloadBehavior
      : ReloadBehavior.default;
  }

  /**
   * Get the controller of the component in the viewport content.
   */
  public get controller(): ICustomElementController | undefined {
    return this.instruction.component.instance?.$controller;
  }

  /**
   * Whether the viewport content's component is equal to that of
   * another viewport content.
   *
   * @param other - The viewport content to compare with
   */
  public equalComponent(other: ViewportContent): boolean {
    return this.instruction.sameComponent(this.router, other.instruction);
  }

  /**
   * Whether the viewport content's parameters is equal to that of
   * another viewport content.
   *
   * @param other - The viewport content to compare with
   */
  public equalParameters(other: ViewportContent): boolean {
    return this.instruction.sameComponent(this.router, other.instruction, true) &&
      // TODO: Review whether query is enough or if parameters need
      // to be checked as well depending on when query is updated.
      // Should probably be able to compare parameters vs query as well.
      (this.navigation.query ?? '') === (other.navigation.query ?? '');
  }

  /**
   * Whether the viewport content is equal from a caching perspective to
   * that of another viewport content.
   *
   * @param other - The viewport content to compare with
   */
  public isCacheEqual(other: ViewportContent): boolean {
    return this.instruction.sameComponent(this.router, other.instruction, true);
  }

  /**
   * Get the controller of the component in the viewport content.
   *
   * @param connectedCE - The custom element connected to the viewport
   */
  public contentController(connectedCE: IConnectedCustomElement): ICustomElementController {
    return Controller.$el(
      connectedCE.container.createChild(),
      this.instruction.component.instance as ICustomElementViewModel,
      connectedCE.element,
      null,
    );
  }

  /**
   * Create the component for the viewport content (based on the instruction)
   *
   * @param connectedCE - The custom element connected to the viewport
   * @param fallback - A (possible) fallback component to create if the
   * instruction component can't be created. The name of the failing
   * component is passed as parameter `id` to the fallback component
   * @param fallbackAction - Whether the children of an unloadable component
   * will be processed under the fallback component or if the child
   * instructions will be aborted.
   */
  public createComponent(connectedCE: IConnectedCustomElement, fallback?: ComponentAppellation, fallbackAction?: FallbackAction): void {
    // Can be called at multiple times, only process the first
    if (this.contentStates.has('created')) {
      return;
    }
    // Don't load cached content or instantiated history content
    if (!this.fromCache && !this.fromHistory) {
      try {
        this.instruction.component.set(this.toComponentInstance(connectedCE.container, connectedCE.controller, connectedCE.element));
      } catch (e) {
        // TODO: Improve this by extracting the existance check separately
        if (!(e as Error).message.startsWith('AUR0009:')) {
          throw e;
        }
        if (__DEV__) {
          console.warn(`'${this.instruction.component.name as string}' did not match any configured route or registered component name - did you forget to add the component '${this.instruction.component.name}' to the dependencies or to register it as a global dependency?`);
        }

        // If there's a fallback component...
        if ((fallback ?? '') !== '') {
          if (fallbackAction === 'process-children') {
            // ...set the failed component as the first parameter (0)...
            this.instruction.parameters.set([this.instruction.component.name]);
          } else { // 'abort'
            // ...set the unparsed string of the failed component as the first parameter (0)...
            this.instruction.parameters.set([this.instruction.unparsed ?? this.instruction.component.name]);
            // ...prevent processing of child instructions...
            this.instruction.nextScopeInstructions = null;
          }
          // ...fallback is the new component...
          this.instruction.component.set(fallback);

          try {
            // ...and try again.
            this.instruction.component.set(this.toComponentInstance(connectedCE.container, connectedCE.controller, connectedCE.element));
          } catch (ee) {
            if (!(ee as Error).message.startsWith('AUR0009:')) {
              throw ee;
            }
            throw new Error(`'${this.instruction.component.name as string}' did not match any configured route or registered component name - did you forget to add the component '${this.instruction.component.name}' to the dependencies or to register it as a global dependency?`);
          }
        } else {
          throw new Error(`'${this.instruction.component.name as string}' did not match any configured route or registered component name - did you forget to add the component '${this.instruction.component.name}' to the dependencies or to register it as a global dependency?`);
        }
      }
    }
    this.contentStates.set('created', void 0);
  }

  /**
   * Check if the viewport content's component can be loaded.
   */
  public canLoad(): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]> {
    // Since canLoad is called from more than one place multiple calls can happen (and is fine)
    if (!this.contentStates.has('created') || (this.contentStates.has('checkedLoad') && !this.reload)) {
      // If we got here, an earlier check has already stated it can be loaded
      return true;
    }
    const instance = this.instruction.component.instance!;
    if (instance == null) {
      return true;
    }

    this.contentStates.set('checkedLoad', void 0);

    // Propagate parent parameters
    // TODO: Do we really want this?
    const parentParameters = (this.endpoint as Viewport)
      .parentViewport?.getTimeContent(this.navigation.timestamp)?.instruction?.typeParameters(this.router);
    const parameters = this.instruction.typeParameters(this.router);
    const merged = { ...this.navigation.parameters, ...parentParameters, ...parameters };

    const hooks = this.getLifecycleHooks(instance, 'canLoad').map(hook => ((innerStep: Step) => {
      const result = hook(instance, merged, this.instruction, this.navigation);
      if (typeof result === 'boolean') {
        if (result === false) {
          innerStep.exit();
        }
        return result;
      }
      if (typeof result === 'string') {
        innerStep.exit();
        return result;
      }
      return result as Promise<RoutingInstruction[]>;
    }));

    if (hooks.length !== 0) {
      const hooksResult = Runner.run(null, ...hooks);

      if (hooksResult !== true) {
        if (hooksResult === false) {
          return false;
        }
        if (typeof hooksResult === 'string') {
          return hooksResult;
        }
        return hooksResult as Promise<RoutingInstruction[]>;
      }
    }

    // No hook for component, we can load
    if (instance.canLoad == null) {
      return true;
    }

    const result = instance.canLoad(merged, this.instruction, this.navigation);
    if (typeof result === 'boolean' || typeof result === 'string') {
      return result;
    }
    return result as Promise<RoutingInstruction[]>;
  }

  /**
   * Check if the viewport content's component can be unloaded.
   *
   * @param navigation - The navigation that causes the content change
   */
  public canUnload(navigation: Navigation | null): boolean | Promise<boolean> {
    // Since canUnload is called recursively multiple calls can happen (and is fine)
    if (this.contentStates.has('checkedUnload') && !this.reload) {
      // If we got here, an earlier check has already stated it can be unloaded
      return true;
    }
    this.contentStates.set('checkedUnload', void 0);

    // If content hasn't loaded a component, we're done
    if (!this.contentStates.has('loaded')) {
      return true;
    }

    const instance = this.instruction.component.instance!;

    // If it's an unload without a navigation, such as custom element simply
    // being removed, create an empty navigation for canUnload hook
    if (navigation === null) {
      navigation = Navigation.create({
        instruction: '',
        fullStateInstruction: '',
        previous: this.navigation,
      });
    }

    const hooks = this.getLifecycleHooks(instance, 'canUnload').map(hook => ((innerStep: Step) => {
      const result = hook(instance, this.instruction, navigation);
      if (typeof result === 'boolean') {
        if (result === false) {
          innerStep.exit();
        }
        return result;
      }
      return result as Promise<boolean>;
    }));

    if (hooks.length !== 0) {
      const hooksResult = Runner.run(null, ...hooks);

      if (hooksResult !== true) {
        if (hooksResult === false) {
          return false;
        }
        return hooksResult as Promise<boolean>;
      }
    }

    // No hook in component, we can unload
    if (!instance.canUnload) {
      return true;
    }

    const result = instance.canUnload(this.instruction, navigation);
    if (typeof result !== 'boolean' && !(result instanceof Promise)) {
      throw new Error(`Method 'canUnload' in component "${this.instruction.component.name}" needs to return true or false or a Promise resolving to true or false.`);
    }
    return result;
  }

  /**
   * Load the viewport content's content.
   *
   * @param step - The previous step in this transition Run
   */
  public load(step: Step<void>): Step<void> {
    return Runner.run(step,
      () => this.contentStates.await('checkedLoad'),
      () => {
        // Since load is called from more than one place multiple calls can happen (and is fine)
        if (!this.contentStates.has('created') || (this.contentStates.has('loaded') && !this.reload)) {
          // If we got here, it's already loaded
          return;
        }
        this.reload = false;

        this.contentStates.set('loaded', void 0);

        const instance = this.instruction.component.instance!;

        // Propagate parent parameters
        // TODO: Do we really want this?
        const parentParameters = (this.endpoint as Viewport)
          .parentViewport?.getTimeContent(this.navigation.timestamp)?.instruction?.typeParameters(this.router);
        const parameters = this.instruction.typeParameters(this.router);
        const merged = { ...this.navigation.parameters, ...parentParameters, ...parameters };

        const hooks = this.getLifecycleHooks(instance, 'loading').map(hook =>
          () => hook(instance, merged, this.instruction, this.navigation));

        hooks.push(...this.getLifecycleHooks(instance, 'load').map(hook =>
          () => {
            console.warn(`[Deprecated] Found deprecated hook name "load" in ${this.instruction.component.name}. Please use the new name "loading" instead.`);
            return hook(instance, merged, this.instruction, this.navigation);
          }));

        if (hooks.length !== 0) {
          // Add hook in component
          if (instance.loading != null) {
            hooks.push(() => instance.loading!(merged, this.instruction, this.navigation));
          }
          if ((instance as any).load != null) {
            console.warn(`[Deprecated] Found deprecated hook name "load" in ${this.instruction.component.name}. Please use the new name "loading" instead.`);
            hooks.push(() => (instance as any).load!(merged, this.instruction, this.navigation));
          }

          return Runner.run(null, ...hooks);
        }

        // Skip if there's no hook in component
        if (instance.loading != null) {
          return instance.loading(merged, this.instruction, this.navigation);
        }
        // Skip if there's no hook in component
        if ((instance as any).load != null) {
          console.warn(`[Deprecated] Found deprecated hook name "load" in ${this.instruction.component.name}. Please use the new name "loading" instead.`);
          return (instance as any).load(merged, this.instruction, this.navigation);
        }
      }
    ) as Step<void>;
  }

  /**
   * Unload the viewport content's content.
   *
   * @param navigation - The navigation that causes the content change
   */
  public unload(navigation: Navigation | null): void | Promise<void> {
    // Since load is called from more than one place multiple calls can happen (and is fine)
    if (!this.contentStates.has('loaded')) {
      // If we got here, it's already unloaded (or wasn't loaded in the first place)
      return;
    }
    this.contentStates.delete('loaded');

    const instance = this.instruction.component.instance!;

    if (navigation === null) {
      navigation = Navigation.create({
        instruction: '',
        fullStateInstruction: '',
        previous: this.navigation,
      });
    }

    const hooks = this.getLifecycleHooks(instance, 'unloading').map(hook =>
      () => hook(instance, this.instruction, navigation));

    hooks.push(...this.getLifecycleHooks(instance, 'unload').map(hook =>
      () => {
        console.warn(`[Deprecated] Found deprecated hook name "unload" in ${this.instruction.component.name}. Please use the new name "unloading" instead.`);
        return hook(instance, this.instruction, navigation);
      }));

    if (hooks.length !== 0) {
      // Add hook in component
      if (instance.unloading != null) {
        hooks.push(() => instance.unloading!(this.instruction, navigation));
      }
      if ((instance as any).unload != null) {
        console.warn(`[Deprecated] Found deprecated hook name "unload" in ${this.instruction.component.name}. Please use the new name "unloading" instead.`);
        hooks.push(() => (instance as any).unload!(this.instruction, navigation));
      }

      return Runner.run(null, ...hooks) as void | Promise<void>;
    }

    // Skip if there's no hook in component
    if (instance.unloading != null) {
      return instance.unloading(this.instruction, navigation);
    }
    if ((instance as any).unload != null) {
      console.warn(`[Deprecated] Found deprecated hook name "unload" in ${this.instruction.component.name}. Please use the new name "unloading" instead.`);
      return (instance as any).unload(this.instruction, navigation);
    }
  }

  /**
   * Activate (bind and attach) the content's component.
   *
   * @param step - The previous step in this transition Run
   * @param initiator - The controller initiating the activation
   * @param parent - The parent controller for the content's component controller
   * @param flags - The lifecycle flags
   * @param connectedCE - The viewport's connectd custom element
   * @param boundCallback - A callback that's called when the content's component has been bound
   * @param attachPromise - A promise that th content's component controller will await before attaching
   */
  public activateComponent(step: Step<void>, initiator: IHydratedController | null, parent: ICustomElementController | null, flags: LifecycleFlags, connectedCE: IConnectedCustomElement, boundCallback: any | undefined, attachPromise: void | Promise<void> | undefined): Step<void> {
    return Runner.run(step,
      () => this.contentStates.await('loaded'),
      () => this.waitForParent(parent), // TODO: It might be possible to refactor this away
      () => {
        if (this.contentStates.has('activating') || this.contentStates.has('activated')) {
          return;
        }
        this.contentStates.set('activating', void 0);

        return this.controller?.activate(
          initiator ?? this.controller,
          parent,
          flags,
          void 0 /* , boundCallback, this.instruction.topInstruction ? attachPromise : void 0 */) as Promise<void>;
      },
      () => {
        this.contentStates.set('activated', void 0);
      },
      /* TODO: This should be added back in somehow/somewhere
      () => {
        if (this.fromCache || this.fromHistory) {
          const elements = Array.from(connectedCE.element.getElementsByTagName('*'));
          for (const el of elements) {
            const attr = el.getAttribute('au-element-scroll');
            if (attr) {
              const [top, left] = attr.split(',');
              el.removeAttribute('au-element-scroll');
              el.scrollTo(+left, +top);
            }
          }
        }
      },
    */
    ) as Step<void>;
  }

  /**
   * Deactivate (detach and unbind) the content's component.
   *
   * @param step - The previous step in this transition Run
   * @param initiator - The controller initiating the activation
   * @param parent - The parent controller for the content's component controller
   * @param flags - The lifecycle flags
   * @param connectedCE - The viewport's connectd custom element
   * @param stateful - Whether the content's component is stateful and shouldn't be disposed
   */
  public deactivateComponent(step: Step<void> | null, initiator: IHydratedController | null, parent: ICustomElementController | null, flags: LifecycleFlags, connectedCE: IConnectedCustomElement, stateful: boolean = false): void | Promise<void> | Step<void> {
    if (!this.contentStates.has('activated') && !this.contentStates.has('activating')) {
      return;
    }
    return Runner.run(step,
      // TODO: Revisit once it's possible to abort within lifecycle hooks
      // () => {
      //   if (!this.contentStates.has('activated')) {
      //     const elements = Array.from(connectedCE.element.children);
      //     for (const el of elements) {
      //       (el as HTMLElement).style.display = 'none';
      //     }
      //     return this.contentStates.await('activated');
      //   }
      // },
      // () => this.waitForActivated(this.controller, connectedCE),
      () => {
        if (stateful && connectedCE.element !== null) {
          const elements = Array.from(connectedCE.element.getElementsByTagName('*'));
          for (const el of elements) {
            if (el.scrollTop > 0 || el.scrollLeft) {
              el.setAttribute('au-element-scroll', `${el.scrollTop},${el.scrollLeft}`);
            }
          }
        }

        this.contentStates.delete('activated');
        this.contentStates.delete('activating');
        return this.controller?.deactivate(initiator ?? this.controller, parent, flags);
      }
    ) as Step<void>;
  }

  /**
   * Dispose the content's component.
   *
   * @param connectedCE - The viewport's connectd custom element
   * @param cache - The cache to push the viewport content to if stateful
   * @param stateful - Whether the content's component is stateful and shouldn't be disposed
   */
  public disposeComponent(connectedCE: IConnectedCustomElement, cache: ViewportContent[], stateful: boolean = false): void {
    if (!this.contentStates.has('created') || this.instruction.component.instance == null) {
      return;
    }

    // Don't unload components when stateful
    // TODO: We're missing stuff here
    if (!stateful) {
      this.contentStates.delete('created');
      return this.controller?.dispose();
    } else {
      cache.push(this);
    }
  }

  /**
   * Free the content's content.
   *
   * @param step - The previous step in this transition Run
   * @param connectedCE - The viewport's connectd custom element
   * @param navigation - The navigation causing the content to be freed
   * @param cache - The cache to push the viewport content to if stateful
   * @param stateful - Whether the content's component is stateful and shouldn't be disposed
   */
  public freeContent(step: Step<void>, connectedCE: IConnectedCustomElement | null, navigation: Navigation | null, cache: ViewportContent[], stateful: boolean = false): Step<void> {
    return Runner.run(step,
      () => this.unload(navigation),
      (innerStep: Step<void>) => this.deactivateComponent(innerStep, null, connectedCE!.controller, LifecycleFlags.none, connectedCE!, stateful),
      () => this.disposeComponent(connectedCE!, cache, stateful),
    ) as Step<void>;
  }

  /**
   * Get the content's component name (if any).
   */
  public toComponentName(): string | null {
    return this.instruction.component.name;
  }

  /**
   * Get the content's component type (if any).
   */
  public toComponentType(container: IContainer): RouteableComponentType | null {
    if (this.instruction.component.none) {
      return null;
    }
    return this.instruction.component.toType(container, this.instruction);
  }

  /**
   * Get the content's component instance (if any).
   */
  public toComponentInstance(parentContainer: IContainer, parentController: IHydratedController, parentElement: HTMLElement): IRouteableComponent | null {
    if (this.instruction.component.none) {
      return null;
    }
    return this.instruction.component.toInstance(parentContainer, parentController, parentElement, this.instruction);
  }

  /**
   * Wait for the viewport's parent to be active.
   *
   * @param parent - The parent controller to the viewport's controller
   */
  private waitForParent(parent: ICustomElementController | null): void | Promise<void> {
    if (parent === null) {
      return;
    }
    if (!parent.isActive) {
      return new Promise((resolve) => {
        (this.endpoint as Viewport).activeResolve = resolve;
      });
    }
  }

  // TODO: Move this elsewhere and fix the typings
  private getLifecycleHooks(instance: IRouteableComponent, name: string): any[] {
    const hooks = (instance.$controller!.lifecycleHooks[name as FuncPropNames<Constructable>] ?? []) as LifecycleHooksEntry[];
    return hooks.map(hook => (hook.instance[name as FuncPropNames<Constructable>] as VoidFunction).bind(hook.instance));
  }
}
