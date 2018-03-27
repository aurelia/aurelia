import { User } from "../models/user";

export class SharedState {
  public currentUser: User;
  public isAuthenticated: boolean;

  constructor() {
    this.currentUser = new User();
    this.isAuthenticated = false;
  }
}
