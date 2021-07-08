import { existsSync } from 'fs';
import { resolve } from 'path';
import { HttpServerOptions, RuntimeNodeConfiguration, IHttpServer } from '@aurelia/http-server';
import { DI, IContainer } from '@aurelia/kernel';

/* eslint-disable prefer-template */
const space = ' ';
class AuConfigurationOptions {
    constructor(server = new HttpServerOptions()) {
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

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

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

class ParsedArgs {
    constructor(cmd, configuration, unknownCommand = undefined, unconsumedArgs = []) {
        this.cmd = cmd;
        this.configuration = configuration;
        this.unknownCommand = unknownCommand;
        this.unconsumedArgs = unconsumedArgs;
    }
}
const cwd = process.cwd();
async function parseArgs(args) {
    const cmd = args[0];
    args = args.slice(1);
    const configuration = new AuConfigurationOptions();
    if (args.length % 2 === 1) {
        // check for configuration file
        const configurationFile = resolve(cwd, args[0]);
        if (!existsSync(configurationFile)) {
            throw new Error(`Configuration file is missing or uneven amount of args: ${args}. Args must come in pairs of --key value`);
        }
        else {
            const config = (await import(`file://${configurationFile}`)).default;
            configuration.applyConfig(config);
            args = args.slice(1);
        }
    }
    let parsed;
    switch (cmd) {
        case 'help':
            parsed = new ParsedArgs(cmd, new AuConfigurationOptions());
            break;
        case 'dev': {
            parsed = new ParsedArgs(cmd, configuration);
            configuration.server.applyOptionsFromCli(cwd, args, 'server.');
            break;
        }
        default:
            parsed = new ParsedArgs('help', new AuConfigurationOptions(), cmd);
            break;
    }
    const unconsumed = parsed.unconsumedArgs;
    if (unconsumed.length > 0) {
        console.warn(`Following arguments are not consumed ${unconsumed.join(',')}`);
    }
    return parsed;
}
(async function () {
    const args = await parseArgs(process.argv.slice(2));
    switch (args.cmd) {
        case 'dev': {
            const server = DevServer.create();
            await server.run(args.configuration.server);
            break;
        }
        case 'help': {
            const unknownCommand = args.unknownCommand;
            if (unknownCommand !== void 0) {
                console.error(`Unknown command: ${unknownCommand}; Refer the valid options below.`);
            }
            console.log(args.configuration.toString());
            break;
        }
    }
})().catch(err => {
    console.error(err);
    process.exit(1);
});

export { AuConfigurationOptions };
//# sourceMappingURL=index.js.map
