import { inject } from '@aurelia/kernel';
import { Profile } from 'shared/models/profile';
import { ApiService } from './api-service';

@inject(ApiService)
export class ProfileService {

  public constructor(private readonly apiService: ApiService) {
  }

  public get(username: string): Promise<Profile> {
    return this.apiService.get(`/profiles/${username}`)
      .then((data: { profile: any }) => data.profile);
  }

  public follow(username: string) {
    return this.apiService.post(`/profiles/${username}/follow`);
  }

  public unfollow(username: string) {
    return this.apiService.delete(`/profiles/${username}/follow`);
  }
}
