export declare function lifecycleLogger(name: string): (target: any) => void;
export declare class LifecycleClass {
    canEnter(): boolean;
    enter(params: any): void;
    created(): void;
    binding(): void;
    bound(): void;
    attaching(): void;
    attached(): void;
    canLeave(): boolean;
    leave(): void;
    detaching(): void;
    detached(): void;
    unbinding(): void;
    unbound(): void;
}
//# sourceMappingURL=lifecycle-logger.d.ts.map