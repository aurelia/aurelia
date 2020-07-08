import { inject } from "aurelia";
import { Book } from "./book";
import { BookService } from './book-service';

@inject(BookService)
export class Books {
    public books: Book[] = [];

    public constructor(private bookService: BookService) {

    }

    public enter() {
        this.books = this.bookService.getBooks();
    }
}