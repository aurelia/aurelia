import { inject } from '@aurelia/kernel';
import { BooksRepository } from '../repositories/books';

@inject(BooksRepository)
export class AuthorsRepository {
  public data = [
    { id: 1, name: 'Terry Pratchett', born: 1948 },
    { id: 2, name: 'Stephen King', born: 1947 },
    { id: 3, name: 'Patrick Rothfuss', born: 1973 },
    { id: 4, name: 'Neil Gaiman', born: 1960 },
  ];

  public constructor(private readonly booksRepository: BooksRepository) {
    for (const book of this.booksRepository.data) {
      for (const bookAuthor of book.authors) {
        const author = this.data.find(v => v.name === bookAuthor.name);
        (bookAuthor as any).id = author.id;
        if (!(author as any).books) {
          (author as any).books = [{ id: book.id, title: book.title }];
        } else {
          (author as any).books.push({ id: book.id, title: book.title });
        }
      }
    }

  }

  public authors() { return this.data; }
  public author(id: number) { return this.data.find((value) => value.id === id); }
}
