import { parseFragment } from 'parse5';
import type { DefaultTreeAdapterMap, Token } from 'parse5';
import type { IAttributeParser } from '@aurelia/template-compiler';
import { IsExpressionOrStatement, Unparser } from '@aurelia/expression-parser';

import type { OverlayPlanModule } from '../analysis/types';
import type { ScopeModule, FrameId } from '../scope-graph/types';
import { IExpressionParser } from '../ir/build';

type DefaultTreeElement = DefaultTreeAdapterMap['element'];
type DefaultTreeTextNode = DefaultTreeAdapterMap['textNode'];
type Template = DefaultTreeAdapterMap['template'];
type Location = Token.ElementLocation;

const ALLOWED_LET_BINDING_CMDS = ['bind', 'one-time', 'to-view', 'two-way'] as const;

export function emitHtmlOverlay(
  rawHtml: string,
  plan: OverlayPlanModule,
  scope: ScopeModule,
  parsers: { readonly attrParser: IAttributeParser; readonly exprParser: IExpressionParser },
  {
    isJs,
    functionName,
  }: { readonly isJs: boolean; readonly functionName: string },
): string {
  const out: string[] = [];

  const t = plan.templates[0];
  const sg = scope.templates[0];
  if (!t || !sg) return '';

  // 1) TS: per-frame aliases
  if (!isJs) {
    for (const f of t.frames) {
      out.push(`type ${f.typeName} = ${f.typeExpr};`);
    }
  }

  // 2) Build factories in source order
  type CallFactory = (code: string) => string;

  const frames = new Map<FrameId, { typeName: string; lambdas: readonly string[]; idx: number }>();
  for (const f of t.frames) frames.set(f.frame, { typeName: f.typeName, lambdas: f.lambdas, idx: 0 });

  const callFactories: CallFactory[] = [];
  for (const [, fid] of Object.entries(sg.exprToFrame)) {
    const fp = frames.get(fid);
    if (!fp) continue;

    const nextLambda = fp.lambdas[fp.idx++] ?? 'o => o';
    const typeName = fp.typeName;

    if (isJs) {
      callFactories.push((code) => {
        const normalized = normalizeLambdaForThis(nextLambda, code);
        return `\${access(${jsCastedLambda(normalized, typeName)}, ${JSON.stringify(code)})}`;
      });
    } else {
      callFactories.push((code) => {
        const normalized = normalizeLambdaForThis(nextLambda, code);
        return `\${access<${typeName}>(${normalized}, ${JSON.stringify(code)})}`;
      });
    }
  }

  const take = (code: string): string => {
    const f = callFactories.shift();
    // Defensive fallback to keep template valid if analysis/counts ever diverge
    return f ? f(code) : `\${access((_o) => void 0, ${JSON.stringify(code)})}`;
  };

  // 3) Collect replacements
  const toReplace: { readonly loc: Location; readonly build: () => string }[] = [];
  const tree = parseFragment(rawHtml, { sourceCodeLocationInfo: true }) as DefaultTreeElement;

  traverse(tree, (node) => processNode(node, toReplace, take, parsers), parsers);

  // 4) Splice replacements back into the original HTML
  toReplace.sort((a, b) => a.loc.startOffset - b.loc.startOffset);

  let html = '';
  let last = 0;
  for (const r of toReplace) {
    html += rawHtml.slice(last, r.loc.startOffset) + r.build();
    last = r.loc.endOffset;
  }
  html += rawHtml.slice(last);

  // 5) Emit the function wrapper (TS vs JS)
  if (isJs) {
    out.push(
      `function ${functionName}() {`,
      `  /**`,
      `   * @template T`,
      `   * @param {(o: T) => unknown} typecheck`,
      `   * @param {string} expr`,
      `   * @returns {string}`,
      `   */`,
      `  const access = (typecheck, expr) => expr;`,
      `  return \`${html}\`;`,
      `}`
    );
  } else {
    out.push(
      `function ${functionName}(): string {`,
      `  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string): string => expr;`,
      `  return \`${html}\`;`,
      `}`
    );
  }

  return `${out.join('\n')}\n`;
}

/* ========================================================================== */
/* Traversal & site detection                                                  */
/* ========================================================================== */

function processNode(
  node: DefaultTreeElement | DefaultTreeTextNode,
  toReplace: { readonly loc: Location; readonly build: () => string }[],
  take: (code: string) => string,
  parsers: { readonly attrParser: IAttributeParser; readonly exprParser: IExpressionParser },
): void | false {
  const { attrParser, exprParser } = parsers;

  if ('tagName' in node) {
    // Skip <template as-custom-element="...">
    if (node.tagName === 'template' && node.attrs.some(a => a.name === 'as-custom-element')) return;

    // <let ...>
    if (node.tagName === 'let') {
      const attrsLoc = node.sourceCodeLocation!.attrs!;
      for (const attr of node.attrs) {
        if (attr.name === 'to-binding-context') continue;

        const { target, command } = attrParser.parse(attr.name, attr.value);
        if (!command || !ALLOWED_LET_BINDING_CMDS.includes(command as (typeof ALLOWED_LET_BINDING_CMDS)[number])) continue;

        const value = attr.value.length === 0 ? target : attr.value;
        const ast = exprParser.parse(value, 'None');
        if (ast == null || ast.$kind === 'PrimitiveLiteral') continue;

        const loc = attrsLoc[attr.name];
        toReplace.push({
          loc,
          build: () => `${attr.name}="${take(value)}"`,
        });
      }
      return false;
    }

    // Attribute-based bindings
    const attrsLoc = node.sourceCodeLocation!.attrs!;
    for (const attr of node.attrs ?? []) {
      const syntax = attrParser.parse(attr.name, attr.value);

      // repeat.for
      if (syntax.command === 'for') {
        const iter = exprParser.parse(attr.value, 'IsIterator');
        if (iter != null) {
          const declCode = Unparser.unparse(iter.declaration as IsExpressionOrStatement);
          const iterableCode = Unparser.unparse(iter.iterable as IsExpressionOrStatement);
          const loc = attrsLoc[attr.name];
          toReplace.push({
            loc,
            build: () => `${attr.name}="${take(declCode)} of ${take(iterableCode)}"`,
          });
        }
        continue;
      }

      // with / promise / then / catch
      if (syntax.target === 'with' || syntax.target === 'promise' || syntax.target === 'then' || syntax.target === 'catch') {
        const value = attr.value.length === 0 ? syntax.target : attr.value;
        const loc = attrsLoc[attr.name];
        toReplace.push({
          loc,
          build: () => `${attr.name}="${take(value)}"`,
        });
        continue;
      }

      // Generic command (skip primitives)
      if (syntax.command) {
        const value = attr.value.length === 0 ? syntax.target : attr.value;
        const ast = parsers.exprParser.parse(value, 'None');
        if (ast == null || ast.$kind === 'PrimitiveLiteral') continue;

        const loc = attrsLoc[attr.name];
        toReplace.push({
          loc,
          build: () => `${attr.name}="${take(value)}"`,
        });
      }
    }
  } else if (node.nodeName === '#text') {
    // Interpolations
    const interp = parsers.exprParser.parse(node.value, 'Interpolation');
    if (interp != null) {
      const parts: string[] = [interp.parts[0]];
      interp.expressions.forEach((exp, i) => {
        const code = Unparser.unparse(exp as IsExpressionOrStatement);
        parts.push(take(code));
        parts.push(interp.parts[i + 1]);
      });
      toReplace.push({
        loc: node.sourceCodeLocation!,
        build: () => parts.join(''),
      });
    }
  }
}

/* ========================================================================== */
/* Helpers                                                                     */
/* ========================================================================== */

function traverse(
  tree: DefaultTreeAdapterMap['documentFragment'] | DefaultTreeElement,
  cb: (node: DefaultTreeElement | DefaultTreeTextNode) => void | false,
  _parsers?: { readonly attrParser: IAttributeParser; readonly exprParser: IExpressionParser }, // kept for call-site parity
): void {
  const visitElement = (el: DefaultTreeElement): void => {
    const cont = cb(el);
    if (cont === false) return;

    // Walk light-DOM children
    if (hasChildNodes(el)) {
      for (const c of el.childNodes) visitChild(c);
    }
    // Walk <template> content fragment
    if (isTemplateElement(el)) {
      const frag = el.content;
      if (hasChildNodes(frag)) {
        for (const c of frag.childNodes) visitChild(c);
      }
    }
  };

  const visitChild = (n: DefaultTreeAdapterMap['childNode']): void => {
    if (isText(n)) {
      cb(n);
      return;
    }
    if (isElement(n)) {
      visitElement(n);
      return;
    }
    // Ignore comments, doctypes, etc. (not relevant for TTC overlay)
  };

  // Root: document fragment or element
  if (isElement(tree)) {
    visitElement(tree);
  } else {
    // documentFragment
    if (hasChildNodes(tree)) {
      for (const c of tree.childNodes) visitChild(c);
    }
  }
}

/* =======================
 * Narrow, reusable guards
 * ======================= */

function isElement(n: DefaultTreeAdapterMap['childNode'] | DefaultTreeAdapterMap['documentFragment'] | DefaultTreeElement):
  n is DefaultTreeElement {
  return typeof (n as DefaultTreeElement).tagName === 'string';
}

function isText(n: DefaultTreeAdapterMap['childNode']): n is DefaultTreeTextNode {
  return (n as DefaultTreeTextNode).nodeName === '#text';
}

function isTemplateElement(el: DefaultTreeElement): el is Template {
  return el.tagName === 'template';
}

function hasChildNodes(
  n: DefaultTreeAdapterMap['documentFragment'] | DefaultTreeElement | Template,
): n is typeof n & { childNodes: readonly DefaultTreeAdapterMap['childNode'][] } {
  return Array.isArray((n as { childNodes?: unknown }).childNodes);
}

/**
 * Normalizes a lambda for expressions that start with `this.`.
 * E.g. code "this.lastName" -> "o => o.lastName".
 */
function normalizeLambdaForThis(lambda: string, code: string): string {
  const trimmed = code.trim();
  if (trimmed === 'this') return 'o => o';
  if (trimmed.startsWith('this.')) {
    const tail = trimmed.slice(5);
    return `o => o.${tail}`;
  }
  return lambda;
}

/**
 * Cast the lambda parameter in JS so the callback is contextually typed.
 * Produces: (/** @type {Alias} *\/(o)) => o.foo
 */
function jsCastedLambda(lambda: string, alias: string): string {
  const idx = lambda.indexOf('=>');
  if (idx <= 0) return lambda;
  const left = lambda.slice(0, idx).trim();  // e.g., "o"
  const right = lambda.slice(idx);           // e.g., "=> o.foo"
  return `(${`/** @type {${alias}} */(${left})`}) ${right}`;
}
