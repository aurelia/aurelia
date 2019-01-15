export function closestCustomElement(element: Element): Element {
  while (element) {
    if ((element as any).$customElement) {
      break;
    }
    element = element.parentElement;
  }
  return element;
}
