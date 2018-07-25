import { spy } from 'sinon';
import { CustomElementResource } from './../../src/runtime/templating/custom-element';
import { TargetedInstructionType, ITemplateSource } from "../../src/runtime/templating/instructions";
import { IVisual } from "../../src/runtime/templating/visual";
import { IExpressionParser } from "../../src/runtime/binding/expression-parser";
import { IContainer } from "../../src/kernel/di";
import { AccessMember, AccessScope } from "../../src/runtime/binding/ast";
import { Repeater } from "../../src/runtime/templating/resources/repeater";
import { ICustomElement } from "../../src/runtime/templating/custom-element";
import { If } from '../../src/runtime/templating/resources/if';

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

export interface IIfFixture {
  type: Function;
  elName: string;
  conditionName: string;
  propName: string;
}

export function createTextBindingTemplateSource(propertyName: string, oneTime?: boolean): ITemplateSource {
  return {
    template: `<div><au-marker class="au"></au-marker> </div>`,
    instructions: [
      [
        {
          type: TargetedInstructionType.textBinding,
          src: propertyName,
          oneTime: oneTime
        }
      ]
    ]
  };
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
    template: `
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
              type: TargetedInstructionType.toViewBinding,
              src: colName,
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

export function createIfTemplateSource({ elName, conditionName }: IIfFixture, src: ITemplateSource): ITemplateSource {
  return {
    name: elName,
    dependencies: [],
    template: `
      <au-marker class="au"></au-marker> 
    `,
    instructions: [
      [
        {
          type: TargetedInstructionType.hydrateTemplateController,
          res: 'if',
          src,
          instructions: [
            {
              type: TargetedInstructionType.toViewBinding,
              src: conditionName,
              dest: 'condition'
            }
          ]
        }
      ]
    ]
  }
}

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
      container.get(IExpressionParser).cache(expressionCache);
      container.register(...globalResources);
    }
  };
};

export function createAureliaIfConfig({ propName, conditionName  }: IIfFixture): { register(container: IContainer): void } {
  const globalResources: any[] = [If];
  const expressionCache = {
    [conditionName]: new AccessScope(conditionName),
    [propName]: new AccessScope(propName)
  };

  return {
    register(container: IContainer) {
      container.get(IExpressionParser).cache(expressionCache);
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

/**
 * Create a customElement based on the provided fixture
 * 
 * (currently specific to repeater)
 */
export function createIf(fixture: IIfFixture, initialCondition: boolean, initialPropValue: any, src: ITemplateSource): ICustomElement {
  const Type = CustomElementResource.define(src, class {});
  const component = new Type();
  component[fixture.conditionName] = initialCondition;
  component[fixture.propName] = initialPropValue;
  return component;
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
