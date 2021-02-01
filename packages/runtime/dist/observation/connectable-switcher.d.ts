import type { IConnectable } from '../observation.js';
export declare let connecting: boolean;
export declare function pauseConnecting(): void;
export declare function resumeConnecting(): void;
export declare function currentConnectable(): IConnectable | null;
export declare function enterConnectable(connectable: IConnectable): void;
export declare function exitConnectable(connectable: IConnectable): void;
export declare const ConnectableSwitcher: Readonly<{
    readonly current: IConnectable | null;
    readonly connecting: boolean;
    enter: typeof enterConnectable;
    exit: typeof exitConnectable;
    pause: typeof pauseConnecting;
    resume: typeof resumeConnecting;
}>;
//# sourceMappingURL=connectable-switcher.d.ts.map