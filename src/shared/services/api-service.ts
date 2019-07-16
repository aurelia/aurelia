import { config } from './config';
import { HttpClient, json } from '@aurelia/fetch-client';
import * as qs from 'querystringify';
import { JwtService } from './jwt-service';
import { status, parseError } from './service-helper';
import { inject } from '@aurelia/kernel';

@inject(HttpClient, JwtService)
export class ApiService {

  constructor(private readonly http: HttpClient, private readonly jwtService: JwtService) {
  }

  setHeaders() {
    const headersConfig = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    return new Headers(headersConfig);
  }

  async get(path: string, params?: unknown) {
    const options = {
      method: 'GET',
      headers: this.setHeaders()
    };
    try {
      let response = await this.http.fetch(`${config.api_url}${path}?${qs.stringify(params)}`, options);
      return status(response);
    }
    catch (error) {
      return parseError(error);
    }
  }

  async put(path: string, body = {}) {
    const options = {
      method: 'PUT',
      headers: this.setHeaders(),
      body: json(body)
    };
    try {
      let response = await this.http.fetch(`${config.api_url}${path}`, options);
      return status(response);
    }
    catch (error) {
      return parseError(error);
    }
  }

  async post(path: string, body = {}) {
    const options = {
      method: 'POST',
      headers: this.setHeaders(),
      body: json(body)
    };
    try {
      let response = await this.http.fetch(`${config.api_url}${path}`, options);
      return status(response);
    }
    catch (error) {
      return parseError(error);
    }
  }

  async delete(path: string) {
    const options = {
      method: 'DELETE',
      headers: this.setHeaders()
    };
    try {
      let response = await this.http.fetch(`${config.api_url}${path}`, options);
      return status(response);
    }
    catch (error) {
      return parseError(error);
    }
  }
}
