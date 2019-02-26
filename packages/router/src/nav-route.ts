import { ICustomElementType, INode, IObserverLocator, IPropertyObserver, LifecycleFlags } from '@aurelia/runtime';
import { INavRoute, IViewportComponent, Nav, NavInstruction } from './nav';
import { Router } from './router';
import { ViewportInstruction } from './viewport-instruction';

export class NavRoute {
  public nav: Nav;
  public instructions: ViewportInstruction[];
  public title: string;
  public link?: string;
  public linkActive?: string;
  public children?: NavRoute[];
  public meta?: Record<string, unknown>;

  public active: string = '';

  private readonly observerLocator: IObserverLocator;
  private readonly observer: IPropertyObserver<Router, 'activeComponents'>;

  constructor(nav: Nav, route?: INavRoute) {
    this.nav = nav;
    Object.assign(this, {
      title: route.title,
      children: null,
      meta: route.meta,
      active: '',
    });
    this.instructions = this.parseRoute(route.route);
    this.link = this._link(this.instructions);
    this.linkActive = route.consideredActive ? this._link(this.parseRoute(route.consideredActive)) : this.link;
    this.observerLocator = this.nav.router.container.get(IObserverLocator);
    this.observer = this.observerLocator.getObserver(LifecycleFlags.none, this.nav.router, 'activeComponents') as IPropertyObserver<Router, 'activeComponents'>;
    this.observer.subscribe(this);
  }

  public get hasChildren(): string {
    return (this.children && this.children.length ? 'nav-has-children' : '');
  }

  public handleChange(): void {
    if (this.link && this.link.length) {
      this.active = this._active();
    } else {
      this.active = (this.active === 'nav-active' ? 'nav-active' : (this.activeChild() ? 'nav-active-child' : ''));
    }
  }

  public _active(): string {
    const components = this.nav.router.instructionResolver.viewportInstructionsFromString(this.linkActive);
    const activeComponents = this.nav.router.activeComponents.map((state) => this.nav.router.instructionResolver.parseViewportInstruction(state));
    for (const component of components) {
      if (!activeComponents.find((active) => active.sameComponent(component))) {
        return '';
      }
    }
    return 'nav-active';
  }

  public toggleActive(): void {
    this.active = (this.active.startsWith('nav-active') ? '' : 'nav-active');
  }

  public _link(instructions: ViewportInstruction[]): string {
    return this.nav.router.instructionResolver.viewportInstructionsToString(instructions);
  }

  private parseRoute(routes: NavInstruction | NavInstruction[]): ViewportInstruction[] {
    if (!Array.isArray(routes)) {
      return this.parseRoute([routes]);
    }
    const instructions: ViewportInstruction[] = [];
    for (const route of routes) {
      if (typeof route === 'string') {
        instructions.push(this.nav.router.instructionResolver.parseViewportInstruction(route));
      } else if (route as ViewportInstruction instanceof ViewportInstruction) {
        instructions.push(route as ViewportInstruction);
      } else if (route['component']) {
        const viewportComponent = route as IViewportComponent;
        instructions.push(new ViewportInstruction(viewportComponent.component, viewportComponent.viewport, viewportComponent.parameters));
      } else {
        instructions.push(new ViewportInstruction(route as Partial<ICustomElementType>));
      }
    }
    return instructions;
  }

  private activeChild(): boolean {
    if (this.children) {
      for (const child of this.children) {
        if (child.active.startsWith('nav-active') || child.activeChild()) {
          return true;
        }
      }
    }
    return false;
  }
}
