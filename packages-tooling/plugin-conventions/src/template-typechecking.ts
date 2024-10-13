import { DI, Writable } from '@aurelia/kernel';
import { AccessScopeExpression, DestructuringAssignmentExpression, DestructuringAssignmentRestExpression, DestructuringAssignmentSingleExpression, ExpressionParser, IsLeftHandSide, Unparser } from '@aurelia/expression-parser';
import {
  DotSeparatedAttributePattern,
  EventAttributePattern,
  RefAttributePattern,
  AtPrefixedTriggerAttributePattern,
  ColonPrefixedBindAttributePattern,
  IAttributeParser
} from '@aurelia/template-compiler';
import { parseFragment } from 'parse5';
import type { DefaultTreeAdapterMap, Token } from 'parse5';
import { modifyCode } from './modify-code';
import { ClassMetadata } from './preprocess-resource';

type DefaultTreeElement = DefaultTreeAdapterMap['element'];
type DefaultTreeTextNode = DefaultTreeAdapterMap['textNode'];
type Template = DefaultTreeAdapterMap['template'];
type Location = Token.ElementLocation;

const reservedPrimitiveLiterals: readonly string[] = ['true', 'false', 'null', 'undefined', ''];

export function prependUtilityTypes(m: ReturnType<typeof modifyCode>, isJs: boolean) {
  m.prepend(`// @ts-check
${isJs
      ?
      `/**
  * @template TCollection
  * @typedef {TCollection extends Array<infer TElement> ? TElement : TCollection extends Set<infer TElement> ? TElement : TCollection extends Map<infer TKey, infer TValue> ? [TKey, TValue] : never} CollectionElement
  */`
      :
      `type CollectionElement<TCollection> = TCollection extends Array<infer TElement>
      ? TElement
      : TCollection extends Set<infer TElement>
        ? TElement
        : TCollection extends Map<infer TKey, infer TValue>
          ? [TKey, TValue]
          : never;`}
`
  );
}

class TypeCheckingContext {
  // TODO: this is a bit of mess and should a part of the repeat stack frame; keeping it like it is for now to avoid premature optimization
  public readonly overriddenIdentMap: Map<string, string> = new Map();
  public readonly decIdentMap: Map<string, number> = new Map();
  public readonly toReplace: { loc: Location; modifiedContent: () => string }[] = [];
  public readonly classUnion: string;
  public readonly accessTypeParts: ((acc: string) => string)[];
  public readonly accessTypeIdentifier: string;
  public readonly accessIdent: string;

  private _accessType: string | undefined = void 0;
  public get accessType(): string { return this._accessType ??= this.accessTypeParts.reduce((acc: string, part) => part(acc), ''); }

  public constructor(
    public readonly attrParser: IAttributeParser,
    public readonly exprParser: ExpressionParser,
    public readonly classes: ClassMetadata[],
    public readonly isJs: boolean,
  ) {
    const classNames = classes.map(c => c.name);
    this.classUnion = `(${classNames.join('|')})`;
    this.accessTypeParts = [() => this.classUnion];
    this.accessTypeIdentifier = `__Template_Type_${classNames.join('_')}__`;
    this.accessIdent = `access${isJs ? '' : `<${this.accessTypeIdentifier}>`}`;
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

  public getIdentifier(ident: string): string {
    if (this.classes.some(c => c.members.includes(ident))) return ident;
    if (this.overriddenIdentMap.has(ident)) return this.overriddenIdentMap.get(ident)!;

    const lookup = this.decIdentMap;
    let count = lookup.get(ident) ?? 0;
    lookup.set(ident, ++count);
    return `${ident}${count}`;
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

function processNode(node: DefaultTreeElement | DefaultTreeTextNode, ctx: TypeCheckingContext): void | false {
  let retVal: void | false = void 0;
  if ('tagName' in node) {
    node.attrs?.forEach(attr => {
      const syntax = ctx.attrParser.parse(attr.name, attr.value);
      if (syntax.command) {
        if (syntax.command === 'for') {
          const expr = ctx.exprParser.parse(attr.value, 'IsIterator');

          // TODO: move this to the context class; the cleanup should be something like the frame push and pop
          const overriddenIdents: string[] = [];

          const rawIterIdent = Unparser.unparse(expr.iterable);
          const iterIdent = ctx.getIdentifier(rawIterIdent);
          ctx.overriddenIdentMap.set(rawIterIdent, iterIdent);
          overriddenIdents.push(rawIterIdent);
          const propAccExpr = `${ctx.accessTypeIdentifier}['${iterIdent}']`;

          let declaration: () => string;
          switch (expr.declaration.$kind) {
            // if this is an array destructuring, it only means that it is a map, as that is the only collection type supported for repeat.for
            case 'ArrayDestructuring': {
              const [keyAssignLeaf, valueAssignLeaf] = expr.declaration.list;
              const [rawKeyIdent, keyIdent] = getArrDestIdent(keyAssignLeaf);
              const [rawValueIdent, valueIdent] = getArrDestIdent(valueAssignLeaf);

              ctx.accessTypeParts.push((acc) => `${acc} & { ${keyIdent}: CollectionElement<${propAccExpr}>[0], ${valueIdent}: CollectionElement<${propAccExpr}>[1] }`);
              declaration = () => `\${${ctx.accessIdent}(o => (o.${keyIdent},o.${valueIdent}), '[${rawKeyIdent},${rawValueIdent}]')}`;
              break;

              // eslint-disable-next-line no-inner-declarations
              function getArrDestIdent(leafExpr: DestructuringAssignmentExpression | DestructuringAssignmentSingleExpression | DestructuringAssignmentRestExpression): [raw: string, ident: string] {
                switch (leafExpr.$kind) {
                  case 'DestructuringAssignmentLeaf': {
                    const rawIdent = leafExpr.target.name;
                    const ident = ctx.getIdentifier(rawIdent);
                    ctx.overriddenIdentMap.set(rawIdent, ident);
                    overriddenIdents.push(rawIdent);
                    return [rawIdent, ident];
                  }
                  default: throw new Error(`Unsupported declaration kind: ${keyAssignLeaf.$kind}`);
                }
              }
            }
            default: {
              const rawDecIdent = Unparser.unparse(expr.declaration);
              const decIdent = ctx.getIdentifier(rawDecIdent);
              ctx.overriddenIdentMap.set(rawDecIdent, decIdent);

              ctx.accessTypeParts.push((acc) => `${acc} & { ${decIdent}: CollectionElement<${propAccExpr}> }`);
              declaration = () => `\${${ctx.accessIdent}(o => o.${decIdent}, '${rawDecIdent}')}`;

              overriddenIdents.push(rawDecIdent);
              break;
            }
          }

          const iterable = () => `\${${ctx.accessIdent}(o => o.${iterIdent}, '${rawIterIdent}')}`;

          ctx.toReplace.push({
            loc: node.sourceCodeLocation!.attrs![attr.name],
            modifiedContent: () => `${attr.name}="${declaration()} of ${iterable()}"`,
          });

          // drill down
          if (node.childNodes) traverse(node, n => processNode(n, ctx));
          // For <template> tag
          if ((node as Template).content?.childNodes) traverse((node as Template).content, n => processNode(n, ctx));

          for (const key of overriddenIdents) {
            ctx.overriddenIdentMap.delete(key);
          }
          retVal = false;
        } else {
          // TODO: same stuff as in the #text node??
          const value = attr.value.length === 0 ? syntax.target : attr.value;
          if (reservedPrimitiveLiterals.includes(value)) return;
          ctx.toReplace.push({
            loc: node.sourceCodeLocation!.attrs![attr.name],
            modifiedContent: () => `${attr.name}="\${${ctx.accessIdent}(o => o.${value}, '${value}')}"`
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
        while (part.$kind === 'ValueConverter' || part.$kind === 'BindingBehavior') {
          part = part.expression;
        }

        // traverse to the root vm property and rename if required
        part = structuredClone(part);
        let object: IsLeftHandSide = part as IsLeftHandSide;
        if (object.$kind === 'AccessScope' && object.ancestor === 0) {
          const member = object.name;
          (object as Writable<AccessScopeExpression>).name = ctx.overriddenIdentMap.get(member) ?? member;
        } else {
          while (!isAccessGlobal(object) && (object.$kind === 'CallMember' || object.$kind === 'AccessMember' || object.$kind === 'AccessKeyed')) {
            object = object.object;
            if (object.$kind === 'AccessScope' && object.ancestor === 0) {
              const member = object.name;
              (object as Writable<AccessScopeExpression>).name = ctx.overriddenIdentMap.get(member) ?? member;
              break;
            }
          }
        }
        htmlFactories.push(
          () => `\${${ctx.accessIdent}(o => o.${Unparser.unparse(part).replace(/^\(|\)$/g, '')}, '${Unparser.unparse(originalExpr).replace(/^\(|\)$/g, '')}')}`,
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
