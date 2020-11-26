import { DI } from '@aurelia/kernel';
import { User } from 'models/user';

export interface ISharedState extends SharedState {}
export const ISharedState = DI.createInterface<ISharedState>('ISharedState').withDefault(x => x.singleton(SharedState));
export class SharedState {
  public currentUser: User = {};
  public isAuthenticated: boolean = false;
}
