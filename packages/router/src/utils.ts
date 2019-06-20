import { CustomElementHost } from '@aurelia/runtime';

export function closestCustomElement(element: CustomElementHost<Element>): CustomElementHost {
  while (element) {
    if ((element).$controller) {
      break;
    }
    element = element.parentElement;
  }
  return element;
}

// tslint:disable-next-line:no-any
export function arrayRemove(arr: any[], func: (value: any, index?: number, obj?: any[]) => boolean): any[] {
  // tslint:disable-next-line:no-any
  const removed: any[] = [];
  let arrIndex = arr.findIndex(func);
  while (arrIndex >= 0) {
    removed.push(arr.splice(arrIndex, 1)[0]);
    arrIndex = arr.findIndex(func);
  }
  return removed;
}
