import { DI } from '@aurelia/kernel';

import { Profile } from 'shared/models/profile';
import { IApiService } from './api-service';

export interface IProfileService extends ProfileService {}
export const IProfileService = DI.createInterface<IProfileService>('IProfileService').withDefault(x => x.singleton(ProfileService));
export class ProfileService {
  public constructor(
    @IApiService private readonly apiService: IApiService,
  ) {}

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
