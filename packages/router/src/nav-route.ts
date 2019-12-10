import { Constructable } from '@aurelia/kernel';
import { RouteableComponentType, NavigationInstruction } from './interfaces';
import { INavRoute, Nav } from './nav';
import { ComponentAppellationResolver, NavigationInstructionResolver } from './type-resolvers';
import { ViewportInstruction } from './viewport-instruction';

export class NavRoute {
  public instructions: ViewportInstruction[] = [];
  public title: string;
  public link: string | null = null;
  public execute?: ((route: NavRoute) => void);
  public linkVisible: boolean | ((route: NavRoute) => boolean) | null = null;
  public linkActive: NavigationInstruction | NavigationInstruction[] | ((route: NavRoute) => boolean) | null = null;
  public compareParameters: boolean = false;
  public children: NavRoute[] | null = null;
  public meta?: Record<string, unknown>;

  public visible: boolean = true;
  public active: string = '';

  public constructor(
    public nav: Nav,
    route: INavRoute
  ) {
    this.title = route.title;
    this.meta = route.meta;

    if (route.route) {
      this.instructions = this.parseRoute(route.route);
      this.link = this.computeLink(this.instructions);
    }
    this.linkActive = route.consideredActive ? route.consideredActive : this.link;
    if (!(this.linkActive instanceof Function) || ComponentAppellationResolver.isType(this.linkActive as RouteableComponentType)) {
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
    if (this.execute) {
      this.execute(this);
    }
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
    return !!this.linkVisible;
  }

  private computeActive(): string {
    if (!Array.isArray(this.linkActive)) {
      return (this.linkActive as ((route: NavRoute) => boolean))(this) ? 'nav-active' : '';
    }
    const components = this.linkActive as ViewportInstruction[];
    const activeComponents = this.nav.router.instructionResolver.flattenViewportInstructions(this.nav.router.activeComponents);
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
