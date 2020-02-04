import { ValidationResultsSubscriber, ValidationEvent, ValidationResultTarget } from '../validation-controller';
import { ValidationResult } from '../rule-provider';
import { DOM } from '@aurelia/runtime';

const resultIdAttribute = 'validation-result-id';
const resultContainerAttribute = 'validation-result-container';

export class ValidationResultPresenterService implements ValidationResultsSubscriber {

  public handleValidationEvent(event: ValidationEvent): void {
    // console.log(`#added ${event.addedResults.length}, #removed ${event.removedResults.length}`);
    console.log('added', event.addedResults.map(({ result, targets }) => ([result.toString(), targets.length])));
    console.log('removed', event.removedResults.map(({ result, targets }) => ([result.toString(), targets.length])));
    for (const [target, results] of this.reverseMap(event.removedResults)) {
      this.remove(target, results);
    }

    for (const [target, results] of this.reverseMap(event.addedResults)) {
      this.add(target, results);
    }
  }

  public remove(target: Element, results: ValidationResult[]) {
    console.log(`remove\n${target.outerHTML}, ${results.map(r => r.message).join()}`);
    const messageContainer = this.getValidationMessageContainer(target);
    if (messageContainer === null) { return; }
    this.removeResults(messageContainer, results);
  }

  public add(target: Element, results: ValidationResult[]) {
    console.log(`add\n${target.outerHTML}, ${results.map(r => r.message).join()}`);
    const messageContainer = this.getValidationMessageContainer(target);
    if (messageContainer === null) { return; }
    this.showResults(messageContainer, results);
  }

  public getValidationMessageContainer(target: Element): Element | null {
    const parent = target.parentElement;
    if (parent === null) { return null; }
    let messageContainer = parent.querySelector(`[${resultContainerAttribute}]`);
    if (messageContainer === null) {
      messageContainer = DOM.createElement('div') as Element;
      messageContainer.setAttribute(resultContainerAttribute, '');
      parent.appendChild(messageContainer);
    }
    return messageContainer;
  }

  public showResults(messageContainer: Element, results: ValidationResult[]) {
    messageContainer.append(
      ...results.reduce((acc: Element[], result) => {
        if (!result.valid) {
          const span = DOM.createElement('span') as HTMLSpanElement;
          span.setAttribute(resultIdAttribute, result.id.toString());
          span.textContent = result.message!;
          acc.push(span);
        }
        return acc;
      }, [])
    );
  }

  public removeResults(messageContainer: Element, results: ValidationResult[]) {
    console.log('removeResults', messageContainer);
    console.log('#results', results.length);
    for (const result of results) {
      if (!result.valid) {
        console.log('resultId:', result.id);
        const message = messageContainer.querySelector(`[${resultIdAttribute}=${result.id}]`);
        if (!message) { throw new Error('message not found'); }
        console.log(`message found: ${message?.outerHTML}`);
        // message!.remove();
        messageContainer.removeChild(message!);
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
