import {inject, bindable, computedFrom} from 'aurelia-framework';
import {SharedState} from "../../shared/state/shared-state";

@inject(SharedState)
export class CommentCustomElement {
  @bindable comment;
  @bindable deleteCb;

  constructor(shSt) {
    this.sharedState = shSt;
  }

  @computedFrom('sharedState.currentUser.username')
  get canModify() {
    return this.comment.author.username === this.sharedState.currentUser.username;
  }
}
