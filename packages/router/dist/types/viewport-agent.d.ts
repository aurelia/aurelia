import { type ICustomElementController } from '@aurelia/runtime-html';
import type { IViewport } from './resources/viewport';
import type { IRouteContext } from './route-context';
export declare class ViewportRequest {
    readonly viewportName: string;
    readonly componentName: string;
    constructor(viewportName: string, componentName: string);
    toString(): string;
}
export declare class ViewportAgent {
    readonly viewport: IViewport;
    readonly hostController: ICustomElementController;
    private constructor();
    static for(viewport: IViewport, ctx: IRouteContext): ViewportAgent;
    toString(): string;
}
//# sourceMappingURL=viewport-agent.d.ts.map