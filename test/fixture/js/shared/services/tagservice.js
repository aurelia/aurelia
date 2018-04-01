import {inject} from 'aurelia-dependency-injection';
import {ApiService} from './apiservice';

@inject(ApiService)
export class TagService {

  constructor(apiService) {
    this.apiService = apiService;
  }
  
  getList() {
    return this.apiService.get('/tags')
      .then(data => data.tags)
  }
}
