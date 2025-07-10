import { Writable } from '@aurelia/kernel';
import { ICustomElementController, IPlatform, IViewModel, IHydratedController as HC, IHydratedParentController as HPC } from '@aurelia/runtime-html';
import { Params as P, RouteNode as RN, NavigationInstruction as NI } from '@aurelia/router';
declare const hookNames: readonly ["binding", "bound", "attaching", "attached", "detaching", "unbinding", "canLoad", "loading", "canUnload", "unloading"];
type HookName = typeof hookNames[number] | 'dispose';
declare class DelayedInvokerFactory<T extends HookName> {
    readonly name: T;
    readonly ticks: number;
    constructor(name: T, ticks: number);
    create(mgr: INotifierManager, p: IPlatform): DelayedInvoker<T>;
    toString(): string;
}
export declare class HookSpecs {
    readonly binding: DelayedInvokerFactory<'binding'>;
    readonly bound: DelayedInvokerFactory<'bound'>;
    readonly attaching: DelayedInvokerFactory<'attaching'>;
    readonly attached: DelayedInvokerFactory<'attached'>;
    readonly detaching: DelayedInvokerFactory<'detaching'>;
    readonly unbinding: DelayedInvokerFactory<'unbinding'>;
    readonly dispose: DelayedInvokerFactory<'dispose'>;
    readonly canLoad: DelayedInvokerFactory<'canLoad'>;
    readonly loading: DelayedInvokerFactory<'loading'>;
    readonly canUnload: DelayedInvokerFactory<'canUnload'>;
    readonly unloading: DelayedInvokerFactory<'unloading'>;
    readonly ticks: number;
    private constructor();
    static create(ticks: number, input?: Partial<HookSpecs>): HookSpecs;
    $dispose(): void;
    toString(exclude?: number): string;
}
declare abstract class TestVM implements IViewModel {
    readonly $controller: ICustomElementController<this>;
    get name(): string;
    readonly bindingDI: DelayedInvoker<'binding'>;
    readonly boundDI: DelayedInvoker<'bound'>;
    readonly attachingDI: DelayedInvoker<'attaching'>;
    readonly attachedDI: DelayedInvoker<'attached'>;
    readonly detachingDI: DelayedInvoker<'detaching'>;
    readonly unbindingDI: DelayedInvoker<'unbinding'>;
    readonly canLoadDI: DelayedInvoker<'canLoad'>;
    readonly loadDI: DelayedInvoker<'loading'>;
    readonly canUnloadDI: DelayedInvoker<'canUnload'>;
    readonly unloadDI: DelayedInvoker<'unloading'>;
    readonly disposeDI: DelayedInvoker<'dispose'>;
    constructor(mgr: INotifierManager, p: IPlatform, specs: HookSpecs);
    binding(i: HC, p: HPC): void | Promise<void>;
    bound(i: HC, p: HPC): void | Promise<void>;
    attaching(i: HC, p: HPC): void | Promise<void>;
    attached(i: HC): void | Promise<void>;
    detaching(i: HC, p: HPC): void | Promise<void>;
    unbinding(i: HC, p: HPC): void | Promise<void>;
    canLoad(p: P, n: RN, c: RN | null): boolean | NI | NI[] | Promise<boolean | NI | NI[]>;
    loading(p: P, n: RN, c: RN | null): void | Promise<void>;
    canUnload(n: RN | null, c: RN): boolean | Promise<boolean>;
    unloading(n: RN | null, c: RN): void | Promise<void>;
    dispose(): void;
    protected $binding(_i: HC, _p: HPC): void;
    protected $bound(_i: HC, _p: HPC): void;
    protected $attaching(_i: HC, _p: HPC): void;
    protected $attached(_i: HC): void;
    protected $detaching(_i: HC, _p: HPC): void;
    protected $unbinding(_i: HC, _p: HPC): void;
    protected $canLoad(_p: P, _n: RN, _c: RN | null): boolean | NI | NI[] | Promise<boolean | NI | NI[]>;
    protected $loading(_p: P, _n: RN, _c: RN | null): void | Promise<void>;
    protected $canUnload(_n: RN | null, _c: RN): boolean | Promise<boolean>;
    protected $unloading(_n: RN | null, _c: RN): void | Promise<void>;
    protected $dispose(this: Partial<Writable<this>>): void;
}
declare class Notifier {
    readonly mgr: NotifierManager;
    readonly name: HookName;
    readonly p: IPlatform;
    readonly entryHistory: string[];
    readonly fullHistory: string[];
    constructor(mgr: NotifierManager, name: HookName);
    enter(vm: TestVM): void;
    leave(vm: TestVM): void;
    tick(vm: TestVM, i: number): void;
    dispose(this: Partial<Writable<this>>): void;
}
declare const INotifierManager: import("@aurelia/kernel").InterfaceSymbol<INotifierManager>;
interface INotifierManager extends NotifierManager {
}
declare class NotifierManager {
    readonly entryNotifyHistory: string[];
    readonly fullNotifyHistory: string[];
    prefix: string;
    readonly p: IPlatform;
    readonly binding: Notifier;
    readonly bound: Notifier;
    readonly attaching: Notifier;
    readonly attached: Notifier;
    readonly detaching: Notifier;
    readonly unbinding: Notifier;
    readonly canLoad: Notifier;
    readonly loading: Notifier;
    readonly canUnload: Notifier;
    readonly unloading: Notifier;
    readonly dispose: Notifier;
    enter(vm: TestVM, tracker: Notifier): void;
    leave(vm: TestVM, tracker: Notifier): void;
    tick(vm: TestVM, tracker: Notifier, i: number): void;
    setPrefix(prefix: string): void;
    $dispose(this: Partial<Writable<this>>): void;
}
declare class DelayedInvoker<T extends HookName> {
    readonly mgr: INotifierManager;
    readonly p: IPlatform;
    readonly name: T;
    readonly ticks: number;
    constructor(mgr: INotifierManager, p: IPlatform, name: T, ticks: number);
    static binding(ticks?: number): DelayedInvokerFactory<'binding'>;
    static bound(ticks?: number): DelayedInvokerFactory<'bound'>;
    static attaching(ticks?: number): DelayedInvokerFactory<'attaching'>;
    static attached(ticks?: number): DelayedInvokerFactory<'attached'>;
    static detaching(ticks?: number): DelayedInvokerFactory<'detaching'>;
    static unbinding(ticks?: number): DelayedInvokerFactory<'unbinding'>;
    static canLoad(ticks?: number): DelayedInvokerFactory<'canLoad'>;
    static loading(ticks?: number): DelayedInvokerFactory<'loading'>;
    static canUnload(ticks?: number): DelayedInvokerFactory<'canUnload'>;
    static unloading(ticks?: number): DelayedInvokerFactory<'unloading'>;
    static dispose(ticks?: number): DelayedInvokerFactory<'dispose'>;
    invoke(vm: TestVM, cb: () => any): any;
    toString(): string;
}
export interface IComponentSpec {
    kind: 'all-sync' | 'all-async';
    hookSpec: HookSpecs;
}
export {};
//# sourceMappingURL=hook-tests.spec.d.ts.map