import { autoinject } from "aurelia-dependency-injection";
import { ApiService } from "./apiservice";

@autoinject()
export class ProfileService {
  public apiService: ApiService;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  // tslint:disable-next-line:no-reserved-keywords
  public get(username: string): Promise<any> {
    return this.apiService.get<any>(`/profiles/${username}`).then(data => data.profile);
  }

  public follow(username: string): Promise<any> {
    return this.apiService.post(`/profiles/${username}/follow`);
  }

  public unfollow(username: string): Promise<any> {
    return this.apiService.delete(`/profiles/${username}/follow`);
  }
}
