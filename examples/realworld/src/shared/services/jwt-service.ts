import { DI } from '@aurelia/kernel';

export interface IJwtService extends JwtService {}
export const IJwtService = DI.createInterface<IJwtService>('IJwtService').withDefault(x => x.singleton(JwtService));
export class JwtService {
  public getToken() {
    return window.localStorage.jwtToken;
  }

  public saveToken(token: string) {
    window.localStorage.jwtToken = token;
  }

  public destroyToken() {
    window.localStorage.removeItem('jwtToken');
  }

  public isTokenValid() {
    return typeof this.getToken() !== 'undefined' && this.getToken() !== '';
  }

  public getAuthorizationHeader(): string {
    return this.isTokenValid() ? `Token ${this.getToken()}` : '';
  }

}
