import {User} from '../models/user';

export class SharedState {

  constructor() {
    this.currentUser = new User();
    this.isAuthenticated = false;
  }
}
