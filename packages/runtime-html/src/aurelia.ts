import {
  DI,
  IContainer,
  Registration,
  InstanceProvider,
  IDisposable,
  onResolve,
} from '@aurelia/kernel';
import { AppRoot, IAppRoot, IDOM, ISinglePageApp } from '@aurelia/runtime';

type Publisher = { dispatchEvent(evt: unknown, options?: unknown): void };

export interface IAurelia extends Aurelia {}
export const IAurelia = DI.createInterface<IAurelia>('IAurelia').noDefault();

export class Aurelia implements IDisposable {
  private _isRunning: boolean = false;
  public get isRunning(): boolean { return this._isRunning; }
  private _isStarting: boolean = false;
  public get isStarting(): boolean { return this._isStarting; }
  private _isStopping: boolean = false;
  public get isStopping(): boolean { return this._isStopping; }

  private _root: IAppRoot<HTMLElement> | undefined = void 0;
  public get root(): IAppRoot<HTMLElement> {
    if (this._root == void 0) {
      if (this.next == void 0) {
        throw new Error(`root is not defined`); // TODO: create error code
      }
      return this.next;
    }
    return this._root;
  }

  private next: IAppRoot<HTMLElement> | undefined = void 0;

  private readonly rootProvider: InstanceProvider<IAppRoot<HTMLElement>>;

  public constructor(
    public readonly container: IContainer = DI.createContainer(),
  ) {
    if (container.has(IAurelia, true)) {
      throw new Error('An instance of Aurelia is already registered with the container or an ancestor of it.');
    }

    container.register(Registration.instance(IAurelia, this));
    container.registerResolver(IAppRoot, this.rootProvider = new InstanceProvider('IAppRoot'));
  }

  public register(...params: any[]): this {
    this.container.register(...params);
    return this;
  }

  public app(config: ISinglePageApp<HTMLElement>): Omit<this, 'register' | 'app' | 'enhance'> {
    this.next = new AppRoot(config, this.container, this.rootProvider, false);
    return this;
  }

  public enhance(config: ISinglePageApp<HTMLElement>): Omit<this, 'register' | 'app' | 'enhance'> {
    this.next = new AppRoot(config, this.container, this.rootProvider, true);
    return this;
  }

  private startPromise: Promise<void> | void = void 0;
  public start(root: IAppRoot<HTMLElement> | undefined = this.next): void | Promise<void> {
    if (root == void 0) {
      throw new Error(`There is no composition root`);
    }

    if (this.startPromise instanceof Promise) {
      return this.startPromise;
    }

    return this.startPromise = onResolve(this.stop(), () => {
      Reflect.set(root.host, '$aurelia', this);
      this.rootProvider.prepare(this._root = root);
      this._isStarting = true;

      return onResolve(root.activate(), () => {
        this._isRunning = true;
        this._isStarting = false;
        this.startPromise = void 0;
        this.dispatchEvent(root, 'aurelia-composed', root.dom);
        this.dispatchEvent(root, 'au-started', root.host);
      });
    });
  }

  private stopPromise: Promise<void> | void = void 0;
  public stop(): void | Promise<void> {
    if (this.stopPromise instanceof Promise) {
      return this.stopPromise;
    }

    if (this._isRunning === true) {
      const root = this._root!;
      this._isRunning = false;
      this._isStopping = true;

      return this.stopPromise = onResolve(root.deactivate(), () => {
        Reflect.deleteProperty(root.host, '$aurelia');
        this._root = void 0;
        this.rootProvider.dispose();
        this._isStopping = false;
        this.dispatchEvent(root, 'au-stopped', root.host);
      });
    }
  }

  public dispose(): void {
    if (this._isRunning || this._isStopping) {
      throw new Error(`The aurelia instance must be fully stopped before it can be disposed`);
    }
    this._root?.dispose();
    this._root = void 0;
    this.container.dispose();
  }

  private dispatchEvent(root: IAppRoot, name: string, target: IDOM<HTMLElement> | (HTMLElement & Partial<Publisher>)): void {
    const $target = ('dispatchEvent' in target ? target : root.dom) as Publisher;
    $target.dispatchEvent(root.dom.createCustomEvent(name, { detail: this, bubbles: true, cancelable: true }));
  }
}
