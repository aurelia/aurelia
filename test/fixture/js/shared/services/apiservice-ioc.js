import { HttpClient } from "aurelia-fetch-client";
import { JwtService } from "./jwtservice";
import { ApiService } from "./apiservice";
import { DefaultInjector } from "../../../../../ioc/designtime/injector";
class $ApiServiceActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new ApiService(DefaultInjector.INSTANCE.getInstance(HttpClient), DefaultInjector.INSTANCE.getInstance(JwtService));
        }
        return this.instance;
    }
}
DefaultInjector.addActivator(ApiService, new $ApiServiceActivator());
