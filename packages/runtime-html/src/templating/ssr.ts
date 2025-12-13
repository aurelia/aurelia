/**
 * SSR Manifest Types and Hydration
 *
 * Tree-shaped structure mirroring the controller tree.
 * - Discriminator: 'type' in child → TC entry, otherwise → scope
 * - `nodeCount` present for containerless scopes (TC views, containerless CEs)
 *
 * Recording functions live in @aurelia-ls/build (cross-package awareness).
 * Types, type guards, and hydration utilities remain here for the client.
 */

import { createInterface } from '../utilities-di';
import {
  PropertyBindingInstruction,
  TextBindingInstruction,
  InterpolationInstruction,
  ListenerBindingInstruction,
  RefBindingInstruction,
  SetPropertyInstruction,
  SetAttributeInstruction,
  HydrateElementInstruction,
  HydrateAttributeInstruction,
  HydrateTemplateController,
  HydrateLetElementInstruction,
  LetBindingInstruction,
  IteratorBindingInstruction,
  MultiAttrInstruction,
  BindingMode,
  type IInstruction,
} from '@aurelia/template-compiler';
import {
  createInterpolation,
  type IsBindingBehavior,
  type ForOfStatement,
  type Interpolation,
} from '@aurelia/expression-parser';

/** Root SSR manifest structure. */
export interface ISSRManifest {
  root: string;
  manifest: ISSRScope;
}

/**
 * A scope in the SSR manifest (CE scope or TC view scope).
 * `nodeCount` is present for containerless scopes (TC views, containerless CEs).
 */
export interface ISSRScope {
  /** CE name (absent for synthetic view scopes) */
  name?: string;
  /** Node count for containerless scopes (absent when host element defines boundary) */
  nodeCount?: number;
  /** Children in controller tree order */
  children: ISSRScopeChild[];
}

/** Either a TC entry (has `type`) or a nested scope (no `type`). */
export type ISSRScopeChild = ISSRTemplateController | ISSRScope;

/** Template controller entry recording which views were rendered during SSR. */
export interface ISSRTemplateController {
  /** TC type: 'repeat' | 'if' | 'else' | 'with' | 'switch' | 'promise' */
  type: string;
  /** TC-specific state (e.g., `if`: which branch; `switch`: which case) */
  state?: unknown;
  /** Views rendered by this TC (each with `nodeCount` since TC views are containerless) */
  views: ISSRScope[];
}

/** Check if a scope child is a template controller entry. */
export function isSSRTemplateController(child: ISSRScopeChild): child is ISSRTemplateController {
  return 'type' in child;
}

/** Check if a scope child is a nested scope (CE or view). */
export function isSSRScope(child: ISSRScopeChild): child is ISSRScope {
  return !('type' in child);
}

export interface ISSRContext {
  /** When true, preserve `au-hid` attributes and `<!--au:N-->` markers in DOM for hydration. */
  readonly preserveMarkers: boolean;
}

/** DI token for SSR context. Register with `preserveMarkers: true` on server. */
export const ISSRContext = /*@__PURE__*/createInterface<ISSRContext>('ISSRContext');

/* =============================================================================
 * SSR Definition Hydration
 *
 * Converts expression table format (from SSR wire) to Aurelia instructions.
 * Tree-shakeable: only included if hydrateSSRDefinition is imported.
 * ============================================================================= */

/** Expression ID (opaque string) */
type ExprId = string;

/** Any expression AST */
type AnyBindingExpression = { $kind: string } & Record<string, unknown>;

/** Serialized expression entry */
interface SerializedExpression {
  id: ExprId;
  ast: AnyBindingExpression;
}

/** Serialized definition (root or nested) */
interface SerializedDefinition {
  name: string;
  instructions: SerializedInstruction[][];
  nestedTemplates: SerializedDefinition[];
  targetCount: number;
}

/** Nested template HTML node */
interface NestedTemplateHtmlNode {
  html: string;
  nested: NestedTemplateHtmlNode[];
}

/** Binding mode string */
type BindingModeString = 'default' | 'oneTime' | 'toView' | 'fromView' | 'twoWay';

/** Union of all serialized instruction types */
type SerializedInstruction =
  | { type: 'propertyBinding'; exprId: ExprId; to: string; mode: BindingModeString }
  | { type: 'textBinding'; exprIds: ExprId[]; parts: string[] }
  | { type: 'interpolation'; exprIds: ExprId[]; parts: string[]; to: string }
  | { type: 'listenerBinding'; exprId: ExprId; to: string; capture: boolean; modifier?: string | null }
  | { type: 'refBinding'; exprId: ExprId; to: string }
  | { type: 'setProperty'; value: unknown; to: string }
  | { type: 'setAttribute'; value: string; to: string }
  | { type: 'hydrateElement'; resource: string; instructions: SerializedInstruction[]; containerless?: boolean }
  | { type: 'hydrateAttribute'; resource: string; alias?: string; instructions: SerializedInstruction[] }
  | { type: 'hydrateTemplateController'; resource: string; templateIndex: number; instructions: SerializedInstruction[] }
  | { type: 'hydrateLetElement'; bindings: { exprId: ExprId; to: string }[]; toBindingContext: boolean }
  | { type: 'iteratorBinding'; exprId: ExprId; to: string; aux?: { exprId: ExprId; name: string }[] };

/** SSR definition in expression table format (wire format) */
export interface ISSRDefinition {
  /** Root template HTML with markers */
  template: string;
  /** Expression table */
  expressions: SerializedExpression[];
  /** Root definition with ExprId references */
  definition: SerializedDefinition;
  /** Nested template HTML tree */
  nestedHtmlTree: NestedTemplateHtmlNode[];
}

/** Hydrated definition ready for Aurelia */
export interface IHydratedDefinition {
  /** Root template HTML with markers */
  template: string;
  /** Translated Aurelia instructions */
  instructions: IInstruction[][];
  /** Whether compilation is needed (always false for AOT) */
  needsCompile: false;
}

/**
 * Hydrate an SSR definition to Aurelia's instruction format.
 *
 * Resolves ExprId references to actual ASTs and builds instruction objects.
 * This is the client-side counterpart to the SSR middleware's wire format.
 *
 * @param ssrDef - The SSR definition from window.__AU_DEF__
 * @returns Hydrated definition ready for Aurelia.app()
 */
export function hydrateSSRDefinition(ssrDef: ISSRDefinition): IHydratedDefinition {
  const exprMap = new Map<ExprId, AnyBindingExpression>();
  for (const expr of ssrDef.expressions) {
    exprMap.set(expr.id, expr.ast);
  }

  const { instructions } = translateDefinition(
    ssrDef.definition,
    ssrDef.nestedHtmlTree,
    exprMap,
  );

  return {
    template: ssrDef.template,
    instructions,
    needsCompile: false,
  };
}

/* =============================================================================
 * Translation Internals
 * ============================================================================= */

interface TranslationContext {
  exprMap: Map<ExprId, AnyBindingExpression>;
  nestedDefs: NestedDefResult[];
}

interface NestedDefResult {
  template: string;
  instructions: IInstruction[][];
  name: string;
  needsCompile: false;
}

function translateDefinition(
  def: SerializedDefinition,
  nestedHtmlTree: NestedTemplateHtmlNode[],
  exprMap: Map<ExprId, AnyBindingExpression>,
): { instructions: IInstruction[][]; nestedDefs: NestedDefResult[] } {
  const nestedDefs: NestedDefResult[] = [];
  for (let i = 0; i < def.nestedTemplates.length; i++) {
    const nested = def.nestedTemplates[i];
    const htmlNode = nestedHtmlTree[i];
    if (nested && htmlNode) {
      const nestedResult = translateDefinition(nested, htmlNode.nested, exprMap);
      nestedDefs.push({
        template: htmlNode.html,
        instructions: nestedResult.instructions,
        name: nested.name,
        needsCompile: false,
      });
    }
  }

  const ctx: TranslationContext = { exprMap, nestedDefs };
  const instructions = def.instructions.map(row =>
    row.map(ins => translateInstruction(ins, ctx))
  );

  return { instructions, nestedDefs };
}

function translateInstruction(ins: SerializedInstruction, ctx: TranslationContext): IInstruction {
  switch (ins.type) {
    case 'propertyBinding': {
      const expr = getExpr(ctx.exprMap, ins.exprId) as IsBindingBehavior;
      return new PropertyBindingInstruction(expr, ins.to, translateBindingMode(ins.mode));
    }

    case 'textBinding': {
      const expressions = ins.exprIds.map(id => getExpr(ctx.exprMap, id) as IsBindingBehavior);
      const interpolation = createInterpolation(ins.parts, expressions);
      return new TextBindingInstruction(interpolation as unknown as IsBindingBehavior);
    }

    case 'interpolation': {
      const expressions = ins.exprIds.map(id => getExpr(ctx.exprMap, id) as IsBindingBehavior);
      const interpolation = createInterpolation(ins.parts, expressions);
      return new InterpolationInstruction(interpolation, ins.to);
    }

    case 'listenerBinding': {
      const expr = getExpr(ctx.exprMap, ins.exprId) as IsBindingBehavior;
      return new ListenerBindingInstruction(expr, ins.to, ins.capture, ins.modifier ?? null);
    }

    case 'refBinding': {
      const expr = getExpr(ctx.exprMap, ins.exprId) as IsBindingBehavior;
      return new RefBindingInstruction(expr, ins.to);
    }

    case 'setProperty':
      return new SetPropertyInstruction(ins.value, ins.to);

    case 'setAttribute':
      return new SetAttributeInstruction(ins.value ?? '', ins.to);

    case 'hydrateElement': {
      const props = ins.instructions.map(i => translateInstruction(i, ctx));
      return new HydrateElementInstruction(ins.resource, props, null, ins.containerless ?? false, void 0, {});
    }

    case 'hydrateAttribute': {
      const props = ins.instructions.map(i => translateInstruction(i, ctx));
      return new HydrateAttributeInstruction(ins.resource, ins.alias, props);
    }

    case 'hydrateTemplateController': {
      const nestedDef = ctx.nestedDefs[ins.templateIndex];
      if (!nestedDef) {
        throw new Error(`Missing nested template at index ${ins.templateIndex}`);
      }
      const props = ins.instructions.map(i => translateInstruction(i, ctx));
      const def = {
        name: nestedDef.name,
        type: 'custom-element' as const,
        template: nestedDef.template,
        instructions: nestedDef.instructions,
        needsCompile: false,
      };
      return new HydrateTemplateController(def, ins.resource, void 0, props);
    }

    case 'hydrateLetElement': {
      const bindings = ins.bindings.map(b => {
        const expr = getExpr(ctx.exprMap, b.exprId) as IsBindingBehavior | Interpolation;
        return new LetBindingInstruction(expr, b.to);
      });
      return new HydrateLetElementInstruction(bindings, ins.toBindingContext);
    }

    case 'iteratorBinding': {
      const forOf = getExpr(ctx.exprMap, ins.exprId) as unknown as ForOfStatement;
      const props: MultiAttrInstruction[] = [];
      if (ins.aux) {
        for (const aux of ins.aux) {
          const expr = getExpr(ctx.exprMap, aux.exprId);
          props.push(new MultiAttrInstruction(expr as IsBindingBehavior, aux.name, 'bind'));
        }
      }
      return new IteratorBindingInstruction(forOf, ins.to, props);
    }

    default:
      throw new Error(`Unknown instruction type: ${(ins as SerializedInstruction).type}`);
  }
}

function getExpr(exprMap: Map<ExprId, AnyBindingExpression>, id: ExprId): AnyBindingExpression {
  const expr = exprMap.get(id);
  if (!expr) {
    throw new Error(`Expression not found: ${id}`);
  }
  return expr;
}

function translateBindingMode(mode: BindingModeString): typeof BindingMode[keyof typeof BindingMode] {
  switch (mode) {
    case 'oneTime': return BindingMode.oneTime;
    case 'toView': return BindingMode.toView;
    case 'fromView': return BindingMode.fromView;
    case 'twoWay': return BindingMode.twoWay;
    default: return BindingMode.default;
  }
}

