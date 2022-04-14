export class BooksRepository {
  public data = [
    { id: 1, title: 'The Colour of Magic', year: 1983, authors: [{ name: 'Terry Pratchett' }] },
    { id: 2, title: 'Jingo', year: 1997, authors: [{ name: 'Terry Pratchett' }] },
    { id: 3, title: 'Night Watch', year: 2002, authors: [{ name: 'Terry Pratchett' }] },
    { id: 4, title: 'It', year: 1986, authors: [{ name: 'Stephen King' }] },
    { id: 5, title: 'The Shining', year: 1977, authors: [{ name: 'Stephen King' }] },
    { id: 6, title: 'The Name of the Wind', year: 2007, authors: [{ name: 'Patrick Rothfuss' }] },
    { id: 7, title: 'The Wise Man\'s Fear', year: 2011, authors: [{ name: 'Patrick Rothfuss' }] },
    { id: 8, title: 'Good Omens', year: 1990, authors: [{ name: 'Terry Pratchett' }, { name: 'Neil Gaiman' }] },
  ];

  public books(): any[] { return this.data; }
  public book(id: number) { return this.data.find((value) => value.id === id); }
}
