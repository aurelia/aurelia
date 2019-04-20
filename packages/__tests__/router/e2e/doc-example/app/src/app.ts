import { inject } from '@aurelia/kernel';
import { customElement } from '@aurelia/runtime';
import { Router } from '@aurelia/router';
import { About } from './components/about';
import { Authors } from './components/authors/authors';
import { Books } from './components/books/books';
import { AuthorsRepository } from './repositories/authors';
import { State } from './state';

import { arrayRemove } from '../../../../../../router/src/utils';

@inject(Router, AuthorsRepository, State)
@customElement({
  name: 'app', template:
    `
<div if.bind="!state.loggedIn">
  <login></login>
</div>
<div if.bind="state.loggedIn">
  <div class="\${router.isNavigating ? 'routing' : ''}" style="--primary-color: \${color}">
    <div>
      <au-nav data-test="app-menu" name="app-menu"></au-nav>
      <span class="loader \${router.isNavigating ? 'routing' : ''}">&nbsp;</span>
    </div>
    <div class="info">
      In this test, the <i>Authors</i> list and <i>Author</i> component have a 2 second wait/delay on <pre>enter</pre>,
      the <i>About</i> component has a 4 second delay on <pre>enter</pre> and <i>Author details</i> stops navigation
      in <pre>canEnter</pre>. (Meaning that <i>Author</i> can't be opened since it has <i>Author details</i> as default
      and the navigation is rolled back after 2 seconds.)
    </div>
    <div class="info">
      <label><input data-test="no-delay-checkbox" type="checkbox" checked.two-way="state.noDelay">Disable loading delays for components</label><br>
      <label><input data-test="allow-enter-author-details-checkbox" type="checkbox" checked.two-way="state.allowEnterAuthorDetails">Allow entering <i>Author details</i></label><br>
    </div>
    <div class="info" style="background-color: var(--primary-color)">
      <select data-test="info-background-color-select" value.two-way="color">
        <option value="lightblue">Light blue</option>
        <option value="lightgreen">Light green</option>
      <select>
      <div style="display: inline-block;">
        The background is in the --primary-color: <span data-test="info-background-color">\${color}</span>.
      </div>
    </div>
    <au-viewport name="lists" used-by="authors,books" default="authors"></au-viewport>
    <au-viewport name="content" default="about"></au-viewport>
    <au-viewport name="chat" used-by="chat" no-link no-history></au-viewport>
  </div>
</div>
` })
export class App {
  public color: string = 'lightgreen';
  constructor(private readonly router: Router, authorsRepository: AuthorsRepository, private readonly state: State) {
    let arr: any = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 2 }];
    console.log('§§§§§', arr);
    console.log('§§§§§', arrayRemove(arr, value => value.id === 2));
    console.log('§§§§§', arr);

    arr = [1, 2, 3, 2];
    console.log('§§§§§', arr);
    console.log('§§§§§', arrayRemove(arr, value => value === 2));
    console.log('§§§§§', arr);

    authorsRepository.authors(); // Only here to initialize repositories
  }

  public bound() {
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

    this.router.guardian.addGuard((instructions) => {
      if (this.verifyLogin()) {
        return true;
      }
      this.state.loginReturnTo.push(this.router.instructionResolver.stringifyViewportInstructions(instructions));
      alert("You've timed out!");
      this.state.loggedIn = false;
      return false;
    }, { exclude: ['', 'login'] });

    this.router.guardian.addGuard((instructions) => {
      if (this.verifyLogin(true)) { // true makes it separate and "special"
        return true;
      }
      const params = this.router.instructionResolver.encodeViewportInstructions(instructions);
      this.router.goto(`login(${params}&1)`);
      this.state.loggedInSpecial = false;
      return [];
    }, { include: [{ viewportName: 'author-tabs' }], exclude: ['', 'login'] });

    // this.router.guardian.addGuard((instructions) => {
    //   return this.notify('Guarded (all)', instructions);
    // });

    // this.router.guardian.addGuard((instructions) => {
    //   return this.notify('Guarded (all but "author")', instructions);
    // }, { exclude: ['author'] });

    // this.router.guardian.addGuard((instructions) => {
    //   return this.notify('Guarded ("author" and "book")', instructions);
    // }, { include: ['author', 'book'] });

    // this.router.guardian.addGuard((instructions) => {
    //   this.notify('Guarded (everything in VIEWPORT "author-tabs")', instructions);
    //   this.router.goto('about');
    //   return false;
    // }, { include: [{ viewportName: 'author-tabs' }] });

    console.log('#### guardian', this.router.guardian.guards);
    // console.log('#### passes', this.guardian.passes(GuardTypes.Before, { path: 'some-component', fullStatePath: null }));
  }

  private verifyLogin(special: boolean = false): boolean {
    if (!(special ? this.state.loggedInSpecial : this.state.loggedIn)) {
      return false;
    }
    const timeout = special
      ? this.state.loggedInSpecialAt.getTime() + 5 * 1000
      : this.state.loggedInAt.getTime() + 15 * 1000;
    const now = new Date().getTime();
    return timeout > now;
  }

  notify(message, instructions) {
    alert(message + ': ' + instructions.map(i => i.componentName).join(', '));
    console.log('#####', message, instructions);
    return true;
  }
}
