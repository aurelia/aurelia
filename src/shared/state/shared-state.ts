import { User } from '../models/user';

export class SharedState {
  currentUser: User;
  isAuthenticated: boolean;

  constructor() {
    this.currentUser = new User();
  }
}
