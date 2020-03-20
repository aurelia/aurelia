import { INode } from '@aurelia/runtime';
import { ValidationResultsSubscriber, ValidationEvent, ValidationResultTarget, IValidationController } from '../validation-controller';
export declare class ValidationContainerCustomElement implements ValidationResultsSubscriber {
    private readonly controller;
    errors: ValidationResultTarget[];
    private readonly host;
    constructor(host: INode, controller: IValidationController);
    handleValidationEvent(event: ValidationEvent): void;
    beforeBind(): void;
    beforeUnbind(): void;
}
//# sourceMappingURL=validation-container-custom-element.d.ts.map