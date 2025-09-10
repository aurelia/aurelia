import { Collection } from '@aurelia/runtime';
import { IHydratedComponentController, ICustomAttributeViewModel, ISyntheticView, IRenderLocation, type CustomAttributeStaticAuDefinition } from '@aurelia/runtime-html';
import { HydrateTemplateController } from '@aurelia/template-compiler';
import type { IVirtualRepeater } from "./interfaces";
export interface VirtualRepeat extends ICustomAttributeViewModel {
}
export declare class VirtualRepeat implements IVirtualRepeater {
    static readonly $au: CustomAttributeStaticAuDefinition;
    local: string;
    items: Collection | null | undefined;
    private itemHeight;
    private itemWidth;
    private minViewsRequired;
    private collectionStrategy?;
    private dom;
    readonly location: IRenderLocation<ChildNode>;
    readonly instruction: HydrateTemplateController;
    readonly parent: IHydratedComponentController;
    constructor();
    getDistances(): [top: number, bottom: number];
    getViews(): readonly ISyntheticView[];
}
//# sourceMappingURL=virtual-repeat.d.ts.map