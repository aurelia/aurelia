export class ContactList {
  public contacts = [
    { id: '123', name: 'OneTwoThree', },
    { id: '456', name: 'FourFiveSix', },
    { id: '789', name: 'SevenEightNine', },
  ];

  public allContacts() { return this.contacts; }
  public contact(id: string) { return this.contacts.find((value) => value.id === id); }
}
