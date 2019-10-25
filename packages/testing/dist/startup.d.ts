import { Constructable } from '@aurelia/kernel';
import { Aurelia } from '@aurelia/runtime';
import { HTMLTestContext } from './html-test-context';
export declare function setup<T>(template: string | Node, $class?: Constructable<T>, registrations?: any[], autoStart?: boolean, ctx?: HTMLTestContext): {
    startPromise: Promise<unknown>;
    ctx: HTMLTestContext;
    host: Element | null;
    container: import("@aurelia/kernel").IContainer;
    lifecycle: import("@aurelia/runtime").ILifecycle;
    scheduler: import("@aurelia/runtime").IScheduler;
    testHost: HTMLDivElement;
    appHost: HTMLElement;
    au: Aurelia<import("@aurelia/runtime").INode>;
    component: import("@aurelia/runtime").IViewModel<import("@aurelia/runtime").INode> & T;
    observerLocator: import("@aurelia/runtime").IObserverLocator;
    start: () => Promise<void>;
    tearDown: () => Promise<void>;
};
//# sourceMappingURL=startup.d.ts.map