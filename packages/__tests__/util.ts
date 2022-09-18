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

export const enum Char {
  Null           = 0x00,
  Backspace      = 0x08,
  Tab            = 0x09,
  LineFeed       = 0x0A,
  VerticalTab    = 0x0B,
  FormFeed       = 0x0C,
  CarriageReturn = 0x0D,
  Space          = 0x20,
  Exclamation    = 0x21,
  DoubleQuote    = 0x22,
  Dollar         = 0x24,
  Percent        = 0x25,
  Ampersand      = 0x26,
  SingleQuote    = 0x27,
  OpenParen      = 0x28,
  CloseParen     = 0x29,
  Asterisk       = 0x2A,
  Plus           = 0x2B,
  Comma          = 0x2C,
  Minus          = 0x2D,
  Dot            = 0x2E,
  Slash          = 0x2F,
  Semicolon      = 0x3B,
  Backtick       = 0x60,
  OpenBracket    = 0x5B,
  Backslash      = 0x5C,
  CloseBracket   = 0x5D,
  Caret          = 0x5E,
  Underscore     = 0x5F,
  OpenBrace      = 0x7B,
  Bar            = 0x7C,
  CloseBrace     = 0x7D,
  Colon          = 0x3A,
  LessThan       = 0x3C,
  Equals         = 0x3D,
  GreaterThan    = 0x3E,
  Question       = 0x3F,

  Zero   = 0x30,
  One    = 0x31,
  Two    = 0x32,
  Three  = 0x33,
  Four   = 0x34,
  Five   = 0x35,
  Six    = 0x36,
  Seven  = 0x37,
  Eight  = 0x38,
  Nine   = 0x39,

  UpperA = 0x41,
  UpperB = 0x42,
  UpperC = 0x43,
  UpperD = 0x44,
  UpperE = 0x45,
  UpperF = 0x46,
  UpperG = 0x47,
  UpperH = 0x48,
  UpperI = 0x49,
  UpperJ = 0x4A,
  UpperK = 0x4B,
  UpperL = 0x4C,
  UpperM = 0x4D,
  UpperN = 0x4E,
  UpperO = 0x4F,
  UpperP = 0x50,
  UpperQ = 0x51,
  UpperR = 0x52,
  UpperS = 0x53,
  UpperT = 0x54,
  UpperU = 0x55,
  UpperV = 0x56,
  UpperW = 0x57,
  UpperX = 0x58,
  UpperY = 0x59,
  UpperZ = 0x5A,

  LowerA  = 0x61,
  LowerB  = 0x62,
  LowerC  = 0x63,
  LowerD  = 0x64,
  LowerE  = 0x65,
  LowerF  = 0x66,
  LowerG  = 0x67,
  LowerH  = 0x68,
  LowerI  = 0x69,
  LowerJ  = 0x6A,
  LowerK  = 0x6B,
  LowerL  = 0x6C,
  LowerM  = 0x6D,
  LowerN  = 0x6E,
  LowerO  = 0x6F,
  LowerP  = 0x70,
  LowerQ  = 0x71,
  LowerR  = 0x72,
  LowerS  = 0x73,
  LowerT  = 0x74,
  LowerU  = 0x75,
  LowerV  = 0x76,
  LowerW  = 0x77,
  LowerX  = 0x78,
  LowerY  = 0x79,
  LowerZ  = 0x7A
}
