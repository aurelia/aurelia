import { INode, PartialCustomElementDefinition } from '@aurelia/runtime-html';
import { ValidationResultsSubscriber, ValidationEvent, ValidationResultTarget, IValidationController } from '../validation-controller';
export declare const defaultContainerTemplate = "\n<slot></slot>\n<slot name='secondary'>\n  <span repeat.for=\"error of errors\">\n    ${error.result.message}\n  </span>\n</slot>\n";
export declare const defaultContainerDefinition: PartialCustomElementDefinition;
export declare class ValidationContainerCustomElement implements ValidationResultsSubscriber {
    private readonly scopedController;
    controller: IValidationController;
    errors: ValidationResultTarget[];
    private readonly host;
    constructor(host: INode, scopedController: IValidationController);
    handleValidationEvent(event: ValidationEvent): void;
    beforeBind(): void;
    beforeUnbind(): void;
}
//# sourceMappingURL=validation-container-custom-element.d.ts.map