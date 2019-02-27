import { inject } from '@aurelia//kernel';
import { customElement, ICustomElement } from '@aurelia/runtime';
import { BooksRepository } from '../../repositories/books';

@customElement({
  name: 'books', template: `<template>
<h3>Books</h3>
<ul>
  <li repeat.for="book of books">
    <a href="book(\${book.id})">\${book.title}</a>
    <ul><li repeat.for="author of book.authors">\${author.name}</li></ul>
  </li>
</ul>
</template>` })
@inject(BooksRepository)
export class Books {
  constructor(private readonly booksRepository: BooksRepository) { }

  get books() { return this.booksRepository.books(); }
}
export interface Books extends ICustomElement<HTMLElement> { }
