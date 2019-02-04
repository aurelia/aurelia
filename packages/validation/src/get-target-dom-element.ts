import { Reporter } from '@aurelia/kernel';
import { DOM } from '@aurelia/runtime';
import { CustomElementResource, INode } from '@aurelia/runtime';

/**
 * Gets the DOM element associated with the data-binding. Most of the time it's
 * the binding.target but sometimes binding.target is an aurelia custom element,
 * or custom attribute which is a javascript "class" instance, so we need to use
 * the controller's container to retrieve the actual DOM element.
 */
export function getTargetDOMElement(binding: any, view: any): INode {
  const target = binding.target;
  if (DOM.isNodeInstance(target)) {
    return target;
  }
  const behavior = CustomElementResource.behaviorFor(target);
  if (behavior === null) {
    throw Reporter.error(1201); // TODO: create error code // throw new Error(`Unable to locate target element for "${binding.sourceExpression}".`);
  }
  return behavior.$host;
}
