import { ArticleService } from "../../shared/services/articleservice";
import { ProfileArticleComponent } from "./profilearticlecomponent";
import { DefaultInjector } from "../../../../../ioc/injector";
class $ProfileArticleComponentActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new ProfileArticleComponent(DefaultInjector.INSTANCE.getInstance(ArticleService));
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(ProfileArticleComponent, new $ProfileArticleComponentActivator());
