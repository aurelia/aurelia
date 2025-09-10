import { IPlatform, IRenderLocation } from '@aurelia/runtime-html';
import { IContainer } from '@aurelia/kernel';
import { IVirtualRepeatDom, IDomRenderer } from './interfaces';
export declare class DefaultDomRenderer implements IDomRenderer {
    protected p: IPlatform;
    static register(container: IContainer): import("@aurelia/kernel").IResolver<DefaultDomRenderer>;
    constructor(p: IPlatform);
    render(target: HTMLElement | IRenderLocation, layout?: 'vertical' | 'horizontal'): IVirtualRepeatDom;
}
//# sourceMappingURL=virtual-repeat-dom-renderer.d.ts.map