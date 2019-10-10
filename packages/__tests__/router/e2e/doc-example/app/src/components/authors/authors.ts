import { inject } from '@aurelia//kernel';
import { customElement, IViewModel } from '@aurelia/runtime';
import { AuthorsRepository } from '../../repositories/authors';
import { State } from '../../state';
import { wait } from '../../utils';
import { Author } from './author';

@customElement({
  name: 'authors', template: `<template>
<h3>Authors</h3>
<ul>
  <li data-test="authors-element-item" repeat.for="author of authors">
    <a data-test="authors-element-author-link" href="\${author.name}" goto.bind="{ component: Author, parameters: \`\${author.id}\` }">\${author.name}</a>
    <ul><li data-test="authors-element-book-name" repeat.for="book of author.books">\${book.title}</li></ul>
  </li>
</ul>
</template>` })
@inject(AuthorsRepository, State)
export class Authors {
  private readonly Author = Author;

  public constructor(private readonly authorsRepository: AuthorsRepository, private readonly state: State) { }

  get authors() { return this.authorsRepository.authors(); }

  public enter() {
    return wait(this.state.noDelay ? 0 : 2000);
  }
}
export interface Authors extends IViewModel<HTMLElement> { }
