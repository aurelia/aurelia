import { autoinject } from "aurelia-dependency-injection";
import { bindable, bindingMode } from "aurelia-framework";
import { RouteConfig } from "aurelia-router";
import { SharedState } from "../state/sharedstate";

@autoinject()
export class HeaderLayout {
  public activeRoute: string = "";

  @bindable({ defaultBindingMode: bindingMode.twoWay })
  public routerConfig: RouteConfig | undefined;

  public sharedState: SharedState;

  constructor(sharedState: SharedState) {
    this.sharedState = sharedState;
  }

  public routerConfigChanged(newValue: RouteConfig | undefined, _oldValue: RouteConfig | undefined): void {
    this.activeRoute = newValue && newValue.name ? newValue.name : "";
  }
}
