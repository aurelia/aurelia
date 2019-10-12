import { Class, IContainer, ITraceInfo } from '@aurelia/kernel';
export declare function enableTracing(): void;
export declare function disableTracing(): void;
export declare const SymbolTraceWriter: {
    write(info: ITraceInfo): void;
};
export declare class Call {
    readonly instance: any;
    readonly args: any[];
    readonly method: PropertyKey;
    readonly index: number;
    constructor(instance: any, args: any[], method: PropertyKey, index: number);
}
export declare class CallCollection {
    readonly calls: Call[];
    constructor();
    static register(container: IContainer): void;
    addCall(instance: any, method: PropertyKey, ...args: any[]): CallCollection;
}
export declare function recordCalls<TProto extends object>(ctor: Class<TProto>, calls: CallCollection): void;
export declare function stopRecordingCalls<TProto extends object>(ctor: Class<TProto>): void;
export declare function trace(calls: CallCollection): (ctor: {
    new (...args: any[]): any;
    readonly prototype: any;
}) => void;
//# sourceMappingURL=tracing.d.ts.map