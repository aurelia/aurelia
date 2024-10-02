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

export function createTypeCheckedTemplate(rawHtml: string, viewModelClassName: string) {
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

  const toReplace: { loc: Location; modifiedContent: string }[] = [];
  traverse(tree, processNode);

  let html = '';
  let lastIndex = 0;
  toReplace.forEach(({ loc, modifiedContent }) => {
    html += rawHtml.slice(lastIndex, loc.startOffset) + modifiedContent; // + rawHtml.slice(loc.endOffset);
    lastIndex = loc.endOffset;
  });

  return html;

  function processNode(node: DefaultTreeElement | DefaultTreeTextNode, type: string | null = null): void | false {
    type ??= viewModelClassName.length !== 0 ? viewModelClassName : '';
    let retVal: void | false = void 0;
    if ('tagName' in node) {
      node.attrs?.forEach(attr => {
        const syntax = attrParser.parse(attr.name, attr.value);
        if (syntax.command) {
          if (syntax.command === 'for') {
            const expr = exprParser.parse(attr.value, 'IsIterator');
            const decIdent = Unparser.unparse(expr.declaration);
            const iterIdent = Unparser.unparse(expr.iterable);
            const propAccExpr = `${type}['${iterIdent}']`;
            const decType = `${type} & { ${decIdent}: ${propAccExpr}[CollectionPropertyKey<${propAccExpr}>] }`;
            const declaration = `\${access<${decType}>(o => o.${decIdent}, '${decIdent}')}`;
            const iterable = `\${access<${type}>(o => o.${iterIdent}, '${iterIdent}')}`;

            toReplace.push({
              loc: node.sourceCodeLocation!.attrs![attr.name],
              modifiedContent: `${attr.name}="${declaration} of ${iterable}"`,
            });

            if (node.childNodes) traverse(node, (nd) => processNode(nd, decType));
            // For <template> tag
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((node as any).content?.childNodes) traverse((node as any).content, (nd) => processNode(nd, decType));

            retVal = false;
          } else {
            const value = attr.value.length === 0 ? syntax.target : attr.value;
            if (reservedPrimitiveLiterals.includes(value)) return;
            toReplace.push({
              loc: node.sourceCodeLocation!.attrs![attr.name],
              modifiedContent: `${attr.name}="\${access<${type}>(o => o.${value}, '${value}')}"`
            });
          }
        }
      });
    } else if (node.nodeName === '#text') {
      const expr = exprParser.parse(node.value, 'Interpolation');

      if (expr != null) {
        let html = expr.parts[0];
        expr.expressions.forEach((part, idx) => {
          const originalExpr = part;
          while (part.$kind === 'ValueConverter' || part.$kind === 'BindingBehavior') {
            part = part.expression;
          }
          html += `\${access<${type}>(o => o.${Unparser.unparse(part).replace(/^\(|\)$/g, '')}, '${Unparser.unparse(originalExpr).replace(/^\(|\)$/g, '')}')}`;
          html += expr.parts[idx + 1];
        });
        toReplace.push({ loc: node.sourceCodeLocation!, modifiedContent: html });
      }
    }
    return retVal;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function traverse(tree: any, cb: (node: DefaultTreeElement | DefaultTreeTextNode) => void | false) {
  // eslint-disable-next-line
  tree.childNodes.forEach((n: any) => {
    const ne = n as DefaultTreeElement;
    // skip <template as-custom-element="..">
    if (ne.tagName === 'template' && ne.attrs.some(attr => attr.name === 'as-custom-element')) return;

    const processChildren = cb(ne);
    if (processChildren === false) return;

    if (n.childNodes) traverse(n, cb);
    // For <template> tag
    if (n.content?.childNodes) traverse(n.content, cb);
  });
}
