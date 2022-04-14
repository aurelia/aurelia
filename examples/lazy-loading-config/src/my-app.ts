export class MyApp {
  public static routes = [{ path: 'three', component: () => import('./four'), viewport: 'default' }];

  public message = 'Hello World!';
}
