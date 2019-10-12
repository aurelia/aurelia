import { writeFileSync } from 'fs';
import {
  addSyntheticLeadingComment,
  ArrayLiteralExpression,
  ClassElement,
  ClassExpression,
  createArrayLiteral,
  createAssignment,
  createBindingElement,
  createBlock,
  createCall,
  createClassExpression,
  createExpressionStatement,
  createFunctionDeclaration,
  createFunctionExpression,
  createIdentifier,
  createImportClause,
  createImportDeclaration,
  createImportSpecifier,
  createLiteral,
  createMethod,
  createModifier,
  createNamedImports,
  createNew,
  createObjectBindingPattern,
  createObjectLiteral,
  createParameter,
  createPrinter,
  createProperty,
  createPropertyAccess,
  createPropertyAssignment,
  createReturn,
  createShorthandPropertyAssignment,
  createSourceFile,
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement,
  EmitHint,
  Expression,
  Identifier,
  ImportDeclaration,
  MethodDeclaration,
  Node,
  NodeFlags,
  ObjectLiteralElementLike,
  ObjectLiteralExpression,
  ParameterDeclaration,
  Printer,
  PropertyAccessExpression,
  PropertyDeclaration,
  ReturnStatement,
  ScriptTarget,
  SourceFile,
  Statement,
  SyntaxKind,
  VariableDeclaration,
  VariableStatement
} from 'typescript';

export function emit(path: string, ...nodes: Node[]): void {
  const emptyFile: SourceFile = createSourceFile('', '', ScriptTarget.Latest);
  const printer: Printer = createPrinter({ removeComments: false });
  let content = '';
  for (const node of nodes) {
    if (node === null) {
      content += '\n';
    } else {
      content += `${printer.printNode(EmitHint.Unspecified, node, emptyFile)}\n`;
    }
  }
  writeFileSync(path, `${content.slice(0, -1)}\r\n`, { encoding: 'utf8' });
}

export function addRange(start: number, end: number, ...records: Record<string, boolean>[]): void {
  for (let i = start; i <= end; ++i) {
    records.forEach(r => r[String.fromCharCode(i)] = true);
  }
}
const identPart = {};
const identStart = {};
addRange('a'.charCodeAt(0), 'z'.charCodeAt(0), identPart, identStart);
addRange('A'.charCodeAt(0), 'Z'.charCodeAt(0), identPart, identStart);
addRange('$'.charCodeAt(0), '$'.charCodeAt(0), identPart, identStart);
addRange('_'.charCodeAt(0), '_'.charCodeAt(0), identPart, identStart);
addRange('0'.charCodeAt(0), '9'.charCodeAt(0), identPart);

export function $name(input: string): string {
  let value = '';
  let first = true;
  let char: string;
  for (let i = 0, ii = input.length; i < ii; ++i) {
    char = input.charAt(i);
    if (first) {
      value = value + (identStart[char] ? char : '_');
    } else {
      value = value + (identPart[char] ? char : '_');
    }
    first = false;
  }
  return value;
}

export function $id(name: string): Identifier;
export function $id(id: Identifier): Identifier;
export function $id(nameOrId: string | Identifier): Identifier;
export function $id(expr: Expression): Expression;
export function $id(nameOrExpr: string | Expression): Identifier | Expression;
export function $id(idOrExpr: Identifier | Expression): Identifier | Expression;
export function $id(nameOrExprOrId: string | Expression | Identifier): Expression | Identifier;
export function $id(nameOrExprOrId: string | Expression | Identifier): Expression | Identifier {
  return typeof nameOrExprOrId === 'string' ? createIdentifier(nameOrExprOrId) : nameOrExprOrId;
}

export function $access(name: string): Identifier;
export function $access(path: [string | Expression | Identifier, ...(string | Identifier)[]]): PropertyAccessExpression;
export function $access(nameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]]): PropertyAccessExpression | Identifier;
export function $access(nameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]]): PropertyAccessExpression | Identifier {
  if (Array.isArray(nameOrPath)) {
    let left = $id(nameOrPath[0]);
    const rest = nameOrPath.slice(1) as (string | Identifier)[];
    rest.forEach(name => {
      left = createPropertyAccess(left, $id(name));
    });
    return left as PropertyAccessExpression;
  } else {
    return createIdentifier(nameOrPath);
  }
}

export function $call(name: string, variablesOrExpressions?: (string | Expression | Identifier)[]): Expression;
export function $call(path: [string | Expression | Identifier, ...(string | Identifier)[]], variablesOrExpressions?: (string | Expression | Identifier)[]): Expression;
export function $call(nameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]], variablesOrExpressions?: (string | Expression | Identifier)[]): Expression;
export function $call(nameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]], variablesOrExpressions: (string | Expression | Identifier)[] = []): Expression {
  const left = $access(nameOrPath);
  const args: Expression[] = [];

  variablesOrExpressions.forEach(varOrExpr => {
    if (typeof varOrExpr === 'string') {
      args.push(createIdentifier(varOrExpr));
    } else {
      args.push(varOrExpr);
    }
  });
  return createCall(left, [], args);
}

export function $$call(name: string, variablesOrExpressions?: (string | Expression | Identifier)[]): Statement;
export function $$call(path: [string | Expression | Identifier, ...(string | Identifier)[]], variablesOrExpressions?: (string | Expression | Identifier)[]): Statement;
export function $$call(nameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]], variablesOrExpressions?: (string | Expression | Identifier)[]): Statement;
export function $$call(nameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]], variablesOrExpressions: (string | Expression | Identifier)[] = []): Statement {
  return createExpressionStatement($call(nameOrPath, variablesOrExpressions));
}

export function $assign(leftName: string, rightName: string): Expression;
export function $assign(leftPath: [string | Expression | Identifier, ...(string | Identifier)[]], rightName: string): Expression;
export function $assign(leftNameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]], rightName: string): Expression;
export function $assign(leftName: string, rightPath: [string | Expression | Identifier, ...(string | Identifier)[]]): Expression;
export function $assign(leftPath: [string | Expression | Identifier, ...(string | Identifier)[]], rightPath: [string | Expression | Identifier, ...(string | Identifier)[]]): Expression;
export function $assign(leftNameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]], rightPath: [string | Expression | Identifier, ...(string | Identifier)[]]): Expression;
export function $assign(leftName: string, rightNameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]]): Expression;
export function $assign(leftPath: [string | Expression | Identifier, ...(string | Identifier)[]], rightNameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]]): Expression;
export function $assign(leftNameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]], rightNameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]]): Expression;
export function $assign(leftNameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]], rightNameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]]): Expression {
  const left = $access(leftNameOrPath);
  const right = $access(rightNameOrPath);
  return createAssignment(left, right);
}

export function $$assign(leftName: string, rightName: string): Statement;
export function $$assign(leftPath: [string | Expression | Identifier, ...(string | Identifier)[]], rightName: string): Statement;
export function $$assign(leftNameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]], rightName: string): Statement;
export function $$assign(leftName: string, rightPath: [string | Expression | Identifier, ...(string | Identifier)[]]): Statement;
export function $$assign(leftPath: [string | Expression | Identifier, ...(string | Identifier)[]], rightPath: [string | Expression | Identifier, ...(string | Identifier)[]]): Statement;
export function $$assign(leftNameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]], rightPath: [string | Expression | Identifier, ...(string | Identifier)[]]): Statement;
export function $$assign(leftName: string, rightNameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]]): Statement;
export function $$assign(leftPath: [string | Expression | Identifier, ...(string | Identifier)[]], rightNameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]]): Statement;
export function $$assign(leftNameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]], rightNameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]]): Statement;
export function $$assign(leftNameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]], rightNameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]]): Statement {
  return createExpressionStatement($assign(leftNameOrPath, rightNameOrPath));
}

export function $new(name: string, variablesOrExpressions?: (string | Expression | Identifier)[]): Expression;
export function $new(path: [string | Expression | Identifier, ...(string | Identifier)[]], variablesOrExpressions?: (string | Expression | Identifier)[]): Expression;
export function $new(nameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]], variablesOrExpressions?: (string | Expression | Identifier)[]): Expression;
export function $new(nameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]], variablesOrExpressions: (string | Expression | Identifier)[] = []): Expression {
  const left = $access(nameOrPath);
  const args: Expression[] = [];

  variablesOrExpressions.forEach(varOrExpr => {
    if (typeof varOrExpr === 'string') {
      args.push(createIdentifier(varOrExpr));
    } else {
      args.push(varOrExpr);
    }
  });
  return createNew(left, [], args);
}

export function $$new(variable: string, name: string, variablesOrExpressions?: (string | Expression | Identifier)[]): Statement;
export function $$new(variable: string, path: [string | Expression | Identifier, ...(string | Identifier)[]], variablesOrExpressions?: (string | Expression | Identifier)[]): Statement;
export function $$new(variable: string, nameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]], variablesOrExpressions?: (string | Expression | Identifier)[]): Statement;
export function $$new(variable: string, nameOrPath: string | [string | Expression | Identifier, ...(string | Identifier)[]], variablesOrExpressions: (string | Expression | Identifier)[] = []): Statement {
  return $$const(variable, $new(nameOrPath, variablesOrExpressions));
}

export function $$comment(comment: string, arg: Statement): Statement {
  return addSyntheticLeadingComment(arg, SyntaxKind.SingleLineCommentTrivia, ` ${comment}`, true);
}

export function $$const(name: string, initializer: Expression): VariableStatement;
export function $$const(names: string[], initializer: Expression): VariableStatement;
export function $$const(nameOrNames: string | string[], initializer: Expression): VariableStatement {
  let declaration: VariableDeclaration;
  if (Array.isArray(nameOrNames)) {
    const elements = nameOrNames.map(n => createBindingElement(undefined, undefined, n));
    declaration = createVariableDeclaration(createObjectBindingPattern(elements), undefined, initializer);
  } else {
    declaration = createVariableDeclaration(createIdentifier(nameOrNames), undefined, initializer);
  }
  return createVariableStatement([], createVariableDeclarationList([declaration], NodeFlags.Const));
}

export function $expression(value: any, multiline: number = 0, level: number = 0): Expression {

  function $objectLiteral(obj: any, $multiline: number, $level: number): ObjectLiteralExpression {
    const properties: ObjectLiteralElementLike[] = [];
    Object.keys(obj).forEach(key => {
      const identifier = createIdentifier(key);
      const objValue = obj[key];
      if (key === objValue) {
        properties.push(createShorthandPropertyAssignment(identifier));
      } else {
        const initializer = $expression(obj[key], $multiline, $level + 1);
        properties.push(createPropertyAssignment(identifier, initializer));
      }
    });
    return createObjectLiteral(properties, $multiline > $level);
  }

  function $arrayLiteral(arr: any[], $multiline: number, $level: number): ArrayLiteralExpression {
    const expressions: Expression[] = [];
    arr.forEach(arrValue => {
      expressions.push($expression(arrValue, $multiline, $level + 1));
    });
    return createArrayLiteral(expressions, $multiline > $level);
  }

  switch (Object.prototype.toString.call(value)) {
    case '[object Undefined]':
      return createIdentifier('undefined');
    case '[object Null]':
      return createIdentifier('null');
    case '[object Number]':
    case '[object Boolean]':
    case '[object String]':
      return createLiteral(value);
    case '[object Array]':
      return $arrayLiteral(value, multiline, level);
    case '[object Object]':
      return $objectLiteral(value, multiline, level);
    default:
      if (typeof value === 'function') {
        return $id(value.name);
      } else {
        return $objectLiteral(value, multiline, level);
      }
  }
}

export function $$return(value: any): ReturnStatement {
  return createReturn($expression(value));
}

export function $property(name: string, value?: any, isStatic?: boolean): PropertyDeclaration {
  const modifiers = [];
  if (isStatic === true) {
    modifiers.push(createModifier(SyntaxKind.StaticKeyword));
  }
  if (arguments.length === 1) {
    return createProperty([], modifiers, $id(name), undefined, undefined, undefined);
  } else {
    return createProperty([], modifiers, $id(name), undefined, undefined, value && value.escapedText ? value : $expression(value));
  }
}
export function $method(name: string, statements: Statement[], params?: ParameterDeclaration[], isStatic?: boolean): MethodDeclaration {
  const modifiers = [];
  if (isStatic === true) {
    modifiers.push(createModifier(SyntaxKind.StaticKeyword));
  }
  if (arguments.length === 2) {
    return createMethod([], modifiers, undefined, $id(name), undefined, undefined, [], undefined, createBlock(statements, true));
  } else {
    return createMethod([], modifiers, undefined, $id(name), undefined, undefined, params, undefined, createBlock(statements, true));
  }
}
export function $class(elements: readonly ClassElement[]): ClassExpression {
  return createClassExpression([], undefined, [], [], elements);
}
export function $functionExpr(parameters: ParameterDeclaration[], statements: Statement[]): Expression;
export function $functionExpr(statements: Statement[]): Expression;
export function $functionExpr(statementsOrParameters: Statement[] | ParameterDeclaration[], statements?: Statement[]): Expression {
  return createFunctionExpression(
    [],
    undefined,
    undefined,
    [],
    arguments.length === 1 ? [] : statementsOrParameters as ParameterDeclaration[],
    undefined,
    createBlock(arguments.length === 1 ? statementsOrParameters as Statement[] : statements, true)
  );
}
export function $$functionExpr(name: string, args: Expression[]): Statement {
  return createExpressionStatement($call(name, args));
}
export function $$functionDecl(name: string, statements: Statement[], parameters: ParameterDeclaration[]): Statement {
  return createFunctionDeclaration([], [], undefined, createIdentifier(name), [], parameters, undefined, createBlock(statements, true));
}
export function $param(name: string): ParameterDeclaration {
  return createParameter(
    [],
    [],
    undefined,
    createIdentifier(name),
    undefined,
    undefined,
    undefined
  );
}
export function $$import(path: string, ...names: string[]): ImportDeclaration {
  return createImportDeclaration(
    [],
    [],
    createImportClause(
      undefined,
      createNamedImports(names.map(name => createImportSpecifier(undefined, createIdentifier(name))))
    ),
    createLiteral(path)
  );
}
export function $element(name: string, inner: string, ...attributes: string[]): string {
  return attributes.length
    ? `<${name} ${attributes.join(' ')}>${inner}</${name}>`
    : `<${name}>${inner}</${name}>`;
}
export function $div(inner: string, ...attributes: string[]): string {
  return $element('div', inner, ...attributes);
}
$div.$name = 'div';
export function $tpl(inner: string, ...attributes: string[]): string {
  return $element('template', inner, ...attributes);
}
$tpl.$name = 'tpl';
type CreateElement = { $name: string } & ((inner: string, ...attributes: string[]) => string);

export function $attr(create: CreateElement, ...attributes: string[]): CreateElement {
  const createWrapped = (inner: string) => {
    return create(inner, ...attributes);
  };
  createWrapped.$name = this.$name;
  return createWrapped;
}
