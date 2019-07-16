import { SharedState } from "../../shared/state/shared-state";
import { inject } from "@aurelia/kernel";
import { bindable } from "@aurelia/runtime";

@inject(SharedState)
export class CommentCustomElement {
  @bindable comment;
  @bindable deleteCb;

  constructor(private readonly sharedState: SharedState) {
  }

  get canModify() {
    return this.comment.author.username === this.sharedState.currentUser.username;
  }
}
