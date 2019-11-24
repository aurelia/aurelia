import {
  Expression,
  // Chain,
  ValueConverter,
  // Assign,
  Conditional,
  // AccessThis,
  // AccessScope,
  AccessMember,
  AccessKeyed,
  // CallScope,
  // CallFunction,
  CallMember,
  // PrefixNot,
  BindingBehavior,
  Binary,
  // LiteralPrimitive,
  // LiteralArray,
  // LiteralObject,
  // LiteralString
} from 'aurelia-binding';

export type Chain = any;
export type Assign = any;
export type AccessThis = any;
export type AccessScope = any;
export type CallScope = any;
export type CallFunction = any;
export type PrefixNot = any;
export type LiteralPrimitive = any;
export type LiteralArray = any;
export type LiteralObject = any;
export type LiteralString = any;

// tslint:disable:no-empty
export class ExpressionVisitor {
  public visitChain(chain: Chain) {
    this.visitArgs(chain.expressions);
  }

  public visitBindingBehavior(behavior: BindingBehavior) {
    behavior.expression.accept(this);
    this.visitArgs(behavior.args);
  }

  public visitValueConverter(converter: ValueConverter) {
    converter.expression.accept(this);
    this.visitArgs(converter.args);
  }

  public visitAssign(assign: Assign) {
    assign.target.accept(this);
    assign.value.accept(this);
  }

  public visitConditional(conditional: Conditional) {
    conditional.condition.accept(this);
    conditional.yes.accept(this);
    conditional.no.accept(this);
  }

  public visitAccessThis(access: AccessThis) {
    access.ancestor = access.ancestor;
  }

  public visitAccessScope(access: AccessScope) {
    access.name = access.name;
  }

  public visitAccessMember(access: AccessMember) {
    access.object.accept(this);
  }

  public visitAccessKeyed(access: AccessKeyed) {
    access.object.accept(this);
    access.key.accept(this);
  }

  public visitCallScope(call: CallScope) {
    this.visitArgs(call.args);
  }

  public visitCallFunction(call: CallFunction) {
    call.func.accept(this);
    this.visitArgs(call.args);
  }

  public visitCallMember(call: CallMember) {
    call.object.accept(this);
    this.visitArgs(call.args);
  }

  public visitPrefix(prefix: PrefixNot) {
    prefix.expression.accept(this);
  }

  public visitBinary(binary: Binary) {
    binary.left.accept(this);
    binary.right.accept(this);
  }

  public visitLiteralPrimitive(literal: LiteralPrimitive) {
    literal.value = literal.value;
  }

  public visitLiteralArray(literal: LiteralArray) {
    this.visitArgs(literal.elements);
  }

  public visitLiteralObject(literal: LiteralObject) {
    this.visitArgs(literal.values);
  }

  public visitLiteralString(literal: LiteralString) {
    literal.value = literal.value;
  }

  private visitArgs(args: Expression[]) {
    for (let i = 0; i < args.length; i++) {
      args[i].accept(this);
    }
  }
}
