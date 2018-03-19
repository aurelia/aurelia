import { computedFrom } from "aurelia-binding";
import { autoinject } from "aurelia-framework";
import { bindable } from "aurelia-templating";
import { SharedState } from "../../shared/state/sharedstate";

@autoinject()
export class CommentCustomElement {
  @bindable()
  public comment: any;

  @bindable()
  public deleteCb: Function | undefined;

  public sharedState: SharedState;

  constructor(shSt: SharedState) {
    this.sharedState = shSt;
  }

  @computedFrom("comment.author.username")
  public get canModify(): boolean {
    return this.comment.author.username === this.sharedState.currentUser.username;
  }
}
