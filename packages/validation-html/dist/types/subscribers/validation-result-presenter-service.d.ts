import { IPlatform } from '@aurelia/runtime-html';
import { ValidationResult } from '@aurelia/validation';
import { ValidationEvent, ValidationResultsSubscriber } from '../validation-controller.js';
export declare class ValidationResultPresenterService implements ValidationResultsSubscriber {
    private readonly platform;
    constructor(platform: IPlatform);
    handleValidationEvent(event: ValidationEvent): void;
    remove(target: Element, results: ValidationResult[]): void;
    add(target: Element, results: ValidationResult[]): void;
    getValidationMessageContainer(target: Element): Element | null;
    showResults(messageContainer: Element, results: ValidationResult[]): void;
    removeResults(messageContainer: Element, results: ValidationResult[]): void;
    private reverseMap;
}
//# sourceMappingURL=validation-result-presenter-service.d.ts.map