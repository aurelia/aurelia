"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuConfigurationOptions = void 0;
/* eslint-disable prefer-template */
const http_server_1 = require("@aurelia/http-server");
const space = ' ';
class AuConfigurationOptions {
    constructor(server = new http_server_1.HttpServerOptions()) {
        this.server = server;
    }
    /** @internal */
    applyConfig(config) {
        const server = config.server;
        if (server !== void 0 && server !== null) {
            this.server.applyConfig(server);
        }
    }
    /** @internal */
    toString() {
        const indent = space.repeat(2);
        return 'au server'
            + `${indent}Starts the dev server`
            + this.server.toString(indent.repeat(2));
    }
}
exports.AuConfigurationOptions = AuConfigurationOptions;
//# sourceMappingURL=au-configuration-options.js.map