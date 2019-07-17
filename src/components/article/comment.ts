import { SharedState } from "../../shared/state/shared-state";
import { inject } from "@aurelia/kernel";
import { bindable, customElement } from "@aurelia/runtime";
import template from './comment.html';
@inject(SharedState)
@customElement({ name: 'comment', template: template })
export class CommentCustomElement {
  @bindable comment: any;
  @bindable deleteCb: any;

  constructor(private readonly sharedState: SharedState) {
  }

  get canModify() {
    return this.comment.author.username === this.sharedState.currentUser.username;
  }
}
