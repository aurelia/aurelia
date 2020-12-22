import { IContainer } from '@aurelia/kernel';
import { IHttpServerOptions } from './interfaces.js';
export declare const HttpServerConfiguration: {
    create(customization: Partial<IHttpServerOptions>): {
        register(container: IContainer): IContainer;
    };
};
//# sourceMappingURL=configuration.d.ts.map