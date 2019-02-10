import { inject } from '@aurelia/kernel';
import { customElement } from '@aurelia/runtime';
import { Router } from '../../../../../router/src/index';
import { About } from './components/about';
import { Authors } from './components/authors/authors';
import { Books } from './components/books/books';
import { AuthorsRepository } from './repositories/authors';
import { State } from './state';

@inject(Router, AuthorsRepository, State)
@customElement({
  name: 'app', template:
    `<template>
  <div class="\${router.isNavigating ? 'routing' : ''}">
    <div>
      <au-nav name="app-menu"></au-nav>
      <span class="loader \${router.isNavigating ? 'routing' : ''}">&nbsp;</span>
    </div>
    <div class="info">
      In this test, the <i>Authors</i> list and <i>Author</i> component have a 2 second wait/delay on <pre>enter</pre>,
      the <i>About</i> component has a 4 second delay on <pre>enter</pre> and <i>Author details</i> stops navigation
      in <pre>canEnter</pre>. (Meaning that <i>Author</i> can't be opened since it has <i>Author details</i> as default
      and the navigation is rolled back after 2 seconds.)
    </div>
    <div class="info">
    <label><input type="checkbox" checked.two-way="state.noDelay">Disable loading delays for components</label><br>
    <label><input type="checkbox" checked.two-way="state.allowEnterAuthorDetails">Allow entering <i>Author details</i></label><br>
    </div>
    <au-viewport name="lists" used-by="authors,books" default="authors"></au-viewport>
    <au-viewport name="content" stateful default="about"></au-viewport>
    <au-viewport name="chat" used-by="chat" no-link no-history></au-viewport>
  </div>
</template>
` })
export class App {
  constructor(private readonly router: Router, authorsRepository: AuthorsRepository, private readonly state: State) {
    authorsRepository.authors(); // Only here to initialize repositories
    this.router.activate({
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
    this.router.addNav('app-menu', [
      {
        title: 'Authors',
        route: [Authors, About],
        consideredActive: [Authors],
      },
      {
        title: 'Books',
        route: [Books, About],
        consideredActive: Books,
      },
      {
        route: About,
        title: 'About',
      },
      {
        route: 'chat',
        title: 'Chat',
      },
    ]);
  }
}
