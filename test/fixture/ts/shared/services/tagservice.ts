import { autoinject } from "aurelia-dependency-injection";
import { ApiService } from "./apiservice";

@autoinject()
export class TagService {
  public apiService: ApiService;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  public getList(): Promise<any> {
    return this.apiService.get<any>("/tags").then(data => data.tags);
  }
}
