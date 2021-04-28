import { IRouter } from 'aurelia-direct-router';
import { customElement, INode } from '@aurelia/runtime-html';
import { AuthorsRepository } from './repositories/authors';
import { State } from './state';

@customElement({
  name: 'app',
  template: `
    <div class="info">
      <label><input data-test="timed-out-checkbox" type="checkbox" checked.two-way="state.timedOut">Timed out</label><br>
      <label><input data-test="special-timed-out-checkbox" type="checkbox" checked.two-way="state.specialTimedOut"><i>Special</i> timed out</label><br>
    </div>
    <div><a href="login" goto="login"><span>login</span></a></div>
    <div><a href="\${link}"><span>A changing link</span></a></div>
    <div><a goto="authors/4+about">Authors</a></div>
    <au-viewport no-scope name="gate" used-by="main,login" default="\${!state.loggedIn ? 'login' : 'main'}"></au-viewport>
  `
})
export class App {
  public link: string = 'aLink';
  public constructor(
    @IRouter private readonly router: IRouter,
    @INode private readonly element: INode,
    authorsRepository: AuthorsRepository,
    private readonly state: State,
  ) {
    authorsRepository.authors(); // Only here to initialize repositories
  }

  // KEEP THIS!
  public match(current) {
    // const rootScope = this.router['rootScope'];

    // const match = rootScope.routeTable.findMatchingRoute(current.path);
    // console.log('matching route', match);

    // let routes = rootScope.routeTable.routes;
    // for (const route of routes) {
    //   console.log(route, this.isWithin(route, current));
    // }
    // routes = routes.filter(route => this.isWithin(route, current));
    // console.log('routes within', routes.slice());
    // let length = routes.length + 1;
    // while (length > routes.length) {
    //   length = routes.length;
    //   for (let i = 0; i < routes.length; i++) {
    //     for (let j = 0; j < routes.length; j++) {
    //       if (i !== j && this.isWithin(routes[i], routes[j])) {
    //         routes.splice(i, 1);
    //         i--;
    //         break;
    //       }
    //     }
    //   }
    // }
    // console.log('routes within not within', routes);

    // const urlRoutes = [];
    // const currentInstructions = this.router.instructionResolver.flattenViewportInstructions(current.instructions);
    // while (currentInstructions.length > 0 && routes.length > 0) {
    //   for (const route of routes) {
    //     if (this.isWithin(route, { instructions: currentInstructions })) {
    //       urlRoutes.push(route);
    //       for (const part of route.instructions) {
    //         const index = currentInstructions.findIndex(match => part.sameComponent(match) && part.sameViewport(match));
    //         if (index > -1) {
    //           currentInstructions.splice(index, 1);
    //         }
    //       }
    //     }
    //   }
    // }
    // console.log('routes end', urlRoutes, routes, currentInstructions);

  }
  public isWithin(find, lookup) {
    const parts = this.router.instructionResolver.flattenViewportInstructions(find.instructions);
    const instructions = this.router.instructionResolver.flattenViewportInstructions(lookup.instructions);
    for (const part of parts) {
      const index = instructions.findIndex(match => part.sameComponent(match) && part.sameViewport(match));
      if (index > -1) {
        instructions.splice(index, 1);
      } else {
        return false;
      }
    }
    return true;
    // return !parts.some(part => !instructions.find(match => !part.sameComponent(match) || !part.sameViewport(match)));
    // for (const part of parts) {
    //   const index = instrs.findIndex(match => part.sameComponent(match) && part.sameViewport(match));
    //   if (index > -1) {
    //     instrs.splice(index, 1);
    //     matches++;
    //   }
    // }
  }

  public matches(route, instructions) {
    const parts = this.router.instructionResolver.flattenViewportInstructions(route);
    const instrs = this.router.instructionResolver.flattenViewportInstructions(instructions);
    let matches = 0;
    for (const part of parts) {
      const index = instrs.findIndex(match => part.sameComponent(match) && part.sameViewport(match));
      if (index > -1) {
        instrs.splice(index, 1);
        matches++;
      }
    }
    return { matches, match: matches === parts.length };
  }

  public bound() {
    setTimeout(() => { this.link = 'newLink'; }, 5000);
    const paths = [
      'authors',
      'authors+books',
      'authors+about',
      'authors/author(1)',
      'authors/author(1)+books',
      'authors/author(1)+about',
      'authors/author(1)+about+books',
    ];
    const states = paths.map(path => { return { path: path, instructions: this.router.instructionResolver.parseViewportInstructions(path) }; });
    const viewports = {
      'authors': 'left',
      'about': 'middle',
      'books': 'right',
    };
    for (const state of states) {
      for (const instruction of state.instructions) {
        if (viewports[instruction.componentName]) {
          instruction.setViewport(viewports[instruction.componentName]);
          if (instruction.nextScopeInstructions) {
            instruction.nextScopeInstructions[0].setViewport('down');
          }
        }
      }
    }
    // const routes = states.map(state => {
    //   return {
    //     path: state.path,
    //     instructions:
    //       [this.router.instructionResolver.stringifyViewportInstructions(this.router.instructionResolver.flattenViewportInstructions(state.instructions))]
    //   };
    // });
    const routes = [
      { path: 'authors', instructions: [{ component: 'authors', viewport: 'left' }] },
      { path: 'authors+books', instructions: [{ component: 'authors', viewport: 'left' }, { component: 'books', viewport: 'right' }] },
      { path: 'authors+about', instructions: [{ component: 'authors', viewport: 'left' }, { component: 'about', viewport: 'middle' }] },
      { path: 'authors/:id', instructions: [{ component: 'authors', viewport: 'left' }, { component: 'author', viewport: 'down' }] },
      { path: 'authors/:id+books', instructions: [{ component: 'authors', viewport: 'left' }, { component: 'author', viewport: 'down' }, { component: 'books', viewport: 'right' }] },
      { path: 'authors/:id+about', instructions: [{ component: 'main', viewport: 'gate' }, { component: 'authors', viewport: 'lists' }, { component: 'author', viewport: 'content' }] },
      { path: 'authors/:id+about+books', instructions: [{ component: 'authors', viewport: 'left' }, { component: 'author', viewport: 'down' }, { component: 'about', viewport: 'middle' }, { component: 'books', viewport: 'right' }] },
    ];
    this.router.addRoutes(routes);
    console.log('routes', routes);

    // for (const state of states) {
    //   const matches = this.matches(route, state.instructions)
    //   console.log('match', state.path, matches);
    // }

    // this.router.activate({
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
    // }).catch(error => { throw error; });

    // this.router.guardian.addGuard((instructions) => {
    //   if (this.verifyLogin()) {
    //     return true;
    //   }
    //   this.state.loginReturnTo = this.router.instructionResolver.mergeViewportInstructions([
    //     ...this.state.loginReturnTo,
    //     ...this.router.activeComponents,
    //     ...instructions
    //   ]);
    //   // this.state.loginReturnTo.push(...this.router.activeComponents)
    //   // this.state.loginReturnTo.push(this.router.instructionResolver.stringifyViewportInstructions(instructions));
    //   alert("You've timed out!");
    //   this.state.loggedIn = false;
    //   this.router.goto('login');
    //   return false;
    // }, { exclude: ['', 'login'] });

    // this.router.guardian.addGuard((instructions) => {
    //   if (this.verifyLogin(true)) { // true makes it separate and "special"
    //     return true;
    //   }
    //   // this.state.loginReturnTo.push(this.router.instructionResolver.stringifyViewportInstructions(instructions));
    //   this.state.loginReturnTo = this.router.instructionResolver.mergeViewportInstructions([
    //     ...this.state.loginReturnTo,
    //     ...this.router.activeComponents,
    //     ...instructions
    //   ]);
    //   this.state.loggedInSpecial = false;
    //   this.router.goto(`login-special`);
    //   return [];
    // }, { include: [{ viewport: 'author-tabs' }], exclude: ['', 'login-special'] });

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
    // }, { include: [{ viewport: 'author-tabs' }] });

    // console.log('#### guardian', this.router.guardian.guards);
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
    alert(`${message}: ${instructions.map(i => i.componentName).join(', ')}`);
    console.log('#####', message, instructions);
    return true;
  }
}
