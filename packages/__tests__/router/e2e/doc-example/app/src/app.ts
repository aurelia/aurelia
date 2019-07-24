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
<div class="info">
  <label><input data-test="timed-out-checkbox" type="checkbox" checked.two-way="state.timedOut">Timed out</label><br>
  <label><input data-test="special-timed-out-checkbox" type="checkbox" checked.two-way="state.specialTimedOut"><i>Special</i> timed out</label><br>
</div>
<div><a href="login">login</a></div>
<au-viewport name="gate" used-by="main,login" default="\${!state.loggedIn ? 'login' : 'main'}"></au-viewport>
` })
export class App {
  constructor(private readonly router: Router, authorsRepository: AuthorsRepository, private readonly state: State) {
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

    this.router.guardian.addGuard((instructions) => {
      if (this.verifyLogin()) {
        return true;
      }
      this.state.loginReturnTo = this.router.instructionResolver.mergeViewportInstructions([
        ...this.state.loginReturnTo,
        ...this.router.activeComponents,
        ...instructions
      ]);
      // this.state.loginReturnTo.push(...this.router.activeComponents)
      // this.state.loginReturnTo.push(this.router.instructionResolver.stringifyViewportInstructions(instructions));
      alert("You've timed out!");
      this.state.loggedIn = false;
      this.router.goto('login');
      return false;
    }, { exclude: ['', 'login'] });

    this.router.guardian.addGuard((instructions) => {
      if (this.verifyLogin(true)) { // true makes it separate and "special"
        return true;
      }
      // this.state.loginReturnTo.push(this.router.instructionResolver.stringifyViewportInstructions(instructions));
      this.state.loginReturnTo = this.router.instructionResolver.mergeViewportInstructions([
        ...this.state.loginReturnTo,
        ...this.router.activeComponents,
        ...instructions
      ]);
      this.state.loggedInSpecial = false;
      this.router.goto('login-special');
      return [];
    }, { include: [{ viewportName: 'author-tabs' }], exclude: ['', 'login-special'] });

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
    return !(special ? this.state.specialTimedOut : this.state.timedOut);
    // const timeout = special
    //   ? this.state.loggedInSpecialAt.getTime() + 5 * 1000
    //   : this.state.loggedInAt.getTime() + 15 * 1000;
    // const now = new Date().getTime();
    // return timeout > now;
  }

  private notify(message, instructions) {
    alert(message + ': ' + instructions.map(i => i.componentName).join(', '));
    console.log('#####', message, instructions);
    return true;
  }
}
