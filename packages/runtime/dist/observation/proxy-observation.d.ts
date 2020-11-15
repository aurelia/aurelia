export declare const rawKey = "__raw__";
export declare function getProxyOrSelf<T extends unknown>(v: T): T;
export declare function getProxy<T extends object>(obj: T): T;
export declare function getRaw<T extends object>(obj: T): T;
export declare function getRawOrSelf<T extends unknown>(v: T): T;
export declare const ProxyObservable: Readonly<{
    getProxy: typeof getProxy;
    getRaw: typeof getRaw;
}>;
//# sourceMappingURL=proxy-observation.d.ts.map