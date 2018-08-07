import { spy } from 'sinon';
import { IVisual, BindingMode } from '@aurelia/runtime';
import { CustomElementResource, ICustomElement } from '@aurelia/runtime';
import { ITemplateSource, TargetedInstructionType } from '@aurelia/runtime';
import { IContainer } from '@aurelia/kernel';
import { IExpressionParser } from '@aurelia/runtime';
import { AccessMember, AccessScope } from '@aurelia/runtime';
import { Repeater } from '@aurelia/runtime';

/**
 * stringify primitive value (null -> 'null' and undefined -> 'undefined')
 */
export function stringify(value: any): string {
  if (value === undefined) {
    return 'undefined';
  } else if (value === null) {
    return 'null';
  } else {
    return value.toString();
  }
}

/**
 * pad a string with spaces on the right-hand side until it's the specified length
 */
export function padRight(str: any, len: number): string {
  str = str + '';
  const strLen = str.length;
  if (strLen >= len) {
    return str;
  }
  return str + new Array(len - strLen + 1).join(' ');
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
export function assertVisualsSynchronized(visuals: IVisual[], items: any[], itemName: string, propName?: string): void {

  let isSynced = true;
  const len = visuals.length;
  if (len === items.length) {
    let i = 0;
    while (i < len) {
      const visual = visuals[i];
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
    const mapVisuals: (v: IVisual) => string = propName ?
      v => stringify(v.$scope.bindingContext[itemName][propName]) :
      v => stringify(v.$scope.bindingContext[itemName]);
    const mapItems: (i: any) => string = propName ?
      i => stringify(i[propName]) :
      i => stringify(i);
    const $actual = visuals.map(mapVisuals).join(',');
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
  const globalResources: any[] = [Repeater];
  const expressionCache = {
    [colName]: new AccessScope(colName),
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
