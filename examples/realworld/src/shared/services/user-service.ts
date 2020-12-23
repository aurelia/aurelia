import { DI } from '@aurelia/kernel';

import { User } from 'models/user';
import { ISharedState } from 'shared/state/shared-state';
import { IApiService } from './api-service';
import { IJwtService } from './jwt-service';

export interface IUserService extends UserService {}
export const IUserService = DI.createInterface<IUserService>('IUserService').withDefault(x => x.singleton(UserService));
export class UserService {
  public constructor(
    @IApiService private readonly apiService: IApiService,
    @IJwtService private readonly jwtService: IJwtService,
    @ISharedState private readonly sharedState: ISharedState,
  ) {}

  // Verify JWT in localstorage with server & load user's info.
  // This runs once on application startup.
  public async populate() {
    if (this.jwtService.getToken()) {
      const data = await this.apiService.get('/user');
      this.setAuth(data.user);
    } else {
      // Remove any potential remnants of previous auth states
      this.purgeAuth();
    }
  }

  public setAuth(user: User) {
    // Save JWT sent from server in localstorage
    this.jwtService.saveToken(user.token!);
    this.sharedState.currentUser = user;
    this.sharedState.isAuthenticated = true;
  }

  public purgeAuth() {
    // Remove JWT from localstorage
    this.jwtService.destroyToken();
    this.sharedState.currentUser = {};
    this.sharedState.isAuthenticated = false;
  }

  public async attemptAuth(type: string, credentials: Partial<User>) {
    const route = (type === 'login') ? '/login' : '';
    const data = await this.apiService.post(`/users${route}`, { user: credentials });
    this.setAuth(data.user);
    return data;
  }

  public async update(user: User) {
    const data = await this.apiService.put('/user', { user });
    this.sharedState.currentUser = data.user;
    return data.user;

  }
}
