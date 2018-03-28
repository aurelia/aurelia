import { ArticleService } from "../../shared/services/articleservice";
import { ProfileFavoritesComponent } from "./profilefavoritescomponent";
import { DefaultInjector } from "../../../../../ioc/injector";
class $ProfileFavoritesComponentActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new ProfileFavoritesComponent(DefaultInjector.INSTANCE.getInstance(ArticleService));
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(ProfileFavoritesComponent, new $ProfileFavoritesComponentActivator());
