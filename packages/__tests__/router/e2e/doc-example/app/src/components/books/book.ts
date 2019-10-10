import { inject } from '@aurelia//kernel';
import { customElement } from '@aurelia/runtime';
import { IRouter } from '@aurelia/router';
import { BooksRepository } from '../../repositories/books';
import { Information } from './information';
import { RedirectAbout } from './redirect-about';
import { RedirectInformation } from './redirect-information';

@customElement({
  name: 'book', template: `<template>
<h3 data-test="book-element-book-name">\${book.title}</h3>
<div data-test="book-element-publish-year">Published: \${book.year}</div>
<div>Author(s):
  <ul>
    <li repeat.for="author of book.authors"><a data-test="book-element-author-link" href="author(\${author.id})">\${author.name}</a></li>
  </ul>
</div>
<au-nav data-test="book-menu" name="book-menu"></au-nav>
<au-viewport no-scope name="book-tabs" default="book-details(\${book.id})" used-by="about-books,book-details,information,redirect-information,redirect-about" no-link></au-viewport>
</template>`,
  dependencies: [Information as any, RedirectInformation as any, RedirectAbout as any]
})
@inject(IRouter, BooksRepository)
export class Book {
  public static parameters = ['id'];

  public book: { id: number };

  public constructor(private readonly router: IRouter, private readonly booksRepository: BooksRepository) { }

  public enter(parameters) {
    let id = +(parameters.id ? parameters.id : parameters[0]);
    if (id) {
      this.book = this.booksRepository.book(id);
    }
    this.router.setNav('book-menu', [
      {
        title: 'Details',
        route: `book-details(${this.book.id})`
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
