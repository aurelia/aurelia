import { Book } from "./book";

export class BookService {
    private data: any = [
        { id: '1', title: 'The Colour of Magic', year: 1983, authors: ['Terry Pratchett'] },
        { id: '2', title: 'Jingo', year: 1997, authors: ['Terry Pratchett'] },
        { id: '3', title: 'Night Watch', year: 2002, authors: ['Terry Pratchett'] },
        { id: '4', title: 'It', year: 1986, authors: ['Stephen King'] },
        { id: '5', title: 'The Shining', year: 1977, authors: ['Stephen King'] },
        { id: '6', title: 'The Name of the Wind', year: 2007, authors: ['Patrick Rothfuss'] },
        { id: '7', title: 'The Wise Man\'s Fear', year: 2011, authors: ['Patrick Rothfuss'] },
        { id: '8', title: 'Good Omens', year: 1990, authors: ['Terry Pratchett', 'Neil Gaiman'] },
    ];

    private books: Book[] = [];
    public constructor() {
        this.data.forEach(item =>
            this.books.push(Object.assign(new Book(), item)));
    }

    public getBooks(): Book[] {
        return this.books;
    }

    public getBook(id: string): Book {
        return this.books.find(book => book.id === id);
    }
}
