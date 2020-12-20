import { Constructable } from '@aurelia/kernel';
import { Aurelia } from '@aurelia/runtime-html';
import { TestContext } from './test-context.js';
export declare function createFixture<T>(template: string | Node, $class?: Constructable<T>, registrations?: any[], autoStart?: boolean, ctx?: TestContext): {
    startPromise: void | Promise<void>;
    ctx: TestContext;
    host: Element | null;
    container: import("@aurelia/kernel").IContainer;
    platform: import("@aurelia/runtime-html").IPlatform;
    testHost: HTMLDivElement;
    appHost: HTMLElement;
    au: Aurelia;
    component: import("@aurelia/runtime-html").ICustomElementViewModel & T;
    observerLocator: import("@aurelia/runtime-html").IObserverLocator;
    start: () => Promise<void>;
    tearDown: () => Promise<void>;
};
//# sourceMappingURL=startup.d.ts.map