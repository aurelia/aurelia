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
  
}
