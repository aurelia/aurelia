import { customElement } from '@aurelia/runtime-html';
import { BooksRepository } from '../../repositories/books';

@customElement({
  name: 'books',
  template: `
    <h3>Books</h3>
    <ul>
      <li data-testid="books-element-item" repeat.for="book of books">
        <a data-testid="books-element-book-link" href="book(\${book.id})">\${book.title}</a>
        <ul><li data-testid="books-element-author-name" repeat.for="author of book.authors">\${author.name}</li></ul>
      </li>
    </ul>
  `
})
export class Books {
  public constructor(
    private readonly booksRepository: BooksRepository
  ) {}

  public get books() {
    return this.booksRepository.books();
  }
}
