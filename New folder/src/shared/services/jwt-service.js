export class JwtService {
  
  getToken() {
    return window.localStorage['jwtToken'];
  }
  
  saveToken(token) {
    window.localStorage['jwtToken'] = token;
  }
  
  destroyToken() {
    window.localStorage.removeItem('jwtToken');
  }

  isTokenValid() {
    return typeof this.getToken() !== 'undefined' && this.getToken() !== '';
  }

  getAuthorizationHeader() {
    if (this.isTokenValid())
      return `Token ${this.getToken()}`;
  };
  
}
