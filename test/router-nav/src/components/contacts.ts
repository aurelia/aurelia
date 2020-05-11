import { customElement } from '@aurelia/runtime';
import { ContactList } from '../contact-list';

@customElement({
  name: 'contacts',
  template: `
    CONTACTS <input>
    <ul>
      <li repeat.for="contact of contacts"><a href="contact(\${contact.id})">\${contact.name}</a></li>
    </ul>
    <au-viewport name="contact" used-by="contact"></au-viewport>
  `,
})
export class Contacts {
  public constructor(
    private readonly contactList: ContactList,
  ) { }

  public get contacts() {
    return this.contactList.allContacts();
  }
}
