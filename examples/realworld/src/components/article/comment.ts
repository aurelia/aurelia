import { inject } from '@aurelia/kernel';
import { bindable } from '@aurelia/runtime-html';

import { SharedState } from 'shared/state/shared-state';

@inject(SharedState)
export class Comment {
  @bindable public comment: any;
  @bindable public deleteCb: any;

  public constructor(
    private readonly sharedState: SharedState,
  ) {}

  public get canModify() {
    return this.comment.author.username === this.sharedState.currentUser.username;
  }
}
