import { inject } from '@aurelia//kernel';
import { customElement } from '@aurelia/runtime';
import { Router } from '../../../../../../src';
import { BooksRepository } from '../../repositories/books';
import { Information } from './information';
import { RedirectAbout } from './redirect-about';
import { RedirectInformation } from './redirect-information';

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
<au-viewport name="book-tabs" default="book-details=\${book.id}" used-by="about-books,book-details,information,redirect-information,redirect-about" no-link></au-viewport>
</template>`,
  dependencies: [Information as any, RedirectInformation as any, RedirectAbout as any]
})
@inject(Router, BooksRepository)
export class Book {
  public static parameters = ['id'];

  public book: { id: number };

  constructor(private readonly router: Router, private readonly booksRepository: BooksRepository) { }

  public enter(parameters) {
    if (parameters.id) {
      this.book = this.booksRepository.book(+parameters.id);
    }
    this.router.setNav('book-menu', [
      {
        title: 'Details',
        route: `book-details=${this.book.id}`
      },
      {
        title: 'About books',
        route: 'about-books'
      },
      {
        title: 'Book information',
        route: 'information'
      },
      {
        title: 'Redirect information',
        route: 'redirect-information'
      },
      {
        title: 'Redirect about',
        route: 'redirect-about'
      },
    ]);
  }
}
