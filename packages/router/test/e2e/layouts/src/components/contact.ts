import { customElement } from '../../../../../../runtime';
import { ContactList } from '../contact-list';

@customElement({
  name: 'contact', template: `<template>CONTACT <input>
<p>Id: \${contact.id}</p>
<p>Name: \${contact.name}</p>
</template>` })
export class Contact {
  static parameters = ['id'];

  public contact = {};
  public contactList;
  constructor() { this.contactList = new ContactList(); }

  enter(parameters) {
    if (parameters.id) {
      this.contact = this.contactList.contact(parameters.id);
    }
  }
}
