import type { Constructable } from '@aurelia/kernel';
import type { IConnectable } from '@aurelia/runtime';
export type IDepCollectionFn<TType extends object, TReturn = unknown> = (vm: TType, watcher: IConnectable) => TReturn;
export type IWatcherCallback<TType extends object, TValue = unknown> = (this: TType, newValue: TValue, oldValue: TValue, vm: TType) => unknown;
export interface IWatchDefinition<T extends object = object> {
    expression: PropertyKey | IDepCollectionFn<T>;
    callback: keyof T | IWatcherCallback<T>;
    flush: 'async' | 'sync';
}
export type IWatchOptions = {
    flush?: 'async' | 'sync';
};
type AnyMethod<R = unknown> = (...args: unknown[]) => R;
type WatchClassDecorator<T extends object> = (target: Constructable<T>, context: ClassDecoratorContext<Constructable<T>>) => void;
type WatchMethodDecorator<T, TV extends AnyMethod> = (target: TV, context: ClassMethodDecoratorContext<T, TV>) => void;
type MethodsOf<Type> = {
    [Key in keyof Type]: Type[Key] extends AnyMethod ? Key : never;
}[keyof Type];
export declare function watch<T extends object, D = unknown>(expressionOrPropertyAccessFn: PropertyKey, changeHandlerOrCallback: MethodsOf<T> | IWatcherCallback<T, D>, options?: IWatchOptions): WatchClassDecorator<T>;
export declare function watch<T extends object, D = unknown>(expressionOrPropertyAccessFn: IDepCollectionFn<T, D>, changeHandlerOrCallback: MethodsOf<T> | IWatcherCallback<T, D>, options?: IWatchOptions): WatchClassDecorator<T>;
export declare function watch<T extends object = object, D = unknown, TV extends AnyMethod = AnyMethod>(expressionOrPropertyAccessFn: PropertyKey | IDepCollectionFn<T, D>, options?: IWatchOptions): WatchMethodDecorator<T, TV>;
export declare const Watch: Readonly<{
    add(Type: Constructable, definition: IWatchDefinition): void;
    getDefinitions(Type: Constructable): IWatchDefinition[];
}>;
export {};
//# sourceMappingURL=watch.d.ts.map