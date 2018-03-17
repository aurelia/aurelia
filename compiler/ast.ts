import * as ts from 'typescript';

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

export type dehydratedAst = any[];

export abstract class Expression {

  isAssignable?: boolean;
  abstract dehydrate(): dehydratedAst;
  abstract get observedProperties(): string[];
  abstract get code(): ts.Expression;

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
    return this.expressions.reduce((props, e) => props.concat(e.observedProperties), [] as string[]);
  }

  get code() {
    return ts.createNew(
      ts.createIdentifier('Chain'),
      undefined,
      [
        ...this.expressions.map(e => e.code)
      ]
    );
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
    return this.args.reduce((props, a) => props.concat(a.observedProperties), [] as string[]);
  }

  get code() {
    return ts.createNew(
      ts.createIdentifier('BindingBehavior'),
      undefined,
      [
        ts.createLiteral(this.name),
        ...this.args.map(a => a.code)
      ]
    );
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

  get code() {
    return ts.createNew(
      ts.createIdentifier('ValueConverter'),
      undefined,
      [
        ts.createLiteral('this.name'),
        ...this.args.map(a => a.code)
      ]
    );
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
    return [...this.value.observedProperties];
  }

  get code() {
    return ts.createNew(
      ts.createIdentifier('Assign'),
      undefined,
      [
        this.target.code,
        this.value.code
      ]
    );
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

  get code() {
    return ts.createNew(
      ts.createIdentifier('Conditional'),
      undefined,
      [
        this.condition.code,
        this.yes.code,
        this.no.code
      ]
    );
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

  get observedProperties(): string[] {
    return [];
  }

  get code() {
    return ts.createNew(
      ts.createIdentifier('AccessThis'),
      undefined,
      [
        ts.createLiteral(this.ancestor)
      ]
    );
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
    return this.ancestor === 0 ? [this.name] : [];
  }

  get code() {
    return ts.createNew(
      ts.createIdentifier('AccessScope'),
      undefined,
      [
        ts.createLiteral(this.name),
        ts.createLiteral(this.ancestor)
      ]
    );
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

  get observedProperties(): string[] {
    return [];
    // return [this.name, ...this.object.observedProperties];
  }

  get code() {
    return ts.createNew(
      ts.createIdentifier('AccessMember'),
      undefined,
      [
        this.object.code,
        ts.createLiteral(this.name)
      ]
    );
  }
}

export class AccessKeyed extends Expression {
  constructor(
    public object: Expression,
    public key: string | number | Expression
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
    if (this.object instanceof AccessScope) {
      return [this.key.toString(), ...this.object.observedProperties]
    } else {
      return [];
    }
    // return [this.key.toString(), ...this.object.observedProperties];
  }

  get code() {
    return ts.createNew(
      ts.createIdentifier('AccessKeyed'),
      undefined,
      [
        this.object.code,
        !(this.key instanceof Object) ? ts.createLiteral(this.key) : undefined!
      ].filter(Boolean)
    );
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
    return this.args.reduce((props: string[], a) => props.concat(a.observedProperties), []);
  }

  get code() {
    return ts.createNew(
      ts.createIdentifier('CallScope'),
      undefined,
      [
        ts.createLiteral(this.name),
        ...this.args.map(a => a.code),
        ts.createLiteral(this.ancestor)
      ]
    );
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

  get observedProperties(): string[] {
    return [];
    // return this.args.reduce(
    //   (props, a) => props.concat(a.observedProperties),
    //   [this.name, ...this.object.observedProperties]
    // );
  }

  get code() {
    return ts.createNew(
      ts.createIdentifier('CallMember'),
      undefined,
      [
        this.object.code,
        ts.createLiteral(this.name),
        ...this.args.map(a => a.code)
      ]
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
    return this.args.reduce((props: string[], a) => props.concat(a.observedProperties), []);
  }

  get code() {
    return ts.createNew(
      ts.createIdentifier('CallFunction'),
      undefined,
      [
        this.func.code,
        ...this.args.map(a => a.code)
      ]
    );
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

  get code() {
    return ts.createNew(
      ts.createIdentifier('Binary'),
      undefined,
      [
        ts.createLiteral(this.operation),
        this.left.code,
        this.right.code
      ]
    );
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

  get code() {
    return ts.createNew(
      ts.createIdentifier('PrefixNot'),
      undefined,
      [
        this.expression.code
      ]
    );
  }
}

export class LiteralPrimitive extends Expression {
  constructor(public value: number | boolean | null | undefined) {
    super();
  }

  dehydrate() {
    return [
      AstKind.LiteralPrimitive,
      this.value
    ];
  }

  get observedProperties(): string[] {
    return [];
  }

  get code() {
    return ts.createNew(
      ts.createIdentifier('LiteralPrimitive'),
      undefined,
      [
        this.value === null
          ? ts.createNull()
          : this.value === undefined
            ? ts.createIdentifier('undefined')
            : ts.createLiteral(this.value)
      ]
    );
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

  get observedProperties(): string[] {
    return [];
  }

  get code() {
    return ts.createNew(
      ts.createIdentifier('LiteralString'),
      undefined,
      [
        ts.createLiteral(this.value)
      ]
    );
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
    return this.parts.reduce((props: string[], v) => props.concat(v.observedProperties), []);
  }

  get code() {
    return ts.createNew(
      ts.createIdentifier('TemplateLiteral'),
      undefined,
      [
        ...this.parts.map(p => p.code)
      ]
    );
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
    return this.elements.reduce((props: string[], e) => props.concat(e.observedProperties), []);
  }

  get code() {
    return ts.createNew(
      ts.createIdentifier('LiteralArray'),
      undefined,
      [
        ...this.elements.map(e => e.code)
      ]
    );
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
    return this.values.reduce((props: string[], v) => props.concat(v.observedProperties), []);
  }

  get code() {
    return ts.createNew(
      ts.createIdentifier('LiteralObject'),
      undefined,
      [
        ...this.keys.map(k => ts.createLiteral(k)),
        ...this.values.map(v => v.code)
      ]
    );
  }
}
