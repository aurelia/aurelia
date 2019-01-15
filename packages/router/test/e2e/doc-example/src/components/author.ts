import { inject } from '@aurelia//kernel';
import { customElement } from '@aurelia/runtime';
import { Router } from '../../../../../src';
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
<au-nav name="author-menu"></au-nav>
<au-viewport name="author-tabs" default="author-details=\${author.id}" used-by="about-authors,author-details" no-history></au-viewport>
</template>` })
@inject(Router, AuthorsRepository)
export class Author {
  public static parameters = ['id'];

  public author: { id: number };

  constructor(private readonly router: Router, private readonly authorsRepository: AuthorsRepository) { }

  public enter(parameters) {
    if (parameters.id) {
      this.author = this.authorsRepository.author(+parameters.id);
    }
    this.router.setNav('author-menu', [
      {
        title: 'Details',
        components: `author-details=${this.author.id}`
      },
      {
        title: 'About authors',
        components: 'about-authors'
      },
    ]);
  }

  public created(...rest) {
    console.log('Created', rest);
  }
}
