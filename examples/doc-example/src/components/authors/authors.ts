import { customElement } from '@aurelia/runtime-html';
import { AuthorsRepository } from '../../repositories/authors';
import { State } from '../../state';
import { Author } from './author';
import { Constructable } from '@aurelia/kernel';

@customElement({
  name: 'authors',
  template: `
    <h3>Authors</h3>
    <ul>
      <li data-test="authors-element-item" repeat.for="author of authors">
        <a data-test="authors-element-author-link" href="\${author.name}" goto.bind="{ component: Author, parameters: \`\${author.id}\` }">\${author.name}</a>
        <ul><li data-test="authors-element-book-name" repeat.for="book of author.books">\${book.title}</li></ul>
      </li>
    </ul>
  `
})
export class Authors {
  private readonly Author: Constructable = Author;

  public constructor(
    private readonly authorsRepository: AuthorsRepository,
    private readonly state: State,
  ) {}

  public get authors() {
    return this.authorsRepository.authors();
  }

  public async enter() {
    if (!this.state.noDelay) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}
