import { CustomElementHost } from '@aurelia/runtime';

export function closestCustomElement(element: CustomElementHost<Element>): CustomElementHost | null {
  let el: CustomElementHost<Element> | null = element;
  while (el) {
    if (el.$controller) {
      break;
    }
    el = el.parentElement;
  }
  return el;
}

export function arrayRemove<T>(arr: T[], func: (value: T, index?: number, obj?: T[]) => boolean): T[] {
  const removed: T[] = [];
  let arrIndex = arr.findIndex(func);
  while (arrIndex >= 0) {
    removed.push(arr.splice(arrIndex, 1)[0]);
    arrIndex = arr.findIndex(func);
  }
  return removed;
}
