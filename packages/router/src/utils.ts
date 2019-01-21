import { CustomElementHost } from '@aurelia/runtime';

export function closestCustomElement(element: Element): CustomElementHost {
  while (element) {
    if ((element as CustomElementHost).$customElement) {
      break;
    }
    element = element.parentElement;
  }
  return element;
}
