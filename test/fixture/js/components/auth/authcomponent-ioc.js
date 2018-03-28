import { UserService } from "../../shared/services/userservice";
import { SharedState } from "../../shared/state/sharedstate";
import { Router } from "aurelia-router";
import { ValidationControllerFactory } from "aurelia-validation";
import { AuthComponent } from "./authcomponent";
import { DefaultInjector } from "../../../../../ioc/injector";
class $AuthComponentActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new AuthComponent(DefaultInjector.INSTANCE.getInstance(UserService), DefaultInjector.INSTANCE.getInstance(SharedState), DefaultInjector.INSTANCE.getInstance(Router), DefaultInjector.INSTANCE.getInstance(ValidationControllerFactory));
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(AuthComponent, new $AuthComponentActivator());
