import { inject } from '@aurelia//kernel';
import { customElement } from '@aurelia/runtime';
import { UsersRepository } from '../../repositories/users';

@customElement({
  name: 'chat-users', template: `<template>
<ul>
  <li repeat.for="user of users">
    <a href="chat-user=\${user.id}">\${user.id} (\${user.name})</a>
  </li>
</ul>
</template>` })
@inject(UsersRepository)
export class ChatUsers {
  constructor(private readonly usersRepository: UsersRepository) { }

  get users() { return this.usersRepository.users(); }
}
