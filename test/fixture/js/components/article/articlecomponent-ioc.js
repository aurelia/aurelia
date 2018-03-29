import { ArticleService } from "../../shared/services/articleservice";
import { CommentService } from "../../shared/services/commentservice";
import { UserService } from "../../shared/services/userservice";
import { SharedState } from "../../shared/state/sharedstate";
import { ProfileService } from "../../shared/services/profileservice";
import { Router } from "aurelia-router";
import { ArticleComponent } from "./articlecomponent";
import { DefaultInjector } from "../../../../../ioc/designtime/injector";
class $ArticleComponentActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new ArticleComponent(DefaultInjector.INSTANCE.getInstance(ArticleService), DefaultInjector.INSTANCE.getInstance(CommentService), DefaultInjector.INSTANCE.getInstance(UserService), DefaultInjector.INSTANCE.getInstance(SharedState), DefaultInjector.INSTANCE.getInstance(ProfileService), DefaultInjector.INSTANCE.getInstance(Router));
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(ArticleComponent, new $ArticleComponentActivator());
