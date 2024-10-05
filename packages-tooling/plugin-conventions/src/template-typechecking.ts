import { DI, Writable } from '@aurelia/kernel';
import { AccessScopeExpression, ExpressionParser, IsLeftHandSide, Unparser } from '@aurelia/expression-parser';
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

type DefaultTreeElement = DefaultTreeAdapterMap['element'];
type DefaultTreeTextNode = DefaultTreeAdapterMap['textNode'];
type Template = DefaultTreeAdapterMap['template'];
type Location = Token.ElementLocation;

const reservedPrimitiveLiterals: readonly string[] = ['true', 'false', 'null', 'undefined', ''];

export function createTypeCheckedTemplate(rawHtml: string, classNames: string[], isJs: boolean): string {
  const classUnion = `(${classNames.join('|')})`;
  const accessTypeParts: ((acc: string) => string)[] = [() => classUnion];

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

  const overriddenIdentMap: Map<string, string> = new Map();
  const decIdentMap: Map<string, number> = new Map();

  const toReplace: { loc: Location; modifiedContent: () => string }[] = [];
  traverse(tree, processNode);

  const accessType = accessTypeParts.reduce((acc: string, part) => part(acc), '');
  const accessTypeIdentifier = `__Access_Type_${classNames.join('_')}__`;
  const accessIdent = `access${isJs ? '' : `<${accessTypeIdentifier}>`}`;
  let html = '';
  let lastIndex = 0;
  toReplace.forEach(({ loc, modifiedContent }) => {
    html += rawHtml.slice(lastIndex, loc.startOffset) + modifiedContent(); // + rawHtml.slice(loc.endOffset);
    lastIndex = loc.endOffset;
  });
  html += rawHtml.slice(lastIndex);

  const output = `
${isJs ? '' : `type ${accessTypeIdentifier} = ${accessType};`}
function __typecheck_template_${classNames.join('_')}__() {
  ${isJs
      ? `
  /**
   * @template {${accessType}} T
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

  function processNode(node: DefaultTreeElement | DefaultTreeTextNode): void | false {
    let retVal: void | false = void 0;
    if ('tagName' in node) {
      node.attrs?.forEach(attr => {
        const syntax = attrParser.parse(attr.name, attr.value);
        if (syntax.command) {
          if (syntax.command === 'for') {
            const expr = exprParser.parse(attr.value, 'IsIterator');

            const rawDecIdent = Unparser.unparse(expr.declaration);
            const decIdent = getIdentifier(rawDecIdent);
            overriddenIdentMap.set(rawDecIdent, decIdent);

            const iterIdent = Unparser.unparse(expr.iterable);
            const propAccExpr = () => `${classUnion}['${iterIdent}']`;

            accessTypeParts.push((acc) => {
              const accExpr = propAccExpr();
              return `${acc} & { ${decIdent}: ${accExpr}[CollectionPropertyKey<${accExpr}>] }`;
            });
            const declaration = () => `\${${accessIdent}(o => o.${decIdent}, '${rawDecIdent}')}`;
            const iterable = () => `\${${accessIdent}(o => o.${iterIdent}, '${iterIdent}')}`;

            toReplace.push({
              loc: node.sourceCodeLocation!.attrs![attr.name],
              modifiedContent: () => `${attr.name}="${declaration()} of ${iterable()}"`,
            });

            // drill down
            if (node.childNodes) traverse(node, processNode);
            // For <template> tag
            if ((node as Template).content?.childNodes) traverse((node as Template).content, processNode);

            overriddenIdentMap.delete(rawDecIdent);
            retVal = false;
          } else {
            // TODO: same stuff as in the #text node??
            const value = attr.value.length === 0 ? syntax.target : attr.value;
            if (reservedPrimitiveLiterals.includes(value)) return;
            toReplace.push({
              loc: node.sourceCodeLocation!.attrs![attr.name],
              modifiedContent: () => `${attr.name}="\${${accessIdent}(o => o.${value}, '${value}')}"`
            });
          }
        }
      });
    } else if (node.nodeName === '#text') {
      const expr = exprParser.parse(node.value, 'Interpolation');

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
          while (!isAccessGlobal(object) && (object.$kind === 'CallMember' || object.$kind === 'AccessMember' || object.$kind === 'AccessKeyed')) {
            object = object.object;
            if (object.$kind === 'AccessScope' && object.ancestor === 0) {
              const member = object.name;
              (object as Writable<AccessScopeExpression>).name = overriddenIdentMap.get(member) ?? member;
              break;
            }
          }
          htmlFactories.push(
            () => `\${${accessIdent}(o => o.${Unparser.unparse(part).replace(/^\(|\)$/g, '')}, '${Unparser.unparse(originalExpr).replace(/^\(|\)$/g, '')}')}`,
            () => expr.parts[idx + 1]
          );
        });

        toReplace.push({
          loc: node.sourceCodeLocation!,
          modifiedContent: () => htmlFactories.map(factory => factory()).join('')
        });
      }
    }
    return retVal;
  }

  function getIdentifier(ident: string): string {
    let count = decIdentMap.get(ident) ?? 0;
    decIdentMap.set(ident, ++count);
    return `${ident}${count}`;
  }

  function isAccessGlobal(ast: IsLeftHandSide): boolean {
    return ast.$kind === 'AccessGlobal' ||
      (
        ast.$kind === 'AccessMember' ||
        ast.$kind === 'AccessKeyed'
      ) && ast.accessGlobal;
  }
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
