import { IContainer } from '@aurelia/kernel';
import { IController, IRenderContext } from '@aurelia/runtime';
import { IRouter } from './router';
import { IViewportOptions, Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';

export interface IFindViewportsResult {
  viewportInstructions: ViewportInstruction[];
  viewportsRemaining: boolean;
}

export type ChildContainer = IContainer & { parent?: ChildContainer };

export class Scope {
  public viewport: Viewport | null = null;

  public children: Scope[] = [];
  public viewports: Viewport[] = [];

  private viewportInstructions: ViewportInstruction[] | null = null;
  private availableViewports: Record<string, Viewport | null> | null = null;

  constructor(
    private readonly router: IRouter,
    public element: Element | null,
    public context: IRenderContext | IContainer | null,
    public parent: Scope | null,
  ) {
    if (this.parent) {
      this.parent.addChild(this);
    }
  }

  public getEnabledViewports(): Record<string, Viewport> {
    return this.viewports.filter((viewport) => viewport.enabled).reduce(
      (viewports: Record<string, Viewport>, viewport) => {
        viewports[viewport.name] = viewport;
        return viewports;
      },
      {});
  }

  public findViewports(viewportInstructions?: ViewportInstruction[], withoutViewports: boolean = false): IFindViewportsResult {
    const instructions: ViewportInstruction[] = [];
    let viewportsRemaining: boolean = false;

    // Get a shallow copy of all available viewports (clean if it's the first find)
    if (viewportInstructions) {
      this.availableViewports = {};
      this.viewportInstructions = viewportInstructions.slice();
    } else if (!this.viewportInstructions) {
      this.viewportInstructions = [];
    }
    this.availableViewports = { ...this.getEnabledViewports(), ...this.availableViewports };

    // Configured viewport is ruling
    for (let i = 0; i < this.viewportInstructions.length; i++) {
      const instruction = this.viewportInstructions[i];
      instruction.needsViewportDescribed = true;
      for (const name in this.availableViewports) {
        const viewport: Viewport | null = this.availableViewports[name];
        // TODO: Also check if (resolved) component wants a specific viewport
        if (viewport && viewport.wantComponent(instruction.componentName as string)) {
          instruction.needsViewportDescribed = false;
          const found = this.foundViewport(instruction, viewport, withoutViewports);
          instructions.push(...found.viewportInstructions);
          viewportsRemaining = viewportsRemaining || found.viewportsRemaining;
          this.availableViewports[name] = null;
          this.viewportInstructions.splice(i--, 1);
          break;
        }
      }
    }

    // Next in line is specified viewport (but not if we're ignoring viewports)
    if (!withoutViewports) {
      for (let i = 0; i < this.viewportInstructions.length; i++) {
        const instruction = this.viewportInstructions[i];
        const name = instruction.viewportName;
        if (!name || !name.length) {
          continue;
        }
        const newScope = instruction.ownsScope;
        if (!this.getEnabledViewports()[name]) {
          this.addViewport(name, null, null, { scope: newScope, forceDescription: true });
          this.availableViewports[name] = this.getEnabledViewports()[name];
        }
        const viewport = this.availableViewports[name];
        if (viewport && viewport.acceptComponent(instruction.componentName as string)) {
          instruction.needsViewportDescribed = false;
          const found = this.foundViewport(instruction, viewport, withoutViewports);
          instructions.push(...found.viewportInstructions);
          viewportsRemaining = viewportsRemaining || found.viewportsRemaining;
          this.availableViewports[name] = null;
          this.viewportInstructions.splice(i--, 1);
        }
      }
    }

    // Finally, only one accepting viewport left?
    for (let i = 0; i < this.viewportInstructions.length; i++) {
      const instruction = this.viewportInstructions[i];
      const remainingViewports: Viewport[] = [];
      for (const name in this.availableViewports) {
        const viewport: Viewport | null = this.availableViewports[name];
        if (viewport && viewport.acceptComponent(instruction.componentName as string)) {
          remainingViewports.push(viewport);
        }
      }
      if (remainingViewports.length === 1) {
        instruction.needsViewportDescribed = false;
        const viewport: Viewport = remainingViewports.shift() as Viewport;
        const found = this.foundViewport(instruction, viewport, withoutViewports);
        instructions.push(...found.viewportInstructions);
        viewportsRemaining = viewportsRemaining || found.viewportsRemaining;
        this.availableViewports[viewport.name] = null;
        this.viewportInstructions.splice(i, 1);
        break;
      }
    }

    // If we're ignoring viewports, we now match them anyway
    if (withoutViewports) {
      for (let i = 0; i < this.viewportInstructions.length; i++) {
        const instruction = this.viewportInstructions[i];
        const name = instruction.viewportName;
        if (!name || !name.length) {
          continue;
        }
        const newScope = instruction.ownsScope;
        if (!this.getEnabledViewports()[name]) {
          this.addViewport(name, null, null, { scope: newScope, forceDescription: true });
          this.availableViewports[name] = this.getEnabledViewports()[name];
        }
        const viewport = this.availableViewports[name];
        if (viewport && viewport.acceptComponent(instruction.componentName as string)) {
          const found = this.foundViewport(instruction, viewport, withoutViewports);
          instructions.push(...found.viewportInstructions);
          viewportsRemaining = viewportsRemaining || found.viewportsRemaining;
          this.availableViewports[name] = null;
          this.viewportInstructions.splice(i--, 1);
        }
      }
    }

    viewportsRemaining = viewportsRemaining || this.viewportInstructions.length > 0;

    // If it's a repeat there might be remaining viewports in scope children
    if (!viewportInstructions) {
      for (const child of this.children) {
        const found = child.findViewports();
        instructions.push(...found.viewportInstructions);
        viewportsRemaining = viewportsRemaining || found.viewportsRemaining;
      }
    }

    return {
      viewportInstructions: instructions,
      viewportsRemaining: viewportsRemaining,
    };
  }

  public foundViewport(instruction: ViewportInstruction, viewport: Viewport, withoutViewports: boolean): IFindViewportsResult {
    if (!withoutViewports) {
      instruction.setViewport(viewport);
    }
    const instructions: ViewportInstruction[] = [instruction];
    let viewportsRemaining: boolean = false;

    if (instruction.nextScopeInstructions) {
      const scope = viewport.scope || viewport.owningScope;
      const scoped = scope.findViewports(instruction.nextScopeInstructions, withoutViewports);
      instructions.push(...scoped.viewportInstructions);
      viewportsRemaining = viewportsRemaining || scoped.viewportsRemaining;
    }
    return {
      viewportInstructions: instructions,
      viewportsRemaining: viewportsRemaining,
    };
  }

  public addViewport(name: string, element: Element | null, context: IRenderContext | IContainer | null, options: IViewportOptions = {}): Viewport {
    let viewport: Viewport | null = this.getEnabledViewports()[name];
    // Each au-viewport element has its own Viewport
    if (element && viewport && viewport.element !== null && viewport.element !== element) {
      viewport.enabled = false;
      viewport = this.viewports.find(vp => vp.name === name && vp.element === element) || null;
      if (viewport) {
        viewport.enabled = true;
      }
    }
    if (!viewport) {
      let scope: Scope | null = null;
      if (options.scope) {
        scope = new Scope(this.router, element, context, this);
        this.router.scopes.push(scope);
      }

      viewport = new Viewport(this.router, name, null, null, this, scope, options) as Viewport;
      this.viewports.push(viewport);
    }
    // TODO: Either explain why || instead of && here (might only need one) or change it to && if that should turn out to not be relevant
    if (element || context) {
      viewport.setElement(element as Element, context as IRenderContext, options);
    }
    return viewport;
  }
  public removeViewport(viewport: Viewport, element: Element | null, context: IRenderContext | IContainer | null): number {
    if ((!element && !context) || viewport.remove(element, context)) {
      if (viewport.scope) {
        this.router.removeScope(viewport.scope);
      }
      this.viewports.splice(this.viewports.indexOf(viewport), 1);
    }
    return Object.keys(this.viewports).length;
  }

  public removeScope(): void {
    for (const child of this.children) {
      child.removeScope();
    }
    const viewports = this.getEnabledViewports();
    for (const name in viewports) {
      this.router.removeViewport(viewports[name], null, null);
    }
  }

  public addChild(child: Scope): void {
    if (this.children.indexOf(child) < 0) {
      this.children.push(child);
    }
  }
  public removeChild(child: Scope): void {
    this.children.splice(this.children.indexOf(child), 1);
  }

  public viewportStates(full: boolean = false, active: boolean = false): string[] {
    const states: string[] = [];
    const enabledViewports = this.getEnabledViewports();
    for (const vp in enabledViewports) {
      const viewport: Viewport = enabledViewports[vp];
      if ((viewport.options.noHistory || (viewport.options.noLink && !full)) && !active) {
        continue;
      }
      states.push(viewport.scopedDescription(full));
    }
    for (const scope of this.children) {
      states.push(...scope.viewportStates(full));
    }
    return states.filter((value) => value && value.length);
  }

  public allViewports(): Viewport[] {
    const viewports = this.viewports.filter((viewport) => viewport.enabled);
    for (const scope of this.children) {
      viewports.push(...scope.allViewports());
    }
    return viewports;
  }

  public scopeContext(full: boolean = false): string {
    if (!this.element || !this.parent) {
      return '';
    }
    const parents: string[] = [];
    if (this.viewport) {
      parents.unshift(this.viewport.description(full));
    }
    let viewport: Viewport | null = this.parent.closestViewport((this.element as any).$controller.parent);
    while (viewport && viewport.owningScope === this.parent) {
      parents.unshift(viewport.description(full));
      // TODO: Write thorough tests for this!
      viewport = this.closestViewport((viewport.element as any).$controller.parent);
      // viewport = this.closestViewport((viewport.context.get(IContainer) as ChildContainer).parent);
    }
    parents.unshift(this.parent.scopeContext(full));

    return this.router.instructionResolver.stringifyScopedViewportInstructions(parents.filter((value) => value && value.length));
  }

  public reparentViewportInstructions(): ViewportInstruction[] | null {
    const enabledViewports = this.viewports.filter(viewport => viewport.enabled
      && viewport.content.content
      && viewport.content.content.componentName);
    if (!enabledViewports.length) {
      return null;
    }
    const childInstructions: ViewportInstruction[] = [];
    for (const child of this.children) {
      childInstructions.push(...(child.reparentViewportInstructions() || []));
    }
    for (const vp in enabledViewports) {
      const viewport: Viewport = enabledViewports[vp];
      if (viewport.content.content) {
        viewport.content.content.nextScopeInstructions = childInstructions && childInstructions.length ? childInstructions : null;
      }
    }
    return enabledViewports.map(viewport => viewport.content.content);
  }

  private closestViewport(controller: IController): Viewport | null {
    const viewports = Object.values(this.getEnabledViewports());
    let ctrlr: IController | undefined = controller;
    while (ctrlr) {
      if (ctrlr.host) {
        const viewport = viewports.find(item => item.element === (ctrlr as IController).host);
        if (viewport) {
          return viewport;
        }
      }
      ctrlr = ctrlr.parent;
    }
    return null;
  }

  // private closestViewport(container: ChildContainer): Viewport {
  //   const viewports = Object.values(this.getEnabledViewports());
  //   while (container) {
  //     const viewport = viewports.find((item) => item.context.get(IContainer) === container);
  //     if (viewport) {
  //       return viewport;
  //     }
  //     container = container.parent;
  //   }
  //   return null;
  // }
}
