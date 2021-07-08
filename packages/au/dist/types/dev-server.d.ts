import { HttpServerOptions } from '@aurelia/http-server';
import { IContainer } from '@aurelia/kernel';
export declare class DevServer {
    protected readonly container: IContainer;
    constructor(container: IContainer);
    static create(container?: IContainer): DevServer;
    run(option: HttpServerOptions): Promise<void>;
}
//# sourceMappingURL=dev-server.d.ts.map