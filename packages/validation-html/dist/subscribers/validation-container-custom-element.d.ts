import { INode, PartialCustomElementDefinition } from '@aurelia/runtime-html';
import { ValidationResultsSubscriber, ValidationEvent, ValidationResultTarget, IValidationController } from '../validation-controller.js';
export declare const defaultContainerTemplate = "\n<slot></slot>\n<slot name='secondary'>\n  <span repeat.for=\"error of errors\">\n    ${error.result.message}\n  </span>\n</slot>\n";
export declare const defaultContainerDefinition: PartialCustomElementDefinition;
export declare class ValidationContainerCustomElement implements ValidationResultsSubscriber {
    private readonly host;
    private readonly scopedController;
    controller: IValidationController;
    errors: ValidationResultTarget[];
    constructor(host: INode<HTMLElement>, scopedController: IValidationController);
    handleValidationEvent(event: ValidationEvent): void;
    binding(): void;
    unbinding(): void;
}
//# sourceMappingURL=validation-container-custom-element.d.ts.map