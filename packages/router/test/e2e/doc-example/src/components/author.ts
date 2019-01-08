import { inject } from '@aurelia//kernel';
import { customElement } from '@aurelia/runtime';
import { AuthorsRepository } from '../repositories/authors';

@customElement({
  name: 'author', template: `<template>
<h3>\${author.name}</h3>
<div>Born: \${author.born}</div>
<div>Books:
  <ul>
    <li repeat.for="book of author.books"><a href="book=\${book.id}">\${book.title}</a></li>
  </ul>
</div>
</template>` })
@inject(AuthorsRepository)
export class Author {
  public static parameters = ['id'];

  public author = {};
  constructor(private authorsRepository: AuthorsRepository) { }

  public enter(parameters) {
    if (parameters.id) {
      this.author = this.authorsRepository.author(+parameters.id);
    }
  }
}
