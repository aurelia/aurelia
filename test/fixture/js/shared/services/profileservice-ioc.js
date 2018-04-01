import { ApiService } from "./apiservice";
import { ProfileService } from "./profileservice";
import { DefaultInjector } from "../../../../../ioc/designtime/injector";
class $ProfileServiceActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new ProfileService(DefaultInjector.INSTANCE.getInstance(ApiService));
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(ProfileService, new $ProfileServiceActivator());
