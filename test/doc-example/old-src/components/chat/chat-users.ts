import { customElement } from '@aurelia/runtime-html';
import { UsersRepository } from '../../repositories/users';

@customElement({
  name: 'chat-users',
  template: `
    <ul>
      <li data-test="chat-users-element-item" repeat.for="user of users">
        <a data-test="chat-users-element-links" href="chat-user(\${user.id})">\${user.id} (\${user.name})</a>
      </li>
    </ul>
  `
})
export class ChatUsers {
  public constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  public get users() {
    return this.usersRepository.users();
  }
}
