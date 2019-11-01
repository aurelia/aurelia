import { CustomElement, IController, IViewModel } from '@aurelia/runtime';

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
  let controller: IController<Element> | undefined = CustomElement.behaviorFor(element);
  while (controller === void 0 && element.parentElement) {
    element = element.parentElement;
    controller = CustomElement.behaviorFor(element);
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
