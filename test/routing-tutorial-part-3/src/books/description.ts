import { inject } from '@aurelia/kernel';
import { BookService } from './book-service';
import { Book } from './book';
import { customElement } from '@aurelia/runtime-html';
import template from './description.html';

@customElement({
  name: 'description',
  template,
})
@inject(BookService)
export class Description {
    public static parameters: string[] = ['id'];
    public book: Book;

    public constructor(private bookService: BookService) {

    }

    public loading(parameters) {
        this.book = this.bookService.getBook(parameters.id);
    }
}
