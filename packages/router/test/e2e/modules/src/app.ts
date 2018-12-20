import { inject } from '@aurelia/kernel';
import { customElement } from '@aurelia/runtime';
import * as template from './app.html';
import { Router } from '../../../../src/index';
import { AbcComponent } from './components/abc-component';
import { DefComponent } from './components/def-component';
import { AppState } from './app-state';

@inject(Router, AppState)
@customElement({ name: 'app', template })
export class App {
  message = 'So... we meet again, Mr. World!';
  public output: string = '';
  public title: string = '';

  public abcComponent: any = AbcComponent;

  private left: any;
  private right: any;

  constructor(private router: Router, private appState: AppState) {
    this.abcComponent;
    this.configureRouter();
  }

  configureRouter() {
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
  }

  pathCallback(instruction) {
    console.log('app callback', instruction, this.title);
    this.output += `Path: ${instruction.path} [${instruction.index}] "${instruction.title}" (${this.stringifyFlags(instruction)}) ${JSON.stringify(instruction.data)}\n`;
    // this.title = this.router.historyBrowser.titles.join(' > ');
    if (!instruction.title) {
      setTimeout(() => {
        this.router.historyBrowser.setEntryTitle(instruction.path.split('/').pop() + ' (async)');
        // this.title = this.router.historyBrowser.titles.join(' > ');
      }, 500);
    }
  }

  stringifyFlags(flags) {
    let outs = [];
    for (let flag in flags) {
      if (flag.substring(0, 'is'.length) === 'is') {
        outs.push(flag.replace('is', ''));
      }
    }
    return outs.join(',');
  }

  updateTitle() {
    this.title = this.router.historyBrowser.titles.join(' > ');
    setTimeout(() => this.updateTitle(), 150);
  }
  clickAbc() {
    this.router.goto({ left: AbcComponent, right: AbcComponent }, 'first', { id: 123 });
  }
  clickAbcLeft() {
    this.router.goto({ left: AbcComponent }, 'first-left', { id: '123L' });
  }
  clickAbcRight() {
    this.router.goto({ right: AbcComponent }, 'first-right', { id: '123R' });
  }
  clickDef() {
    this.router.goto({ left: DefComponent, right: DefComponent }, 'second', { id: 456 });
  }
  // clickReplace() {
  //   this.router.replace({ left: Content3Component, right: Content3Component }, 'last', { id: 999 });
  // }
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
