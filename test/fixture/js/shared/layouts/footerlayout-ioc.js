import { FooterLayout } from "./footerlayout";
import { DefaultInjector } from "../../../../../ioc/designtime/injector";
class $FooterLayoutActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new FooterLayout();
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(FooterLayout, new $FooterLayoutActivator());
