import { inject } from "@aurelia/kernel";
import { bindable, customElement } from "@aurelia/runtime";
import { SharedState } from "shared/state/shared-state";
import template from './comment.html';
@inject(SharedState)
@customElement({ name: 'comment', template })
export class CommentCustomElement {
  @bindable public comment: any;
  @bindable public deleteCb: any;

  constructor(private readonly sharedState: SharedState) {
  }

  get canModify() {
    return this.comment.author.username === this.sharedState.currentUser.username;
  }
}
