import {inject} from 'aurelia-dependency-injection';
import {ApiService} from './api-service';

@inject(ApiService)
export class ProfileService {

  constructor(apiService) {
    this.apiService = apiService;
  }

  get(username) {
    return this.apiService.get('/profiles/' + username)
      .then(data => data.profile)
  }

  follow(username) {
    return this.apiService.post('/profiles/' + username + '/follow')
  }

  unfollow(username) {
    return this.apiService.delete('/profiles/' + username + '/follow')
  }
}
