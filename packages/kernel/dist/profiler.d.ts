export interface ITimer {
    enter(): void;
    leave(): void;
}
export interface IProfile {
    name: string;
    duration: number;
    topLevelCount: number;
    totalCount: number;
}
export declare const Profiler: {
    createTimer: (name: string) => ITimer;
    enable: () => void;
    disable: () => void;
    report: (cb: (name: string, duration: number, topLevelCount: number, totalCount: number) => void) => void;
    readonly enabled: boolean;
};
//# sourceMappingURL=profiler.d.ts.map