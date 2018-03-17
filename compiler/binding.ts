import * as ts from 'typescript';

import {
  Expression,
  // AccessScope,
  // AccessMember,
  // CallScope,
  // LiteralString,
  // Binary,
  // Conditional
} from './ast';

// const emptyArray = [];

interface AstRegistryRecord {
  id: number;
  ast: Expression
}

export enum bindingMode {
  oneTime = 0,
  toView = 1,
  oneWay = 1,
  fromView = 3,
  twoWay = 2,
}

export enum delegationStrategy {
  none = 0,
  capturing = 1,
  bubbling = 2
}

// let lookupFunctions: ILookupFunctions = {
//   valueConverters: {},
//   bindingBehaviors: {}
// };

// function getAST(key: string) {
//   return astLookup[key];
// }

export interface IBinding {
  behavior?: boolean;
  behaviorIndex?: number;
  targetIndex: number;
  dehydrated: any[];
  code: ts.Expression;
  observedProperties: string[];
}

export abstract class AbstractBinding implements IBinding {

  static targetsAccessor = 'targets';
  static getAstFn = 'getAst';

  static resolveBindingMode(mode: bindingMode) {
    return ts.createLiteral(mode);
  }

  behavior?: boolean;
  behaviorIndex?: number;
  textAccessor = 'textContent';
  abstract targetIndex: number;
  abstract get dehydrated(): any[];
  abstract get code(): ts.Expression;
  abstract get observedProperties(): string[];
}

export class PropertyBinding extends AbstractBinding {

  constructor(
    public astRecord: AstRegistryRecord,
    public targetIndex: number,
    public targetProperty: string,
    public mode: bindingMode = bindingMode.oneWay,
    public forBehavior?: boolean,
    public behaviorIndex?: number
  ) {
    super();
  }

  get dehydrated(): any[] {
    return [];
  }

  get code() {
    return ts.createNew(
      ts.createIdentifier('Binding'),
      /** type arguments */ undefined,
      /** arguments */
      [
        ts.createCall(
          ts.createIdentifier(AbstractBinding.getAstFn),
          /** type arguments */ undefined,
          /** arguments */
          [
            ts.createLiteral(this.astRecord.id)
          ]
        ),
        this.forBehavior
          ? ts.createPropertyAccess(
            ts.createThis(),
            `$b${this.behaviorIndex}`
          )
          : ts.createElementAccess(
            ts.createIdentifier(AbstractBinding.targetsAccessor),
            ts.createNumericLiteral(this.targetIndex.toString())
          ),
        ts.createLiteral(this.targetProperty),
        AbstractBinding.resolveBindingMode(this.mode),
        ts.createIdentifier('lookupFunctions')
      ]
    );
  }

  get observedProperties() {
    return this.astRecord.ast.observedProperties;
  }
}

export class ListenerBinding extends AbstractBinding {
  constructor(
    public astRecord: AstRegistryRecord,
    public targetIndex: number,
    public targetEvent: string,
    public delegationStrategy: delegationStrategy,
    public preventDefault = true
  ) {
    super();
  }

  get dehydrated(): any[] {
    return [];
  }

  get code() {
    return ts.createNew(
      ts.createIdentifier('Listener'),
      /** type arguments */ undefined,
      /** arguments */
      [
        ts.createLiteral(this.targetEvent),
        ts.createLiteral(this.delegationStrategy),
        ts.createCall(
          ts.createIdentifier(AbstractBinding.getAstFn),
          /** type arguments */ undefined,
          /** arguments */
          [
            ts.createLiteral(this.astRecord.id)
          ]
        ),
        ts.createElementAccess(
          ts.createIdentifier(AbstractBinding.targetsAccessor),
          ts.createNumericLiteral(this.targetIndex.toString())
        ),
        ts.createLiteral(this.preventDefault),
        ts.createIdentifier('lookupFunctions')
      ]
    );
  }

  get observedProperties() {
    return this.astRecord.ast.observedProperties;
  }
}

export class RefBinding extends AbstractBinding {
  constructor(
    public astRecord: AstRegistryRecord,
    public targetIndex: number,
    public targetProperty: string
  ) {
    super();
  }

  get dehydrated(): any[] {
    return [];
  }

  get code(): ts.Expression {
    throw new Error('RefBinding.prototype.code() not implemented');
  }

  get observedProperties() {
    return this.astRecord.ast.observedProperties;
  }
}

export class TextBinding extends AbstractBinding {
  constructor(
    public astRecord: AstRegistryRecord,
    public targetIndex: number,
  ) {
    super();
  }

  get dehydrated(): any[] {
    return [];
  }

  get code() {
    return ts.createNew(
      ts.createIdentifier('TextBinding'),
      /** type arguments */ undefined,
      /** arguments */
      [
        ts.createCall(
          ts.createIdentifier(AbstractBinding.getAstFn),
          /** type arguments */ undefined,
          /** arguments */
          [
            ts.createLiteral(this.astRecord.id)
          ]
        ),
        ts.createElementAccess(
          ts.createIdentifier(AbstractBinding.targetsAccessor),
          ts.createNumericLiteral(this.targetIndex.toString())
        ),
        ts.createIdentifier('lookupFunctions')
      ]
    );
  }

  get observedProperties() {
    return this.astRecord.ast.observedProperties;
  }
}
