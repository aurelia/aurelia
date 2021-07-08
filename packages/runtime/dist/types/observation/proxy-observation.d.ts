export declare const rawKey = "__raw__";
export declare function wrap<T extends unknown>(v: T): T;
export declare function getProxy<T extends object>(obj: T): T;
export declare function getRaw<T extends object>(obj: T): T;
export declare function unwrap<T extends unknown>(v: T): T;
export declare const ProxyObservable: Readonly<{
    getProxy: typeof getProxy;
    getRaw: typeof getRaw;
    wrap: typeof wrap;
    unwrap: typeof unwrap;
    rawKey: string;
}>;
//# sourceMappingURL=proxy-observation.d.ts.map