import { Component, TransitionComponent } from './component.js';
export declare class Transition {
    from: Component;
    to: Component;
    viewport: string;
    constructor(transition: {
        from: string | TransitionComponent | Component;
        to: string | TransitionComponent | Component;
        viewport: string;
    });
}
//# sourceMappingURL=transition.d.ts.map