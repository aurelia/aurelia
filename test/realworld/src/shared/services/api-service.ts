import { HttpClient, json } from '@aurelia/fetch-client';
import { inject } from '@aurelia/kernel';
import * as qs from 'querystringify';
import { config } from './config';
import { HttpInterceptor } from './http-interceptor';
import { JwtService } from './jwt-service';
import { parseError, status } from './service-helper';

@inject(HttpClient, JwtService, HttpInterceptor)
export class ApiService {

  public constructor(private readonly http: HttpClient,
    private readonly jwtService: JwtService,
    private readonly interceptor: HttpInterceptor) {
    http.configure((httpConfiguration) => {
      httpConfiguration
        .withInterceptor(interceptor);
      return httpConfiguration;
    });

  }

  public setHeaders() {
    const headersConfig = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    return new Headers(headersConfig);
  }

  public async get(path: string, params: object = {}) {
    const options = {
      headers: this.setHeaders(),
      method: 'GET',
    };
    try {
      const response = await this.http.fetch(`${config.apiUrl}${path}?${qs.stringify(params)}`, options);
      return status(response);
    } catch (error) {
      return parseError(error);
    }
  }

  public async put(path: string, body = {}) {
    const options = {
      body: json(body),
      headers: this.setHeaders(),
      method: 'PUT',
    };
    try {
      const response = await this.http.fetch(`${config.apiUrl}${path}`, options);
      return status(response);
    } catch (error) {
      return parseError(error);
    }
  }

  public async post(path: string, body = {}) {
    const options = {
      body: json(body),
      headers: this.setHeaders(),
      method: 'POST',
    };
    try {
      const response = await this.http.fetch(`${config.apiUrl}${path}`, options);
      return status(response);
    } catch (error) {
      return parseError(error);
    }
  }

  public async delete(path: string) {
    const options = {
      headers: this.setHeaders(),
      method: 'DELETE',
    };
    try {
      const response = await this.http.fetch(`${config.apiUrl}${path}`, options);
      return status(response);
    } catch (error) {
      return parseError(error);
    }
  }
}
