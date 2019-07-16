import { ApiService } from './api-service';
import { inject } from '@aurelia/kernel';

@inject(ApiService)
export class ProfileService {

  constructor(private readonly apiService: ApiService) {
  }

  get(username: string) {
    return this.apiService.get('/profiles/' + username)
      .then((data: { profile: any; }) => data.profile)
  }

  follow(username: string) {
    return this.apiService.post('/profiles/' + username + '/follow')
  }

  unfollow(username: string) {
    return this.apiService.delete('/profiles/' + username + '/follow')
  }
}
