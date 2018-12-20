export interface NavRoute {
  components: string | Object;
  title: string;
  children?: NavRoute[];
  meta?: Object;
}

export class Nav {
  public name: string;
  public routes: NavRoute[] = [];

  constructor(name: string) {
    this.name = name;
  }

  // TODO: Deal with non-string components
  public addNav(routes: NavRoute[]): void {
    this.routes.push(...routes);
  }
}
