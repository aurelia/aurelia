import { IContainer } from '@aurelia/kernel';
import { IHttpServerOptions } from './interfaces';
export declare const HttpServerConfiguration: {
    create(customization: Partial<IHttpServerOptions>): {
        register(container: IContainer): IContainer;
    };
};
//# sourceMappingURL=configuration.d.ts.map