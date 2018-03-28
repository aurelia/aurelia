import { SharedState } from "../../shared/state/sharedstate";
import { ProfileService } from "../../shared/services/profileservice";
import { ProfileComponent } from "./profilecomponent";
import { DefaultInjector } from "../../../../../ioc/injector";
class $ProfileComponentActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new ProfileComponent(DefaultInjector.INSTANCE.getInstance(SharedState), DefaultInjector.INSTANCE.getInstance(ProfileService));
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(ProfileComponent, new $ProfileComponentActivator());
