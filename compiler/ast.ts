export enum AstKind {
  Base = 1,
  Chain = 2,
  ValueConverter = 3,
  BindingBehavior = 4,
  Assign = 5,
  Conditional = 6,
  AccessThis = 7,
  AccessScope = 8,
  AccessMember = 9,
  AccessKeyed = 10,
  CallScope = 11,
  CallFunction = 12,
  CallMember = 13,
  PrefixNot = 14,
  Binary = 15,
  LiteralPrimitive = 16,
  LiteralArray = 17,
  LiteralObject = 18,
  LiteralString = 19,
  TemplateLiteral = 20
}

export type dehydratedAst = any[]

export abstract class Expression {

  abstract dehydrate(): dehydratedAst;
  abstract get observedProperties(): string[];

  toJSON() {
    return this.dehydrate();
  }

  toString() {
    return JSON.stringify(this);
  }
}

export class Chain extends Expression {
  constructor(public expressions: Expression[]) {
    super();
  }

  dehydrate() {
    return [AstKind.Chain, this.expressions.map(e => e.dehydrate())];
  }

  get observedProperties() {
    return this.expressions.reduce((props, e) => props.concat(e.observedProperties), []);
  }
}

export class BindingBehavior extends Expression {

  constructor(
    public expression: Expression,
    public name: string,
    public args: Expression[]
  ) {
    super();
  }

  dehydrate() {
    return [AstKind.BindingBehavior, this.name, this.args.map(a => a.dehydrate())];
  }

  get observedProperties() {
    return this.args.reduce((props, a) => props.concat(a.observedProperties), []);
  }
}

export class ValueConverter extends Expression {

  constructor(
    public expression: Expression,
    public name: string,
    public args: Expression[]
  ) {
    super();
  }

  dehydrate() {
    return [
      AstKind.ValueConverter,
      this.expression.dehydrate(),
      this.name,
      this.args.map(a => a.dehydrate())
    ];
  }

  get observedProperties() {
    return this.args.reduce((props, a) => props.concat(a.observedProperties), this.expression.observedProperties);
  }
}

export class Assign extends Expression {
  constructor(
    public target: Expression,
    public value: Expression
  ) {
    super();
  }

  dehydrate() {
    return [
      AstKind.Assign,
      this.target.dehydrate(),
      this.value.dehydrate()
    ];
  }

  get observedProperties() {
    return [...this.target.observedProperties, ...this.value.observedProperties];
  }
}

export class Conditional extends Expression {
  constructor(
    public condition: Expression,
    public yes: Expression,
    public no: Expression
  ) {
    super();
  }

  dehydrate() {
    return [
      AstKind.Conditional,
      this.condition.dehydrate(),
      this.yes.dehydrate(),
      this.no.dehydrate()
    ];
  }

  get observedProperties() {
    return [
      ...this.condition.observedProperties,
      ...this.yes.observedProperties,
      ...this.no.observedProperties
    ];
  }
}

export class AccessThis extends Expression {
  constructor(public ancestor = 0) {
    super();
  }

  dehydrate() {
    return [
      AstKind.AccessThis,
      this.ancestor
    ];
  }

  get observedProperties() {
    return [];
  }
}

export class AccessScope extends Expression {
  constructor(
    public name: string,
    public ancestor = 0
  ) {
    super();
  }

  dehydrate() {
    return [
      AstKind.AccessScope,
      this.name,
      this.ancestor
    ];
  }

  get observedProperties() {
    return [this.name];
  }
}

export class AccessMember extends Expression {
  constructor(
    public object: Expression,
    public name: string
  ) {
    super();
  }

  dehydrate() {
    return [
      AstKind.AccessMember,
      this.object.dehydrate(),
      this.name
    ];
  }

  get observedProperties() {
    return [this.name, ...this.object.observedProperties];
  }
}

export class AccessKeyed extends Expression {
  constructor(
    public object: Expression,
    public key: string | number
  ) {
    super();
  }

  dehydrate() {
    return [
      AstKind.AccessKeyed,
      this.object.dehydrate(),
      this.key
    ];
  }

  get observedProperties() {
    return [this.key.toString(), ...this.object.observedProperties];
  }
}

export class CallScope extends Expression {
  constructor(
    public name: string,
    public args: Expression[],
    public ancestor = 0
  ) {
    super();
  }

  dehydrate() {
    return [
      AstKind.CallScope,
      this.name,
      this.args.map(a => a.dehydrate()),
      this.ancestor
    ];
  }

  get observedProperties() {
    return this.args.reduce((props, a) => props.concat(a.observedProperties), [this.name]);
  }
}

export class CallMember extends Expression {
  constructor(
    public object: Expression,
    public name: string,
    public args: Expression[]
  ) {
    super();
  }

  dehydrate() {
    return [
      AstKind.CallMember,
      this.object.dehydrate(),
      this.name,
      this.args.map(a => a.dehydrate())
    ];
  }

  get observedProperties() {
    return this.args.reduce(
      (props, a) => props.concat(a.observedProperties),
      [this.name, ...this.object.observedProperties]
    );
  }
}

export class CallFunction extends Expression {
  constructor(
    public func: Expression,
    public args: Expression[]
  ) {
    super();
  }

  dehydrate() {
    return [
      AstKind.CallFunction,
      this.func.dehydrate(),
      this.args.map(a => a.dehydrate())
    ];
  }

  get observedProperties() {
    return this.args.reduce((props, a) => props.concat(a.observedProperties), []);
  }
}

export class Binary extends Expression {
  constructor(
    public operation: string,
    public left: Expression,
    public right: Expression
  ) {
    super();
  }

  dehydrate() {
    return [
      AstKind.Binary,
      this.operation,
      this.left.dehydrate(),
      this.right.dehydrate()
    ];
  }

  get observedProperties() {
    return [...this.left.observedProperties, ...this.right.observedProperties];
  }
}

export class PrefixNot extends Expression {
  constructor(
    public expression: Expression
  ) {
    super();
  }

  dehydrate() {
    return [
      AstKind.PrefixNot,
      this.expression.dehydrate()
    ];
  }

  get observedProperties() {
    return this.expression.observedProperties;
  }
}

export class LiteralPrimitive extends Expression {
  constructor(public value: number | boolean) {
    super();
  }

  dehydrate() {
    return [
      AstKind.LiteralPrimitive,
      this.value
    ];
  }

  get observedProperties() {
    return [];
  }
}

export class LiteralString extends Expression {
  constructor(public value: string) {
    super();
  }

  dehydrate() {
    return [
      AstKind.LiteralString,
      this.value
    ];
  }

  get observedProperties() {
    return [];
  }
}

export class TemplateLiteral extends Expression {
  constructor(
    public parts: Expression[]
  ) {
    super();
  }

  dehydrate() {
    return [
      AstKind.TemplateLiteral,
      this.parts.map(p => p.dehydrate())
    ];
  }

  get observedProperties() {
    return this.parts.reduce((props, v) => props.concat(v.observedProperties), []);
  }
}

export class LiteralArray extends Expression {
  constructor(
    public elements: Expression[]
  ) {
    super();
  }

  dehydrate() {
    return [
      AstKind.LiteralArray,
      this.elements.map(e => e.dehydrate())
    ];
  }

  get observedProperties() {
    return this.elements.reduce((props, e) => props.concat(e.observedProperties), []);
  }
}

export class LiteralObject extends Expression {
  constructor(
    public keys: string[],
    public values: Expression[]
  ) {
    super();
  }

  dehydrate() {
    return [
      AstKind.LiteralObject,
      this.keys,
      this.values.map(v => v.dehydrate())
    ];
  }

  get observedProperties() {
    return this.values.reduce((props, v) => props.concat(v.observedProperties), []);
  }
}
