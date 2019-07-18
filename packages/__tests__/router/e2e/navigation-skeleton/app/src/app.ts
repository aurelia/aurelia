import { customElement } from '@aurelia/runtime';
import { inject } from '@aurelia/kernel';
import { Router } from '@aurelia/router';
import * as html from './app.html';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import './styles.css';

import './nav-bar.html';

@inject(Router)
@customElement({ name: 'app', template: html })
export class App {
  public count: number = 3;
  public maxWindows: number = 5;
  constructor(public router: Router) { }
  public bound() {
    this.router.activate();
    // Yeah, this is cheating somewhat, should've reacted to actual count
    for (let i = 1; i <= this.maxWindows; i++) {
      this.router.setNav(`app-menu-${i}`, [
        { title: 'Welcome', route: `welcome@app-viewport-${i}` },
        { title: 'Users', route: `users@app-viewport-${i}` },
        { title: 'Child router', route:  `child-router@app-viewport-${i}` },
      ]);
    }
  }
}
