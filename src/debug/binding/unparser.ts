import * as AST from "../../runtime/binding/ast";

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
    { type: AST.Chain, name: 'Chain' },
    { type: AST.Conditional, name: 'Conditional' },
    { type: AST.LiteralArray, name: 'LiteralArray' },
    { type: AST.LiteralObject, name: 'LiteralObject' },
    { type: AST.LiteralPrimitive, name: 'LiteralPrimitive' },
    { type: AST.LiteralString, name: 'LiteralString' },
    { type: AST.PrefixNot, name: 'Prefix' }, //pattern variation
    { type: AST.TemplateLiteral, name: 'TemplateLiteral' },
    { type: AST.ValueConverter, name: 'ValueConverter' }
  ].forEach(x => adoptDebugMethods(x.type, x.name));
}

function adoptDebugMethods(type, name: string) {
  type.prototype.toString = function() { return Unparser.unparse(this); };
  type.prototype.accept = function(visitor) { return visitor['visit' + name](this); };
}

class Unparser {
  constructor(private buffer: string[]) {
    this.buffer = buffer;
  }

  static unparse(expression: any) {
    let buffer = [];
    let visitor = new Unparser(buffer);

    expression.accept(visitor);

    return buffer.join('');
  }

  write(text) {
    this.buffer.push(text);
  }

  writeArgs(args) {
    this.write('(');

    for (let i = 0, length = args.length; i < length; ++i) {
      if (i !== 0) {
        this.write(',');
      }

      args[i].accept(this);
    }

    this.write(')');
  }

  visitChain(chain) {
    let expressions = chain.expressions;

    for (let i = 0, length = expressions.length; i < length; ++i) {
      if (i !== 0) {
        this.write(';');
      }

      expressions[i].accept(this);
    }
  }

  visitBindingBehavior(behavior) {
    let args = behavior.args;

    behavior.expression.accept(this);
    this.write(`&${behavior.name}`);

    for (let i = 0, length = args.length; i < length; ++i) {
      this.write(':');
      args[i].accept(this);
    }
  }

  visitValueConverter(converter) {
    let args = converter.args;

    converter.expression.accept(this);
    this.write(`|${converter.name}`);

    for (let i = 0, length = args.length; i < length; ++i) {
      this.write(':');
      args[i].accept(this);
    }
  }

  visitAssign(assign) {
    assign.target.accept(this);
    this.write('=');
    assign.value.accept(this);
  }

  visitConditional(conditional) {
    conditional.condition.accept(this);
    this.write('?');
    conditional.yes.accept(this);
    this.write(':');
    conditional.no.accept(this);
  }

  visitAccessThis(access) {
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

  visitAccessScope(access) {
    let i = access.ancestor;
    while (i--) {
      this.write('$parent.');
    }
    this.write(access.name);
  }

  visitAccessMember(access) {
    access.object.accept(this);
    this.write(`.${access.name}`);
  }

  visitAccessKeyed(access) {
    access.object.accept(this);
    this.write('[');
    access.key.accept(this);
    this.write(']');
  }

  visitCallScope(call) {
    let i = call.ancestor;
    while (i--) {
      this.write('$parent.');
    }
    this.write(call.name);
    this.writeArgs(call.args);
  }

  visitCallFunction(call) {
    call.func.accept(this);
    this.writeArgs(call.args);
  }

  visitCallMember(call) {
    call.object.accept(this);
    this.write(`.${call.name}`);
    this.writeArgs(call.args);
  }

  visitPrefix(prefix) {
    this.write(`(${prefix.operation}`);
    prefix.expression.accept(this);
    this.write(')');
  }

  visitBinary(binary) {
    binary.left.accept(this);
    this.write(binary.operation);
    binary.right.accept(this);
  }

  visitLiteralPrimitive(literal) {
    this.write(`${literal.value}`);
  }

  visitLiteralArray(literal) {
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

  visitLiteralObject(literal) {
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

  visitLiteralString(literal) {
    let escaped = literal.value.replace(/'/g, "\'");
    this.write(`'${escaped}'`);
  }

  visitTemplateLiteral(node) {
    let parts = node.parts;

    for (let i = 0, length = parts.length; i < length; ++i) {
      parts[i].accept(this);
    }
  }
}
