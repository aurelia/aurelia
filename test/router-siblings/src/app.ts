import { customElement } from '@aurelia/runtime-html';
import { Router } from '@aurelia/router';

import { AppState } from './app-state';
import { AbcComponent } from './components/abc-component';
import { About } from './components/about';
import { Calendar } from './components/calendar';
import { Email } from './components/email';
import * as deps from './components/index';
import { ILogger } from 'aurelia';

@customElement({
  name: 'app',
  template: `
    <p>\${message}</p>
    <div style="padding: 20px;">
      <div style="padding: 10px;">
        <au-nav name="top-menu"></au-nav>
      </div>

      <div style="padding: 10px;">
        <au-viewport name="header" used-by="header"></au-viewport>
      </div>
      <div style="padding: 10px;">
        <a href="header">Add the header</a>
        <a href="-@header">Remove the header</a>
      </div>
      <div style="padding: 10px;">
        <au-viewport name="steps" used-by="one,two,three"></au-viewport>
      </div>
      <div style="padding: 10px;">
        <a href="one">One</a>
        <a href="two">Two</a>
        <a href="three">Three</a>
      </div>
      <div repeat.for="i of [1,2,3]" style="padding: 10px;">
        <au-viewport name="view\${i}" scope></au-viewport>
        <a href="sub@view\${i}!+sub@view\${i}!/alpha@sub">Alpha \${i}</a>
        <a href="sub@view\${i}!/beta">Beta \${i}</a>
      </div>
      <div style="padding: 10px;">
        <a href="email">Email</a>
        <a href="calendar">Calendar</a>
        <a href="email+contacts@email-content">Email Contacts</a>
        <a href="contacts@email-content">Only Contacts</a>
        <a href="calendar/recursive@calendar-content!/email">Recursive > Email</a>
      </div>
      <div style="padding: 10px;">
        <au-viewport name="application" used-by="email,calendar"></au-viewport>
      </div>

      <div style="padding: 10px;">
        <pre>\${output}</pre>
      </div>
    </div>
  `,
  dependencies: [deps],
})
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
    this.router.activate({
      reportCallback: (instruction) => {
        this.pathCallback(instruction);
      },
      // transformFromUrl: (path, router) => {
      //   if (!path.length) {
      //     return path;
      //   }
      //   if (path.startsWith('/')) {
      //     path = path.slice(1);
      //   }
      //   // Fetch components for the "lists" viewport
      //   const listsComponents = router.rootScope.viewports().lists.options.usedBy.split(',');
      //   const states = [];
      //   const parts = path.split('/');
      //   while (parts.length) {
      //     const component = parts.shift();
      //     const state: ViewportInstruction = { component: component };
      //     // Components in "lists" viewport can't have parameters so continue
      //     if (listsComponents.indexOf(component) >= 0) {
      //       states.push(state);
      //       continue;
      //     }
      //     // It can have parameters, but does it?
      //     if (parts.length > 0) {
      //       state.parameters = { id: parts.shift() };
      //     }
      //     states.push(state);
      //   }
      //   return states;
      // },
      // transformToUrl: (states: ViewportInstruction[], router) => {
      //   const parts = [];
      //   for (const state of states) {
      //     parts.push(state.component);
      //     if (state.parameters) {
      //       parts.push(state.parameters.id);
      //     }
      //   }
      //   return parts.join('/');
      // }
    });

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
        route: 'Root',
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
  public clickAbc() {
    // this.router.goto({ left: AbcComponent, right: AbcComponent }, 'first', { id: 123 });
  }
  public clickAbcLeft() {
    // this.router.goto({ left: AbcComponent }, 'first-left', { id: '123L' });
  }
  public clickAbcRight() {
    // this.router.goto({ right: AbcComponent }, 'first-right', { id: '123R' });
  }
  public clickDef() {
    // this.router.goto({ left: DefComponent, right: DefComponent }, 'second', { id: 456 });
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
