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

export function createTypeCheckedTemplate(rawHtml: string, viewModelClassName: string) {
  const accessType = viewModelClassName.length !== 0 ? `<${viewModelClassName}>`: '';
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
  traverse(tree, node => {
    if ('tagName' in node) {
      node.attrs?.forEach(attr => {
        const syntax = attrParser.parse(attr.name, attr.value);
        if (syntax.command) {
          if (syntax.command === 'for') {
            const expr = exprParser.parse(attr.value, 'IsIterator');
            const declaration = `\${access<${viewModelClassName} & { ${Unparser.unparse(expr.declaration)}: ${viewModelClassName}['${Unparser.unparse(expr.iterable)}'] }>(o => o.${Unparser.unparse(expr.declaration)}, '${Unparser.unparse(expr.declaration)}')}`;
            const iterable = `\${access${accessType}['${Unparser.unparse(expr.iterable)}']>(o => o.${Unparser.unparse(expr.iterable)}, '${Unparser.unparse(expr.iterable)}')}`;

            toReplace.push({
              loc: node.sourceCodeLocation!.attrs![attr.name],
              modifiedContent: `${attr.name}="${declaration} of ${iterable}"`,
            });
          } else {
            const value = attr.value.length === 0 ? syntax.target : attr.value;
            toReplace.push({
              loc: node.sourceCodeLocation!.attrs![attr.name],
              modifiedContent: `${attr.name}="\${access${accessType}(o => o.${value}, '${value}')}"`
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
          html += `\${access${accessType}(o => o.${Unparser.unparse(part).replace(/^\(|\)$/g, '')}, '${Unparser.unparse(originalExpr).replace(/^\(|\)$/g, '')}')}`;
          html += expr.parts[idx + 1];
        });
        toReplace.push({ loc: node.sourceCodeLocation!, modifiedContent: html });
      }
    }
  });

  let html = '';
  let lastIndex = 0;
  toReplace.forEach(({ loc, modifiedContent }) => {
    html += rawHtml.slice(lastIndex, loc.startOffset) + modifiedContent; // + rawHtml.slice(loc.endOffset);
    lastIndex = loc.endOffset;
  });

  return html;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function traverse(tree: any, cb: (node: DefaultTreeElement | DefaultTreeTextNode) => void) {
  // eslint-disable-next-line
  tree.childNodes.forEach((n: any) => {
    const ne = n as DefaultTreeElement;
    // skip <template as-custom-element="..">
    if (ne.tagName === 'template' && ne.attrs.some(attr => attr.name === 'as-custom-element')) {
      return;
    }
    cb(ne);
    if (n.childNodes) traverse(n, cb);
    // For <template> tag
    if (n.content?.childNodes) traverse(n.content, cb);
  });
}
