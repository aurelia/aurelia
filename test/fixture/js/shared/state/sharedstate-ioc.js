import { SharedState } from "./sharedstate";
import { DefaultInjector } from "../../../../../ioc/injector";
class $SharedStateActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new SharedState();
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(SharedState, new $SharedStateActivator());
