import { spy } from 'sinon';
import { IContainer } from '../../../kernel/src/index';
import { IView, BindingMode, DOM, ForOfStatement, BindingIdentifier, CustomElementResource, ICustomElement, ITemplateSource, TargetedInstructionType, IExpressionParser, AccessMember, AccessScope, Repeat } from '../../src/index';
import { _, stringify, jsonStringify, htmlStringify, verifyEqual, createElement, padRight } from '../../../../scripts/test-lib';

export function eachCartesianJoin<T1>(args: T1[], callback: (arg1: T1) => any): void;
export function eachCartesianJoin<T1, T2>(args1: T1[], args2: T2[], callback: (arg1: T1, arg2: T2) => any): void;
export function eachCartesianJoin<T1, T2, T3>(args1: T1[], args2: T2[], args3: T3[], callback: (arg1: T1, arg2: T2, arg3: T3) => any): void;
export function eachCartesianJoin<T1, T2, T3, T4>(args1: T1[], args2: T2[], args3: T3[], args4: T4[], callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => any): void;
export function eachCartesianJoin<T1, T2, T3, T4, T5>(args1: T1[], args2: T2[], args3: T3[], args4: T4[], args5: T5[], callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => any): void;
export function eachCartesianJoin(...args: any[]) {
  const arrays = args.slice(0, -1).filter(arr => arr.length > 0);
  const callback = args[args.length - 1];
  if (typeof callback !== 'function') {
    throw new Error('Callback is not a function');
  }
  if (arrays.length > 10) {
    throw new Error('Maximum number of arguments exceeded');
  }
  const totalCallCount: number = arrays.reduce((count: number, arr: any[]) => count *= arr.length, 1);
  const argsIndices = Array(arrays.length).fill(0);
  args = updateElementByIndices(arrays, Array(arrays.length), argsIndices);
  callback(...updateElementByIndices(arrays, args, argsIndices));
  let callCount = 1;
  if (totalCallCount === callCount) {
    return;
  }
  while (true) {
    const hasUpdate = updateIndices(arrays, argsIndices);
    if (hasUpdate) {
      callback(...updateElementByIndices(arrays, args, argsIndices));
      callCount++;
      if (totalCallCount < callCount) {
        throw new Error('Invalid loop implementation.');
      }
    } else {
      break;
    }
  }
}
function updateIndices(arrays: any[][], indices: number[]) {
  let arrIndex = arrays.length;
  while (arrIndex--) {
    if (indices[arrIndex] === arrays[arrIndex].length - 1) {
      if (arrIndex === 0) {
        return false;
      }
      continue;
    }

    indices[arrIndex] += 1;
    for (let i = arrIndex + 1, ii = arrays.length; ii > i; ++i) {
      indices[i] = 0;
    }
    return true;
  }
  return false;
}
function updateElementByIndices(arrays: any[][], args: any[], indices: number[]) {
  for (let i = 0, ii = arrays.length; ii > i; ++i) {
    args[i] = arrays[i][indices[i]];
  }
  return args;
}

/**
 * Object describing a test fixture
 *
 * (currently specific to repeater)
 */
export interface IRepeaterFixture {
  elName: string;
  colName: string;
  itemName: string;
  propName?: string;
}

export function createTextBindingTemplateSource(propertyName: string, oneTime?: boolean): ITemplateSource {
  return {
    templateOrNode: `<div><au-marker class="au"></au-marker> </div>`,
    instructions: [
      [
        {
          type: TargetedInstructionType.textBinding,
          srcOrExpr: propertyName
        }
      ]
    ]
  };
}

/**
 * Verify a collection of Visuals is in sync with the backing bindingContext
 *
 * (currently specific to repeater)
 */
export function assertVisualsSynchronized(views: IView[], items: any[], itemName: string, propName?: string): void {

  let isSynced = true;
  const len = views.length;
  if (len === items.length) {
    let i = 0;
    while (i < len) {
      const visual = views[i];
      if (visual.$scope.bindingContext[itemName] !== items[i]) {
        isSynced = false;
        break;
      }
      i++;
    }
  } else {
    isSynced = false;
  }
  if (!isSynced) {
    const mapVisuals: (v: IView) => string = propName ?
      v => stringify(v.$scope.bindingContext[itemName][propName]) :
      v => stringify(v.$scope.bindingContext[itemName]);
    const mapItems: (i: any) => string = propName ?
      i => stringify(i[propName]) :
      i => stringify(i);
    const $actual = views.map(mapVisuals).join(',');
    const $expected = items.map(mapItems).join(',');
    throw new Error(`assertVisualsSynchronized - expected visuals[${$actual}] to equal items[${$expected}]`);
  }
}

const newline = /\r?\n/g;

/**
 * Verify the DOM is in sync with the backing bindingContext
 *
 * (currently specific to repeater)
 */
export function assertDOMSynchronized({ propName }: IRepeaterFixture, items: any[], element: HTMLElement): void {
  const expected = items.map(i => i[propName]).join(',');
  const actual = element.innerText.replace(newline, ',');
  if (actual !== expected) {
    throw new Error(`assertDOMSynchronized - expected element.innerText[${actual}] to equal items[${expected}]`);
  }
}

/**
 * Increment the specified (numeric) values (or properties) by the specified number
 */
export function incrementItems(items: any[], by: number, fixture?: IRepeaterFixture): void {
  let i = 0;
  let len = items.length;
  if (fixture) {
    const prop = fixture.propName;
    while (i < len) {
      items[i][prop] += by;
      i++;
    }
  } else {
    while (i < len) {
      items[i] += by;
      i++;
    }
  }
}

/**
 * Create App configuration based on the provided fixture
 *
 * (currently specific to repeater)
 */
export function createRepeaterTemplateSource({ elName, colName, itemName }: IRepeaterFixture, src: ITemplateSource): ITemplateSource {
  return {
    name: elName,
    dependencies: [],
    templateOrNode: `
      <au-marker class="au"></au-marker>
    `,
    instructions: [
      [
        {
          type: TargetedInstructionType.hydrateTemplateController,
          res: 'repeat',
          src: src,
          instructions: [
            {
              type: TargetedInstructionType.propertyBinding,
              mode: BindingMode.toView,
              srcOrExpr: colName,
              dest: 'items'
            },
            {
              type: TargetedInstructionType.setProperty,
              value: itemName,
              dest: 'local'
            }
          ]
        }
      ]
    ],
    surrogates: []
  };
};

/**
 * Create Aurelia configuration based on the provided fixture
 *
 * (currently specific to repeater)
 */
export function createAureliaRepeaterConfig({ colName, itemName, propName }: IRepeaterFixture): { register(container: IContainer): void } {
  const globalResources: any[] = [Repeat];
  const expressionCache = {
    [colName]: new ForOfStatement(new BindingIdentifier(itemName), new AccessScope(colName)),
    [propName]: new AccessMember(new AccessScope(itemName), propName)
  };

  return {
    register(container: IContainer) {
      (<IExpressionParser>container.get(IExpressionParser)).cache(expressionCache);
      container.register(...globalResources);
    }
  };
};

/**
 * Create a customElement based on the provided fixture
 *
 * (currently specific to repeater)
 */
export function createRepeater(fixture: IRepeaterFixture, initialItems: any[], src: ITemplateSource): ICustomElement {
  const Type = CustomElementResource.define(src, class {});
  const component = new Type();
  component[fixture.colName] = initialItems;
  return component;
}

export class SpySubscriber {
  constructor() {
    this.handleChange = spy();
    this.handleBatchedChange = spy();
  }
  handleChange: ReturnType<typeof spy>;
  handleBatchedChange: ReturnType<typeof spy>;
  resetHistory() {
    this.handleChange.resetHistory();
    this.handleBatchedChange.resetHistory();
  }
}


// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
// These attributes are valid on every HTML element and we want to rule out any potential quirk by ensuring
// the DataAttributeObserver functions correctly for each of them
export const globalAttributeNames = [
  'xml:lang',
  'xml:base',

  'accesskey',
  'autocapitalize',
  'aria-foo',
  'class',
  'contenteditable',
  'contextmenu',
  'data-foo',
  'dir',
  'draggable',
  'dropzone',
  'hidden',
  'id',
  'is',
  'itemid',
  'itemprop',
  'itemref',
  'itemscope',
  'itemtype',
  'lang',
  'slot',
  'spellcheck',
  'style',
  'tabindex',
  'title',
  'translate',

  'onabort',
  'onautocomplete',
  'onautocompleteerror',
  'onblur',
  'oncancel',
  'oncanplay',
  'oncanplaythrough',
  'onchange',
  'onclick',
  'onclose',
  'oncontextmenu',
  'oncuechange',
  'ondblclick',
  'ondrag',
  'ondragend',
  'ondragenter',
  'ondragexit',
  'ondragleave',
  'ondragover',
  'ondragstart',
  'ondrop',
  'ondurationchange',
  'onemptied',
  'onended',
  'onerror',
  'onfocus',
  'oninput',
  'oninvalid',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'onload',
  'onloadeddata',
  'onloadedmetadata',
  'onloadstart',
  'onmousedown',
  'onmouseenter',
  'onmouseleave',
  'onmousemove',
  'onmouseout',
  'onmouseover',
  'onmouseup',
  'onmousewheel',
  'onpause',
  'onplay',
  'onplaying',
  'onprogress',
  'onratechange',
  'onreset',
  'onresize',
  'onscroll',
  'onseeked',
  'onseeking',
  'onselect',
  'onshow',
  'onsort',
  'onstalled',
  'onsubmit',
  'onsuspend',
  'ontimeupdate',
  'ontoggle',
  'onvolumechange',
  'onwaiting'
];


export { _, stringify, jsonStringify, htmlStringify, verifyEqual, createElement, padRight };
