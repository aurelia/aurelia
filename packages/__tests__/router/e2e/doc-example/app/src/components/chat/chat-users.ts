import { inject } from '@aurelia//kernel';
import { customElement } from '@aurelia/runtime';
import { UsersRepository } from '../../repositories/users';

@customElement({
  name: 'chat-users', template: `<template>
<ul>
  <li data-test="chat-users-element-item" repeat.for="user of users">
    <a data-test="chat-users-element-links" href="chat-user(\${user.id})">\${user.id} (\${user.name})</a>
  </li>
</ul>
</template>` })
@inject(UsersRepository)
export class ChatUsers {
  public constructor(private readonly usersRepository: UsersRepository) { }

  get users() { return this.usersRepository.users(); }
}
