import { UserService } from "./shared/services/userservice";
import { App } from "./app";
import { DefaultInjector } from "../../../ioc/designtime/injector";
class $AppActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new App(DefaultInjector.INSTANCE.getInstance(UserService));
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(App, new $AppActivator());
