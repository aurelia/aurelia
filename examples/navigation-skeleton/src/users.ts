import { customElement } from '@aurelia/runtime-html';
import { HttpClient } from '@aurelia/fetch-client';

import * as template from './users.html';

@customElement({ name: 'users', template })
export class Users {
  public heading: string = 'Github Users';
  public users: any[] = [];

  public constructor(
    private readonly http: HttpClient
  ) {
    http.configure(config =>
      config
        .useStandardConfiguration()
        .withBaseUrl('https://api.github.com/')
    );
  }

  public async enter(): Promise<void> {
    const response = await this.http.fetch('users');
    this.users = await response.json();
  }
}
