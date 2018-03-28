import { ArticleService } from "../../shared/services/articleservice";
import { Router } from "aurelia-router";
import { EditorComponent } from "./editorcomponent";
import { DefaultInjector } from "../../../../../ioc/injector";
class $EditorComponentActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new EditorComponent(DefaultInjector.INSTANCE.getInstance(ArticleService), DefaultInjector.INSTANCE.getInstance(Router));
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(EditorComponent, new $EditorComponentActivator());
