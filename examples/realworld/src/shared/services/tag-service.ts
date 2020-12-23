import { DI } from '@aurelia/kernel';

import { IApiService } from './api-service';

export interface ITagService extends TagService {}
export const ITagService = DI.createInterface<ITagService>('ITagService').withDefault(x => x.singleton(TagService));
export class TagService {
  public constructor(
    @IApiService private readonly apiService: IApiService,
  ) {}

  public async getList() {
    const data = await this.apiService.get('/tags');
    return data.tags;
  }
}
