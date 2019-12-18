export declare function lifecycleLogger(name: string): (target: any) => void;
export declare class LifecycleClass {
    canEnter(): boolean;
    enter(params: any): void;
    created(): void;
    beforeBind(): void;
    afterBind(): void;
    beforeAttach(): void;
    afterAttach(): void;
    canLeave(): boolean;
    leave(): void;
    beforeDetach(): void;
    afterDetach(): void;
    beforeUnbind(): void;
    afterUnbind(): void;
}
//# sourceMappingURL=lifecycle-logger.d.ts.map