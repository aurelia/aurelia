import { customElement } from '@aurelia/runtime';
import { AuthorsRepository } from '../../repositories/authors';
import { wait } from '../../utils';

@customElement({ name: 'author-details', template: `<template>
<h3>Details about the author</h3>
<p>Here's details about <strong>\${author.name}</strong>...</p>
</template>` })
export class AuthorDetails {
  public static parameters = ['id'];

  public author = {};
  constructor(private readonly authorsRepository: AuthorsRepository) { }

  public canEnter() {
    return false;
  }

  public enter(parameters) {
    if (parameters.id) {
      this.author = this.authorsRepository.author(+parameters.id);
    }
    return wait(2000);
  }
}
