import { inject } from '@aurelia//kernel';
import { customElement } from '@aurelia/runtime';
import { BooksRepository } from '../repositories/books';

@customElement({
  name: 'book', template: `<template>
<h3>\${book.title}</h3>
<div>Published: \${book.year}</div>
<div>Author(s):
  <ul>
    <li repeat.for="author of book.authors"><a href="author/\${author.id}">\${author.name}</a></li>
  </ul>
</div>
</template>` })
@inject(BooksRepository)
export class Book {
  public static parameters = ['id'];

  public book = {};
  constructor(private booksRepository: BooksRepository) { }

  public enter(parameters) {
    if (parameters.id) {
      this.book = this.booksRepository.book(+parameters.id);
    }
  }
}
