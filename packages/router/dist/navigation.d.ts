import { ICustomElementViewModel } from '@aurelia/runtime-html';
import { INavigationFlags } from './navigator.js';
import { ViewportInstruction } from './viewport-instruction.js';
import { Scope } from './scope.js';
import { IRoute } from './interfaces.js';
export interface INavigation extends IStoredNavigation {
    fromBrowser?: boolean;
    origin?: ICustomElementViewModel | Element;
    replacing?: boolean;
    refreshing?: boolean;
    untracked?: boolean;
    historyMovement?: number;
    resolve?: ((value?: void | PromiseLike<void>) => void);
    reject?: ((value?: void | PromiseLike<void>) => void);
}
export interface IStoredNavigation {
    navigation?: INavigationFlags;
    repeating?: boolean;
    instruction: string | ViewportInstruction[];
    fullStateInstruction: string | ViewportInstruction[];
    scope?: Scope | null;
    index?: number;
    firstEntry?: boolean;
    route?: IRoute;
    path?: string;
    title?: string;
    query?: string;
    parameters?: Record<string, unknown>;
    data?: Record<string, unknown>;
}
export declare class Navigation {
    navigation: INavigationFlags;
    previous?: Navigation;
    repeating?: boolean;
    fromBrowser?: boolean;
    origin?: ICustomElementViewModel | Element;
    replacing?: boolean;
    refreshing?: boolean;
    untracked?: boolean;
    historyMovement?: number;
    resolve?: ((value?: void | PromiseLike<void>) => void);
    reject?: ((value?: void | PromiseLike<void>) => void);
    instruction: string | ViewportInstruction[];
    fullStateInstruction: string | ViewportInstruction[];
    scope?: Scope | null;
    index?: number;
    firstEntry?: boolean;
    route?: IRoute;
    path?: string;
    title?: string;
    query?: string;
    parameters?: Record<string, unknown>;
    data?: Record<string, unknown>;
    constructor(entry?: INavigation);
    get useFullStateInstruction(): boolean;
    toStored(): IStoredNavigation;
}
//# sourceMappingURL=navigation.d.ts.map