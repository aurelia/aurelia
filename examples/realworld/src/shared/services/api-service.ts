import { IHttpClient, json } from '@aurelia/fetch-client';
import { DI } from '@aurelia/kernel';

import * as qs from 'querystringify';
import { config } from './config';
import { IHttpInterceptor } from './http-interceptor';
import { IJwtService } from './jwt-service';
import { parseError, status } from './service-helper';

export interface IApiService extends ApiService {}
export const IApiService = DI.createInterface<IApiService>('IApiService').withDefault(x => x.singleton(ApiService));
export class ApiService {
  public constructor(
    @IHttpClient private readonly http: IHttpClient,
    @IJwtService private readonly jwtService: IJwtService,
    @IHttpInterceptor private readonly interceptor: IHttpInterceptor,
  ) {
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
      return await status(response);
    } catch (error) {
      try {
        return await parseError(error);
      } catch {
        return undefined;
      }
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
      return await status(response);
    } catch (error) {
      try {
        return await parseError(error);
      } catch {
        return undefined;
      }
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
      return await status(response);
    } catch (error) {
      try {
        return await parseError(error);
      } catch {
        return undefined;
      }
    }
  }

  public async delete(path: string) {
    const options = {
      headers: this.setHeaders(),
      method: 'DELETE',
    };
    try {
      const response = await this.http.fetch(`${config.apiUrl}${path}`, options);
      return await status(response);
    } catch (error) {
      try {
        return await parseError(error);
      } catch {
        return undefined;
      }
    }
  }
}
