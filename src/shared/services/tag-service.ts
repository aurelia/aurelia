import { ApiService } from './api-service';
import { inject } from '@aurelia/kernel';

@inject(ApiService)
export class TagService {

  constructor(private readonly apiService: ApiService) {
  }

  getList() {
    return this.apiService.get('/tags')
      .then(data => data.tags)
  }
}
