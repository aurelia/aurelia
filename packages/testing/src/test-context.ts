import { DI, IContainer, IRegistration, IRegistry, Registration } from '@aurelia/kernel';
import {
  ILifecycle,
  IObserverLocator,
  IProjectorLocator,
  IComposer,
  IScheduler,
  ITemplateCompiler,
  IPlatform,
  RuntimeHtmlConfiguration,
} from '@aurelia/runtime-html';

export class TestContext {
  public static readonly ambient: TestContext;

  public get wnd(): Window & typeof globalThis { return this.platform.globalThis as Window & typeof globalThis; };
  public get doc(): Document { return this.platform.document; };
  public get userAgent(): string { return this.platform.navigator.userAgent; }

  public get UIEvent() { return this.platform.globalThis.UIEvent; }
  public get Event() { return this.platform.globalThis.Event; }
  public get CustomEvent() { return this.platform.globalThis.CustomEvent; }
  public get Node() { return this.platform.globalThis.Node; }
  public get Element() { return this.platform.globalThis.Element; }
  public get HTMLElement() { return this.platform.globalThis.HTMLElement; }
  public get HTMLDivElement() { return this.platform.globalThis.HTMLDivElement; }
  public get Text() { return this.platform.globalThis.Text; }
  public get Comment() { return this.platform.globalThis.Comment; }
  public get DOMParser() { return this.platform.globalThis.DOMParser; }

  private _container: IContainer | undefined = void 0;
  public get container(): IContainer {
    if (this._container === void 0) {
      this._container = DI.createContainer();
      RuntimeHtmlConfiguration.register(this._container);
      this._container.register(
        Registration.instance(TestContext, this),
      );
      if (this._container.has(IPlatform, true) === false) {
        this._container.register(PLATFORMRegistration);
      }
      if (this._container.has(IScheduler, true) === false) {
        this._container.register(SCHEDULERRegistration);
      }
    }
    return this._container;
  }
  private _scheduler: IScheduler | undefined = void 0;
  public get scheduler(): IScheduler {
    if (this._scheduler === void 0) {
      this._scheduler = this.container.get(IScheduler);
    }
    return this._scheduler;
  }
  private _platform: IPlatform | undefined = void 0;
  public get platform(): IPlatform {
    if (this._platform === void 0) {
      this._platform = this.container.get(IPlatform);
    }
    return this._platform;
  }
  private _templateCompiler: ITemplateCompiler | undefined = void 0;
  public get templateCompiler(): ITemplateCompiler {
    if (this._templateCompiler === void 0) {
      this._templateCompiler = this.container.get(ITemplateCompiler);
    }
    return this._templateCompiler;
  }
  private _observerLocator: IObserverLocator | undefined = void 0;
  public get observerLocator(): IObserverLocator {
    if (this._observerLocator === void 0) {
      this._observerLocator = this.container.get(IObserverLocator);
    }
    return this._observerLocator;
  }
  private _lifecycle: ILifecycle | undefined = void 0;
  public get lifecycle(): ILifecycle {
    if (this._lifecycle === void 0) {
      this._lifecycle = this.container.get(ILifecycle);
    }
    return this._lifecycle;
  }
  private _composer: IComposer | undefined = void 0;
  public get composer(): IComposer {
    if (this._composer === void 0) {
      this._composer = this.container.get(IComposer);
    }
    return this._composer;
  }
  private _projectorLocator: IProjectorLocator | undefined = void 0;
  public get projectorLocator(): IProjectorLocator {
    if (this._projectorLocator === void 0) {
      this._projectorLocator = this.container.get(IProjectorLocator);
    }
    return this._projectorLocator;
  }
  private _domParser: HTMLDivElement | undefined = void 0;
  public get domParser(): HTMLDivElement {
    if (this._domParser === void 0) {
      this._domParser = this.doc.createElement('div');
    }
    return this._domParser;
  }

  private constructor() {}

  public static create(): TestContext {
    return new TestContext();
  }

  public createElementFromMarkup(markup: string): HTMLElement {
    this.domParser.innerHTML = markup;
    return this.domParser.firstElementChild as HTMLElement;
  }

  public createElement(name: string): HTMLElement {
    return this.doc.createElement(name);
  }

  public createAttribute(name: string, value: string): Attr {
    const attr = this.doc.createAttribute(name);
    attr.value = value;
    return attr;
  }
}

export let PLATFORM: IPlatform;
export let PLATFORMRegistration: IRegistration<IPlatform>;

export function setPlatform(p: IPlatform): void {
  PLATFORM = p;
  PLATFORMRegistration = Registration.instance(IPlatform, p);
}

export let SCHEDULER: IScheduler;
export let SCHEDULERRegistration: IRegistration<IScheduler>;

export function setScheduler(s: IScheduler): void {
  SCHEDULER = s;
  SCHEDULERRegistration = Registration.instance(IScheduler, s);
}

export function createContainer(...registries: IRegistry[]): IContainer {
  return DI.createContainer().register(
    PLATFORMRegistration,
    SCHEDULERRegistration,
    ...registries,
  );
}
