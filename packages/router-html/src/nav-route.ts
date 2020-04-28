import { Constructable } from '@aurelia/kernel';
import { INavRoute, Nav } from './nav';
import {
  RouteableComponentType,
  NavigationInstruction,
  ComponentAppellationResolver,
  NavigationInstructionResolver,
  ViewportInstruction,
} from '@aurelia/router';

export class NavRoute {
  public instructions: ViewportInstruction<Element>[] = [];
  public title: string;
  public link: string | null = null;
  public execute?: ((route: NavRoute) => void);
  public linkVisible: boolean | ((route: NavRoute) => boolean) | null = null;
  public linkActive: NavigationInstruction<Element> | NavigationInstruction<Element>[] | ((route: NavRoute) => boolean) | null = null;
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
    this.linkActive = route.consideredActive !== null && route.consideredActive !== void 0 ? route.consideredActive : this.link;
    if (this.linkActive !== null && (!(this.linkActive instanceof Function) || ComponentAppellationResolver.isType(this.linkActive as RouteableComponentType))) {
      this.linkActive = NavigationInstructionResolver.toViewportInstructions(this.nav.router, this.linkActive as NavigationInstruction<Element> | NavigationInstruction<Element>[]);
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

  private parseRoute<C extends Constructable>(routes: NavigationInstruction<Element> | NavigationInstruction<Element>[]): ViewportInstruction<Element>[] {
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
    const components = this.linkActive as ViewportInstruction<Element>[];
    const activeComponents = this.nav.router.instructionResolver.flattenViewportInstructions(this.nav.router.activeComponents);
    for (const component of components) {
      if (activeComponents.every((active) => !active.sameComponent(component, this.compareParameters && component.typedParameters !== null))) {
        return '';
      }
    }
    return 'nav-active';
  }

  private computeLink(instructions: ViewportInstruction<Element>[]): string {
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
