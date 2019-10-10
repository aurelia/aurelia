import { inject } from '../../../../../kernel';
import { Router } from '../../../../../router';
import { customElement } from '../../../../../runtime';
import { AppState } from './app-state';
import * as template from './app.html';
import { AbcComponent } from './components/abc-component';
import { About } from './components/about';
import { Calendar } from './components/calendar';
import { DefComponent } from './components/def-component';
import { Email } from './components/email';

@inject(Router, AppState)
@customElement({ name: 'app', template })
export class App {
  public message = 'So... we meet again, Mr. World!';
  public output: string = '';
  public title: string = '';

  public abcComponent: any = AbcComponent;

  private readonly left: any;
  private readonly right: any;

  public constructor(private readonly router: Router, private readonly appState: AppState) {
    this.configureRouter();
  }

  public configureRouter() {
    this.router.activate({
      reportCallback: (instruction) => {
        this.pathCallback(instruction);
      }
    });
    this.router.addRoute({ name: 'abc', path: '/test/abc', title: 'Abc Title', viewports: { 'left': AbcComponent, 'right': AbcComponent } });
    this.router.addRoute({ name: 'def', path: '/test/def', title: 'Def Title', viewports: { 'left': 'def-component', 'right': 'def-component' } });
    this.router.addRoute({ name: 'abc-left', path: '/test/abc-left', viewports: { 'left': AbcComponent } });
    this.router.addRoute({ name: 'abc-right', path: '/test/abc-right', viewports: { 'right': AbcComponent } });
    this.router.addRoute({ name: 'xyz', path: '/test/xyz', viewports: { 'right': DefComponent } });
    this.router.addRoute({ name: 'redirect', path: '/test/redirect', redirect: '/test/abc' });
    this.router.addRoute({ name: 'detour', path: '/test/detour', redirect: '/test/abc' });

    // this.router.addRoute({ name: 'email', path: '/email', viewports: { 'application': MasterComponent, 'master': DetailComponent } });
    // this.router.addRoute({ name: 'special', path: '/special', viewports: { 'detail': Content3Component } });

    this.updateTitle();
    console.log('ROUTER', this.router);

    this.router.addNav('top-menu', [
      {
        components: Email,
        title: 'Email',
        children: [
          {
            components: [Email, 'inbox@email-content'],
            title: 'Inbox',
          },
          {
            components: [Email, { component: About, viewport: 'email-content' }],
            title: 'About',
          },
          {
            components: [Email, { component: 'contacts@email-content' }],
            title: 'Contacts',
          },
        ],
      },
      {
        components: Calendar,
        title: 'Calendar',
      },
      {
        title: 'Root',
        children: [
          {
            components: Email,
            title: 'Email',
          },
          {
            components: Calendar,
            title: 'Calendar',
          },
        ],
      }
    ]);
  }

  public pathCallback(instruction) {
    console.log('app callback', instruction, this.title);
    this.output += `Path: ${instruction.path} [${instruction.index}] "${instruction.title}" (${this.stringifyFlags(instruction)}) ${JSON.stringify(instruction.data)}\n`;
    // this.title = this.router.historyBrowser.titles.join(' > ');
    if (!instruction.title) {
      setTimeout(() => {
        this.router.historyBrowser.setEntryTitle(`${instruction.path.split('/').pop()} (async)`);
        // this.title = this.router.historyBrowser.titles.join(' > ');
      },         500);
    }
  }

  public stringifyFlags(flags) {
    const outs = [];
    for (const flag in flags) {
      if (flag.substring(0, 'is'.length) === 'is') {
        outs.push(flag.replace('is', ''));
      }
    }
    return outs.join(',');
  }

  public updateTitle() {
    this.title = this.router.historyBrowser.titles.join(' > ');
    setTimeout(() => { this.updateTitle(); }, 150);
  }
  public clickAbc() {
    this.router.goto({ left: AbcComponent, right: AbcComponent }, 'first', { id: 123 });
  }
  public clickAbcLeft() {
    this.router.goto({ left: AbcComponent }, 'first-left', { id: '123L' });
  }
  public clickAbcRight() {
    this.router.goto({ right: AbcComponent }, 'first-right', { id: '123R' });
  }
  public clickDef() {
    this.router.goto({ left: DefComponent, right: DefComponent }, 'second', { id: 456 });
  }
  // clickReplace() {
  //   this.router.replace({ left: Content3Component, right: Content3Component }, 'last', { id: 999 });
  // }
  public clickBack() {
    this.router.back();
  }
  public clickForward() {
    this.router.forward();
  }
  public clickBack2() {
    this.router.navigation.history.go(-2);
  }
  public clickForward2() {
    this.router.navigation.history.go(2);
  }
  public clickCancel() {
    this.router.historyBrowser.cancel();
  }
  public clickRefresh() {
    this.router.refresh();
  }
}
