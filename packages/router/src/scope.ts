import { IContainer } from '@aurelia/kernel';
import { IController, IRenderContext } from '@aurelia/runtime';
import { IRouter } from './router';
import { IViewportOptions, Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';

export interface IFindViewportsResult {
  foundViewports: ViewportInstruction[];
  remainingInstructions: ViewportInstruction[];
}

export type ChildContainer = IContainer & { parent?: ChildContainer };

export class Scope {
  public viewport: Viewport | null = null;

  public children: Scope[] = [];
  public viewports: Viewport[] = [];

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

  public findViewports(instructions: ViewportInstruction[], alreadyFound: ViewportInstruction[], disregardViewports: boolean = false): IFindViewportsResult {
    const foundViewports: ViewportInstruction[] = [];
    const remainingInstructions: ViewportInstruction[] = [];

    // Get a shallow copy of all available viewports
    const availableViewports: Record<string, Viewport | null> = { ...this.getEnabledViewports() };
    for (const instruction of alreadyFound.filter(instruction => instruction.scope === this)) {
      availableViewports[instruction.viewportName!] = null;
    }

    const viewportInstructions = instructions.slice();

    // The viewport is already known
    if (!disregardViewports) {
      for (let i = 0; i < viewportInstructions.length; i++) {
        const instruction = viewportInstructions[i];
        if (instruction.viewport) {
          const remaining = this.foundViewport(instruction, instruction.viewport, disregardViewports);
          foundViewports.push(instruction);
          remainingInstructions.push(...remaining);
          availableViewports[name] = null;
          viewportInstructions.splice(i--, 1);
        }
      }
    }

    // Configured viewport is ruling
    for (let i = 0; i < viewportInstructions.length; i++) {
      const instruction = viewportInstructions[i];
      // if (!withoutViewports && instruction.viewport) {
      //   continue;
      // }
      instruction.needsViewportDescribed = true;
      for (const name in availableViewports) {
        const viewport: Viewport | null = availableViewports[name];
        // TODO: Also check if (resolved) component wants a specific viewport
        if (viewport && viewport.wantComponent(instruction.componentName as string)) {
          const remaining = this.foundViewport(instruction, viewport, disregardViewports, true);
          foundViewports.push(instruction);
          remainingInstructions.push(...remaining);
          availableViewports[name] = null;
          viewportInstructions.splice(i--, 1);
          break;
        }
      }
    }

    // Next in line is specified viewport (but not if we're disregarding viewports)
    if (!disregardViewports) {
      for (let i = 0; i < viewportInstructions.length; i++) {
        const instruction = viewportInstructions[i];
        // if (instruction.viewport) {
        //   continue;
        // }
        const name = instruction.viewportName;
        if (!name || !name.length) {
          continue;
        }
        const newScope = instruction.ownsScope;
        if (!this.getEnabledViewports()[name]) {
          this.addViewport(name, null, null, { scope: newScope, forceDescription: true });
          availableViewports[name] = this.getEnabledViewports()[name];
        }
        const viewport = availableViewports[name];
        if (viewport && viewport.acceptComponent(instruction.componentName as string)) {
          const remaining = this.foundViewport(instruction, viewport, disregardViewports, true);
          foundViewports.push(instruction);
          remainingInstructions.push(...remaining);
          availableViewports[name] = null;
          viewportInstructions.splice(i--, 1);
        }
      }
    }

    // Finally, only one accepting viewport left?
    for (let i = 0; i < viewportInstructions.length; i++) {
      const instruction = viewportInstructions[i];
      // if (!withoutViewports && instruction.viewport) {
      //   continue;
      // }
      const remainingViewports: Viewport[] = [];
      for (const name in availableViewports) {
        const viewport: Viewport | null = availableViewports[name];
        if (viewport && viewport.acceptComponent(instruction.componentName as string)) {
          remainingViewports.push(viewport);
        }
      }
      if (remainingViewports.length === 1) {
        const viewport: Viewport = remainingViewports.shift() as Viewport;
        const remaining = this.foundViewport(instruction, viewport, disregardViewports, true);
        foundViewports.push(instruction);
        remainingInstructions.push(...remaining);
        availableViewports[name] = null;
        viewportInstructions.splice(i--, 1);
        break;
      }
    }

    // If we're ignoring viewports, we now match them anyway
    if (disregardViewports) {
      for (let i = 0; i < viewportInstructions.length; i++) {
        const instruction = viewportInstructions[i];
        let viewport = instruction.viewport;
        if (!viewport) {
          // if (instruction.viewport) {
          //   continue;
          // }
          const name = instruction.viewportName;
          if (!name || !name.length) {
            continue;
          }
          const newScope = instruction.ownsScope;
          if (!this.getEnabledViewports()[name]) {
            this.addViewport(name, null, null, { scope: newScope, forceDescription: true });
            availableViewports[name] = this.getEnabledViewports()[name];
          }
          viewport = availableViewports[name];
        }
        if (viewport && viewport.acceptComponent(instruction.componentName as string)) {
          const remaining = this.foundViewport(instruction, viewport, disregardViewports);
          foundViewports.push(instruction);
          remainingInstructions.push(...remaining);
          availableViewports[name] = null;
          viewportInstructions.splice(i--, 1);
        }
      }
    }

    return {
      foundViewports,
      remainingInstructions,
    };
  }

  public foundViewport(instruction: ViewportInstruction, viewport: Viewport, withoutViewports: boolean, doesntNeedViewportDescribed: boolean = false): ViewportInstruction[] {
    instruction.setViewport(viewport);
    if (doesntNeedViewportDescribed) {
      instruction.needsViewportDescribed = false;
    }
    const remaining: ViewportInstruction[] = (instruction.nextScopeInstructions || []).slice();
    for (const rem of remaining) {
      if (rem.scope === null) {
        rem.scope = viewport.scope || viewport.owningScope;
      }
    }
    return remaining;
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
  public removeViewport(viewport: Viewport, element: Element | null, context: IRenderContext | IContainer | null): boolean {
    if ((!element && !context) || viewport.remove(element, context)) {
      if (viewport.scope) {
        this.router.removeScope(viewport.scope);
      }
      this.viewports.splice(this.viewports.indexOf(viewport), 1);
      return true;
    }
    return false;
  }

  public removeScope(): void {
    for (const child of this.children) {
      child.removeScope();
    }
    const viewports = this.getEnabledViewports();
    for (const name in viewports) {
      this.router.removeViewport(viewports[name], null, null);
    }
    if (this.parent) {
      this.parent.removeChild(this);
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

  public allViewports(includeDisabled: boolean = false): Viewport[] {
    const viewports = this.viewports.filter((viewport) => viewport.enabled || includeDisabled);
    for (const scope of this.children) {
      viewports.push(...scope.allViewports(includeDisabled));
    }
    return viewports;
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
    for (const viewport of enabledViewports) {
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
