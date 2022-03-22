/* eslint-disable import/no-unassigned-import */
import { IRouter, HookTypes } from '@aurelia/router-lite';
import { customElement, IObserverLocator, LifecycleFlags } from '@aurelia/runtime-html';
import html from './app.html';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import './styles.css';

// interface IWindow {
//   id: number;
// }

@customElement({ name: 'app', template: html, })
export class App {
  public url: string = '';
  // public windows: IWindow[] = [{ id: 1 }];
  public windows: unknown[] = [{}];
  public maxWindows: number = 5;

  public constructor(
    @IRouter public router: IRouter
  ) {
    router.addHooks([{
      hook: path => {
        // console.log('TransformToUrl', path);
        if (typeof path === 'string') {
          this.url = path;
        }
        return Promise.resolve(path);
      },
      options: {
        type: HookTypes.TransformToUrl
      },
    }]);
  }

  public get count(): number {
    return this.windows.length;
  }

  // public get maxId(): number {
  //   return Math.max(...this.windows.map(w => w.id));
  // }

  public binding(): void {
    const observerLocator = this.router.container.get(IObserverLocator);
    const observer = observerLocator.getArrayObserver(LifecycleFlags.none, this.windows) as any;
    observer.subscribeToCollection(this);
  }

  public bound(): void {
    this.setupNavs();
  }

  public handleCollectionChange(): void {
    this.setupNavs();
  }

  private setupNavs(): void {
    for (const window of this.windows) {
      // const id = window.id;
      // this.router.setNav(`app-menu-${id}`, [
      this.router.setNav(`app-menu`, [
        { title: '<span style="white-space: nowrap"><i class="fa fa-home"></i> Aurelia</span>', route: `welcome@app-viewport` },
        { title: 'Welcome', route: `welcome` },
        { title: 'Users', route: `users` },
        { title: 'Child router', route: `child-router` },
        // { title: '/child-router', route: `/child-router@app-viewport` },
        // { title: '/main/child-router', route: `/main/child-router@app-viewport` },
        // { title: '/alternate/child-router', route: `/alternate/child-router@app-viewport` },
        // { title: '/alternate/child-router/users', route: `/alternate/child-router@app-viewport/users` },
        // { title: '/++alternate/child-router', route: `/++alternate/child-router` },
      ], {
        nav: 'navbar navbar-expand-lg navbar-light bg-light',
        ul: 'navbar-nav mr-auto',
        li: 'nav-item',
        a: 'nav-link',
        liActive: 'active',
      });
      if (this.count > 1) {
        // this.router.addNav(`app-menu-${id}`, [
        this.router.addNav(`app-menu`, [
          // { title: '<i class="fa fa-minus"></i>', execute: () => { this.remove(window); }, consideredActive: '' },
          { title: '<i class="fa fa-minus"></i>', route: '-' },
        ]);
      }
      // if (id === this.maxId && this.count < this.maxWindows) {
      //   this.router.addNav(`app-menu-${id}`, [
      if (window === this.windows[this.windows.length - 1]) {
        this.router.addNav(`app-menu`, [
          // { title: '<i class="fa fa-plus"></i>', execute: () => { this.add(); }, consideredActive: '' },
          { title: '<i class="fa fa-plus"></i>', route: '+' },
        ]);
      }
    }
  }
}
