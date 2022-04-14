import { inject } from "@aurelia/kernel";
import { Book } from "./book";
import { BookService } from './book-service';
import { customElement } from '@aurelia/runtime-html';
import template from './books.html';
import './books.css';

@customElement({
  name: 'books',
  template,
})
@inject(BookService)
export class Books {
    public books: Book[] = [];

    public constructor(private bookService: BookService) {

    }

    public load() {
        this.books = this.bookService.getBooks();
    }
}
