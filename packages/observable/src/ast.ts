import {
  BindingContext,
  LifecycleFlags,
  TaggedTemplateExpression,
  TemplateExpression,
  UnaryExpression,
  ValueConverterExpression,
  ObjectBindingPattern,
  ObjectLiteralExpression,
  PrimitiveLiteralExpression,
  AccessKeyedExpression,
  AccessMemberExpression,
  AccessScopeExpression,
  AccessThisExpression,
  AnyBindingExpression,
  ArrayBindingPattern,
  ArrayLiteralExpression,
  AssignExpression,
  BinaryExpression,
  BindingBehaviorExpression,
  CallFunctionExpression,
  CallMemberExpression,
  CallScopeExpression,
  ConditionalExpression,
  ExpressionKind,
  ForOfStatement,
  HtmlLiteralExpression,
  Interpolation,
  IsBinary,
  IsAssignable,
} from '@aurelia/runtime';
import { StreamObserver } from "./stream-observer";
import type {
  IIndexable,
  IServiceLocator
} from "@aurelia/kernel";
import type {
  Scope,
  BindingIdentifier,
  IConnectable,
  IsBindingBehavior,
  IsLeftHandSide,
  IsAssign,
} from '@aurelia/runtime';
import type {
  IBindingContext,
  IOverrideContext,
  IVisitor,
} from "@aurelia/runtime-html";
import type { Observable } from "rxjs";
import type { SubscribeBinding } from "./subscribe-binding";

export class StreamAstVisitor implements IVisitor<AnyBindingExpression> {
  public static isStream(name: string) {
    return name.endsWith('$');
  }

  public static rewrite(expr: AnyBindingExpression) {
    return expr.accept(new StreamAstVisitor());
  }

  private constructor() { }

  public visitAccessKeyed(expr: AccessKeyedExpression): AnyBindingExpression {
    const object = expr.object.accept(this) as IsLeftHandSide;
    const key = expr.key.accept(this) as IsAssign;
    return object !== expr.object || key !== expr.key
      ? new StreamAccessKeyedExpression(object, key)
      : expr;
  }
  public visitAccessMember(expr: AccessMemberExpression): AnyBindingExpression {
    const object = expr.object.accept(this) as IsLeftHandSide;
    if (StreamAstVisitor.isStream(expr.name)) {
      return new StreamAccessMemberExpression(object, expr.name);
    }
    return new AccessMemberExpression(object, expr.name);
  }
  public visitAccessScope(expr: AccessScopeExpression): AnyBindingExpression {
    if (StreamAstVisitor.isStream(expr.name)) {
      return new StreamAccessScopeExpression(expr.name, expr.ancestor);
    }
    return expr;
  }
  public visitAccessThis(expr: AccessThisExpression): AnyBindingExpression {
    return expr;
  }
  public visitArrayBindingPattern(expr: ArrayBindingPattern): AnyBindingExpression {
    throw new Error("Method not implemented.");
  }
  public visitArrayLiteral(expr: ArrayLiteralExpression): AnyBindingExpression {
    return new ArrayLiteralExpression(expr.elements.map(e => e.accept(this)) as IsAssign[]);
  }
  public visitAssign(expr: AssignExpression): AnyBindingExpression {
    return new AssignExpression(expr.target.accept(this) as IsAssignable, expr.value.accept(this) as IsAssign);
  }
  public visitBinary(expr: BinaryExpression): AnyBindingExpression {
    return new BinaryExpression(
      expr.operation,
      expr.left.accept(this) as IsBinary,
      expr.right.accept(this) as IsBinary,
    );
  }
  public visitBindingBehavior(expr: BindingBehaviorExpression): AnyBindingExpression {
    return new BindingBehaviorExpression(
      expr.expression.accept(this) as IsBindingBehavior,
      expr.name,
      expr.args.map(a => a.accept(this)) as IsAssign[]
    );
  }
  public visitBindingIdentifier(expr: BindingIdentifier): AnyBindingExpression {
    return expr as unknown as AnyBindingExpression;
  }
  public visitCallFunction(expr: CallFunctionExpression): AnyBindingExpression {
    return new CallFunctionExpression(
      expr.func.accept(this) as IsLeftHandSide,
      expr.args.map(a => a.accept(this)) as IsAssign[]
    );
  }
  public visitCallMember(expr: CallMemberExpression): AnyBindingExpression {
    return new CallMemberExpression(
      expr.object.accept(this) as IsLeftHandSide,
      expr.name,
      expr.args.map(a => a.accept(this)) as IsAssign[]
    );
  }
  public visitCallScope(expr: CallScopeExpression): AnyBindingExpression {
    return new CallScopeExpression(expr.name, expr.args.map(a => a.accept(this)) as IsAssign[], expr.ancestor);
  }
  public visitConditional(expr: ConditionalExpression): AnyBindingExpression {
    return new ConditionalExpression(
      expr.condition.accept(this) as IsBinary,
      expr.yes.accept(this) as IsAssign,
      expr.no.accept(this) as IsAssign
    );
  }
  public visitForOfStatement(expr: ForOfStatement): AnyBindingExpression {
    return new ForOfStatement(expr.declaration, expr.iterable.accept(this) as IsBindingBehavior);
  }
  public visitHtmlLiteral(expr: HtmlLiteralExpression): AnyBindingExpression {
    return new HtmlLiteralExpression(expr.parts.map(e => e.accept(this)) as any[]) as any;
  }
  public visitInterpolation(expr: Interpolation): AnyBindingExpression {
    return new Interpolation(expr.parts, expr.expressions.map(e => e.accept(this)) as IsBindingBehavior[]);
  }
  public visitObjectBindingPattern(expr: ObjectBindingPattern): AnyBindingExpression {
    throw new Error("Method not implemented.");
  }
  public visitObjectLiteral(expr: ObjectLiteralExpression): AnyBindingExpression {
    return new ObjectLiteralExpression(expr.keys, expr.values.map(e => e.accept(this)) as IsAssign[]);
  }
  public visitPrimitiveLiteral(expr: PrimitiveLiteralExpression<string | number | boolean>): AnyBindingExpression {
    return expr;
  }
  public visitTaggedTemplate(expr: TaggedTemplateExpression): AnyBindingExpression {
    return new TaggedTemplateExpression(
      expr.cooked,
      expr.cooked.raw!,
      expr.func.accept(this) as IsLeftHandSide,
      expr.expressions.map(e => e.accept(this)) as IsAssign[]
    );
  }
  public visitTemplate(expr: TemplateExpression): AnyBindingExpression {
    return new TemplateExpression(expr.cooked, expr.expressions.map(e => e.accept(this)) as IsAssign[]);
  }
  public visitUnary(expr: UnaryExpression): AnyBindingExpression {
    return new UnaryExpression(expr.operation, expr.expression.accept(this) as IsLeftHandSide);
  }
  public visitValueConverter(expr: ValueConverterExpression): AnyBindingExpression {
    return new ValueConverterExpression(
      expr.expression,
      expr.name,
      expr.args.map(arg => arg.accept(this)) as IsAssign[]
    );
  }
}

export class StreamAccessScopeExpression extends AccessScopeExpression {
  // todo: refactor this
  public evaluate(f: LifecycleFlags, s: Scope, _l: IServiceLocator, c: IConnectable | null): IBindingContext | IOverrideContext {
    const obj = BindingContext.get(s, this.name, this.ancestor, f) as IBindingContext;
    const evaluatedValue = obj[this.name] as ReturnType<AccessScopeExpression['evaluate']>;
    let value = evaluatedValue;
    let observer: StreamObserver<IIndexable>;
    if (c != null) {
      c.observe(obj, this.name);
      if (evaluatedValue != null && 'subscribe' in evaluatedValue) {
        observer = StreamObserver.from(evaluatedValue as unknown as Observable<object>);
        value = observer.getValue() as IBindingContext | IOverrideContext;
        observer.subscribe(c as SubscribeBinding);
        return value;
      }
    } else if (evaluatedValue != null && 'subscribe' in evaluatedValue) {
      observer = StreamObserver.from(evaluatedValue as unknown as Observable<object>);
      value = observer.getValue() as IBindingContext | IOverrideContext;
      return value;
    }
    return value == null ? '' as unknown as ReturnType<AccessScopeExpression['evaluate']> : value;
  }

  public assign(f: LifecycleFlags, s: Scope, _l: IServiceLocator, val: unknown): unknown {
    throw new Error('Stream based expression is not assignable');
  }
}

export class StreamAccessMemberExpression implements AccessMemberExpression {
  public get $kind(): ExpressionKind.AccessMember { return ExpressionKind.AccessMember; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public object: IsLeftHandSide,
    public name: string,
  ) { }

  public evaluate(f: LifecycleFlags, s: Scope, l: IServiceLocator, c: IConnectable): unknown {
    const instance = this.object.evaluate(f, s, l, (f & LifecycleFlags.observeLeafPropertiesOnly) > 0 ? null : c) as IIndexable;
    let value: any;
    let observer: StreamObserver<IIndexable>;
    if (f & LifecycleFlags.isStrictBindingStrategy) {
      if (instance == null) {
        return instance;
      }
      if (c !== null) {
        c.observe(instance, this.name);
        value = instance[this.name];
        if (value != null && 'subscribe' in value) {
          observer = StreamObserver.from(value);
          observer.subscribe(c as SubscribeBinding);
          return observer.getValue();
        }
      }
      return value;
    }
    if (c !== null && instance instanceof Object) {
      c.observe(instance, this.name);
      value = instance[this.name];
      if (value != null && 'subscribe' in value) {
        observer = StreamObserver.from(value);
        observer.subscribe(c as SubscribeBinding);
        return observer.getValue();
      }
    }
    return instance ? value : '';
  }
  public assign(f: LifecycleFlags, s: Scope, l: IServiceLocator, val: unknown): unknown {
    throw new Error("Stream access is readonly.");
  }
  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessMember(this);
  }
}

export class StreamAccessKeyedExpression extends AccessKeyedExpression {
  public assign(f: LifecycleFlags, s: Scope, l: IServiceLocator, val: unknown): unknown {
    throw new Error('Stream is readonly');
  }
}

export class StreamTemplateExpression implements TemplateExpression {
  public get $kind(): ExpressionKind.Template { return ExpressionKind.Template; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public cooked: readonly string[],
    public expressions: readonly IsAssign[]
  ) { }

  public evaluate(f: LifecycleFlags, s: Scope, l: IServiceLocator, c: IConnectable): string {
    let result = this.cooked[0];
    let i = 0;
    for (; i < this.expressions.length; ++i) {
      result += String(this.expressions[i].evaluate(f, s, l, c));
      result += this.cooked[i + 1];
    }
    return result;
  }

  public assign(_f: LifecycleFlags, _s: Scope, _l: IServiceLocator, _obj: unknown): unknown {
    throw new Error("Method not implemented.");
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitTemplate(this);
  }
}
