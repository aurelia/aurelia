import { ICustomElementType, IObserverLocator, IPropertyObserver, LifecycleFlags } from '@aurelia/runtime';
import { INavRoute, IViewportComponent, Nav, NavInstruction } from './nav';
import { IRouter } from './router';
import { ViewportInstruction } from './viewport-instruction';

export class NavRoute {
  public nav: Nav;
  public instructions: ViewportInstruction[];
  public title: string;
  public link?: string;
  public execute?: ((route: NavRoute) => void);
  public linkVisible?: boolean | ((route: NavRoute) => boolean);
  public linkActive?: string | ((route: NavRoute) => boolean);
  public compareParameters: boolean = false;
  public children?: NavRoute[];
  public meta?: Record<string, unknown>;

  public visible: boolean = true;
  public active: string = '';

  constructor(nav: Nav, route?: INavRoute) {
    this.nav = nav;
    Object.assign(this, {
      title: route.title,
      children: null,
      meta: route.meta,
      active: '',
    });
    if (route.route) {
      this.instructions = this.parseRoute(route.route);
      this.link = this._link(this.instructions);
    }
    this.linkActive = route.consideredActive
      ? route.consideredActive instanceof Function
        ? route.consideredActive
        : this._link(this.parseRoute(route.consideredActive))
      : this.link;
    this.execute = route.execute;
    this.compareParameters = !!route.compareParameters;
    this.linkVisible = route.condition === undefined ? true : route.condition;
    this.update();
  }

  public get hasChildren(): string {
    return (this.children && this.children.length ? 'nav-has-children' : '');
  }

  public update(): void {
    this.visible = this._visible();
    if ((this.link && this.link.length) || this.execute) {
      this.active = this._active();
    } else {
      this.active = (this.active === 'nav-active' ? 'nav-active' : (this.activeChild() ? 'nav-active-child' : ''));
    }
  }

  public executeAction(event: Event): void {
    this.execute(this);
    event.stopPropagation();
  }

  public _visible(): boolean {
    if (this.linkVisible instanceof Function) {
      return this.linkVisible(this);
    }
    return this.linkVisible;
  }

  public _active(): string {
    if (this.linkActive instanceof Function) {
      return this.linkActive(this) ? 'nav-active' : '';
    }
    const components = this.nav.router.instructionResolver.parseViewportInstructions(this.linkActive);
    const activeComponents = this.nav.router.activeComponents.map((state) => this.nav.router.instructionResolver.parseViewportInstruction(state));
    for (const component of components) {
      if (activeComponents.every((active) => !active.sameComponent(component, this.compareParameters && !!component.parametersString))) {
        return '';
      }
    }
    return 'nav-active';
  }

  public toggleActive(): void {
    this.active = (this.active.startsWith('nav-active') ? '' : 'nav-active');
  }

  public _link(instructions: ViewportInstruction[]): string {
    return this.nav.router.instructionResolver.stringifyViewportInstructions(instructions);
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
