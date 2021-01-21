/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
/* eslint-disable no-fallthrough */
import { IContainer, Writable } from '@aurelia/kernel';
import { Controller, LifecycleFlags, IHydratedController, ICustomElementController, ICustomElementViewModel } from '@aurelia/runtime-html';
import { IRouteableComponent, RouteableComponentType, ReentryBehavior, LoadInstruction } from './interfaces.js';
import { parseQuery } from './utilities/parser.js';
import { Viewport } from './viewport.js';
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { Navigation } from './navigation.js';
import { IConnectedCustomElement } from './endpoints/endpoint.js';
import { Runner, Step } from './utilities/runner.js';
import { AwaitableMap } from './utilities/awaitable-map.js';
import { EndpointContent, RoutingScope } from './index.js';
import { IRouter } from './router.js';

/**
 * The viewport content encapsulates the component loaded into a viewport
 * and keeps track of the component's lifecycle and routing states.
 *
 * During a transition, a viewport has two viewport contents, the current
 * and the next, which is turned back into one when the transition is either
 * finalized or aborted.
 *
 * Viewport contents are used to represent the full component state
 * and can be used for caching.
 */

export type ContentState = 'created' | 'checkedUnload' | 'checkedLoad' | 'loaded' | 'activated';

/**
 * @internal - Shouldn't be used directly
 */
export class ViewportContent extends EndpointContent {
  public contentStates: AwaitableMap<ContentState, void> = new AwaitableMap();
  public fromCache: boolean = false;
  public fromHistory: boolean = false;
  public reentry: boolean = false;

  public constructor(
    public readonly router: IRouter,
    public viewport: Viewport,
    owningScope: RoutingScope | null,
    scope: boolean,
    // Can (and wants) be a (resolved) type or a string (to be resolved later)
    public instruction: RoutingInstruction = RoutingInstruction.create('') as RoutingInstruction,
    public navigation = Navigation.create({
      instruction: '',
      fullStateInstruction: '',
    }),
    connectedCE: IConnectedCustomElement | null = null
  ) {
    super(router, viewport, owningScope, scope, instruction);
    // If we've got a container, we're good to resolve type
    if (!this.instruction.component.isType() && (connectedCE?.container ?? null) !== null) {
      this.instruction.component.type = this.toComponentType(connectedCE!.container!);
    }
  }

  public get componentInstance(): IRouteableComponent | null {
    return this.instruction.component.instance;
  }
  public get viewportInstance(): Viewport | null {
    return this.instruction.viewport.instance;
  }

  public equalComponent(other: ViewportContent): boolean {
    return this.instruction.sameComponent(other.instruction);
  }

  public equalParameters(other: ViewportContent): boolean {
    return this.instruction.sameComponent(other.instruction, true) &&
      // TODO: Review whether query is relevant
      this.navigation.query === other.navigation.query;
  }

  public reentryBehavior(): ReentryBehavior {
    return (this.instruction.component.instance !== null &&
      'reentryBehavior' in this.instruction.component.instance &&
      this.instruction.component.instance.reentryBehavior !== void 0)
      ? this.instruction.component.instance.reentryBehavior
      : ReentryBehavior.default;
  }

  public isCacheEqual(other: ViewportContent): boolean {
    return this.instruction.sameComponent(other.instruction, true);
  }

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

  public createComponent(connectedCE: IConnectedCustomElement, fallback?: string): void {
    if (this.contentStates.has('created')) {
      return;
    }
    // Don't load cached content or instantiated history content
    if (!this.fromCache && !this.fromHistory) {
      try {
        this.instruction.component.instance = this.toComponentInstance(connectedCE.container);
      } catch (e) {
        if (fallback !== void 0) {
          this.instruction.parameters.set({ id: this.instruction.component.name });
          this.instruction.component.set(fallback);
          try {
            this.instruction.component.instance = this.toComponentInstance(connectedCE.container);
          } catch (ee) {
            throw new Error(`'${this.instruction.component.name}' did not match any configured route or registered component name - did you forget to add the component '${this.instruction.component.name}' to the dependencies or to register it as a global dependency?`);
          }
        } else {
          throw new Error(`'${this.instruction.component.name}' did not match any configured route or registered component name - did you forget to add the component '${this.instruction.component.name}' to the dependencies or to register it as a global dependency?`);
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
      (controller as Writable<typeof controller>).parent = connectedCE.controller; // CustomElement.for(connectedCE.element)!;
    }
  }

  public canLoad(viewport: Viewport, previousInstruction: Navigation): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]> {
    if (!this.contentStates.has('created') || (this.contentStates.has('checkedLoad') && !this.reentry)) {
      return true;
    }
    this.contentStates.set('checkedLoad', void 0);

    if (!this.instruction.component.instance) {
      return false;
    }

    if (!this.instruction.component.instance.canLoad) {
      return true;
    }

    const typeParameters = this.instruction.component.type ? this.instruction.component.type.parameters : null;
    this.navigation.parameters = this.instruction.parameters.toSpecifiedParameters(typeParameters);
    const merged = { ...parseQuery(this.navigation.query), ...this.navigation.parameters };
    const result = this.instruction.component.instance.canLoad(merged, this.viewport!, this.navigation, previousInstruction);
    if (typeof result === 'boolean') {
      return result;
    }
    if (typeof result === 'string') {
      return [RoutingInstruction.create(result, viewport)];
    }
    return result as Promise<RoutingInstruction[]>;
  }

  public canUnload(nextInstruction: Navigation | null): boolean | Promise<boolean> {
    if (!this.instruction.component.instance || !this.instruction.component.instance.canUnload || (this.contentStates.has('checkedUnload') && !this.reentry)) {
      return true;
    }
    this.contentStates.set('checkedUnload', void 0);

    if (!this.contentStates.has('loaded')) {
      return true;
    }

    const result = this.instruction.component.instance.canUnload(this.viewport!, nextInstruction, this.navigation);
    if (typeof result !== 'boolean') {
      // TODO(alpha): Fix error message
      // throw new Error('canUnload needs to return true or false!');
    }
    return result;
  }

  public load(step: Step<void>, previousInstruction: Navigation): Step<void> {
    return Runner.run(step,
      () => this.contentStates.await('checkedLoad'),
      () => {
        if (!this.contentStates.has('created') || (this.contentStates.has('loaded') && !this.reentry)) {
          return;
        }
        this.reentry = false;

        this.contentStates.set('loaded', void 0);
        if (this.instruction.component.instance && this.instruction.component.instance.load) {
          const typeParameters = this.instruction.component.type ? this.instruction.component.type.parameters : null;
          this.navigation.parameters = this.instruction.parameters.toSpecifiedParameters(typeParameters);
          const merged = { ...parseQuery(this.navigation.query), ...this.navigation.parameters };
          return this.instruction.component.instance.load(merged, this.viewport!, this.navigation, previousInstruction);
        }
      }
    ) as Step<void>;
  }
  public unload(nextInstruction: Navigation | null): void | Promise<void> {
    if (!this.contentStates.has('loaded')) {
      return;
    }
    this.contentStates.delete('loaded');
    if (this.instruction.component.instance?.unload != null) {
      return this.instruction.component.instance.unload(this.viewport!, nextInstruction, this.navigation);
    }
  }

  public activateComponent(step: Step<void>, viewport: Viewport, initiator: IHydratedController | null, parent: ICustomElementController | null, flags: LifecycleFlags, connectedCE: IConnectedCustomElement, parentActivated: boolean, boundCallback: any | undefined, attachPromise: void | Promise<void> | undefined): Step<void> {
    return Runner.run(step,
      () => this.contentStates.await('loaded'),
      () => this.waitForParent(parent, viewport), // TODO: It might be possible to refactor this away
      () => {
        if (this.contentStates.has('activated')) {
          return;
        }
        this.contentStates.set('activated', void 0);

        const contentController = this.contentController(connectedCE);
        return contentController.activate(initiator ?? contentController, parent, flags, void 0, void 0, boundCallback, this.instruction.topInstruction ? attachPromise : void 0);
      },
      /*
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

  public disposeComponent(connectedCE: IConnectedCustomElement, cache: ViewportContent[], stateful: boolean = false): void {
    if (!this.contentStates.has('created') || this.instruction.component.instance == null) {
      return;
    }

    // Don't unload components when stateful
    // TODO: We're missing stuff here
    if (!stateful) {
      this.contentStates.delete('created');
      const contentController = this.contentController(connectedCE);
      // if (contentController.state > 0) {
      return contentController.dispose();
      // }
    } else {
      cache.push(this);
    }
  }

  public freeContent(step: Step<void>, connectedCE: IConnectedCustomElement | null, nextInstruction: Navigation | null, cache: ViewportContent[], stateful: boolean = false): Step<void> {
    return Runner.run(step,
      () => this.unload(nextInstruction),
      () => this.deactivateComponent(null, connectedCE!.controller, LifecycleFlags.none, connectedCE!, stateful),
      () => this.disposeComponent(connectedCE!, cache, stateful),
    ) as Step<void>;
  }

  public toComponentName(): string | null {
    return this.instruction.component.name;
  }
  public toComponentType(container: IContainer): RouteableComponentType | null {
    if (this.instruction.component.none) {
      return null;
    }
    return this.instruction.component.toType(container);
  }
  public toComponentInstance(container: IContainer): IRouteableComponent | null {
    if (this.instruction.component.none) {
      return null;
    }
    return this.instruction.component.toInstance(container);
  }

  private waitForParent(parent: ICustomElementController | null, viewport: Viewport): void | Promise<void> {
    if (parent === null) {
      return;
    }
    if (!parent.isActive) {
      return new Promise((resolve) => {
        viewport.activeResolve = resolve;
      });
    }
  }
}
