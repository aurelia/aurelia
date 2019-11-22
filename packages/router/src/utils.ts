import { CustomElementHost, CustomElement, IController, IViewModel, CustomAttribute } from '@aurelia/runtime';

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

// export function closestController(elementOrViewModel: Element | IViewModel): IController | undefined {
//   if ('$controller' in elementOrViewModel) {
//     return (elementOrViewModel as IViewModel).$controller;
//   }
//   let el: Element = elementOrViewModel as Element;
//   let controller: IController | undefined = CustomElement.for(el);
//   while (!controller && el.parentElement) {
//     el = el.parentElement;
//     controller = CustomElement.for(el);
//   }
//   return controller;

//   // // if ('$controller' in elementOrViewModel) {
//   // //   return (elementOrViewModel as IViewModel).$controller;
//   // // }
//   // let attributeController = CustomAttribute.for(elementOrViewModel, 'au-viewport');
//   // if (attributeController !== void 0) {
//   //   return attributeController;
//   // }
//   // attributeController = CustomAttribute.for(elementOrViewModel, 'goto') || CustomAttribute.for(elementOrViewModel, 'href');
//   // if (attributeController !== void 0) {
//   //   return attributeController.parent;
//   // }
//   // // if ('$au' in elementOrViewModel) {
//   // //   const $au: Record<string, IController> = (elementOrViewModel as { $au: Record<string, IController> }).$au;
//   // //   if ($au['au-viewport']) {
//   // //     return $au['au-viewport'];
//   // //   }
//   // //   const attributeController: IController = $au['goto']
//   // //     || (elementOrViewModel as IViewModel & { $au: Record<string, IController> }).$au['href'];
//   // //   return attributeController.parent;
//   // // }
//   // let element: Element = elementOrViewModel as Element;
//   // let controller: IController<Element> | undefined = CustomElement.for(element);
//   // while (controller === void 0 && element.parentElement) {
//   //   element = element.parentElement;
//   //   controller = CustomElement.for(element);
//   // }
//   // return controller;
// }

export function arrayRemove<T>(arr: T[], func: (value: T, index?: number, obj?: T[]) => boolean): T[] {
  const removed: T[] = [];
  let arrIndex: number = arr.findIndex(func);
  while (arrIndex >= 0) {
    removed.push(arr.splice(arrIndex, 1)[0]);
    arrIndex = arr.findIndex(func);
  }
  return removed;
}
