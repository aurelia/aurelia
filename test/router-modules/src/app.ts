import { Router } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';
import { AppState } from './app-state';
import * as template from './app.html';
import { AbcComponent } from './components/abc-component';
import { About } from './components/about';
import { Calendar } from './components/calendar';
import { DefComponent } from './components/def-component';
import { Email } from './components/email';
import * as deps from './components/index';
import { ILogger } from 'aurelia';

@customElement({ name: 'app', template, dependencies: [deps] })
export class App {
  public message = 'So... we meet again, Mr. World!';
  public output: string = '';
  public title: string = '';

  public abcComponent: any = AbcComponent;

  private readonly left: any;
  private readonly right: any;

  public constructor(
    private readonly router: Router,
    private readonly appState: AppState,
    @ILogger private readonly logger: ILogger,
  ) {
    this.logger = logger.scopeTo(this.constructor.name);
    this.configureRouter();
  }

  public configureRouter() {
    this.router.activate({
      reportCallback: (instruction) => {
        this.pathCallback(instruction);
      }
    });
    // TODO(fkleuver) / TODO(jwx): the immediately commented-out block below needs to be fixed
    // this.router.addRoutes([
    //   { id: 'abc', path: '/test/abc', title: 'Abc Title', viewports: { 'left': AbcComponent, 'right': AbcComponent } },
    //   { id: 'def', path: '/test/def', title: 'Def Title', viewports: { 'left': 'def-component', 'right': 'def-component' } },
    //   { id: 'abc-left', path: '/test/abc-left', viewports: { 'left': AbcComponent } },
    //   { id: 'abc-right', path: '/test/abc-right', viewports: { 'right': AbcComponent } },
    //   { id: 'xyz', path: '/test/xyz', viewports: { 'right': DefComponent } },
    //   { id: 'redirect', path: '/test/redirect', redirect: '/test/abc' },
    //   { id: 'detour', path: '/test/detour', redirect: '/test/abc' },
    // ]);
    // TODO(fkleuver) / TODO(jwx): end of block that needs fixing

    // this.router.addRoute({ name: 'email', path: '/email', viewports: { 'application': MasterComponent, 'master': DetailComponent } });
    // this.router.addRoute({ name: 'special', path: '/special', viewports: { 'detail': Content3Component } });

    this.updateTitle();
    this.logger.debug('ROUTER', this.router);

    this.router.addNav('top-menu', [
      {
        route: Email,
        title: 'Email',
        children: [
          {
            route: [Email, 'inbox@email-content'],
            title: 'Inbox',
          },
          {
            route: [Email, { component: About, viewport: 'email-content' }],
            title: 'About',
          },
          {
            route: [Email, { component: 'contacts@email-content' }],
            title: 'Contacts',
          },
        ],
      },
      {
        route: Calendar,
        title: 'Calendar',
      },
      {
        title: 'Root',
        children: [
          {
            route: Email,
            title: 'Email',
          },
          {
            route: Calendar,
            title: 'Calendar',
          },
        ],
      }
    ]);
  }

  public pathCallback(instruction) {
    this.logger.debug('app callback', instruction, this.title);
    this.output += `Path: ${instruction.path} [${instruction.index}] "${instruction.title}" (${this.stringifyFlags(instruction)}) ${JSON.stringify(instruction.data)}\n`;
    // this.title = this.router.navigator.titles.join(' > ');
    if (!instruction.title) {
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.router.navigator.setEntryTitle(`${instruction.path.split('/').pop()} (async)`);
        // this.title = this.router.navigator.titles.join(' > ');
      }, 500);
    }
  }

  public stringifyFlags(flags) {
    const outs = [];
    for (const flag in flags) {
      if (flag.startsWith('is')) {
        outs.push(flag.replace('is', ''));
      }
    }
    return outs.join(',');
  }

  public updateTitle() {
    this.title = this.router.navigator.titles.join(' > ');
    setTimeout(() => { this.updateTitle(); }, 150);
  }
  public async clickAbc() {
    // TODO(fkleuver) / TODO(jwx): fix this
    // await this.router.goto({ left: AbcComponent, right: AbcComponent }, 'first', { id: 123 });
  }
  public async clickAbcLeft() {
    // TODO(fkleuver) / TODO(jwx): fix this
    // await this.router.goto({ left: AbcComponent }, 'first-left', { id: '123L' });
  }
  public async clickAbcRight() {
    // TODO(fkleuver) / TODO(jwx): fix this
    // await this.router.goto({ right: AbcComponent }, 'first-right', { id: '123R' });
  }
  public async clickDef() {
    // TODO(fkleuver) / TODO(jwx): fix this
    // await this.router.goto({ left: DefComponent, right: DefComponent }, 'second', { id: 456 });
  }
  // clickReplace() {
  //   this.router.replace({ left: Content3Component, right: Content3Component }, 'last', { id: 999 });
  // }
  public async clickBack() {
    await this.router.back();
  }
  public async clickForward() {
    await this.router.forward();
  }
  public clickBack2() {
    this.router.navigation.history.go(-2);
  }
  public clickForward2() {
    this.router.navigation.history.go(2);
  }
  public async clickCancel() {
    // TODO(fkleuver) / TODO(jwx): fix this
    // await this.router.navigator.cancel();
  }
  public async clickRefresh() {
    await this.router.refresh();
  }
}
