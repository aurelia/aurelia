import { TestExecutionContext, StartupConfiguration, startup } from './app/startup.js';
import { ProxyObservable } from '@aurelia/runtime';
import { CustomElement } from '@aurelia/runtime-html';
import { Call, assert, fail } from '@aurelia/testing';

export function createTestFunction(
  testFunction: (ctx: TestExecutionContext) => Promise<void> | void,
  startupConfiguration?: StartupConfiguration,
) {
  return async function (): Promise<void> {
    const ctx = await startup(startupConfiguration);
    try {
      await testFunction(ctx);
    } catch (e) {
      fail(e);
    } finally {
      await ctx.tearDown();
    }
  };
}
export function $it(title: string, testFunction: (ctx: TestExecutionContext) => Promise<void> | void, startupConfiguration?: StartupConfiguration): void {
  it(title, createTestFunction(testFunction, startupConfiguration));
}
$it.skip = function (title: string, testFunction: (ctx: TestExecutionContext) => Promise<void> | void, startupConfiguration?: StartupConfiguration) {
  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip(title, createTestFunction(testFunction, startupConfiguration));
};
$it.only = function (title: string, testFunction: (ctx: TestExecutionContext) => Promise<void> | void, startupConfiguration?: StartupConfiguration) {
  // eslint-disable-next-line mocha/no-exclusive-tests
  it.only(title, createTestFunction(testFunction, startupConfiguration));
};

export function getViewModel<T>(element: Element): T {
  const { viewModel } = (CustomElement.for(element) as unknown) as { viewModel: T };
  return viewModel;
}
export function assertCalls(calls: Call[], fromIndex: number, instance: any, expectedCalls: string[], unexpectedCalls?: string[], message?: string): void {
  const recentCalls = new Set(calls.slice(fromIndex).map(c => Object.is(ProxyObservable.unwrap(c.instance), instance) && c.method));
  for (const expectedCall of expectedCalls) {
    assert.equal(recentCalls.has(expectedCall), true, `${message || ''} expected ${expectedCall}`);
  }
  for (const expectedCall of unexpectedCalls) {
    assert.equal(recentCalls.has(expectedCall), false, `${message || ''} not expected ${expectedCall}`);
  }
}
