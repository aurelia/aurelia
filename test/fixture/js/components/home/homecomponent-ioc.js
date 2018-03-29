import { SharedState } from "../../shared/state/sharedstate";
import { BindingEngine } from "aurelia-framework";
import { ArticleService } from "../../shared/services/articleservice";
import { TagService } from "../../shared/services/tagservice";
import { HomeComponent } from "./homecomponent";
import { DefaultInjector } from "../../../../../ioc/designtime/injector";
class $HomeComponentActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new HomeComponent(DefaultInjector.INSTANCE.getInstance(SharedState), DefaultInjector.INSTANCE.getInstance(BindingEngine), DefaultInjector.INSTANCE.getInstance(ArticleService), DefaultInjector.INSTANCE.getInstance(TagService));
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(HomeComponent, new $HomeComponentActivator());
