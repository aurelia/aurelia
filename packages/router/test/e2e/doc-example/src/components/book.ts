import { inject } from '@aurelia//kernel';
import { customElement } from '@aurelia/runtime';
import { Router } from '../../../../../src';
import { BooksRepository } from '../repositories/books';

@customElement({
  name: 'book', template: `<template>
<h3>\${book.title}</h3>
<div>Published: \${book.year}</div>
<div>Author(s):
  <ul>
    <li repeat.for="author of book.authors"><a href="author=\${author.id}">\${author.name}</a></li>
  </ul>
</div>
<au-nav name="book-menu"></au-nav>
<au-viewport name="book-tabs" default="book-details=\${book.id}" used-by="about-books,book-details"></au-viewport>
</template>` })
@inject(Router, BooksRepository)
export class Book {
  public static parameters = ['id'];

  public book: {id: number};

  constructor(private router: Router, private booksRepository: BooksRepository) { }

  public enter(parameters) {
    if (parameters.id) {
      this.book = this.booksRepository.book(+parameters.id);
    }
    this.router.setNav('book-menu', [
      {
        title: 'Details',
        components: `book-details=${this.book.id}`
      },
      {
        title: 'About books',
        components: 'about-books'
      },
    ]);
  }
}
