import { UserService } from "../../shared/services/userservice";
import { SharedState } from "../../shared/state/sharedstate";
import { Router } from "aurelia-router";
import { SettingsComponent } from "./settingscomponent";
import { DefaultInjector } from "../../../../../ioc/designtime/injector";
class $SettingsComponentActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new SettingsComponent(DefaultInjector.INSTANCE.getInstance(UserService), DefaultInjector.INSTANCE.getInstance(SharedState), DefaultInjector.INSTANCE.getInstance(Router));
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(SettingsComponent, new $SettingsComponentActivator());
