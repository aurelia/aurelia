import { customElement } from '@aurelia/runtime-html';
import { UsersRepository } from '../../repositories/users';

@customElement({
  name: 'chat-user',
  template: `
    <p data-test="chat-user-element-title">Chatting with <strong>\${user.id} (\${user.name})</strong><p>
    <p>You: Hello!</p>
    <p><input data-test="chat-user-element-input"></p>
  `
})
export class ChatUser {
  public static parameters: string[] = ['id'];

  public user: any = {};
  public constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  public enter(parameters) {
    if (parameters.id) {
      this.user = this.usersRepository.user(parameters.id);
    }
  }
}
