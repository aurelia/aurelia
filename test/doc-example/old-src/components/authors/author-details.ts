import { customElement } from '@aurelia/runtime-html';
import { AuthorsRepository } from '../../repositories/authors';
import { State } from '../../state';

@customElement({
  name: 'author-details',
  template: `
    <div>
      <h3>Details about the author</h3>
      <p>Here's details about <strong>\${author.name}</strong>... <input></p>
      <div class="scrollbox">All about the space, about the space, no truncate...</div>
    </div>
  `
})
export class AuthorDetails {
  public static parameters: string[] = ['id'];

  public author: any = {};

  public constructor(
    private readonly authorsRepository: AuthorsRepository,
    private readonly state: State,
  ) {}

  public canEnter() {
    return this.state.allowEnterAuthorDetails;
  }

  public async enter(parameters) {
    if (parameters.id) {
      this.author = this.authorsRepository.author(+parameters.id);
    }
    if (!this.state.noDelay) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}
