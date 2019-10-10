import { inject } from '@aurelia//kernel';
import { customElement } from '@aurelia/runtime';
import { ContactList } from '../contact-list';

@customElement({
  name: 'contact', template: `<template>CONTACT <input>
<p>Id: \${contact.id}</p>
<p>Name: \${contact.name}</p>
</template>` })
@inject(ContactList)
export class Contact {
  public static parameters = ['id'];

  public contact = {};
  public constructor(private readonly contactList: ContactList) { }

  public enter(parameters) {
    if (parameters.id) {
      this.contact = this.contactList.contact(parameters.id);
    }
  }
}
