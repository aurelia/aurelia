import { ICustomElementType, IObserverLocator, IPropertyObserver, LifecycleFlags } from '@aurelia/runtime';
import { INavRoute, IViewportComponent, Nav, NavComponent } from './nav';
import { Router } from './router';
import { ViewportInstruction } from './viewport-instruction';

export class NavRoute {
  public nav: Nav;
  public components: NavComponent | NavComponent[];
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
      components: route.components,
      title: route.title,
      children: null,
      meta: route.meta,
      active: '',
    });
    this.link = this._link(this.components);
    this.linkActive = route.consideredActive ? this._link(route.consideredActive) : this.link;
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

  public _link(components: NavComponent | NavComponent[]): string {
    if (Array.isArray(components)) {
      return components.map((value) => this.linkName(value)).join(this.nav.router.instructionResolver.separators.sibling);
    } else {
      return this.linkName(components);
    }
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

  private linkName(component: NavComponent): string {
    if (!component) {
      return '';
    } else if (typeof component === 'string') {
      return component;
    } else if ((component as ICustomElementType).description) {
      return (component as ICustomElementType).description.name;
    } else if ((component as IViewportComponent).component) {
      return this.linkName((component as IViewportComponent).component) + ((component as IViewportComponent).viewport ? `@${(component as IViewportComponent).viewport}` : '');
    }
  }
}
