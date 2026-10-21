import { IDisposable, IServiceLocator } from '@aurelia/kernel';
import { type Scope } from '@aurelia/runtime';
import { BindingMode } from '@aurelia/template-compiler';
import { State } from '../templating/controller';

/** @internal */ export const { default: defaultMode, oneTime, toView, fromView, twoWay } = BindingMode;
export { BindingMode } from '@aurelia/template-compiler';

export interface IBindingController {
  readonly state: State;
}

export interface IBinding {
  readonly isBound: boolean;
  bind(scope: Scope): void;
  unbind(): void;
  get: IServiceLocator['get'];
  useScope?(scope: Scope): void;
  limit?(opts: IRateLimitOptions): IDisposable;
  /**
   * The controller the binding was rendered for. Work a binding queues on its
   * own (rate-limited calls) reports its failures against it.
   *
   * @internal
   */
  readonly _controller?: IBindingController | null;
}

export interface IRateLimitOptions {
  type: 'throttle' | 'debounce';
  delay: number;
  now: () => number;
  signals: string[];
}
