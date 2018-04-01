import {bindable, computedFrom} from 'aurelia-framework';
import {inject} from 'aurelia-framework';
import {SharedState} from "../../shared/state/sharedstate";

@inject(SharedState)
export class CommentCustomElement {
  @bindable comment;
  @bindable deleteCb;

  constructor(shSt) {
    this.sharedState = shSt;
  }

  @computedFrom('comment.author.username')
  get canModify() {
    return this.comment.author.username === this.sharedState.currentUser.username;
  }
}
