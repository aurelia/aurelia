import { bindable } from '@aurelia/runtime-html';

import { ISharedState } from 'shared/state/shared-state';

export class Comment {
  @bindable public comment: any;
  @bindable public deleteCb: any;

  public constructor(
    @ISharedState private readonly sharedState: ISharedState,
  ) {}

  public get canModify() {
    return this.comment.author.username === this.sharedState.currentUser.username;
  }
}
