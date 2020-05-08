import { inject } from '@aurelia/kernel';
import { customElement } from '@aurelia/runtime';
import { Router } from '../../../../../router/src/index';

import { AppState } from './app-state';
import { About } from './components/about';
import { Calendar } from './components/calendar';
import { Email } from './components/email';

@inject(Router, AppState)
@customElement({
  name: 'app', template:
    `<template>
  <p>\${message}</p>
  <div style="padding: 20px;">
    <div style="padding: 10px;">
      <au-nav name="top-menu"></au-nav>
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
</template>
` })
export class App {
  public message = 'So... we meet again, Mr. World!';
  public output: string = '';
  public title: string = '';

  private readonly left: any;
  private readonly right: any;

  public constructor(private readonly router: Router, private readonly appState: AppState) {
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
    }).catch(error => { throw error; });

    this.updateTitle();
    console.log('ROUTER', this.router);

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
}
