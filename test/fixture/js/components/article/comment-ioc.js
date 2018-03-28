import { SharedState } from "../../shared/state/sharedstate";
import { CommentCustomElement } from "./comment";
import { DefaultInjector } from "../../../../../ioc/injector";
class $CommentCustomElementActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new CommentCustomElement(DefaultInjector.INSTANCE.getInstance(SharedState));
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(CommentCustomElement, new $CommentCustomElementActivator());
