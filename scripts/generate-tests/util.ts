import { writeFileSync } from 'fs';
import {
  createCall,
  createIdentifier,
  createLiteral,
  Node,
  SourceFile,
  Printer,
  createSourceFile,
  createPrinter,
  EmitHint,
  ScriptTarget,
  createArrowFunction,
  createToken,
  SyntaxKind,
  createBlock,
  createFunctionExpression,
  StringLiteral,
  Block,
  createNew,
  createExpressionStatement,
  Statement,
  createVariableDeclaration,
  createVariableStatement,
  ModifierFlags,
  createModifier,
  createKeywordTypeNode,
  createVariableDeclarationList,
  NodeFlags,
  createPropertyAccess,
  Expression,
  createImportDeclaration,
  createImportClause,
  createNamedImports,
  createImportSpecifier,
  createClassDeclaration,
  createDecorator,
  createObjectLiteral,
  createPropertyAssignment,
  ClassElement,
  createPropertySignature,
  createLiteralTypeNode,
  createProperty,
  createAssignment,
  createShorthandPropertyAssignment,
  createFunctionDeclaration,
  createObjectBindingPattern,
  createBindingElement,
  createReturn,
  createClassExpression,
  createBinary
} from 'typescript';

export function emit(path: string, ...nodes: Node[]): void {
  const emptyFile: SourceFile = createSourceFile('', '', ScriptTarget.Latest);
  const printer: Printer = createPrinter({ removeComments: false });
  let content = '';
  for (const node of nodes) {
    if (node === null) {
      content += '\n';
    } else {
      content += printer.printNode(EmitHint.Unspecified, node, emptyFile) + '\n';
    }
  }
  writeFileSync(path, content.slice(0, -1), { encoding: 'utf8' });
}

export function addRange(start: number, end: number, ...records: Record<string, boolean>[]) {
  for (let i = start; i <= end; ++i) {
    records.forEach(r => r[String.fromCharCode(i)] = true);
  }
}
let identPart = {};
let identStart = {};
addRange('a'.charCodeAt(0), 'z'.charCodeAt(0), identPart, identStart);
addRange('A'.charCodeAt(0), 'Z'.charCodeAt(0), identPart, identStart);
addRange('$'.charCodeAt(0), '$'.charCodeAt(0), identPart, identStart);
addRange('_'.charCodeAt(0), '_'.charCodeAt(0), identPart, identStart);
addRange('0'.charCodeAt(0), '9'.charCodeAt(0), identPart);

export function $name(input: string) {
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

export function $const(name: string, expr: Expression) {
  return createVariableStatement(
    [],
    createVariableDeclarationList(
      [createVariableDeclaration(createIdentifier(name), undefined, expr)],
      NodeFlags.Const
    )
  );
}
export function $accessProperty(expr: Expression, ...props: string[]);
export function $accessProperty(object: string, ...props: string[]);
export function $accessProperty(objectOrExpr: string | Expression, ...props: string[]) {
  if (props.length === 0) {
    if (typeof objectOrExpr === 'string') {
      return createIdentifier(objectOrExpr);
    } else {
      return objectOrExpr;
    }
  }
  if (typeof objectOrExpr === 'string') {
    return props.slice(1).reduce((acc, cur) => createPropertyAccess(acc, createIdentifier(cur)), createPropertyAccess(createIdentifier(objectOrExpr), createIdentifier(props[0])));
  } else {
    return props.slice(1).reduce((acc, cur) => createPropertyAccess(acc, createIdentifier(cur)), createPropertyAccess(objectOrExpr, createIdentifier(props[0])));
  }
}
export function $call(expr: Expression, ...args: Expression[]): Expression {
  return createCall(expr, [], args);
}
export function $createContainer() {
  return $const('container', $call($accessProperty('DI', 'createContainer')));
}
export function $testFunction(type: string, title: string, ...statements: Statement[]) {
  const name = $name(title);
  return createExpressionStatement(
    $call(
      createIdentifier(type),
      createLiteral(title),
      createFunctionExpression(
        [],
        undefined,
        createIdentifier(name),
        [],
        [],
        undefined,
        createBlock(statements, true)
      )
    )
  );
}

export function $describeOnly(title: string, ...statements: Statement[]) {
  return $testFunction('describe.only', title, ...statements);
}
export function $describe(title: string, ...statements: Statement[]) {
  return $testFunction('describe', title, ...statements);
}
export function $it(title: string, ...statements: Statement[]) {
  return $testFunction('it', title, ...statements);
}
export function $xit(title: string, ...statements: Statement[]) {
  return $testFunction('xit', title, ...statements);
}
export function $register(...names: string[]) {
  return createExpressionStatement(
    $call($accessProperty('container', 'register'), ...names.map(n => createIdentifier(n)))
  );
}
export function $createAurelia(name: string) {
  return $const(name, createNew(createIdentifier('Aurelia'), [], [createIdentifier('container')]));
}
export function $createChangeSet(name: string) {
  return $const(name, $call(
    $accessProperty('container', 'get'),
    createIdentifier('IChangeSet')
  ));
}
export function $createRenderingEngine(name: string) {
  return $const(name, $call(
    $accessProperty('container', 'get'),
    createIdentifier('IRenderingEngine')
  ));
}
export function $object(...names: string[]) {
  const props = names.map(n => createShorthandPropertyAssignment(createIdentifier(n)));
  return createObjectLiteral(props);
}
export function $app() {
  return createExpressionStatement($call($accessProperty('au', 'app'), $object('host', 'component')));
}
export function $start() {
  return createExpressionStatement($call($accessProperty('au', 'start')));
}
export function $stop() {
  return createExpressionStatement($call($accessProperty('au', 'stop')));
}
export function $createComponent(type: string, ...args: Expression[]) {
  return $const('component', createNew(createIdentifier(type), [], args));
}
export function $hydrateComponent() {
  return createExpressionStatement(
    $call(
      $accessProperty('component', '$hydrate'),
      createIdentifier('re'),
      createIdentifier('host')
    )
  );
}
export function $bindComponent() {
  return createExpressionStatement(
    $call(
      $accessProperty('component', '$bind'),
      createBinary(
        $accessProperty('BindingFlags', 'fromStartTask'),
        SyntaxKind.BarToken,
        $accessProperty('BindingFlags', 'fromBind')
      )
    )
  );
}
export function $attachComponent() {
  return [
    $const(
      'a$lifecycle',
      $call(
        $accessProperty('Lifecycle', 'beginAttach'),
        createIdentifier('cs'),
        createIdentifier('host'),
        $accessProperty('LifecycleFlags', 'none')
      )
    ),
    createExpressionStatement(
      $call(
        $accessProperty('a$lifecycle', 'attach'),
        createIdentifier('component')
      )
    ),
    createExpressionStatement(
      $call(
        $accessProperty('a$lifecycle', 'end')
      )
    )
  ];
}
export function $detachComponent() {
  return [
    $const(
      'd$lifecycle',
      $call(
        $accessProperty('Lifecycle', 'beginDetach'),
        createIdentifier('cs'),
        $accessProperty('LifecycleFlags', 'noTasks')
      )
    ),
    createExpressionStatement(
      $call(
        $accessProperty('d$lifecycle', 'detach'),
        createIdentifier('component')
      )
    ),
    createExpressionStatement(
      $call(
        $accessProperty('d$lifecycle', 'end')
      )
    )
  ];
}
export function $unbindComponent() {
  return createExpressionStatement(
    $call(
      $accessProperty('component', '$unbind'),
      createBinary(
        $accessProperty('BindingFlags', 'fromStopTask'),
        SyntaxKind.BarToken,
        $accessProperty('BindingFlags', 'fromUnbind')
      )
    )
  );
}
export function $createHost() {
  return $const('host', $call($accessProperty('DOM', 'createElement'), createLiteral('div')));
}
export function $import(path: string, ...names: string[]) {
  return createImportDeclaration(
    [],
    [],
    createImportClause(
      undefined,
      createNamedImports(names.map(name => createImportSpecifier(undefined, createIdentifier(name))))),
      createLiteral(path)
  );
}
export function $resource(name: string, kind: string, args: Expression[], members: ClassElement[]) {
  return $const(
    name,
    $call(
      $accessProperty(kind, 'define'),
      ...args,
      createClassExpression(
        [],
        undefined,
        [],
        [],
        members
      )
    )
  );
}
export function $customElement(name: string, ...members: ClassElement[]) {
  return $resource(name, 'CustomElementResource', [$object('name', 'template')], members);
}
export function $classProperty(name: string, type: SyntaxKind, value: any) {
  return createProperty(
    [],
    [],
    createIdentifier(name),
    undefined,
    undefined,
    createLiteral(value)
  );
}
export function $destructureObject(initializer: Expression, ...names: string[]) {
  const elements = names.map(n => createBindingElement(undefined, undefined, n));
  return createVariableStatement(
    [],
    createVariableDeclarationList(
      [createVariableDeclaration(createObjectBindingPattern(elements), undefined, initializer)],
      NodeFlags.Const
    )
  );
}
export function $expect(left: Expression, right: Expression, msg: string, ...asserts: string[]) {
  left = asserts.reduce((l, cur) => createPropertyAccess(l, cur), $call(createIdentifier('expect'), left));
  return createExpressionStatement($call(left, right, createLiteral(msg)));
}
export function $expectHostTextContent(toEqual: string, msg: string) {
  return $expect($accessProperty('host', 'textContent'), createLiteral(toEqual), msg, 'to', 'equal');
}
export function $expectEqual(actual: string, expected: string, msg: string) {
  return $expect($accessProperty(actual), $accessProperty(expected), msg, 'to', 'equal');
}
export function $functionDeclaration(name: string, ...statements: Statement[]) {
  return createFunctionDeclaration([], [], undefined, createIdentifier(name), [], [], undefined, createBlock(statements, true));
}

export function $test(name: string, markup: string, expectedAfterStart: string, expectedAfterStop: string, ...customElMembers: ClassElement[]) {
  return $it(
    name,
    $destructureObject(
      $call(createIdentifier('setup')),
      'au', 'host'
    ),
    $const('name', createLiteral('app')),
    $const('template', createLiteral(markup)),
    null,
    $customElement('App', ...customElMembers),
    $createComponent('App'),
    $app(),
    $start(),
    $expectHostTextContent(expectedAfterStart, 'after start #1'),
    $stop(),
    $expectHostTextContent(expectedAfterStop, 'after stop #1'),
    $start(),
    $expectHostTextContent(expectedAfterStart, 'after start #2'),
    $stop(),
    $expectHostTextContent(expectedAfterStop, 'after stop #2')
  );
}

export function $element(name: string, inner: string, ...attributes: string[]) {
  return attributes.length
    ? `<${name} ${attributes.join(' ')}>${inner}</${name}>`
    : `<${name}>${inner}</${name}>`;
}
export function $div(inner: string, ...attributes: string[]) {
  return $element('div', inner, ...attributes);
}
$div.$name = 'div';
export function $tpl(inner: string, ...attributes: string[]) {
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
