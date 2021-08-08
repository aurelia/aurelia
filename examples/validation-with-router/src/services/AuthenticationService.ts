import { DI } from '@aurelia/kernel';

type Writable<TClass> = { -readonly [key in keyof TClass]: TClass[key] };

export const IAuthenticationService = DI.createInterface<IAuthenticationService>('IAuthenticationService', (x) => x.singleton(AuthenticationService));
export interface IAuthenticationService extends AuthenticationService { }

export class AuthenticationService {
  public readonly currentUser: string;
  public get isAuthenticated(): boolean { return !!this.currentUser; }

  // toy auth service; do NOT try at production
  public async login(login: UserLogin): Promise<boolean> {
    return !!((this as Writable<AuthenticationService>).currentUser = login?.username);
  }

  public logout(): void {
    (this as Writable<AuthenticationService>).currentUser = undefined;
  }
}

export class UserLogin {
  public constructor(
    public username: string,
    public password: string
  ) { }
}
