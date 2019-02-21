import { IContainer } from '@aurelia/kernel';
import { ICustomElementType, IRenderContext } from '@aurelia/runtime';
import { Router } from './router';
import { IFindViewportsResult } from './scope';
import { IViewportOptions, Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';

export interface IViewportCustomElementType extends ICustomElementType {
  viewport?: string;
}

export interface IFindViewportsResult {
  viewportInstructions?: ViewportInstruction[];
  viewportsRemaining?: boolean;
}

export type ChildContainer = IContainer & { parent?: ChildContainer };

export class Scope {
  public element: Element;
  public context: IRenderContext;
  public parent: Scope;

  public viewport: Viewport;

  public children: Scope[];
  public viewports: Viewport[];

  private readonly router: Router;

  private viewportInstructions: ViewportInstruction[];
  private availableViewports: Record<string, Viewport>;

  constructor(router: Router, element: Element, context: IRenderContext, parent: Scope) {
    this.router = router;
    this.element = element;
    this.context = context;
    this.parent = parent;

    this.viewport = null;
    this.children = [];
    this.viewports = [];
    this.availableViewports = null;

    if (this.parent) {
      this.parent.addChild(this);
    }
  }

  public getEnabledViewports(): Record<string, Viewport> {
    return this.viewports.filter((viewport) => viewport.enabled).reduce(
      (viewports, viewport) => {
        viewports[viewport.name] = viewport;
        return viewports;
      },
      {});
  }

  public findViewports(viewportInstructions?: ViewportInstruction[]): IFindViewportsResult {
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
      for (const name in this.availableViewports) {
        const viewport: Viewport = this.availableViewports[name];
        // TODO: Also check if (resolved) component wants a specific viewport
        if (viewport && viewport.wantComponent(instruction.componentName)) {
          const found = this.foundViewport(instruction, viewport);
          instructions.push(...found.viewportInstructions);
          viewportsRemaining = viewportsRemaining || found.viewportsRemaining;
          this.availableViewports[name] = null;
          this.viewportInstructions.splice(i--, 1);
          break;
        }
      }
    }

    // Next in line is specified viewport
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
      if (viewport && viewport.acceptComponent(instruction.componentName)) {
        const found = this.foundViewport(instruction, viewport);
        instructions.push(...found.viewportInstructions);
        viewportsRemaining = viewportsRemaining || found.viewportsRemaining;
        this.availableViewports[name] = null;
        this.viewportInstructions.splice(i--, 1);
      }
    }

    // Finally, only one accepting viewport left?
    for (let i = 0; i < this.viewportInstructions.length; i++) {
      const instruction = this.viewportInstructions[i];
      const remainingViewports: Viewport[] = [];
      for (const name in this.availableViewports) {
        const viewport: Viewport = this.availableViewports[name];
        if (viewport && viewport.acceptComponent(instruction.componentName)) {
          remainingViewports.push(viewport);
        }
      }
      if (remainingViewports.length === 1) {
        const viewport = remainingViewports.shift();
        const found = this.foundViewport(instruction, viewport);
        instructions.push(...found.viewportInstructions);
        viewportsRemaining = viewportsRemaining || found.viewportsRemaining;
        this.availableViewports[viewport.name] = null;
        this.viewportInstructions.splice(i--, 1);
        break;
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

  public foundViewport(instruction: ViewportInstruction, viewport: Viewport): IFindViewportsResult {
    instruction.setViewport(viewport);
    const instructions: ViewportInstruction[] = [instruction];
    let viewportsRemaining: boolean = false;

    if (instruction.nextScopeInstruction) {
      const scope = viewport.scope || viewport.owningScope;
      const scoped = scope.findViewports([instruction.nextScopeInstruction]);
      instructions.push(...scoped.viewportInstructions);
      viewportsRemaining = viewportsRemaining || scoped.viewportsRemaining;
    }
    return {
      viewportInstructions: instructions,
      viewportsRemaining: viewportsRemaining,
    };
  }

  public addViewport(name: string, element: Element, context: IRenderContext, options?: IViewportOptions): Viewport {
    let viewport = this.getEnabledViewports()[name];
    // Each au-viewport element has its own Viewport
    if (element && viewport && viewport.element !== null && viewport.element !== element) {
      viewport.enabled = false;
      viewport = this.viewports.find(vp => vp.name === name && vp.element === element);
      if (viewport) {
        viewport.enabled = true;
      }
    }
    if (!viewport) {
      let scope: Scope;
      if (options.scope) {
        scope = new Scope(this.router, element, context, this);
        this.router.scopes.push(scope);
      }

      viewport = new Viewport(this.router, name, null, null, this, scope, options);
      this.viewports.push(viewport);
    }
    // TODO: Either explain why || instead of && here (might only need one) or change it to && if that should turn out to not be relevant
    if (element || context) {
      viewport.setElement(element, context, options);
    }
    return viewport;
  }
  public removeViewport(viewport: Viewport, element: Element, context: IRenderContext): number {
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
    for (const vp in this.getEnabledViewports()) {
      const viewport: Viewport = this.getEnabledViewports()[vp];
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
    let viewport: Viewport = this.parent.closestViewport((this.context.get(IContainer) as ChildContainer).parent);
    while (viewport && viewport.owningScope === this.parent) {
      parents.unshift(viewport.description(full));
      viewport = this.closestViewport((viewport.context.get(IContainer) as ChildContainer).parent);
    }
    parents.unshift(this.parent.scopeContext(full));

    return this.router.instructionResolver.stringifyScopedViewportInstruction(parents.filter((value) => value && value.length));
  }

  private closestViewport(container: ChildContainer): Viewport {
    const viewports = Object.values(this.getEnabledViewports());
    while (container) {
      const viewport = viewports.find((item) => item.context.get(IContainer) === container);
      if (viewport) {
        return viewport;
      }
      container = container.parent;
    }
    return null;
  }
}
