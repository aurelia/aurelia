import { autoinject } from "aurelia-dependency-injection";
import { HttpClient, json } from "aurelia-fetch-client";
import * as qs from "querystringify";
import { config } from "./config";
import { JwtService } from "./jwtservice";
import { parseError, status } from "./servicehelper";

@autoinject()
export class ApiService {
  public http: HttpClient;
  public jwtService: JwtService;

  constructor(http: HttpClient, jwtService: JwtService) {
    this.http = http;
    this.jwtService = jwtService;
  }

  public setHeaders(): Headers {
    const headersConfig: any = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    if (this.jwtService.getToken()) {
      headersConfig.Authorization = `Token ${this.jwtService.getToken()}`;
    }

    return new Headers(headersConfig);
  }

  // tslint:disable-next-line:no-reserved-keywords
  public get<T extends Object>(path: string, params?: any): Promise<T> {
    const options = {
      method: "GET",
      headers: this.setHeaders()
    };

    return this.http
      .fetch(`${config.api_url}${path}?${qs.stringify(params)}`, options)
      .then(status)
      .catch(parseError);
  }

  public put<T extends Object>(path: string, body: T = {} as any): Promise<T> {
    const options = {
      method: "PUT",
      headers: this.setHeaders(),
      body: json(body)
    };

    return this.http
      .fetch(`${config.api_url}${path}`, options)
      .then(status)
      .catch(parseError);
  }

  public post<T extends Object>(path: string, body: T = {} as any): Promise<T> {
    const options = {
      method: "POST",
      headers: this.setHeaders(),
      body: json(body)
    };

    return this.http
      .fetch(`${config.api_url}${path}`, options)
      .then(status)
      .catch(parseError);
  }

  // tslint:disable-next-line:no-reserved-keywords
  public delete(path: string): Promise<any> {
    const options = {
      method: "DELETE",
      headers: this.setHeaders()
    };

    return this.http
      .fetch(`${config.api_url}${path}`, options)
      .then(status)
      .catch(parseError);
  }
}
