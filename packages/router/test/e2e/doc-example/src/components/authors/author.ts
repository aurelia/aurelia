import { inject } from '@aurelia//kernel';
import { customElement } from '@aurelia/runtime';
import { Router } from '../../../../../../src';
import { AuthorsRepository } from '../../repositories/authors';
import { State } from '../../state';
import { wait } from '../../utils';
import { Information } from './information';

@customElement({
  name: 'author', template: `<template>
<h3>\${author.name}</h3>
<div>Born: \${author.born}</div>
<div>Books:
  <ul>
    <li repeat.for="book of author.books"><a href="book=\${book.id}">\${book.title}</a></li>
  </ul>
</div>
<div class="info">
  <label><input type="checkbox" checked.two-way="hideTabs">Hide author tabs (adds/removes with an <strong>if</strong>)</label><br>
</div>
<div if.bind="!hideTabs">
  <au-nav name="author-menu"></au-nav>
  <au-viewport name="author-tabs" stateful default="author-details=\${author.id}" used-by="about-authors,author-details,information" no-history></au-viewport>
</div>
</template>`,
  dependencies: [Information as any]
})
@inject(Router, AuthorsRepository, State)
export class Author {
  public static parameters = ['id'];

  public author: { id: number };

  public hideTabs: boolean = false;

  constructor(private readonly router: Router, private readonly authorsRepository: AuthorsRepository, private readonly state: State) { }

  public enter(parameters) {
    if (parameters.id) {
      this.author = this.authorsRepository.author(+parameters.id);
    }
    this.router.setNav('author-menu', [
      {
        title: 'Details',
        route: `author-details=${this.author.id}`
      },
      {
        title: 'About authors',
        route: 'about-authors'
      },
      {
        title: 'Author information',
        route: 'information'
      },
    ]);
    return wait(this.state.noDelay ? 0 : 2000);
  }
}
