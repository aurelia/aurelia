import { inject } from '@aurelia/kernel';
import { customElement } from '@aurelia/runtime';
import { IComponentViewportParameters, Router } from '../../../../../router/src/index';
import { About } from './components/about';
import { Authors } from './components/authors';
import { Books } from './components/books';

@inject(Router)
@customElement({
  name: 'app', template:
    `<template>
  <div style="padding: 20px;">
    <au-nav name="app-menu"></au-nav>
    <au-viewport name="lists" used-by="authors,books" default="authors"></au-viewport>
    <au-viewport name="content" default="about"></au-viewport>
    <au-viewport name="chat" used-by="chat" no-link></au-viewport>
  </div>
</template>
` })
export class App {
  constructor(private router: Router) {
    this.router.activate({
      // transformFromUrl: (path, router) => {
      //   if (!path.length) {
      //     return path;
      //   }
      //   if (path.startsWith('/')) {
      //     path = path.slice(1);
      //   }
      //   // Fetch components for the "lists" viewport
      //   const listsComponents = router.rootScope.viewports.lists.options.usedBy.split(',');
      //   const states = [];
      //   const parts = path.split('/');
      //   while (parts.length) {
      //     const component = parts.shift();
      //     const state: IComponentViewportParameters = { component: component };
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
      // transformToUrl: (states: IComponentViewportParameters[], router) => {
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
    this.router.addNav('app-menu', [
      {
        title: 'Authors',
        components: [Authors, About],
        consideredActive: [Authors],
      },
      {
        title: 'Books',
        components: [Books, About],
        consideredActive: Books,
      },
      {
        components: About,
        title: 'About',
      },
      {
        components: 'chat',
        title: 'Chat',
      },
    ]);
  }
}
