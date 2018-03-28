import { SharedState } from "../state/sharedstate";
import { HeaderLayout } from "./headerlayout";
import { DefaultInjector } from "../../../../../ioc/injector";
class $HeaderLayoutActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new HeaderLayout(DefaultInjector.INSTANCE.getInstance(SharedState));
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(HeaderLayout, new $HeaderLayoutActivator());
