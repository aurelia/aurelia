export class JwtService {

  getToken() {
    return window.localStorage['jwtToken'];
  }

  saveToken(token: string) {
    window.localStorage['jwtToken'] = token;
  }

  destroyToken() {
    window.localStorage.removeItem('jwtToken');
  }

  isTokenValid() {
    return typeof this.getToken() !== 'undefined' && this.getToken() !== '';
  }

  getAuthorizationHeader(): string {
    return this.isTokenValid() ? `Token ${this.getToken()}` : '';
  };

}
