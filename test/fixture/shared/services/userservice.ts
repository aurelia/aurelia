import { autoinject } from "aurelia-dependency-injection";
import { User } from "../models/user";
import { SharedState } from "../state/sharedstate";
import { ApiService } from "./apiservice";
import { JwtService } from "./jwtservice";

@autoinject()
export class UserService {
  public apiService: ApiService;
  public jwtService: JwtService;
  public sharedState: SharedState;

  constructor(apiService: ApiService, jwtService: JwtService, sharedState: SharedState) {
    this.apiService = apiService;
    this.jwtService = jwtService;
    this.sharedState = sharedState;
  }

  // Verify JWT in localstorage with server & load user's info.
  // This runs once on application startup.
  public populate(): void {
    if (this.jwtService.getToken()) {
      this.apiService.get<any>("/user").then(data => this.setAuth(data.user));
    } else {
      // Remove any potential remnants of previous auth states
      this.purgeAuth();
    }
  }

  public setAuth(user: User): void {
    // Save JWT sent from server in localstorage
    this.jwtService.saveToken(user.token);
    this.sharedState.currentUser = user;
    this.sharedState.isAuthenticated = true;
  }

  public purgeAuth(): void {
    // Remove JWT from localstorage
    this.jwtService.destroyToken();
    this.sharedState.currentUser = new User();
    this.sharedState.isAuthenticated = false;
  }

  // tslint:disable-next-line:no-reserved-keywords
  public attemptAuth(type: string, credentials: any): Promise<any> {
    const route = type === "login" ? "/login" : "";

    return this.apiService.post(`/users${route}`, { user: credentials }).then(data => {
      this.setAuth(data.user);

      return data;
    });
  }

  public update(user: User): Promise<any> {
    return this.apiService.put("/user", { user }).then(data => {
      this.sharedState.currentUser = data.user;

      return data.user;
    });
  }
}
