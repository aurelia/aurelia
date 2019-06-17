import { Key } from '@aurelia/kernel';
import { Application, ApplicationOptions, Container } from 'pixi.js';
export declare class PixiApp {
    static readonly inject: readonly Key[];
    readonly app: Application | null;
    stage: Container | null;
    options?: ApplicationOptions;
    width?: number;
    height?: number;
    view?: HTMLCanvasElement;
    transparent?: boolean;
    antialias?: boolean;
    preserveDrawingBuffer?: boolean;
    resolution?: number;
    forceCanvas?: boolean;
    backgroundColor?: number;
    clearBeforeRender?: boolean;
    roundPixels?: boolean;
    forceFXAA?: boolean;
    legacy?: boolean;
    context?: WebGLRenderingContext;
    autoResize?: boolean;
    powerPreference?: 'high-performance';
    tick?: (args: {
        delta: number;
    }) => void;
    private readonly callTick;
    private readonly element;
    private _app;
    constructor(...args: unknown[]);
    bound(): void;
    attached(): void;
    detached(): void;
    unbound(): void;
}
//# sourceMappingURL=pixi-app.d.ts.map