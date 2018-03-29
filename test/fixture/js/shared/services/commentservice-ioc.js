import { ApiService } from "./apiservice";
import { CommentService } from "./commentservice";
import { DefaultInjector } from "../../../../../ioc/designtime/injector";
class $CommentServiceActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new CommentService(DefaultInjector.INSTANCE.getInstance(ApiService));
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(CommentService, new $CommentServiceActivator());
