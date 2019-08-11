import { inject } from "@aurelia/kernel";
import { bindable } from "@aurelia/runtime";
import { SharedState } from "shared/state/shared-state";

@inject(SharedState)
export class CommentCustomElement {
  @bindable public comment: any;
  @bindable public deleteCb: any;

  constructor(private readonly sharedState: SharedState) {
  }

  get canModify() {
    return this.comment.author.username === this.sharedState.currentUser.username;
  }
}
