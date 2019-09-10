import { Constructable } from '@aurelia/kernel';
import { TestContext } from '.';
import { CustomElement, Aurelia } from '@aurelia/runtime';
import { HTMLTestContext } from './html-test-context';

export function setup<T>(template: string | Node,
    $class: Constructable<T>,
    ctx: HTMLTestContext = TestContext.createHTMLTestContext(),
    autoStart: boolean = true,
    ...registrations: any[]) {
    const { container, lifecycle, observerLocator } = ctx;
    container.register(...registrations);
    const testHost = ctx.doc.body.appendChild(ctx.doc.createElement('div'));
    const appHost = testHost.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const App = CustomElement.define({ name: 'app', template }, $class);
    const component = new App();

    let startPromise: Promise<unknown> = Promise.resolve();
    if (autoStart) {
        au.app({ host: appHost, component });
        startPromise = au.start().wait();
    }

    return {
        startPromise,
        ctx,
        host: ctx.doc.firstElementChild,
        container,
        lifecycle,
        testHost,
        appHost,
        au,
        component,
        observerLocator,
        start: async () => {
            au.app({ host: appHost, component });
            await au.start().wait();
        },
        dispose: async () => {
            await au.stop().wait();
            testHost.remove();
        }
    };
}


export async function tearDown(au: Aurelia) {
    await au.stop().wait()
}