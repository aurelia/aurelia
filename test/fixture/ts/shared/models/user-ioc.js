import { User } from "./user";
import { DefaultInjector } from "../../../../../ioc/injector";
class $UserActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new User();
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(User, new $UserActivator());
