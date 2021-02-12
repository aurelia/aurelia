/* eslint-disable no-fallthrough */
import { IContainer, Writable } from '@aurelia/kernel';
import { Controller, LifecycleFlags, IHydratedController, ICustomElementController, ICustomElementViewModel } from '@aurelia/runtime-html';
import { IRouteableComponent, RouteableComponentType, ReentryBehavior, LoadInstruction } from '../interfaces.js';
import { parseQuery } from '../utilities/parser.js';
import { Viewport } from './viewport.js';
import { RoutingInstruction } from '../instructions/routing-instruction.js';
import { Navigation } from '../navigation.js';
import { IConnectedCustomElement } from './endpoint.js';
import { Runner, Step } from '../utilities/runner.js';
import { AwaitableMap } from '../utilities/awaitable-map.js';
import { EndpointContent, RoutingScope } from '../index.js';
import { IRouter } from '../router.js';

/**
 * The viewport content encapsulates the component loaded into a viewport
 * and keeps track of the component's lifecycle and routing states, meaning
 * that the callers don't have to query (internal) component state to know if
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
export type ContentState = 'created' | 'checkedUnload' | 'checkedLoad' | 'loaded' | 'activated';

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
   * Whether content is currently being re-entered/reloaded
   */
  public reentry: boolean = false;

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
    // Can (and wants) be a (resolved) type or a string (to be resolved later)
    public instruction: RoutingInstruction = RoutingInstruction.create('') as RoutingInstruction,
    public navigation = Navigation.create({
      instruction: '',
      fullStateInstruction: '',
    }),
    connectedCE: IConnectedCustomElement | null = null
  ) {
    super(router, viewport, owningScope, hasScope, instruction);
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
   * The viewport content's reentry behavior, as in how it behaves
   * when the content is navigated to again
   */
  public get reentryBehavior(): ReentryBehavior {
    return (this.instruction.component.instance !== null &&
      'reentryBehavior' in this.instruction.component.instance &&
      this.instruction.component.instance.reentryBehavior !== void 0)
      ? this.instruction.component.instance.reentryBehavior
      : ReentryBehavior.default;
  }

  /**
   * Whether the viewport content's component is equal to that of
   * another viewport content.
   *
   * @param other - The viewport content to compare with
   */
  public equalComponent(other: ViewportContent): boolean {
    return this.instruction.sameComponent(other.instruction);
  }

  /**
   * Whether the viewport content's parameters is equal to that of
   * another viewport content.
   *
   * @param other - The viewport content to compare with
   */
  public equalParameters(other: ViewportContent): boolean {
    return this.instruction.sameComponent(other.instruction, true) &&
      // TODO: Review whether query is relevant (probably not
      // since it should already be a part of the parameters)
      this.navigation.query === other.navigation.query;
  }

  /**
   * Whether the viewport content is equal from a caching perspective to
   * that of another viewport content.
   *
   * @param other - The viewport content to compare with
   */
  public isCacheEqual(other: ViewportContent): boolean {
    return this.instruction.sameComponent(other.instruction, true);
  }

  /**
   * Get the controller of the component in the viewport content.
   *
   * @param connectedCE - The custom element connected to the viewport
   */
  public contentController(connectedCE: IConnectedCustomElement): ICustomElementController {
    return Controller.forCustomElement(
      null,
      connectedCE.container,
      this.instruction.component.instance as ICustomElementViewModel,
      connectedCE.element,
      null,
      void 0,
    );
  }

  /**
   * Create the component for the viewport content (based on the instruction)
   *
   * @param connectedCE - The custom element connected to the viewport
   * @param fallback - A (possible) fallback component to create if the
   * instruction component can't be created. The name of the failing
   * component is passed as parameter `id` to the fallback component
   */
  public createComponent(connectedCE: IConnectedCustomElement, fallback?: string): void {
    // Can be called at multiple times, only process the first
    if (this.contentStates.has('created')) {
      return;
    }
    // Don't load cached content or instantiated history content
    if (!this.fromCache && !this.fromHistory) {
      try {
        this.instruction.component.set(this.toComponentInstance(connectedCE.container));
      } catch (e) {
        // If there's a fallback component...
        if (fallback !== void 0) {
          // ...set the failed component as parameter `id`...
          this.instruction.parameters.set({ id: this.instruction.component.name });
          // ...fallback is component...
          this.instruction.component.set(fallback);
          try {
            // ...and try again.
            this.instruction.component.set(this.toComponentInstance(connectedCE.container));
          } catch (ee) {
            throw new Error(`'${this.instruction.component.name as string}' did not match any configured route or registered component name - did you forget to add the component '${this.instruction.component.name}' to the dependencies or to register it as a global dependency?`);
          }
        } else {
          throw new Error(`'${this.instruction.component.name as string}' did not match any configured route or registered component name - did you forget to add the component '${this.instruction.component.name}' to the dependencies or to register it as a global dependency?`);
        }
      }
    }
    this.contentStates.set('created', void 0);

    if (this.contentStates.has('loaded') || !this.instruction.component.instance) {
      return;
    }

    // Don't load cached content or instantiated history content
    if (!this.fromCache || !this.fromHistory) {
      const controller = this.contentController(connectedCE);
      // TODO: Don't think I need to do this. Ask Fred.
      (controller as Writable<typeof controller>).parent = connectedCE.controller; // CustomElement.for(connectedCE.element)!;
    }
  }

  /**
   * Check if the viewport content's component can be loaded.
   */
  public canLoad(): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]> {
    // Since canLoad is called from more than one place multiple calls can happen (and is fine)
    if (!this.contentStates.has('created') || (this.contentStates.has('checkedLoad') && !this.reentry)) {
      // If we got here, an earlier check has already stated it can be loaded
      return true;
    }
    this.contentStates.set('checkedLoad', void 0);

    // No hook in component, we can unload
    if (this.instruction.component.instance!.canLoad == null) {
      return true;
    }

    // TODO(alpha): Review this according to params -> instruction -> navigation!
    const typeParameters = this.instruction.component.type?.parameters ?? null;
    this.navigation.parameters = this.instruction.parameters.toSpecifiedParameters(typeParameters);
    const merged = { ...parseQuery(this.navigation.query), ...this.navigation.parameters };
    const result = this.instruction.component.instance!.canLoad(merged, this.instruction, this.navigation);
    if (typeof result === 'boolean') {
      return result;
    }
    if (typeof result === 'string') {
      return [RoutingInstruction.create(result, this.endpoint as Viewport)];
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
    if (this.contentStates.has('checkedUnload') && !this.reentry) {
      // If we got here, an earlier check has already stated it can be unloaded
      return true;
    }
    this.contentStates.set('checkedUnload', void 0);

    // If content hasn't loaded a component, we're done
    if (!this.contentStates.has('loaded')) {
      return true;
    }

    // No hook in component, we can unload
    if (!this.instruction.component.instance!.canUnload) {
      return true;
    }

    // If it's an unload without a navigation, such as custom element simply
    // being removed, create an empty navigation for canUnload hook
    if (navigation === null) {
      navigation = Navigation.create({
        instruction: '',
        fullStateInstruction: '',
        previous: this.navigation,
      });
    }
    const result = this.instruction.component.instance!.canUnload(this.instruction, navigation);
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
        if (!this.contentStates.has('created') || (this.contentStates.has('loaded') && !this.reentry)) {
          // If we got here, it's already loaded
          return;
        }
        this.reentry = false;

        this.contentStates.set('loaded', void 0);

        // Skip if there's no hook in component
        if (this.instruction.component.instance?.load != null) {
          // TODO(alpha): Review this according to params -> instruction -> navigation!
          const typeParameters = this.instruction.component.type ? this.instruction.component.type.parameters : null;
          this.navigation.parameters = this.instruction.parameters.toSpecifiedParameters(typeParameters);
          const merged = { ...parseQuery(this.navigation.query), ...this.navigation.parameters };
          return this.instruction.component.instance.load(merged, this.instruction, this.navigation);
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

    // Skip if there's no hook in component
    if (this.instruction.component.instance?.unload != null) {
      if (navigation === null) {
        navigation = Navigation.create({
          instruction: '',
          fullStateInstruction: '',
          previous: this.navigation,
        });
      }
      return this.instruction.component.instance.unload(this.instruction, navigation);
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
        if (this.contentStates.has('activated')) {
          return;
        }
        this.contentStates.set('activated', void 0);

        const contentController = this.contentController(connectedCE);
        return contentController.activate(initiator ?? contentController, parent, flags, void 0, void 0, boundCallback, this.instruction.topInstruction ? attachPromise : void 0);
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
   * @param initiator - The controller initiating the activation
   * @param parent - The parent controller for the content's component controller
   * @param flags - The lifecycle flags
   * @param connectedCE - The viewport's connectd custom element
   * @param stateful - Whether the content's component is stateful and shouldn't be disposed
   */
  public deactivateComponent(initiator: IHydratedController | null, parent: ICustomElementController | null, flags: LifecycleFlags, connectedCE: IConnectedCustomElement, stateful: boolean = false): void | Promise<void> {
    if (!this.contentStates.has('activated')) {
      return;
    }
    this.contentStates.delete('activated');

    if (stateful && connectedCE.element !== null) {
      const elements = Array.from(connectedCE.element.getElementsByTagName('*'));
      for (const el of elements) {
        if (el.scrollTop > 0 || el.scrollLeft) {
          el.setAttribute('au-element-scroll', `${el.scrollTop},${el.scrollLeft}`);
        }
      }
    }

    const contentController = this.contentController(connectedCE);
    return contentController.deactivate(initiator ?? contentController, parent, flags);
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
      const contentController = this.contentController(connectedCE);
      return contentController.dispose();
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
      () => this.deactivateComponent(null, connectedCE!.controller, LifecycleFlags.none, connectedCE!, stateful),
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
    return this.instruction.component.toType(container);
  }

  /**
   * Get the content's component instance (if any).
   */
  public toComponentInstance(container: IContainer): IRouteableComponent | null {
    if (this.instruction.component.none) {
      return null;
    }
    return this.instruction.component.toInstance(container);
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
}
