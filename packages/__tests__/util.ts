import { IContainer } from '@aurelia/kernel';
import { IPlatform, valueConverter } from '@aurelia/runtime-html';
import { TestContext } from '@aurelia/testing';

export interface TestExecutionContext<TApp extends any> {
  ctx: TestContext;
  container: IContainer;
  host: HTMLElement;
  app: TApp;
  platform: IPlatform;
}

export type $TestSetupContext = Record<string, any> & { timeout?: number };
export type TestFunction<TTestContext extends TestExecutionContext<any>> = (ctx: TTestContext) => void | Promise<void>;
export type WrapperFunction<TTestContext extends TestExecutionContext<any>, TSetupContext extends $TestSetupContext = $TestSetupContext> = (testFunction: TestFunction<TTestContext>, setupContext?: TSetupContext) => void | Promise<void>;

export function createSpecFunction<TTestContext extends TestExecutionContext<any>, TSetupContext extends $TestSetupContext = $TestSetupContext>(wrap: WrapperFunction<TTestContext, TSetupContext>) {

  function $it(title: string, testFunction: TestFunction<TTestContext>, setupContext?: TSetupContext) {
    it(title, async function () {
      if (setupContext?.timeout !== void 0) {
        this.timeout(setupContext.timeout);
      }
      await wrap(testFunction, setupContext);
    });
  }

  $it.only = function (title: string, testFunction: TestFunction<TTestContext>, setupContext?: TSetupContext) {
    it.only(title, async function () { await wrap(testFunction, setupContext); });
  };

  $it.skip = function (title: string, testFunction: TestFunction<TTestContext>, setupContext?: TSetupContext) {
    it.skip(title, async function () { await wrap(testFunction, setupContext); });
  };
  return $it;
}

@valueConverter('toNumber')
export class ToNumberValueConverter {
  public fromView(value: string): number { return Number(value) || void 0; }
}
