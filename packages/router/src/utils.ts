import { CustomElementHost, CustomElement, IController, IViewModel } from '@aurelia/runtime';

// export function closestCustomElement(element: CustomElementHost<Element>): CustomElementHost | null {
//   let el: CustomElementHost<Element> | null = element;
//   while (el !== null) {
//     if (CustomElement.for(el) !== void 0) {
//       break;
//     }
//     el = el.parentElement;
//   }
//   return el;
// }

export function closestController(elementOrViewModel: Element | IViewModel): IController | undefined {
  // if ('$controller' in elementOrViewModel) {
  //   return (elementOrViewModel as IViewModel).$controller;
  // }
  if ('$au' in elementOrViewModel) {
    const $au: Record<string, IController> = (elementOrViewModel as { $au: Record<string, IController> }).$au;
    if ($au['au-viewport']) {
      return $au['au-viewport'];
    }
    const attributeController: IController = $au['goto']
      || (elementOrViewModel as IViewModel & { $au: Record<string, IController> }).$au['href'];
    return attributeController.parent;
  }
  let element: Element = elementOrViewModel as Element;
  let controller: IController<Element> | undefined = CustomElement.for(element);
  while (controller === void 0 && element.parentElement) {
    element = element.parentElement;
    controller = CustomElement.for(element);
  }
  return controller;
}

export function arrayRemove<T>(arr: T[], func: (value: T, index?: number, obj?: T[]) => boolean): T[] {
  const removed: T[] = [];
  let arrIndex: number = arr.findIndex(func);
  while (arrIndex >= 0) {
    removed.push(arr.splice(arrIndex, 1)[0]);
    arrIndex = arr.findIndex(func);
  }
  return removed;
}
