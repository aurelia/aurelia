import { DI, isArray, Writable } from '@aurelia/kernel';
import type {
  AccessKeyedExpression,
  DestructuringAssignmentExpression,
  DestructuringAssignmentRestExpression,
  DestructuringAssignmentSingleExpression,
  IsAssign,
  IsBindingBehavior,
  IsLeftHandSide,
  PrimitiveLiteralExpression,
} from '@aurelia/expression-parser';
import {
  AccessMemberExpression,
  AccessScopeExpression,
  ExpressionParser,
  Unparser,
} from '@aurelia/expression-parser';
import {
  DotSeparatedAttributePattern,
  EventAttributePattern,
  RefAttributePattern,
  AtPrefixedTriggerAttributePattern,
  ColonPrefixedBindAttributePattern,
  IAttributeParser
} from '@aurelia/template-compiler';
import type {
  AttrSyntax
} from '@aurelia/template-compiler';
import { parseFragment } from 'parse5';
import type { DefaultTreeAdapterMap, Token } from 'parse5';
import { modifyCode } from './modify-code';
import { ClassMember, ClassMetadata } from './preprocess-resource';

type DefaultTreeElement = DefaultTreeAdapterMap['element'];
type DefaultTreeTextNode = DefaultTreeAdapterMap['textNode'];
type Template = DefaultTreeAdapterMap['template'];
type Location = Token.ElementLocation;

export function prependUtilityTypes(m: ReturnType<typeof modifyCode>, isJs: boolean) {
  m.prepend(`// @ts-check
${isJs
      ?
      `/**
  * @template TCollection
  * @typedef {TCollection extends Array<infer TElement> ? TElement : TCollection extends Set<infer TElement> ? TElement : TCollection extends Map<infer TKey, infer TValue> ? [TKey, TValue] : TCollection extends number ? number : TCollection extends object ? any : never} CollectionElement
  */`
      :
      `type CollectionElement<TCollection> = TCollection extends Array<infer TElement>
      ? TElement
      : TCollection extends Set<infer TElement>
        ? TElement
        : TCollection extends Map<infer TKey, infer TValue>
          ? [TKey, TValue]
          : TCollection extends number
           ? number
           : TCollection extends object
             ? any
             : never;`}
`
  );
}

const enum IdentifierInstruction {
  None           = 0b0000_0000,
  SkipGeneration = 0b0000_0001,
  AddToOverrides = 0b0000_0010,
  Promise        = 0b0001_0000,
}

type ScopeType = 'none' | 'repeat' | 'promise';

class IdentifierScope {
  private readonly decIdentMap: Map<string, number> | null;
  private readonly overriddenIdentMap: Map<string, string> = new Map();
  private readonly root: IdentifierScope;
  public get isRoot(): boolean { return this.parent === null; }
  private promiseProperty: string | null = null;

  public constructor(
    private readonly type: ScopeType,
    private readonly classes: ClassMetadata[],
    public readonly parent: IdentifierScope | null = null,
  ) {
    this.decIdentMap = parent === null ? new Map() : null;
    this.root = parent === null ? this : parent.root;
  }

  public createChild(type: ScopeType): IdentifierScope { return new IdentifierScope(type, this.classes, this); }

  public getIdentifier(ident: string, instruction: IdentifierInstruction = IdentifierInstruction.None): string | null {
    const returnIdentifier = (newIdent: string): string => {
      if (isPromise) this.promiseProperty = newIdent;
      return newIdent;
    };

    if (ident.startsWith(identifierPrefix)) throw new Error(`Identifier '${ident}' uses reserved prefix '${identifierPrefix}'; consider renaming it.`);

    const isPromise = (instruction & IdentifierInstruction.Promise) > 0;
    if (isPromise) {
      if (this.type !== 'promise') throw new Error(`Identifier '${ident}' is used for promise template controller, but scope is not marked as a promise scope.`);
    }
    if (this.classes.some(c => c.members.some(x => x.name === ident))) return returnIdentifier(ident);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let current: IdentifierScope | null = this;
    while (current !== null) {
      const lookup = current.overriddenIdentMap;
      if (lookup.has(ident)) return returnIdentifier(lookup.get(ident)!);
      current = current.parent;
    }
    if ((instruction & IdentifierInstruction.SkipGeneration) > 0) return null;

    const lookup = this.root.decIdentMap!;
    let count = lookup.get(ident) ?? 0;
    lookup.set(ident, ++count);
    const newName = `${identifierPrefix}${ident}${count}`;

    if ((instruction & IdentifierInstruction.AddToOverrides) > 0) this.overriddenIdentMap.set(ident, newName);

    return returnIdentifier(newName);
  }

  public getPromiseProperty(): string | null {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let current: IdentifierScope | null = this;
    while (current !== null) {
      if (current.promiseProperty !== null) return current.promiseProperty;
      current = current.parent;
    }
    return null;
  }
}

const identifierPrefix = '__Template_TypeCheck_Synthetic_';
class TypeCheckingContext {
  private static readonly _o = 'o';
  private static readonly rootAccessScope = new AccessScopeExpression(this._o, 0);
  private scope: IdentifierScope;
  public readonly toReplace: { loc: Location; modifiedContent: () => string }[] = [];
  public readonly classUnion: string;
  public readonly accessTypeParts: ((acc: string) => string)[];
  public readonly accessTypeIdentifier: string;
  public readonly accessIdentifier: string;

  private _accessType: string | undefined = void 0;
  public get accessType(): string { return this._accessType ??= this.accessTypeParts.reduce((acc: string, part) => part(acc), ''); }

  private _hasRepeatContextualProperties = false;
  public get hasRepeatContextualProperties(): boolean { return this._hasRepeatContextualProperties; }
  public set hasRepeatContextualProperties(value: boolean) {
    if (this._hasRepeatContextualProperties || !value) return;
    this._hasRepeatContextualProperties = value;
    this.accessTypeParts.push((acc) => `${acc} & { $index: number, $first: boolean, $last: boolean, $even: boolean, $odd: boolean, $length: number }`);
  }

  public constructor(
    public readonly attrParser: IAttributeParser,
    public readonly exprParser: ExpressionParser,
    public readonly classes: ClassMetadata[],
    public readonly isJs: boolean,
  ) {
    const classNames = classes.map(c => c.name);

    // create a class union
    // - Omit the private and protected members
    // - Add them back to the union type
    // - Then create union
    const classUnion = [];
    for (const $class of classes) {
      // Omit<CLASS, 'private' | 'protected'> & { PRIVATE: TYPE, PROTECTED: TYPE }
      const nonPublicMembers = $class.members.filter(x => x.accessModifier !== 'public');
      if (nonPublicMembers.length === 0) {
        classUnion.push($class.name);
        continue;
      }
      classUnion.push(
        // TODO(Sayan): handle method overloads?
        `Omit<${$class.name}, ${nonPublicMembers.map(x => `'${x.name}'`).join(' | ')}> & ${renderNonPublicMembers(nonPublicMembers)}`
      );
    }
    this.classUnion = classUnion.join(' | ');

    this.accessTypeParts = [() => `${this.classUnion} & { $parent: any }`];
    this.accessTypeIdentifier = `__Template_Type_${classNames.join('_')}__`;
    this.accessIdentifier = `access${isJs ? '' : `<${this.accessTypeIdentifier}>`}`;
    this.scope = new IdentifierScope('none', classes);

    function renderNonPublicMembers(nonPublicMembers: ClassMember[]): string {
      return `{ ${nonPublicMembers.map(x => `${x.name}${renderMethodArguments(x)}: ${x.dataType}`).join(', ')} }`;
    }
    function renderMethodArguments(x: ClassMember): string {
      if (x.memberType !== 'method') return '';
      return `(${x.methodArguments!.map(a => `${a.isSpread ? '...' : ''}${a.name}${a.isOptional ? '?' : ''}: ${a.type}`).join(',')})`;
    }
  }

  public produceTypeCheckedTemplate(rawHtml: string): string {
    const { accessType, isJs, accessTypeIdentifier, classes } = this;
    let html = '';
    let lastIndex = 0;
    this.toReplace.forEach(({ loc, modifiedContent }) => {
      html += rawHtml.slice(lastIndex, loc.startOffset) + modifiedContent();
      lastIndex = loc.endOffset;
    });
    html += rawHtml.slice(lastIndex);

    const output = `
${isJs ? '' : `type ${accessTypeIdentifier} = ${accessType};`}
function __typecheck_template_${classes.map(x => x.name).join('_')}__() {
  ${isJs
        ? `
  /**
   * @typedef {${accessType}} ${accessTypeIdentifier}
   */
  /**
   * @template {${accessTypeIdentifier}} T
   * @param {function(T): unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  `
        : ''}
  const access = ${isJs ? '' : `<T extends object>`}(typecheck${isJs ? '' : ': (o: T) => unknown'}, expr${isJs ? '' : ': string'}) => expr;
  return \`${html}\`;
}\n\n`;

    return output;
  }

  public getIdentifier(ident: string, instruction: IdentifierInstruction = IdentifierInstruction.None): string | null {
    return this.scope.getIdentifier(ident, instruction);
  }

  public createLambdaExpression(expression: IsBindingBehavior): string;
  public createLambdaExpression(args: string[]): string;
  public createLambdaExpression(args: string[] | IsBindingBehavior): string {
    if (isArray(args)) {
      const len = args.length;
      switch (len) {
        case 0: throw new Error('At least one argument is required');
        case 1: return `${TypeCheckingContext._o} => ${TypeCheckingContext._o}.${args[0]}`;
        default: return `${TypeCheckingContext._o} => (${args.map(arg => `${TypeCheckingContext._o}.${arg}`).join(',')})`;
      }
    }

    switch (args.$kind) {
      case 'CallScope':
        {
          const argList: string[] = [];
          for (const arg of args.args) {
            switch(arg.$kind) {
              case 'PrimitiveLiteral': argList.push(unparse(arg)); break;
              default: argList.push(`${TypeCheckingContext._o}.${unparse(arg)}`);
            }
          }
          return `${TypeCheckingContext._o} => ${TypeCheckingContext._o}.${args.name}(${argList.join(',')})`;
        }
      default: return this.createLambdaExpression([unparse(args)]);
    }
  }

  public createMemberAccessExpression(member: string): AccessMemberExpression {
    return new AccessMemberExpression(TypeCheckingContext.rootAccessScope, member);
  }

  public pushScope(type: ScopeType): void {
    this.scope = this.scope.createChild(type);
  }

  public popScope(): void {
    if (this.scope.isRoot) return;
    this.scope = this.scope.parent!;
  }

  public addPromiseResolvedProperty(identifier: string): void {
    const promiseProp = this.scope.getPromiseProperty();
    if (promiseProp === null) throw new Error('Promise property not found');
    this.accessTypeParts.push((acc) => `${acc} & { ${identifier}: Awaited<${this.accessTypeIdentifier}['${promiseProp}']> }`);
  }
}

export function createTypeCheckedTemplate(rawHtml: string, classes: ClassMetadata[], isJs: boolean): string {
  const tree = parseFragment(rawHtml, { sourceCodeLocationInfo: true }) as DefaultTreeElement;
  const container = DI.createContainer().register(
    DotSeparatedAttributePattern,
    EventAttributePattern,
    RefAttributePattern,
    AtPrefixedTriggerAttributePattern,
    ColonPrefixedBindAttributePattern,
  );
  const attrParser = container.get(IAttributeParser);
  const exprParser = container.get(ExpressionParser);

  const ctx = new TypeCheckingContext(attrParser, exprParser, classes, isJs);

  traverse(tree, (node) => processNode(node, ctx));
  return ctx.produceTypeCheckedTemplate(rawHtml);
}

function traverseDepth($node: DefaultTreeElement, ctx: TypeCheckingContext): void {
  // drill down
  if ($node.childNodes) traverse($node, n => processNode(n, ctx));
  // For <template> tag
  if (($node as Template).content?.childNodes) traverse(($node as Template).content, n => processNode(n, ctx));

  ctx.popScope();
}

function tryProcessRepeat(syntax: AttrSyntax, attr: Token.Attribute, node: DefaultTreeElement, ctx: TypeCheckingContext): boolean {
  if (syntax.command !== 'for') return false;

  ctx.pushScope('repeat');
  const expr = ctx.exprParser.parse(attr.value, 'IsIterator');

  let iterable: () => string;
  let propAccExpr: string;
  if (expr.iterable.$kind === 'PrimitiveLiteral') {
    // generate a new identifier
    const identifier = ctx.getIdentifier(rangeIterableIdentifier)!;
    const primitiveValue = (expr.iterable as PrimitiveLiteralExpression).value;
    iterable = () => `\${${ctx.accessIdentifier}(${ctx.createLambdaExpression([identifier])}, '${primitiveValue}')}`;
    ctx.accessTypeParts.push((acc) => `${acc} & { ${identifier}: ${primitiveValue} }`);
    propAccExpr = `${ctx.accessTypeIdentifier}['${identifier}']`;
  } else {
    const rawIterIdentifier = Unparser.unparse(expr.iterable);
    const [iterIdent, path] = mutateAccessScope(expr.iterable, ctx, member => {
      const newName = ctx.getIdentifier(member, IdentifierInstruction.AddToOverrides)!;
      return newName;
    }, true);
    propAccExpr = `${ctx.accessTypeIdentifier}${path.map(p => `['${p}']`).join('')}`;
    iterable = () => `\${${ctx.accessIdentifier}(${ctx.createLambdaExpression(iterIdent)}, '${rawIterIdentifier}')}`;
  }
  let declaration: () => string;
  switch (expr.declaration.$kind) {
    // if this is an array destructuring, it only means that it is a map, as that is the only collection type supported for repeat.for
    case 'ArrayDestructuring': {
      const [keyAssignLeaf, valueAssignLeaf] = expr.declaration.list;
      const [rawKeyIdent, keyIdent] = getArrDestIdent(keyAssignLeaf);
      const [rawValueIdent, valueIdent] = getArrDestIdent(valueAssignLeaf);

      ctx.accessTypeParts.push((acc) => `${acc} & { ${keyIdent}: CollectionElement<${propAccExpr}>[0], ${valueIdent}: CollectionElement<${propAccExpr}>[1] }`);
      declaration = () => `\${${ctx.accessIdentifier}(${ctx.createLambdaExpression([keyIdent, valueIdent])}, '[${rawKeyIdent},${rawValueIdent}]')}`;
      break;

      // eslint-disable-next-line no-inner-declarations
      function getArrDestIdent(leafExpr: DestructuringAssignmentExpression | DestructuringAssignmentSingleExpression | DestructuringAssignmentRestExpression): [raw: string, ident: string] {
        switch (leafExpr.$kind) {
          case 'DestructuringAssignmentLeaf': {
            const rawIdentifier = leafExpr.target.name;
            const identifier = ctx.getIdentifier(rawIdentifier, IdentifierInstruction.AddToOverrides)!;
            return [rawIdentifier, identifier];
          }
          default: throw new Error(`Unsupported declaration kind: ${keyAssignLeaf.$kind}`);
        }
      }
    }
    default: {
      const rawDecIdentifier = Unparser.unparse(expr.declaration);
      const decIdentifier = ctx.getIdentifier(rawDecIdentifier, IdentifierInstruction.AddToOverrides)!;

      ctx.accessTypeParts.push((acc) => `${acc} & { ${decIdentifier}: CollectionElement<${propAccExpr}> }`);
      declaration = () => `\${${ctx.accessIdentifier}(${ctx.createLambdaExpression([decIdentifier])}, '${rawDecIdentifier}')}`;

      break;
    }
  }

  ctx.toReplace.push({
    loc: node.sourceCodeLocation!.attrs![attr.name],
    modifiedContent: () => `${attr.name}="${declaration()} of ${iterable()}"`,
  });

  traverseDepth(node, ctx);
  return true;
}

function tryProcessPromise(syntax: AttrSyntax, attr: Token.Attribute, node: DefaultTreeElement, ctx: TypeCheckingContext): [processed: boolean, processChild: void | false] {
  const target = syntax.target;
  switch (target) {
    case 'promise': {
      ctx.pushScope('promise');
      const value = attr.value.length === 0 ? target : attr.value;
      const expr = ctx.exprParser.parse(value, 'None');
      // TODO: handle primitive literal
      if (expr != null) {
        const [_expr] = mutateAccessScope(expr, ctx, member => ctx.getIdentifier(member, IdentifierInstruction.SkipGeneration | IdentifierInstruction.Promise) ?? member);
        addReplaceParts(_expr, value);
      }

      traverseDepth(node, ctx);
      return [true, false];
    }
    case 'then': {
      ctx.pushScope('none');
      const value = attr.value.length === 0 ? target : attr.value;
      const expr = ctx.exprParser.parse(value, 'None');
      if (expr != null) {
        const [_expr] = mutateAccessScope(expr, ctx, member => {
          const newName = ctx.getIdentifier(member, IdentifierInstruction.AddToOverrides)!;
          ctx.addPromiseResolvedProperty(newName);
          return newName;
        });
        addReplaceParts(_expr, value);
      }
      traverseDepth(node, ctx);
      return [true, false];
    }
    case 'catch': {
      ctx.pushScope('none');
      const value = attr.value.length === 0 ? target : attr.value;
      const expr = ctx.exprParser.parse(value, 'None');
      if (expr != null) {
        const [_expr] = mutateAccessScope(expr, ctx, member => {
          const newName = ctx.getIdentifier(member, IdentifierInstruction.AddToOverrides)!;
          ctx.accessTypeParts.push((acc) => `${acc} & { ${newName}: any }`);
          return newName;
        });
        addReplaceParts(_expr, value);
      }
      traverseDepth(node, ctx);
      return [true, false];
    }
    default: return [false, void 0];
  }

  function addReplaceParts(_expr: IsAssign, value: string): void {
    ctx.toReplace.push({
      loc: node.sourceCodeLocation!.attrs![attr.name],
      modifiedContent: () => `${attr.name}="\${${ctx.accessIdentifier}(${ctx.createLambdaExpression(_expr)}, '${value}')}"`
    });
  }
}

const rangeIterableIdentifier = '__TypeCheck_RangeIterable__';
function processNode(node: DefaultTreeElement | DefaultTreeTextNode, ctx: TypeCheckingContext): void | false {
  let retVal: void | false = void 0;
  if ('tagName' in node) {
    node.attrs?.forEach(attr => {
      const syntax = ctx.attrParser.parse(attr.name, attr.value);
      if (tryProcessRepeat(syntax, attr, node, ctx)) retVal = false;
      else {
        let promisedProcessed: boolean;
        [promisedProcessed, retVal] = tryProcessPromise(syntax, attr, node, ctx);
        if (!promisedProcessed && syntax.command) {
          const value = attr.value.length === 0 ? syntax.target : attr.value;

          const expr = ctx.exprParser.parse(value, 'None');
          if (expr == null) return;

          const [_expr] = mutateAccessScope(expr, ctx, member => ctx.getIdentifier(member, IdentifierInstruction.SkipGeneration) ?? member);
          if (_expr.$kind === 'PrimitiveLiteral') return;

          ctx.toReplace.push({
            loc: node.sourceCodeLocation!.attrs![attr.name],
            modifiedContent: () => `${attr.name}="\${${ctx.accessIdentifier}(${ctx.createLambdaExpression(_expr)}, '${value}')}"`
          });
        }
      }
    });
  } else if (node.nodeName === '#text') {
    const expr = ctx.exprParser.parse(node.value, 'Interpolation');

    if (expr != null) {
      const htmlFactories: (() => string)[] = [() => expr.parts[0]];

      expr.expressions.forEach((part, idx) => {
        const originalExpr = part;
        [part] = mutateAccessScope(part, ctx, member => ctx.getIdentifier(member, IdentifierInstruction.SkipGeneration) ?? member);
        htmlFactories.push(
          () => `\${${ctx.accessIdentifier}(${ctx.createLambdaExpression(part)}, '${escape(unparse(originalExpr))}')}`,
          () => expr.parts[idx + 1]
        );
      });

      ctx.toReplace.push({
        loc: node.sourceCodeLocation!,
        modifiedContent: () => htmlFactories.map(factory => factory()).join('')
      });
    }
  }
  return retVal;
}

function escape(s: string): string {
  return s.replace(/'/g, '\\\'');
}
function unparse(expr: IsBindingBehavior): string {
  return Unparser.unparse(expr);
}

const contextualRepeatProperties = ['$index', '$first', '$last', '$even', '$odd', '$length'] as readonly string[];
function mutateAccessScope(expr: IsBindingBehavior, ctx: TypeCheckingContext, memberNameResolver: (member: string) => string, needsPath: true): [expr: IsAssign, path: string[]];
function mutateAccessScope(expr: IsBindingBehavior, ctx: TypeCheckingContext, memberNameResolver: (member: string) => string): [expr: IsAssign, null];
function mutateAccessScope(expr: IsBindingBehavior, ctx: TypeCheckingContext, memberNameResolver: (member: string) => string, needsPath: boolean = false): [expr: IsAssign, path: string[] | null] {
  while (expr.$kind === 'ValueConverter' || expr.$kind === 'BindingBehavior') {
    expr = expr.expression;
  }

  if ((expr.$kind === 'AccessScope' || expr.$kind === 'AccessMember') && contextualRepeatProperties.includes(expr.name)) {
    ctx.hasRepeatContextualProperties = true;
    if (needsPath) throw new Error('Not supported');
    return [new AccessScopeExpression(expr.name, 0), null];
  }
  // traverse to the root vm property and rename if required
  expr = structuredClone(expr);
  let object: IsLeftHandSide = expr as IsLeftHandSide;
  const path: string[] | null = needsPath ? [] : null;
  if (object.$kind === 'AccessScope' && object.ancestor === 0) {
    const member = object.name;
    const prop = (object as Writable<AccessScopeExpression>).name = memberNameResolver(member);
    path?.push(prop);
  } else {
    while (!isAccessGlobal(object) && (object.$kind === 'CallMember' || object.$kind === 'AccessMember' || object.$kind === 'AccessKeyed')) {
      switch (object.$kind) {
        case 'AccessMember': path?.push(object.name); break;
        case 'AccessKeyed': {
          if (object.key.$kind === 'AccessScope' && object.key.ancestor === 0) {
            const member = object.key.name;
            const overriddenMember = memberNameResolver(member);
            (object as Writable<AccessKeyedExpression>).key = ctx.createMemberAccessExpression(overriddenMember);
          }
          break;
        }
        default: break;
      }
      object = object.object;
      if (object.$kind === 'AccessScope' && object.ancestor === 0) {
        const member = object.name;
        const prop = (object as Writable<AccessScopeExpression>).name = memberNameResolver(member);
        path?.push(prop);
        break;
      }
    }
  }
  return [expr, path?.reverse() ?? null];
}

function isAccessGlobal(ast: IsLeftHandSide): boolean {
  return ast.$kind === 'AccessGlobal' ||
    (
      ast.$kind === 'AccessMember' ||
      ast.$kind === 'AccessKeyed'
    ) && ast.accessGlobal;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function traverse(tree: any, cb: (node: DefaultTreeElement | DefaultTreeTextNode) => void | false): void {
  // eslint-disable-next-line
  tree.childNodes.forEach((n: any) => {
    const ne = n as DefaultTreeElement;
    // skip <template as-custom-element="..">
    if (ne.tagName === 'template' && ne.attrs.some(attr => attr.name === 'as-custom-element')) return;

    const processChild = cb(ne);
    if (processChild === false) return;

    if (n.childNodes) traverse(n, cb);
    if ((n as Template).content?.childNodes) traverse(n.content, cb);
  });
}
