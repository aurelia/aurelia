import { ApiService } from "./apiservice";
import { JwtService } from "./jwtservice";
import { SharedState } from "../state/sharedstate";
import { UserService } from "./userservice";
import { DefaultInjector } from "../../../../../ioc/designtime/injector";
class $UserServiceActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new UserService(DefaultInjector.INSTANCE.getInstance(ApiService), DefaultInjector.INSTANCE.getInstance(JwtService), DefaultInjector.INSTANCE.getInstance(SharedState));
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(UserService, new $UserServiceActivator());
