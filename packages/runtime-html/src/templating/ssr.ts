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
  type PropertyBindingInstruction,
  type TextBindingInstruction,
  type InterpolationInstruction,
  type ListenerBindingInstruction,
  type RefBindingInstruction,
  type SetPropertyInstruction,
  type SetAttributeInstruction,
  type HydrateElementInstruction,
  type HydrateAttributeInstruction,
  type HydrateTemplateController,
  type HydrateLetElementInstruction,
  type LetBindingInstruction,
  type IteratorBindingInstruction,
  type MultiAttrInstruction,
  BindingMode,
  type IInstruction,
  itPropertyBinding,
  itTextBinding,
  itInterpolation,
  itListenerBinding,
  itRefBinding,
  itSetProperty,
  itSetAttribute,
  itHydrateElement,
  itHydrateAttribute,
  itHydrateTemplateController,
  itHydrateLetElement,
  itLetBinding,
  itIteratorBinding,
  itMultiAttr,
} from '@aurelia/template-compiler';
import {
  createInterpolation,
  type IsBindingBehavior,
  type ForOfStatement,
  type Interpolation,
} from '@aurelia/expression-parser';
import { FragmentNodeSequence, IRenderLocation, partitionSiblingNodes } from '../dom';
import { IPlatform } from '../platform';
import type { IViewFactory } from './view';
import type { ICustomAttributeController, ISyntheticView } from './controller';

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
  /** When true, preserve `<!--au-->` markers in DOM for hydration. */
  readonly preserveMarkers: boolean;
}

/** DI token for SSR context. Register with `preserveMarkers: true` on server. */
export const ISSRContext = /*@__PURE__*/createInterface<ISSRContext>('ISSRContext');

export interface AdoptedViewResult {
  view: ISyntheticView;
  viewScope: ISSRScope;
}

export interface AdoptedViewsResult {
  views: ISyntheticView[];
  viewScopes: ISSRScope[];
}

/** Adopt a single view from SSR manifest. For TCs with at most one view (if, with). */
export function adoptSSRView(
  ssrScope: ISSRTemplateController,
  factory: IViewFactory,
  controller: ICustomAttributeController,
  location: IRenderLocation,
  platform: IPlatform,
): AdoptedViewResult | null {
  const viewScope = ssrScope.views[0];
  if (viewScope == null) {
    return null;
  }

  const nodeCount = viewScope.nodeCount ?? 1;
  const partitions = partitionSiblingNodes(location, [nodeCount]);

  if (partitions.length === 0 || partitions[0].length === 0) {
    return null;
  }

  const adoptedNodes = FragmentNodeSequence.adoptSiblings(platform, partitions[0]);
  const view = factory.createAdopted(controller, adoptedNodes, viewScope);
  view.setLocation(location);

  return { view, viewScope };
}

/** Adopt multiple views from SSR manifest. For TCs with multiple views (repeat). */
export function adoptSSRViews(
  ssrScope: ISSRTemplateController,
  factory: IViewFactory,
  controller: ICustomAttributeController,
  location: IRenderLocation,
  platform: IPlatform,
): AdoptedViewsResult {
  const viewScopes = ssrScope.views;
  const viewCount = viewScopes.length;
  const nodeCounts: number[] = Array(viewCount);
  for (let i = 0; i < viewCount; ++i) {
    nodeCounts[i] = viewScopes[i]?.nodeCount ?? 1;
  }

  const partitions = partitionSiblingNodes(location, nodeCounts);
  const views: ISyntheticView[] = Array(viewCount);

  for (let i = 0; i < viewCount; ++i) {
    const nodes = partitions[i] ?? [];
    const adoptedNodes = FragmentNodeSequence.adoptSiblings(platform, nodes);
    const view = factory.createAdopted(controller, adoptedNodes, viewScopes[i]);
    view.setLocation(location);
    views[i] = view;
  }

  return { views, viewScopes };
}

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

/** Binding mode (numeric, matches BindingMode enum) */
type BindingModeValue = typeof BindingMode[keyof typeof BindingMode];

/** Instruction type codes (numeric, matches itXxx constants) */
type InstructionType = typeof itPropertyBinding | typeof itTextBinding | typeof itInterpolation
  | typeof itListenerBinding | typeof itRefBinding | typeof itSetProperty | typeof itSetAttribute
  | typeof itHydrateElement | typeof itHydrateAttribute | typeof itHydrateTemplateController
  | typeof itHydrateLetElement | typeof itIteratorBinding;

/** Union of all serialized instruction types (numeric type discriminants) */
type SerializedInstruction =
  | { type: typeof itPropertyBinding; exprId: ExprId; to: string; mode: BindingModeValue }
  | { type: typeof itTextBinding; exprIds: ExprId[]; parts: string[] }
  | { type: typeof itInterpolation; exprIds: ExprId[]; parts: string[]; to: string }
  | { type: typeof itListenerBinding; exprId: ExprId; to: string; capture: boolean; modifier?: string | null }
  | { type: typeof itRefBinding; exprId: ExprId; to: string }
  | { type: typeof itSetProperty; value: unknown; to: string }
  | { type: typeof itSetAttribute; value: string; to: string }
  | { type: typeof itHydrateElement; res: string; instructions: SerializedInstruction[]; containerless?: boolean }
  | { type: typeof itHydrateAttribute; res: string; alias?: string; instructions: SerializedInstruction[] }
  | { type: typeof itHydrateTemplateController; res: string; templateIndex: number; instructions: SerializedInstruction[] }
  | { type: typeof itHydrateLetElement; bindings: { exprId: ExprId; to: string }[]; toBindingContext: boolean }
  | { type: typeof itIteratorBinding; exprId: ExprId; to: string; aux?: { exprId: ExprId; name: string }[] };

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
    case itPropertyBinding: {
      const expr = getExpr(ctx.exprMap, ins.exprId) as IsBindingBehavior;
      return {
        type: itPropertyBinding,
        from: expr,
        to: ins.to,
        mode: ins.mode, // Already numeric, no translation needed
      } as PropertyBindingInstruction;
    }

    case itTextBinding: {
      const expressions = ins.exprIds.map(id => getExpr(ctx.exprMap, id) as IsBindingBehavior);
      const interpolation = createInterpolation(ins.parts, expressions);
      return {
        type: itTextBinding,
        from: interpolation as unknown as IsBindingBehavior,
      } as TextBindingInstruction;
    }

    case itInterpolation: {
      const expressions = ins.exprIds.map(id => getExpr(ctx.exprMap, id) as IsBindingBehavior);
      const interpolation = createInterpolation(ins.parts, expressions);
      return {
        type: itInterpolation,
        from: interpolation,
        to: ins.to,
      } as InterpolationInstruction;
    }

    case itListenerBinding: {
      const expr = getExpr(ctx.exprMap, ins.exprId) as IsBindingBehavior;
      return {
        type: itListenerBinding,
        from: expr,
        to: ins.to,
        capture: ins.capture,
        modifier: ins.modifier ?? null,
      } as ListenerBindingInstruction;
    }

    case itRefBinding: {
      const expr = getExpr(ctx.exprMap, ins.exprId) as IsBindingBehavior;
      return {
        type: itRefBinding,
        from: expr,
        to: ins.to,
      } as RefBindingInstruction;
    }

    case itSetProperty:
      return {
        type: itSetProperty,
        value: ins.value,
        to: ins.to,
      } as SetPropertyInstruction;

    case itSetAttribute:
      return {
        type: itSetAttribute,
        value: ins.value ?? '',
        to: ins.to,
      } as SetAttributeInstruction;

    case itHydrateElement: {
      const props = ins.instructions.map(i => translateInstruction(i, ctx));
      return {
        type: itHydrateElement,
        res: ins.res,
        props,
        projections: null,
        containerless: ins.containerless ?? false,
        captures: void 0,
        data: {},
      } as HydrateElementInstruction;
    }

    case itHydrateAttribute: {
      const props = ins.instructions.map(i => translateInstruction(i, ctx));
      return {
        type: itHydrateAttribute,
        res: ins.res,
        alias: ins.alias,
        props,
      } as HydrateAttributeInstruction;
    }

    case itHydrateTemplateController: {
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
      return {
        type: itHydrateTemplateController,
        def,
        res: ins.res,
        alias: void 0,
        props,
      } as HydrateTemplateController;
    }

    case itHydrateLetElement: {
      const bindings = ins.bindings.map(b => {
        const expr = getExpr(ctx.exprMap, b.exprId) as IsBindingBehavior | Interpolation;
        return {
          type: itLetBinding,
          from: expr,
          to: b.to,
        } as LetBindingInstruction;
      });
      return {
        type: itHydrateLetElement,
        instructions: bindings,
        toBindingContext: ins.toBindingContext,
      } as HydrateLetElementInstruction;
    }

    case itIteratorBinding: {
      const forOf = getExpr(ctx.exprMap, ins.exprId) as unknown as ForOfStatement;
      const props: MultiAttrInstruction[] = [];
      if (ins.aux) {
        for (const aux of ins.aux) {
          const expr = getExpr(ctx.exprMap, aux.exprId);
          props.push({
            type: itMultiAttr,
            value: expr as IsBindingBehavior,
            to: aux.name,
            command: 'bind',
          } as MultiAttrInstruction);
        }
      }
      return {
        type: itIteratorBinding,
        forOf,
        to: ins.to,
        props,
      } as IteratorBindingInstruction;
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
