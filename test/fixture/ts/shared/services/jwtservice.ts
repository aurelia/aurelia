export class JwtService {
  public getToken(): string {
    return window.localStorage.jwtToken;
  }

  public saveToken(token: string): void {
    window.localStorage.jwtToken = token;
  }

  public destroyToken(): void {
    window.localStorage.removeItem("jwtToken");
  }
}
