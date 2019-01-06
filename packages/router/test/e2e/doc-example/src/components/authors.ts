import { inject } from '@aurelia//kernel';
import { customElement } from '@aurelia/runtime';
import { AuthorsRepository } from '../repositories/authors';

@customElement({
  name: 'authors', template: `<template>
<h3>Authors</h3>
<ul>
  <li repeat.for="author of authors">
    <a href="author/\${author.id}">\${author.name}</a>
    <ul><li repeat.for="book of author.books">\${book.title}</li></ul>
  </li>
</ul>
</template>` })
@inject(AuthorsRepository)
export class Authors {
  constructor(private authorsRepository: AuthorsRepository) { }

  get authors() { return this.authorsRepository.authors(); }
}
