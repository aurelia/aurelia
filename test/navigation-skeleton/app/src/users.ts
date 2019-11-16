import { inject } from '@aurelia/kernel';
import { customElement } from '@aurelia/runtime';
import { HttpClient } from '@aurelia/fetch-client';
import * as html from './users.html';

@inject(HttpClient)
@customElement({ name: 'users', template: html })
export class Users {
  public heading: string = 'Github Users';
  public users: any[] = [];

  public constructor(private http: HttpClient) {
    (http as any).configure(config => {
      config
        .useStandardConfiguration()
        .withBaseUrl('https://api.github.com/');
    });
  }

  async enter(): Promise<void> {
    const response = await this.http.fetch('users');
    this.users = await response.json();
  }
}
