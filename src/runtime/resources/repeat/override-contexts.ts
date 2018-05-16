import { IVisual } from "../../templating/view-engine";
import { IOverrideContext, BindingContext } from "../../binding/binding-context";
import { IRepeater } from "./repeater";

/**
* Update the override context.
* @param startIndex index in collection where to start updating.
*/
export function updateOverrideContexts(visuals: ArrayLike<IVisual>, startIndex: number) {
  let length = visuals.length;

  if (startIndex > 0) {
    startIndex = startIndex - 1;
  }

  for (; startIndex < length; ++startIndex) {
    updateOverrideContext(visuals[startIndex].$scope.overrideContext, startIndex, length);
  }
}

/**
  * Creates a complete override context.
  * @param data The item's value.
  * @param index The item's index.
  * @param length The collections total length.
  * @param key The key in a key/value pair.
  */
export function createFullOverrideContext(repeat: IRepeater, data: any, index: number, length: number, key?: any) {
  let bindingContext = {};
  let overrideContext = BindingContext.createOverride(bindingContext, repeat.scope.overrideContext);
  
  // is key/value pair (Map)
  if (typeof key !== 'undefined') {
    bindingContext[repeat.key] = key;
    bindingContext[repeat.value] = data;
  } else {
    bindingContext[repeat.local] = data;
  }

  updateOverrideContext(overrideContext, index, length);

  return overrideContext;
}

/**
* Updates the override context.
* @param context The context to be updated.
* @param index The context's index.
* @param length The collection's length.
*/
export function updateOverrideContext(overrideContext: IOverrideContext, index: number, length: number) {
  let first = (index === 0);
  let last = (index === length - 1);
  let even = index % 2 === 0;

  (<any>overrideContext).$index = index;
  (<any>overrideContext).$first = first;
  (<any>overrideContext).$last = last;
  (<any>overrideContext).$middle = !(first || last);
  (<any>overrideContext).$odd = !even;
  (<any>overrideContext).$even = even;
}


