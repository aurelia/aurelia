import { ApiService } from "./apiservice";
import { ArticleService } from "./articleservice";
import { DefaultInjector } from "../../../../../ioc/injector";
class $ArticleServiceActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new ArticleService(DefaultInjector.INSTANCE.getInstance(ApiService));
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(ArticleService, new $ArticleServiceActivator());
