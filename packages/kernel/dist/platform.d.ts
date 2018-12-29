import { ITimerHandler, IWindowOrWorkerGlobalScope } from './interfaces';
export declare const PLATFORM: {
    global: IWindowOrWorkerGlobalScope;
    emptyArray: ReadonlyArray<any>;
    emptyObject: Readonly<{}>;
    noop(): void;
    now: () => number;
    camelCase(input: string): string;
    kebabCase(input: string): string;
    toArray<T = unknown>(input: ArrayLike<T>): T[];
    requestAnimationFrame(callback: (time: number) => void): number;
    clearInterval(handle?: number): void;
    clearTimeout(handle?: number): void;
    setInterval(handler: ITimerHandler, timeout?: number, ...args: any[]): number;
    setTimeout(handler: ITimerHandler, timeout?: number, ...args: any[]): number;
};
//# sourceMappingURL=platform.d.ts.map