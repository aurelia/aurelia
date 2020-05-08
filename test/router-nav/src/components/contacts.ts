import { inject } from '@aurelia//kernel';
import { customElement } from '@aurelia/runtime';
import { ContactList } from './../contact-list';

@customElement({
  name: 'contacts', template: `<template>CONTACTS <input>
<ul>
  <li repeat.for="contact of contacts"><a href="contact(\${contact.id})">\${contact.name}</a></li>
</ul>
<au-viewport name="contact" used-by="contact"></au-viewport>
</template>` })
@inject(ContactList)
export class Contacts {
  public constructor(private readonly contactList: ContactList) { }

  get contacts() { return this.contactList.allContacts(); }
}
