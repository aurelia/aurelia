import { inject } from 'aurelia';
import { BookService } from './book-service';
import { Book } from './book';

@inject(BookService)
export class BookDetails {
    public static parameters: string[] = ['id'];
    public book: Book;

    public constructor(private readonly bookService: BookService) {

    }

    public load(parameters) {
        this.book = this.bookService.getBook(parameters.id);
    }
}
