import { CustomElementHost } from '@aurelia/runtime';

export function closestCustomElement(element: CustomElementHost<Element>): CustomElementHost {
  while (element) {
    if ((element).$customElement) {
      break;
    }
    element = element.parentElement;
  }
  return element;
}
