import { LifecycleFlags } from '../flags';
import { IBinding } from '../lifecycle';
import { ITaskQueue } from '../scheduler';

export const enum MiddlewareType {
  updateTarget,
  updateSource,
  callSource
}
export interface IHookableValueBinding extends IBindingMiddleware, IBinding {
  readonly postRenderTaskQueue: ITaskQueue;
  sourceMiddlewares: IBindingMiddleware[];
  targetMiddlewares: IBindingMiddleware[];
  registerMiddleware(type: MiddlewareType.updateSource | MiddlewareType.updateTarget, middleWare: IBindingMiddleware, addToEnd?: boolean): void;
  deregisterMiddleware(type: MiddlewareType.updateSource | MiddlewareType.updateTarget, middleWare: IBindingMiddleware): void;
}
export interface IHookableCallBinding extends IBindingMiddleware {
  middlewares: IBindingMiddleware[];
  registerMiddleware(type: MiddlewareType.callSource, middleWare: IBindingMiddleware, addToEnd?: boolean): void;
  deregisterMiddleware(type: MiddlewareType.callSource, middleWare: IBindingMiddleware): void;
}
interface IBindingMiddlewareContext {
  done: boolean;
}
export interface IUpdateMiddlewareContext<TValue = unknown> extends IBindingMiddlewareContext {
  flags: LifecycleFlags;
  readonly previousValue: TValue;
  newValue: TValue;
}

export interface ICallSourceMiddlewareContext<TArg = unknown, TEvent extends Event = Event> extends IBindingMiddlewareContext {
  arguments?: TArg;
  event?: TEvent;
}

export interface IBindingMiddleware {
  runUpdateSource?(context: IUpdateMiddlewareContext): Promise<IUpdateMiddlewareContext>;
  runUpdateTarget?(context: IUpdateMiddlewareContext): Promise<IUpdateMiddlewareContext>;
  runCallSource?(context: ICallSourceMiddlewareContext): Promise<ICallSourceMiddlewareContext>;
}

export function registerMiddleware(
  this: IHookableValueBinding,
  type: MiddlewareType.updateSource | MiddlewareType.updateTarget,
  middleware: IBindingMiddleware,
  addToEnd?: boolean,
): void;
export function registerMiddleware(
  this: IHookableCallBinding,
  type: MiddlewareType.callSource,
  middleware: IBindingMiddleware,
  addToEnd?: boolean,
): void;
export function registerMiddleware(
  this: IHookableValueBinding | IHookableCallBinding,
  type: MiddlewareType,
  middleware: IBindingMiddleware,
  addToEnd: boolean = false,
): void {
  let middlewares: IBindingMiddleware[] | undefined = void 0;
  switch (type) {
    case MiddlewareType.updateSource: {
      if (middleware.runUpdateSource === void 0) {
        throw new Error('runUpdateSource is missing in middleware'); // TODO use reporter/logger
      }
      middlewares = (this as IHookableValueBinding).sourceMiddlewares;
      break;
    }
    case MiddlewareType.updateTarget: {
      if (middleware.runUpdateTarget === void 0) {
        throw new Error('runUpdateTarget is missing in middleware'); // TODO use reporter/logger
      }
      middlewares = (this as IHookableValueBinding).targetMiddlewares;
      break;
    }
    case MiddlewareType.callSource: {
      if (middleware.runCallSource === void 0) {
        throw new Error('runCallSource is missing in middleware'); // TODO use reporter/logger
      }
      middlewares = (this as IHookableCallBinding).middlewares;
      break;
    }
    default:
      throw new Error(`Unrecognized middleware type ${type}`); // TODO use reporter/logger
  }

  if (middlewares === void 0) {
    throw new Error('middlewares not found on binding'); // TODO use reporter/logger
  }

  if (middlewares.length === 0) {
    middlewares.push(this);
  }
  if (addToEnd) {
    middlewares.push(middleware);
  } else {
    middlewares.unshift(middleware);
  }
}
export function deregisterMiddleware(
  this: IHookableValueBinding,
  type: MiddlewareType.updateSource | MiddlewareType.updateTarget,
  middleware: IBindingMiddleware,
): void;
export function deregisterMiddleware(
  this: IHookableCallBinding,
  type: MiddlewareType.callSource,
  middleware: IBindingMiddleware,
): void;
export function deregisterMiddleware(
  this: IHookableValueBinding | IHookableCallBinding,
  type: MiddlewareType,
  middleware: IBindingMiddleware,
): void {
  let middlewares: IBindingMiddleware[] | undefined = void 0;
  switch (type) {
    case MiddlewareType.updateSource:
      middlewares = (this as IHookableValueBinding).sourceMiddlewares;
      break;
    case MiddlewareType.updateTarget:
      middlewares = (this as IHookableValueBinding).targetMiddlewares;
      break;
    case MiddlewareType.callSource:
      middlewares = (this as IHookableCallBinding).middlewares;
      break;
  }

  if (middlewares !== void 0) {
    middlewares.splice(middlewares.indexOf(middleware), 1);
  }
}

export function runTargetMiddlewares(this: IHookableValueBinding, newValue: unknown, previousValue: unknown, flags: LifecycleFlags) {
  const lastIndex = this.targetMiddlewares.length - 1;

  this.postRenderTaskQueue.queueTask(async () => {
    await this.targetMiddlewares.reduce(async (acc, middleware, index) => {
      let ctx = await acc;
      if (!ctx.done) {
        ctx = await middleware.runUpdateTarget!(ctx);
        ctx.done = ctx.done ? true : index === lastIndex;
        return ctx;
      }
      return acc;
    }, Promise.resolve<IUpdateMiddlewareContext>({ done: false, newValue, previousValue, flags }));
  });
}

export function runSourceMiddlewares(this: IHookableValueBinding, newValue: unknown, previousValue: unknown, flags: LifecycleFlags) {
  const lastIndex = this.sourceMiddlewares.length - 1;

  this.postRenderTaskQueue.queueTask(async () => {
    await this.sourceMiddlewares.reduce(async (acc, middleware, index) => {
      let ctx = await acc;
      if (!ctx.done) {
        ctx = await middleware.runUpdateSource!(ctx);
        ctx.done = ctx.done ? true : index === lastIndex;
        return ctx;
      }
      return acc;
    }, Promise.resolve<IUpdateMiddlewareContext>({ done: false, newValue, previousValue, flags }));
  });
}
