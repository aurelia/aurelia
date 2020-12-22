import { customElement } from '@aurelia/runtime-html';
import { BooksRepository } from '../../repositories/books';

@customElement({
  name: 'book-details',
  template: `
    <h3>Details about the book</h3>
    <p>Here's details about <strong>\${book.title}</strong>...</p>
  `
})
export class BookDetails {
  public static parameters: string[] = ['id'];

  public book: any = {};
  public constructor(
    private readonly booksRepository: BooksRepository
  ) {}

  public enter(parameters) {
    if (parameters.id) {
      this.book = this.booksRepository.book(+parameters.id);
    }
  }
}
