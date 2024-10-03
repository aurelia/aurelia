import { DI } from '@aurelia/kernel';
import { ExpressionParser, Unparser } from '@aurelia/expression-parser';
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
type Location = Token.ElementLocation;

const reservedPrimitiveLiterals: readonly string[] = ['true', 'false', 'null', 'undefined', ''];

export function createTypeCheckedTemplate(rawHtml: string, classNames: string[], isJs: boolean): string {
  const accessTypeParts: ((acc: string) => string)[] = [() => `(${classNames.join('|')})`];
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

  const toReplace: { loc: Location; modifiedContent: () => string }[] = [];
  traverse(tree, processNode);

  const accessType = accessTypeParts.reduce((acc: string, part) => part(acc), '');
  const accessIdent = `access${isJs ? '' : `<${accessType}>`}`;
  let html = '';
  let lastIndex = 0;
  toReplace.forEach(({ loc, modifiedContent }) => {
    html += rawHtml.slice(lastIndex, loc.startOffset) + modifiedContent(); // + rawHtml.slice(loc.endOffset);
    lastIndex = loc.endOffset;
  });

  const output = `function __typecheck_template_${classNames.join('_')}__() {
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

  function processNode(node: DefaultTreeElement | DefaultTreeTextNode): void {
    if ('tagName' in node) {
      node.attrs?.forEach(attr => {
        const syntax = attrParser.parse(attr.name, attr.value);
        if (syntax.command) {
          if (syntax.command === 'for') {
            const expr = exprParser.parse(attr.value, 'IsIterator');
            const decIdent = Unparser.unparse(expr.declaration);
            const iterIdent = Unparser.unparse(expr.iterable);
            const propAccExpr = (acc: string) => `${acc}['${iterIdent}']`;

            accessTypeParts.push((acc) => {
              const accExpr = propAccExpr(acc);
              return `${acc} & { ${decIdent}: ${accExpr}[CollectionPropertyKey<${accExpr}>] }`;
            });
            const declaration = () => `\${${accessIdent}(o => o.${decIdent}, '${decIdent}')}`;
            const iterable = () => `\${${accessIdent}(o => o.${iterIdent}, '${iterIdent}')}`;

            toReplace.push({
              loc: node.sourceCodeLocation!.attrs![attr.name],
              modifiedContent: () => `${attr.name}="${declaration()} of ${iterable()}"`,
            });
          } else {
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
        toReplace.push({
          loc: node.sourceCodeLocation!, modifiedContent: () => {
            let html = expr.parts[0];
            expr.expressions.forEach((part, idx) => {
              const originalExpr = part;
              while (part.$kind === 'ValueConverter' || part.$kind === 'BindingBehavior') {
                part = part.expression;
              }
              html += `\${${accessIdent}(o => o.${Unparser.unparse(part).replace(/^\(|\)$/g, '')}, '${Unparser.unparse(originalExpr).replace(/^\(|\)$/g, '')}')}`;
              html += expr.parts[idx + 1];
            });
            return html;
          }
        });
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function traverse(tree: any, cb: (node: DefaultTreeElement | DefaultTreeTextNode) => void) {
  // eslint-disable-next-line
  tree.childNodes.forEach((n: any) => {
    const ne = n as DefaultTreeElement;
    // skip <template as-custom-element="..">
    if (ne.tagName === 'template' && ne.attrs.some(attr => attr.name === 'as-custom-element')) return;

    cb(ne);

    if (n.childNodes) traverse(n, cb);
    // For <template> tag
    if (n.content?.childNodes) traverse(n.content, cb);
  });
}
