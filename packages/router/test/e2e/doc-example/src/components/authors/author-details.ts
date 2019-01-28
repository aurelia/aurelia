import { inject } from '@aurelia/kernel';
import { customElement } from '@aurelia/runtime';
import { AuthorsRepository } from '../../repositories/authors';
import { State } from '../../state';
import { wait } from '../../utils';

@customElement({ name: 'author-details', template: `<template>
<h3>Details about the author</h3>
<p>Here's details about <strong>\${author.name}</strong>...</p>
</template>` })
@inject(AuthorsRepository, State)
export class AuthorDetails {
  public static parameters = ['id'];

  public author = {};
  constructor(private readonly authorsRepository: AuthorsRepository, private state: State) { }

  public canEnter() {
    return false;
  }

  public enter(parameters) {
    if (parameters.id) {
      this.author = this.authorsRepository.author(+parameters.id);
    }
    return wait(this.state.noDelay ? 0 : 2000);
  }
}
