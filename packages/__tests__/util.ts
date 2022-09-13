import { IContainer } from '@aurelia/kernel';
import { valueConverter, IPlatform } from '@aurelia/runtime-html';
import { TestContext } from '@aurelia/testing';

export interface TestExecutionContext<TApp> {
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
      await wrap.bind(this)(testFunction.bind(this), setupContext);
    });
  }

  $it.only = function (title: string, testFunction: TestFunction<TTestContext>, setupContext?: TSetupContext) {
    // eslint-disable-next-line mocha/no-exclusive-tests
    it.only(title, async function () { await wrap.bind(this)(testFunction.bind(this), setupContext); });
  };

  $it.skip = function (title: string, testFunction: TestFunction<TTestContext>, setupContext?: TSetupContext) {
    // eslint-disable-next-line mocha/no-skipped-tests
    return it.skip(title, async function () { await wrap.bind(this)(testFunction.bind(this), setupContext); });
  };

  return $it;
}

@valueConverter('toNumber')
export class ToNumberValueConverter {
  public fromView(value: string): number { return Number(value) || void 0; }
}

export class TickLogger {
  public ticks: number = 0;
  private running: boolean = false;
  private cb: (() => void) | null = null;

  public start(): void {
    this.running = true;
    const next = (): void => {
      ++this.ticks;
      this.cb?.call(void 0);
      if (this.running) {
        void Promise.resolve().then(next);
      }
    };
    void Promise.resolve().then(next);
  }

  public stop(): void {
    this.running = false;
  }

  public onTick(cb: () => void): void {
    this.cb = cb;
  }
}

export const isFirefox = () => TestContext.create().wnd.navigator.userAgent.includes('Firefox');
export const isChrome = () => TestContext.create().wnd.navigator.userAgent.includes('Chrome');
export const isNode = () => !isFirefox() && !isChrome();
