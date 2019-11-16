import { inject } from '@aurelia/kernel';
import { customElement } from '@aurelia/runtime';
import { AuthorsRepository } from '../../repositories/authors';
import { State } from '../../state';
import { wait } from '../../utils';

@customElement({ name: 'author-details', template: `<template>
<div>
<h3>Details about the author</h3>
<p>Here's details about <strong>\${author.name}</strong>... <input></p>
<div class="scrollbox">All about the space, about the space, no truncate...</div>
</div>
</template>` })
@inject(AuthorsRepository, State)
export class AuthorDetails {
  public static parameters = ['id'];

  public author = {};
  public constructor(private readonly authorsRepository: AuthorsRepository, private readonly state: State) { }

  public canEnter() {
    return this.state.allowEnterAuthorDetails;
  }

  public enter(parameters) {
    if (parameters.id) {
      this.author = this.authorsRepository.author(+parameters.id);
    }
    return wait(this.state.noDelay ? 0 : 2000);
  }
}
