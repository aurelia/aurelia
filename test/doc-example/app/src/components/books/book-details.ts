import { customElement } from '@aurelia/runtime';
import { BooksRepository } from '../../repositories/books';

@customElement({ name: 'book-details', template: `<template>
<h3>Details about the book</h3>
<p>Here's details about <strong>\${book.title}</strong>...</p>
</template>` })
export class BookDetails {
  public static parameters = ['id'];

  public book = {};
  public constructor(private readonly booksRepository: BooksRepository) { }

  public enter(parameters) {
    if (parameters.id) {
      this.book = this.booksRepository.book(+parameters.id);
    }
  }
}
