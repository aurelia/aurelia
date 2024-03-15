import { DI, resolve } from '@aurelia/kernel';
import { IPlatform } from '@aurelia/runtime-html';
import { ValidationResult } from '@aurelia/validation';
import { ValidationEvent, ValidationResultsSubscriber, ValidationResultTarget } from '../validation-controller';

const resultIdAttribute = 'validation-result-id';
const resultContainerAttribute = 'validation-result-container';

export interface IValidationResultPresenterService extends ValidationResultPresenterService { }
export const IValidationResultPresenterService = /*@__PURE__*/DI.createInterface<IValidationResultPresenterService>('IValidationResultPresenterService', (x) => x.transient(ValidationResultPresenterService));

export class ValidationResultPresenterService implements ValidationResultsSubscriber {
  private readonly platform: IPlatform = resolve(IPlatform);

  public handleValidationEvent(event: ValidationEvent): void {
    for (const [target, results] of this.reverseMap(event.removedResults)) {
      this.remove(target, results);
    }

    for (const [target, results] of this.reverseMap(event.addedResults)) {
      this.add(target, results);
    }
  }

  public remove(target: Element, results: ValidationResult[]) {
    const messageContainer = this.getValidationMessageContainer(target);
    if (messageContainer === null) { return; }
    this.removeResults(messageContainer, results);
  }

  public add(target: Element, results: ValidationResult[]) {
    const messageContainer = this.getValidationMessageContainer(target);
    if (messageContainer === null) { return; }
    this.showResults(messageContainer, results);
  }

  public getValidationMessageContainer(target: Element): Element | null {
    const parent = target.parentElement;
    if (parent === null) { return null; }
    let messageContainer = parent.querySelector(`[${resultContainerAttribute}]`);
    if (messageContainer === null) {
      messageContainer = this.platform.document.createElement('div') as Element;
      messageContainer.setAttribute(resultContainerAttribute, '');
      parent.appendChild(messageContainer);
    }
    return messageContainer;
  }

  public showResults(messageContainer: Element, results: ValidationResult[]) {
    messageContainer.append(
      ...results.reduce((acc: Element[], result) => {
        if (!result.valid) {
          const span = this.platform.document.createElement('span') as HTMLSpanElement;
          span.setAttribute(resultIdAttribute, result.id.toString());
          span.textContent = result.message!;
          acc.push(span);
        }
        return acc;
      }, [])
    );
  }

  public removeResults(messageContainer: Element, results: ValidationResult[]) {
    for (const result of results) {
      if (!result.valid) {
        messageContainer.querySelector(`[${resultIdAttribute}="${result.id}"]`)?.remove();
      }
    }
  }

  private reverseMap(results: ValidationResultTarget[]) {
    const map = new Map<Element, ValidationResult[]>();
    for (const { result, targets } of results) {
      for (const target of targets) {
        let targetResults = map.get(target);
        if (targetResults === void 0) {
          map.set(target, targetResults = []);
        }
        targetResults.push(result);
      }
    }
    return map;
  }
}
