import { ArticlePreview } from "./articlepreview";
import { DefaultInjector } from "../../../../../ioc/injector";
class $ArticlePreviewActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new ArticlePreview();
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(ArticlePreview, new $ArticlePreviewActivator());
