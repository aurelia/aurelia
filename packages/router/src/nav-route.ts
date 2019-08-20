import { Constructable } from '@aurelia/kernel';
import { IRouteableComponentType, NavigationInstruction } from './interfaces';
import { INavRoute, Nav } from './nav';
import { ComponentAppellationResolver, NavigationInstructionResolver } from './type-resolvers';
import { ViewportInstruction } from './viewport-instruction';

export class NavRoute {
  public nav: Nav;
  public instructions: ViewportInstruction[];
  public title: string;
  public link?: string;
  public execute?: ((route: NavRoute) => void);
  public linkVisible?: boolean | ((route: NavRoute) => boolean);
  public linkActive?: NavigationInstruction | NavigationInstruction[] | ((route: NavRoute) => boolean);
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
      this.link = this.computeLink(this.instructions);
    }
    this.linkActive = route.consideredActive ? route.consideredActive : this.link;
    if (!(this.linkActive instanceof Function) || ComponentAppellationResolver.isType(this.linkActive as IRouteableComponentType)) {
      this.linkActive = NavigationInstructionResolver.toViewportInstructions(this.nav.router, this.linkActive as NavigationInstruction | NavigationInstruction[]);
    }
    this.execute = route.execute;
    this.compareParameters = !!route.compareParameters;
    this.linkVisible = route.condition === undefined ? true : route.condition;
    this.update();
  }

  public get hasChildren(): string {
    return (this.children && this.children.length ? 'nav-has-children' : '');
  }

  public update(): void {
    this.visible = this.computeVisible();
    if ((this.link && this.link.length) || this.execute) {
      this.active = this.computeActive();
    } else {
      this.active = (this.active === 'nav-active' ? 'nav-active' : (this.activeChild() ? 'nav-active-child' : ''));
    }
  }

  public executeAction(event: Event): void {
    this.execute(this);
    event.stopPropagation();
  }

  public toggleActive(): void {
    this.active = (this.active.startsWith('nav-active') ? '' : 'nav-active');
  }

  private parseRoute<C extends Constructable>(routes: NavigationInstruction | NavigationInstruction[]): ViewportInstruction[] {
    return NavigationInstructionResolver.toViewportInstructions(this.nav.router, routes);
  }

  private computeVisible(): boolean {
    if (this.linkVisible instanceof Function) {
      return this.linkVisible(this);
    }
    return this.linkVisible;
  }

  private computeActive(): string {
    if (!Array.isArray(this.linkActive)) {
      return (this.linkActive as ((route: NavRoute) => boolean))(this) ? 'nav-active' : '';
    }
    const components = this.linkActive as ViewportInstruction[];
    const activeComponents = this.nav.router.activeComponents.map((state) => this.nav.router.instructionResolver.parseViewportInstruction(state));
    for (const component of components) {
      if (activeComponents.every((active) => !active.sameComponent(component, this.compareParameters && !!component.parametersString))) {
        return '';
      }
    }
    return 'nav-active';
  }

  private computeLink(instructions: ViewportInstruction[]): string {
    return this.nav.router.instructionResolver.stringifyViewportInstructions(instructions);
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
