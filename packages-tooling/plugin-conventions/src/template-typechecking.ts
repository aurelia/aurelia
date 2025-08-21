import type { ClassMetadata } from './preprocess-resource';
import { buildIr, type IExpressionParser } from './ir/build';
import { linkSemantics } from './semantics/linker';
import { DEFAULT as DEFAULT_SEMANTICS } from './semantics/registry';
import { buildScopeGraph } from './scope-graph/build';
import { analyze } from './analysis/build';
import { emitOverlay } from './emit/overlay';
import { emitHtmlOverlay } from './emit/html-overlay';
import { DI } from '@aurelia/kernel';
import { ExpressionParser } from '@aurelia/expression-parser';
import {
  DotSeparatedAttributePattern, EventAttributePattern, RefAttributePattern,
  AtPrefixedTriggerAttributePattern, ColonPrefixedBindAttributePattern, IAttributeParser
} from '@aurelia/template-compiler';
import { modifyCode } from './modify-code';
import { VmReflection } from './analysis/types';
import { snapshotScope } from './scope-graph/snapshot';

export function createTypeCheckedTemplate(
  html: string,
  classes: ClassMetadata[],
  isJs: boolean,
): string {
  if (!html || classes.length === 0) return '';

  const { attrParser, exprParser } = getParsers();
  const ir = buildIr(html, { attrParser, exprParser, file: 'inline.html', name: 'inline' });
  const linked = linkSemantics(ir, DEFAULT_SEMANTICS);
  const scope = buildScopeGraph(linked);

  const plan = analyze(linked, scope, {
    isJs,
    vm: vmReflectionFromClasses(classes),
    syntheticPrefix: '__AU_TTC_',
  });

  // Default call-only overlay (unchanged)
  return emitOverlay(plan, { isJs });
}

/**
 * HTML overlay variant: returns a function that returns the *original HTML*
 * with `${__au$accessS<Alias>(lambda, 'code')}` injected at each expression site.
 */
export function createHtmlTypeCheckedTemplate(
  html: string,
  classes: ClassMetadata[],
  isJs: boolean,
): string {
  if (!html || classes.length === 0) return '';

  const { attrParser, exprParser } = getParsers();
  const ir = buildIr(html, { attrParser, exprParser, file: 'inline.html', name: 'inline' });
  const linked = linkSemantics(ir, DEFAULT_SEMANTICS);
  const scope = buildScopeGraph(linked);
  const plan = analyze(linked, scope, {
    isJs,
    vm: vmReflectionFromClasses(classes),
    syntheticPrefix: '__AU_TTC_',
  });

  const fnName = `__typecheck_template_${classes.map(c => c.name).join('_')}__`;
  return emitHtmlOverlay(html, plan, scope, { attrParser, exprParser }, { isJs, functionName: fnName });
}

export function createScopeSnapshot(html: string) {
  if (!html) return '';

  const { attrParser, exprParser } = getParsers();
  const ir = buildIr(html, { attrParser, exprParser });
  const sem = linkSemantics(ir, DEFAULT_SEMANTICS);
  const graph = buildScopeGraph(sem);
  return snapshotScope(graph, { includeLinkedMeta: true });
}

export function vmReflectionFromClasses(classes: ClassMetadata[]): VmReflection {
  const union = classes.map(c => c.name).filter(Boolean).join(' | ') || 'unknown';
  const prefix = '__AU_TTC_';
  return {
    getRootVmTypeExpr: () => union,
    getSyntheticPrefix: () => prefix,
  };
}

export function prependUtilityTypes(m: ReturnType<typeof modifyCode>, isJs: boolean) {
  m.prepend(`// @ts-check
${isJs
  ? `/**
  * @template TCollection
  * @typedef {TCollection extends Array<infer TElement> ? TElement : TCollection extends Set<infer TElement> ? TElement : TCollection extends Map<infer TKey, infer TValue> ? [TKey, TValue] : TCollection extends number ? number : TCollection extends object ? any : never} CollectionElement
  */
/**
 * @template T
 * @param {(o: T) => unknown} _fn
 * @returns {void}
 */
function __au$access(_fn) { /* no-op */ }
/**
 * @template T
 * @param {(o: T) => unknown} _fn
 * @param {string} expr
 * @returns {string}
 */
function __au$accessS(_fn, expr) { return expr; }`
  : `type CollectionElement<TCollection> = TCollection extends Array<infer TElement>
      ? TElement
      : TCollection extends Set<infer TElement>
        ? TElement
        : TCollection extends Map<infer TKey, infer TValue>
          ? [TKey, TValue]
          : TCollection extends number
           ? number
           : TCollection extends object
             ? any
             : never;

/* @internal */
const __au$access = <T>(_fn: (o: T) => unknown): void => { /* no-op */ };

/* @internal */
const __au$accessS = <T>(_fn: (o: T) => unknown, expr: string): string => expr;`}
`);
}

function getParsers() {
  const container = DI.createContainer().register(
    DotSeparatedAttributePattern,
    EventAttributePattern,
    RefAttributePattern,
    AtPrefixedTriggerAttributePattern,
    ColonPrefixedBindAttributePattern,
  );
  const attrParser = container.get(IAttributeParser);
  const exprParser = container.get(ExpressionParser) as unknown as IExpressionParser;
  return { attrParser, exprParser };
}
