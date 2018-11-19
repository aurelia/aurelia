import { inject } from '@aurelia/kernel';
import { customElement } from '@aurelia/runtime';
import * as template from './app.html';
import { Router } from '../../../src/index';
import { AbcComponent } from './components/abc-component';
import { DefComponent } from './components/def-component';
import { AppState } from './app-state';

@inject(Router, AppState)
@customElement({ name: 'app', template })
export class App {
  message = 'So... we meet again, Mr. World!';
  public output: string = '';
  public title: string = '';

  private left: any;
  private right: any;

  constructor(private router: Router, private appState: AppState) {
    this.configureRouter();
  }

  configureRouter() {
    this.router.activate({
      reportCallback: (entry, flags) => {
        this.pathCallback(entry, flags);
      }
    });
    this.router.addRoute({ name: 'abc', path: '/test/abc', title: 'Abc Title', viewports: { 'left': { component: AbcComponent }, 'right': { component: AbcComponent } } });
    this.router.addRoute({ name: 'def', path: '/test/def', title: 'Def Title', viewports: { 'left': { component: DefComponent }, 'right': { component: DefComponent } } });
    this.router.addRoute({ name: 'abc-left', path: '/test/abc-left', viewports: { 'left': { component: AbcComponent } } });
    this.router.addRoute({ name: 'abc-right', path: '/test/abc-right', viewports: { 'right': { component: AbcComponent } } });
    this.updateTitle();
    console.log('ROUTER', this.router);
  }

  pathCallback(entry, flags) {
    console.log('app callback', entry, flags, this.title);
    this.output += `Path: ${entry.path} [${entry.index}] "${entry.title}" (${this.stringifyFlags(flags)}) ${JSON.stringify(entry.data)}\n`;
    // this.title = this.router.historyBrowser.titles.join(' > ');
    if (!entry.title) {
      setTimeout(() => {
        this.router.historyBrowser.setEntryTitle(entry.path.split('/').pop() + ' (async)');
        // this.title = this.router.historyBrowser.titles.join(' > ');
      }, 500);
    }
  }

  stringifyFlags(flags) {
    let outs = [];
    for (let flag in flags) {
      outs.push(flag.replace('is', ''));
    }
    return outs.join(',');
  }

  updateTitle() {
    this.title = this.router.historyBrowser.titles.join(' > ');
    setTimeout(() => this.updateTitle(), 150);
  }
  clickAbc() {
    this.router.goto('/test/abc', 'first', { id: 123 });
  }
  clickAbcLeft() {
    this.router.goto('/test/abc-left', 'first-left', { id: '123L' });
  }
  clickAbcRight() {
    this.router.goto('/test/abc-right', 'first-right', { id: '123R' });
  }
  clickDef() {
    this.router.goto('/test/def', 'second', { id: 456 });
  }
  clickReplace() {
    this.router.replace('/test/xyz', 'last', { id: 999 });
  }
  clickBack() {
    this.router.back();
  }
  clickForward() {
    this.router.forward();
  }
  clickBack2() {
    this.router.historyBrowser.history.go(-2);
  }
  clickForward2() {
    this.router.historyBrowser.history.go(2);
  }
  clickCancel() {
    this.router.historyBrowser.cancel();
  }
  clickRefresh() {
    this.router.refresh();
  }
}
