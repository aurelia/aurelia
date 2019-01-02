import { customElement } from '../../../../../../runtime';
import { inject } from '../../../../../..//kernel';
import { ContactList } from './../contact-list';

@customElement({
  name: 'contacts', template: `<template>CONTACTS <input>
<ul>
  <li repeat.for="contact of contacts"><a href="contact=\${contact.id}">\${contact.name}</a></li>
</ul>
<au-viewport name="contact" used-by="contact"></au-viewport>
</template>` })
@inject(ContactList)
export class Contacts {
  constructor(private contactList: ContactList) { }

  get contacts() { return this.contactList.allContacts(); }
}
