import { inject } from '@aurelia/kernel';
import { bindable, BindingFlags, createElement, customElement, ICustomElement, IHydrateElementInstruction, IRenderable, IRenderingEngine, ITemplateSource, IView, IViewFactory, PotentialRenderable, TargetedInstruction, ITargetedInstruction } from '@aurelia/runtime';
import { RouteTarget } from './route';
import { IRouter } from './router';

const routerViewSource: ITemplateSource = {
  name: 'router-view',
  containerless: true
};

// tslint:disable-next-line:interface-name
export interface RouterView extends ICustomElement {}

@customElement(routerViewSource)
@inject(IRouter, IRenderable, IRenderingEngine, ITargetedInstruction)
export class RouterView {
  @bindable()
  public name: string;

  private _target: RouteTarget;
  public get target(): RouteTarget {
    return this._target;
  }
  public set target(value: RouteTarget) {
    this.targetChanged(value, this._target);
    this._target = value;
  }
  private properties: Record<string, TargetedInstruction>;
  private currentView: IView = null;

  constructor(
    private router: IRouter,
    private renderable: IRenderable,
    private renderingEngine: IRenderingEngine,
    instruction: IHydrateElementInstruction
  ) {
    this.router.addRouterView(this);
    const props = this.properties = {};
    const instructions = instruction.instructions;
    for (let i = 0, ii = instructions.length; i < ii; ++i) {
      const cur = instructions[i];
      if ('dest' in cur && cur.dest !== 'name') {
        props[cur.dest] = cur;
      }
    }
  }

  private targetChanged(newValue: RouteTarget, oldValue: RouteTarget): void {
    if (newValue === oldValue) {
      return;
    }
    const view = this.provideViewFor(newValue);
    this.clear();
    if (view) {
      view.onRender = () => view.$nodes.insertBefore(this.$projector.host);
      view.lockScope(this.renderable.$scope);

      this.currentView = view;
      this.$addChild(view, BindingFlags.fromBind);
    }
  }

  private clear(): void {
    if (this.currentView) {
      this.$removeChild(this.currentView);
      this.currentView = null;
    }
  }

  private provideViewFor(target: RouteTarget): IView | null {
    if (!target) {
      return null;
    }

    if (isTemplateDefinition(target)) {
      return this.renderingEngine
        .getViewFactory(target, this.renderable.$context)
        .create();
    }

    if (isViewFactory(target)) {
      return target.create();
    }

    if (isPotentialRenderable(target)) {
      return target.createView(this.renderingEngine, this.renderable.$context);
    }

    if (isView(target)) {
      return target;
    }

    return createElement(target, this.properties, this.$projector.children)
      .createView(this.renderingEngine, this.renderable.$context);
  }
}

function isTemplateDefinition(target: RouteTarget): target is ITemplateSource {
  return 'templateOrNode' in target;
}
function isViewFactory(target: RouteTarget): target is IViewFactory {
  return 'create' in target;
}
function isPotentialRenderable(target: RouteTarget): target is PotentialRenderable {
  return 'createView' in target;
}
function isView(target: RouteTarget): target is IView {
  return 'lockScope' in target;
}
