import { ConsideredActiveCustomAttribute } from './considered-active';
/* eslint-disable compat/compat */
import { IEventAggregator } from '@aurelia/kernel';
import { IRouter, RouterStartEvent } from '../router.js';
import { CustomAttribute, IHydratedController } from '@aurelia/runtime-html';
import { LoadInstruction } from '../interfaces.js';
import { RoutingInstruction } from '../instructions/routing-instruction.js';

/**
 * Get either a provided value or the value of an html attribute,
 * depending on `useValue`. If `doExistCheck` is `true` the
 * existence of the html attribute is returned, regardless of
 * `useValue` (or `value`).
 *
 * @param name - Attribute name
 * @param value - The value that's used if `useValue` or if
 * the attribute doesn't exist on the element (so it's also default)
 * @param useValue - Whether the value should be used (unless check exists)
 * @param element - The element with the attributes
 * @param doExistCheck - Whether only the existence of the html attribute
 * should be checked and returned as a boolean
 */
export function getValueOrAttribute(name: string, value: string | boolean, useValue: boolean, element: HTMLElement, doExistCheck: boolean = false): string | boolean | undefined {
  // If an attribute exist check is requested, the value isn't used at all
  if (doExistCheck) {
    return element.hasAttribute(name);
  }
  if (useValue) {
    return value;
  }
  const attribute = element.getAttribute(name) ?? '';
  // If no or empty attribute, the provided value serves as default
  return attribute.length > 0 ? attribute : value;
}

/**
 * Make it possible to wait for router start by subscribing to the
 * router start event and return a promise that's resolved when
 * the router start event fires.
 */
export function waitForRouterStart(router: IRouter, ea: IEventAggregator): void | Promise<void> {
  if (router.isActive) {
    return;
  }
  return new Promise((resolve) => {
    const subscription = ea.subscribe(RouterStartEvent.eventName, () => {
      resolve();
      subscription.dispose();
    });
  });
}

export function getConsideredActiveInstructions(router: IRouter, controller: IHydratedController, element: HTMLElement, value: unknown): RoutingInstruction[] {
  let activeInstructions = (CustomAttribute
    .for(element, 'considered-active')?.viewModel as ConsideredActiveCustomAttribute)?.value as LoadInstruction;
  if (activeInstructions === void 0) {
    activeInstructions = value as LoadInstruction;
  }
  // const activeInstructions = (element.hasAttribute('considered-active')
  //   ? element.getAttribute('considered-active')
  //   : value) as LoadInstruction;

  const created = router.applyLoadOptions(activeInstructions, { context: controller });
  const instructions = RoutingInstruction.from(router, created.instructions);
  for (const instruction of instructions) {
    if (instruction.scope === null) {
      instruction.scope = created.scope;
    }
  }
  return instructions;
}

export function getLoadIndicator(element: HTMLElement): HTMLElement {
  let indicator = element.parentElement;
  while (indicator != null) {
    if (indicator.tagName === 'AU-VIEWPORT') {
      indicator = null;
      break;
    }
    if (indicator.hasAttribute('load-active')) {
      break;
    }
    indicator = indicator.parentElement;
  }
  indicator ??= element;
  return indicator;
}
