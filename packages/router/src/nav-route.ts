import { AccessorOrObserver, ICustomElementType, IObserverLocator, SetterObserver } from '@aurelia/runtime';
import { INavRoute, Nav } from './nav';

export interface IViewportComponent {
  viewport?: string;
  component: string | ICustomElementType;
}

export class NavRoute {
  public nav: Nav;
  public components: string | ICustomElementType | IViewportComponent;
  public title: string;
  public link?: string;
  public children?: NavRoute[];
  public meta?: Object;

  public active: string = '';

  private readonly observer: SetterObserver;

  constructor(nav: Nav, route?: INavRoute) {
    this.nav = nav;
    Object.assign(this, {
      components: route.components,
      title: route.title,
      meta: route.meta,
      active: '',
    });
    this.link = this._link();
    this.observer = new SetterObserver(this.nav.router, 'activeComponents');
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
    const components: string[] = this.link.split(this.nav.router.separators.add);
    const activeComponents: string[] = this.nav.router.activeComponents;
    for (let component of components) {
      if (component.indexOf(this.nav.router.separators.viewport) >= 0) {
        if (activeComponents.indexOf(component) < 0) {
          return '';
        }
      } else {
        component = component + this.nav.router.separators.viewport;
        if (activeComponents.findIndex((value) => value.startsWith(component)) < 0) {
          return '';
        }
      }
    }
    return 'nav-active';
  }

  public toggleActive(): void {
    this.active = (this.active.startsWith('nav-active') ? '' : 'nav-active');
  }

  public _link(): string {
    if (Array.isArray(this.components)) {
      return this.components.map((value) => this.linkName(value)).join(this.nav.router.separators.sibling);
    } else {
      return this.linkName(this.components);
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

  private linkName(component: string | ICustomElementType | IViewportComponent): string {
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
