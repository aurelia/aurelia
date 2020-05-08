import { customElement } from '@aurelia/runtime';
import { ContactList } from '../contact-list';

@customElement({
  name: 'contact',
  template: `
    CONTACT <input>
    <p>Id: \${contact.id}</p>
    <p>Name: \${contact.name}</p>
  `,
})
export class Contact {
  public static parameters: string[] = ['id'];

  public contact = {};
  public constructor(
    private readonly contactList: ContactList,
  ) { }

  public enter(parameters) {
    if (parameters.id) {
      this.contact = this.contactList.contact(parameters.id);
    }
  }
}
