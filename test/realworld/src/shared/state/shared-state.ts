import { User } from 'models/user';

export class SharedState {
  public currentUser: User = {};
  public isAuthenticated: boolean = false;
}
