import { inject } from '@aurelia/kernel';

import { ApiService } from './api-service';

@inject(ApiService)
export class TagService {
  public constructor(
    private readonly apiService: ApiService,
  ) {}

  public async getList() {
    const data = await this.apiService.get('/tags');
    return data.tags;
  }
}
