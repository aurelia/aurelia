import * as AST from '@aurelia/runtime';

export function enableImprovedExpressionDebugging() {
  [
    { type: AST.AccessKeyed, name: 'AccessKeyed' },
    { type: AST.AccessMember, name: 'AccessMember' },
    { type: AST.AccessScope, name: 'AccessScope' },
    { type: AST.AccessThis, name: 'AccessThis' },
    { type: AST.Assign, name: 'Assign' },
    { type: AST.Binary, name: 'Binary' },
    { type: AST.BindingBehavior, name: 'BindingBehavior' },
    { type: AST.CallFunction, name: 'CallFunction' },
    { type: AST.CallMember, name: 'CallMember' },
    { type: AST.CallScope, name: 'CallScope' },
    { type: AST.Conditional, name: 'Conditional' },
    { type: AST.ArrayLiteral, name: 'LiteralArray' },
    { type: AST.ObjectLiteral, name: 'LiteralObject' },
    { type: AST.PrimitiveLiteral, name: 'LiteralPrimitive' },
    { type: AST.PrimitiveLiteral, name: 'LiteralString' },
    { type: AST.Unary, name: 'Unary' },
    { type: AST.HtmlLiteral, name: 'TemplateLiteral' },
    { type: AST.ValueConverter, name: 'ValueConverter' }
  ].forEach(x => adoptDebugMethods(x.type, x.name));
}

/*@internal*/
export function adoptDebugMethods(type, name: string) {
  type.prototype.toString = function() { return Unparser.unparse(this); };
  type.prototype.accept = function(visitor) { return visitor['visit' + name](this); };
}

/*@internal*/
export class Unparser {
  constructor(private buffer: string[]) {
    this.buffer = buffer;
  }

  static unparse(expression: any) {
    let buffer = [];
    let visitor = new Unparser(buffer);

    expression.accept(visitor);

    return buffer.join('');
  }

  public write(text) {
    this.buffer.push(text);
  }

  public writeArgs(args) {
    this.write('(');

    for (let i = 0, length = args.length; i < length; ++i) {
      if (i !== 0) {
        this.write(',');
      }

      args[i].accept(this);
    }

    this.write(')');
  }

  public visitBindingBehavior(behavior) {
    let args = behavior.args;

    behavior.expression.accept(this);
    this.write(`&${behavior.name}`);

    for (let i = 0, length = args.length; i < length; ++i) {
      this.write(':');
      args[i].accept(this);
    }
  }

  public visitValueConverter(converter) {
    let args = converter.args;

    converter.expression.accept(this);
    this.write(`|${converter.name}`);

    for (let i = 0, length = args.length; i < length; ++i) {
      this.write(':');
      args[i].accept(this);
    }
  }

  public visitAssign(assign) {
    assign.target.accept(this);
    this.write('=');
    assign.value.accept(this);
  }

  public visitConditional(conditional) {
    conditional.condition.accept(this);
    this.write('?');
    conditional.yes.accept(this);
    this.write(':');
    conditional.no.accept(this);
  }

  public visitAccessThis(access) {
    if (access.ancestor === 0) {
      this.write('$this');
      return;
    }
    this.write('$parent');
    let i = access.ancestor - 1;
    while (i--) {
      this.write('.$parent');
    }
  }

  public visitAccessScope(access) {
    let i = access.ancestor;
    while (i--) {
      this.write('$parent.');
    }
    this.write(access.name);
  }

  public visitAccessMember(access) {
    access.object.accept(this);
    this.write(`.${access.name}`);
  }

  public visitAccessKeyed(access) {
    access.object.accept(this);
    this.write('[');
    access.key.accept(this);
    this.write(']');
  }

  public visitCallScope(call) {
    let i = call.ancestor;
    while (i--) {
      this.write('$parent.');
    }
    this.write(call.name);
    this.writeArgs(call.args);
  }

  public visitCallFunction(call) {
    call.func.accept(this);
    this.writeArgs(call.args);
  }

  public visitCallMember(call) {
    call.object.accept(this);
    this.write(`.${call.name}`);
    this.writeArgs(call.args);
  }

  public visitUnary(unary) {
    this.write(`(${unary.operation}`);
    unary.expression.accept(this);
    this.write(')');
  }

  public visitBinary(binary) {
    binary.left.accept(this);
    this.write(binary.operation);
    binary.right.accept(this);
  }

  public visitLiteralPrimitive(literal) {
    this.write(`${literal.value}`);
  }

  public visitLiteralArray(literal) {
    let elements = literal.elements;

    this.write('[');

    for (let i = 0, length = elements.length; i < length; ++i) {
      if (i !== 0) {
        this.write(',');
      }

      elements[i].accept(this);
    }

    this.write(']');
  }

  public visitLiteralObject(literal) {
    let keys = literal.keys;
    let values = literal.values;

    this.write('{');

    for (let i = 0, length = keys.length; i < length; ++i) {
      if (i !== 0) {
        this.write(',');
      }

      this.write(`'${keys[i]}':`);
      values[i].accept(this);
    }

    this.write('}');
  }

  public visitLiteralString(literal) {
    let escaped = literal.value.replace(/'/g, "\'");
    this.write(`'${escaped}'`);
  }

  public visitTemplateLiteral(node) {
    let parts = node.parts;

    for (let i = 0, length = parts.length; i < length; ++i) {
      parts[i].accept(this);
    }
  }
}
