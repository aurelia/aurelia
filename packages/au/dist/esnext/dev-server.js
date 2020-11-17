var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { IHttpServer, RuntimeNodeConfiguration } from '@aurelia/http-server';
import { DI, IContainer } from '@aurelia/kernel';
let DevServer = class DevServer {
    constructor(container) {
        this.container = container;
    }
    static create(container = DI.createContainer()) {
        return new DevServer(container);
    }
    async run(option) {
        // wireup
        const container = this.container.createChild();
        container.register(RuntimeNodeConfiguration.create(option));
        // TODO compile/bundle
        // TODO inject the entry script to index.html template (from user-space)
        // start the http/file/websocket server
        const server = container.get(IHttpServer);
        await server.start();
    }
};
DevServer = __decorate([
    __param(0, IContainer)
], DevServer);
export { DevServer };
//# sourceMappingURL=dev-server.js.map