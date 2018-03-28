import { ApiService } from "./apiservice";
import { TagService } from "./tagservice";
import { DefaultInjector } from "../../../../../ioc/injector";
class $TagServiceActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new TagService(DefaultInjector.INSTANCE.getInstance(ApiService));
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(TagService, new $TagServiceActivator());
