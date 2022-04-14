import { Description } from './description';
import { inject } from '@aurelia/kernel';
import { BookService } from './book-service';
import { Book } from './book';
import { customElement } from '@aurelia/runtime-html';
import template from './book-details.html';
import './book-details.css';
import { AboutBooks } from './about-books';

@customElement({
  name: 'book-details',
  template,
  dependencies: [AboutBooks, Description],
})
@inject(BookService)
export class BookDetails {
  public static parameters: string[] = ['id'];
  public static title = (vm) => vm.book.title;

  public book: Book;

  public constructor(private bookService: BookService) {

  }

  public load(parameters) {
    this.book = this.bookService.getBook(parameters.id);
  }
}
