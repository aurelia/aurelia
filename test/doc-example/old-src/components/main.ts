import { IRouter } from 'aurelia-direct-router';
import { customElement } from '@aurelia/runtime-html';

import { State } from '../state';
import { About } from './about';
import { Authors } from './authors/authors';
import { Books } from './books/books';

@customElement({
  name: 'main',
  template: `
    <div class="\${router.isNavigating ? 'routing' : ''}" style="--primary-color: \${color}">
      <div>
        <au-nav data-test="main-menu" name="main-menu"></au-nav>
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
      <au-viewport no-scope name="lists" used-by="authors,books" default="authors"></au-viewport>
      <au-viewport no-scope name="content" default="about"></au-viewport>
      <au-viewport no-scope name="chat" used-by="chat" no-link no-history></au-viewport>
    </div>
  `
})
export class Main {
  public constructor(
    @IRouter private readonly router: IRouter,
    private readonly state: State,
  ) {
    this.router.setNav('main-menu', [
      {
        title: 'Authors',
        route: [Authors, About],
        consideredActive: ['authors'],
      },
      {
        title: 'Books',
        route: [Books, About],
        consideredActive: 'books',
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
