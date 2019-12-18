import { INode } from '@aurelia/runtime';
export declare class GotoCustomAttribute {
    value: unknown;
    private hasHref;
    private readonly element;
    constructor(element: INode);
    beforeBind(): void;
    valueChanged(newValue: unknown): void;
    private updateValue;
}
//# sourceMappingURL=goto.d.ts.map