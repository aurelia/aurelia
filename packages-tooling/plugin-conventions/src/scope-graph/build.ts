import type {
  ForOfIR, SourceSpan,
  BindingSourceIR, TemplateNode,
  ExprId,
  // AST types we rely on to read repeat headers precisely
  ForOfStatement,
  BindingIdentifierOrPattern,
  DestructuringAssignmentExpression,
  DestructuringAssignmentSingleExpression,
  DestructuringAssignmentRestExpression,
  IsAssign,
} from '../shared/types';
import type {
  LinkedSemanticsModule, LinkedTemplate, LinkedRow,
  LinkedHydrateTemplateController, LinkedIteratorBinding, LinkedHydrateLetElement,
} from '../semantics/linked-types';
import {
  ScopeModule, ScopeTemplate, ScopeFrame, FrameId, ScopeSymbol, ScopeDiagnostic,
  exprIdsOf, idOf,
} from './types';
import { RepeatController } from '../semantics/registry';
import { assertNever } from '../shared/util';

/* ====================================================================== */
/* Build ScopeGraph v0 from the linked semantics module.                  */
/* Pure & deterministic. Trusts stage contracts after the boundary.       */
/* ====================================================================== */

export function buildScopeGraph(linked: LinkedSemanticsModule): ScopeModule {
  const diags: ScopeDiagnostic[] = [];
  const templates: ScopeTemplate[] = [];

  // External boundary: Semantics keeps exprTable as `unknown` to avoid a hard dep.
  // We cast to the narrow slice we need (ForOf entries) once here, then trust it.
  type ForOfExprEntry = { id: ExprId; astKind: 'ForOfStatement'; ast: ForOfStatement };
  const forOfIndex = indexForOf(linked.exprTable as readonly ForOfExprEntry[] | undefined);

  // Map raw TemplateIR (addressable via their DOM roots) → LinkedTemplate
  // so we can look up the linked def for nested controllers.
  // Semantics preserves identity: LinkedTemplate.dom === TemplateIR.dom
  const domToLinked = new WeakMap<TemplateNode, LinkedTemplate>();
  for (const t of linked.templates) domToLinked.set(t.dom, t);

  // Only the module's *root* template should produce a ScopeTemplate.
  // Nested templates are traversed via controllers (walkRows) into the same frame tree.
  const roots: LinkedTemplate[] = linked.templates.length > 0 ? [linked.templates[0]] : [];
  for (const t of roots) {
    templates.push(buildTemplateScopes(t, diags, domToLinked, forOfIndex));
  }

  return {
    version: 'aurelia-scope@1',
    templates,
    diags,
  };
}

/* ====================================================================== */
/* Template traversal                                                      */
/* ====================================================================== */

function buildTemplateScopes(
  t: LinkedTemplate,
  diags: ScopeDiagnostic[],
  domToLinked: WeakMap<TemplateNode, LinkedTemplate>,
  forOfIndex: ReadonlyMap<ExprId, ForOfStatement>,
): ScopeTemplate {
  const frames: ScopeFrame[] = [];
  const exprToFrame: Record<string /* ExprId */, FrameId> = Object.create(null);

  // Root frame (component root).
  const rootId = nextFrameId(frames);
  frames.push({
    id: rootId,
    parent: null,
    kind: 'root',
    overlay: null,
    symbols: [],
    origin: null,
    letValueExprs: null,
  });

  // Walk rows at the root template
  walkRows(t.rows, rootId, frames, exprToFrame, diags, domToLinked, forOfIndex);

  return {
    name: t.name,
    frames,
    root: rootId,
    exprToFrame,
    linked: t,
  };
}

function walkRows(
  rows: LinkedRow[],
  currentFrame: FrameId,
  frames: ScopeFrame[],
  exprToFrame: Record<string, FrameId>,
  diags: ScopeDiagnostic[],
  domToLinked: WeakMap<TemplateNode, LinkedTemplate>,
  forOfIndex: ReadonlyMap<ExprId, ForOfStatement>,
): void {
  for (const r of rows) {
    for (const ins of r.instructions) {
      switch (ins.kind) {
        // ---- Bindings that carry expressions evaluated in the *current* frame ----
        case 'propertyBinding':
          mapBindingSource(ins.from, currentFrame, exprToFrame);
          break;
        case 'attributeBinding':
          mapBindingSource(ins.from, currentFrame, exprToFrame);
          break;
        case 'stylePropertyBinding':
          mapBindingSource(ins.from, currentFrame, exprToFrame);
          break;
        case 'listenerBinding':
          exprToFrame[idOf(ins.from)] = currentFrame;
          break;
        case 'refBinding':
          exprToFrame[idOf(ins.from)] = currentFrame;
          break;
        case 'textBinding':
          mapBindingSource(ins.from, currentFrame, exprToFrame);
          break;

        // ---- Setters (no expressions) ----
        case 'setAttribute':
        case 'setClassAttribute':
        case 'setStyleAttribute':
        case 'setProperty':
          break;

        // ---- <let> introduces locals in the current frame ----
        case 'hydrateLetElement':
          materializeLetSymbols(ins, currentFrame, frames, exprToFrame, diags);
          break;

        // ---- Standalone iteratorBinding should not appear (repeat packs it as a prop) ----
        case 'iteratorBinding':
          // Header evaluated in the outer frame: record the ForOfStatement id.
          exprToFrame[ins.forOf.astId] = currentFrame;
          // Tail options (aux) also evaluate in the outer frame.
          for (const a of ins.aux) mapBindingSource(a.from, currentFrame, exprToFrame);
          break;

        // ---- Template controllers ----
        case 'hydrateTemplateController': {
          // 1) Map controller prop expressions at the *outer* frame.
          for (const p of ins.props) {
            switch (p.kind) {
              case 'propertyBinding':
                mapBindingSource(p.from, currentFrame, exprToFrame);
                break;
              case 'iteratorBinding':
                exprToFrame[p.forOf.astId] = currentFrame; // header evaluated in outer frame
                for (const a of p.aux) mapBindingSource(a.from, currentFrame, exprToFrame);
                break;
              default:
                assertNever(p);
            }
          }

          // Case branch expressions (switch): evaluated in the outer frame.
          if (ins.branch && ins.branch.kind === 'case') {
            exprToFrame[idOf(ins.branch.expr)] = currentFrame;
          }

          // 2) Enter the controller's frame according to semantics.scope
          const nextFrame = enterControllerFrame(ins, currentFrame, frames);

          // 3) Populate locals / overlays + record origin metadata
          switch (ins.res) {
            case 'repeat': {
              const iter = getIteratorProp(ins);

              // provenance for Analysis
              const forOfAstId = iter.forOf.astId;
              frames[nextFrame] = { ...frames[nextFrame], origin: { kind: 'repeat', forOfAstId } };

              // locals/contextuals
              const forOfAst = forOfIndex.get(forOfAstId)!;
              const names = bindingNamesFromDeclaration(forOfAst.declaration);
              addUniqueSymbols(
                nextFrame,
                frames,
                names.map(n => ({ kind: 'repeatLocal' as const, name: n, span: iter.forOf.loc ?? null })),
                diags,
              );
              for (const c of (ins.controller.spec as RepeatController).contextuals) {
                addUniqueSymbols(nextFrame, frames, [{ kind: 'repeatContextual', name: c, span: iter.forOf.loc ?? null }], diags);
              }
              break;
            }
            case 'with': {
              const valueProp = getValueProp(ins);
              setOverlayBase(nextFrame, frames, { kind: 'with', from: valueProp.from, span: valueProp.loc ?? null });
              const ids = exprIdsOf(valueProp.from);
              if (ids.length > 0) {
                frames[nextFrame] = { ...frames[nextFrame], origin: { kind: 'with', valueExprId: ids[0] } };
              }
              break;
            }
            case 'promise': {
              const valueProp = getValueProp(ins);
              setOverlayBase(nextFrame, frames, { kind: 'promise', from: valueProp.from, span: valueProp.loc ?? null });
              const ids = exprIdsOf(valueProp.from);
              const branch = ins.branch && (ins.branch.kind === 'then' || ins.branch.kind === 'catch') ? ins.branch.kind : undefined;
              if (ids.length > 0) {
                frames[nextFrame] = { ...frames[nextFrame], origin: { kind: 'promise', valueExprId: ids[0], branch } };
              }
              // Promise alias (then/catch): surface as local if present.
              if (ins.branch && (ins.branch.kind === 'then' || ins.branch.kind === 'catch')) {
                if (ins.branch.local && ins.branch.local.length > 0) {
                  addUniqueSymbols(nextFrame, frames, [{ kind: 'promiseAlias', name: ins.branch.local, span: ins.loc ?? null }], diags);
                }
              }
              break;
            }
            case 'if':
            case 'switch':
            case 'portal':
              // scope === 'reuse' → keep current frame; no overlay / locals.
              break;

            default:
              assertNever(ins as never);
          }

          // 4) Recurse into nested template view using the chosen frame
          const linkedNested = domToLinked.get(ins.def.dom);
          if (linkedNested) {
            walkRows(linkedNested.rows, nextFrame, frames, exprToFrame, diags, domToLinked, forOfIndex);
          }
          break;
        }

        default:
          assertNever(ins);
      }
    }
  }
}

/* ====================================================================== */
/* Frame management                                                       */
/* ====================================================================== */

function nextFrameId(frames: ScopeFrame[]): FrameId {
  return frames.length as FrameId;
}

function enterControllerFrame(
  ctrl: LinkedHydrateTemplateController,
  current: FrameId,
  frames: ScopeFrame[],
): FrameId {
  switch (ctrl.controller.spec.scope) {
    case 'overlay': {
      const id = nextFrameId(frames);
      frames.push({ id, parent: current, kind: 'overlay', overlay: null, symbols: [], origin: null, letValueExprs: null });
      return id;
    }
    case 'reuse':
      return current;
    default:
      // Future scopes (e.g., 'isolate') — keep traversal alive in MVP.
      return current;
  }
}

function setOverlayBase(targetFrame: FrameId, frames: ScopeFrame[], overlay: ScopeFrame['overlay']): void {
  const f = frames[targetFrame];
  frames[targetFrame] = { ...f, overlay };
}

function addUniqueSymbols(targetFrame: FrameId, frames: ScopeFrame[], symbols: ScopeSymbol[], diags: ScopeDiagnostic[]): void {
  if (symbols.length === 0) return;
  const f = frames[targetFrame];
  const existing = new Set(f.symbols.map(s => s.name));
  for (const s of symbols) {
    if (existing.has(s.name)) {
      diags.push({ code: 'AU1202', message: `Duplicate local '${s.name}' in the same scope.`, span: s.span ?? null });
      continue;
    }
    f.symbols.push(s);
    existing.add(s.name);
  }
}

/* ====================================================================== */
/* Instructions helpers                                                   */
/* ====================================================================== */

function materializeLetSymbols(
  ins: LinkedHydrateLetElement,
  currentFrame: FrameId,
  frames: ScopeFrame[],
  exprToFrame: Record<string, FrameId>,
  diags: ScopeDiagnostic[],
): void {
  // Record each <let> value expr in the current frame and surface names as locals.
  const f = frames[currentFrame];
  let map = f.letValueExprs ?? Object.create(null) as Record<string, ExprId>;

  for (const lb of ins.instructions) {
    mapBindingSource(lb.from, currentFrame, exprToFrame);
    const ids = exprIdsOf(lb.from);
    if (ids.length > 0) {
      map = { ...map, [lb.to]: ids[0] }; // if interpolation, take first expr as representative
    }
  }
  frames[currentFrame] = { ...f, letValueExprs: map };

  // Surface all <let> names as locals in the current frame.
  const names = ins.instructions.map(lb => lb.to);
  addUniqueSymbols(currentFrame, frames, names.map(n => ({ kind: 'let' as const, name: n, span: spanOfLet(ins, n) })), diags);
}

function spanOfLet(ins: LinkedHydrateLetElement, _name: string): SourceSpan | null | undefined {
  // TODO(linker-carry): Thread per-let SourceSpan through LinkedHydrateLetElement if needed.
  return ins.loc ?? null;
}

function getIteratorProp(ctrl: LinkedHydrateTemplateController): LinkedIteratorBinding {
  for (const p of ctrl.props) {
    if (p.kind === 'iteratorBinding') return p;
  }
  // Semantics enforces iteratorProp presence on 'repeat'
  throw new Error('repeat controller missing iteratorBinding');
}

function getValueProp(ctrl: LinkedHydrateTemplateController) {
  for (const p of ctrl.props) {
    if (p.kind === 'propertyBinding' && p.to === 'value') return p;
  }
  throw new Error(`${ctrl.res} controller missing 'value' property`);
}

/* ====================================================================== */
/* Expression → Frame mapping                                             */
/* ====================================================================== */

function mapBindingSource(src: BindingSourceIR, frame: FrameId, out: Record<string, FrameId>): void {
  for (const id of exprIdsOf(src)) out[id] = frame;
}

/* ====================================================================== */
/* repeat.for declaration → local names (AST-based, shallow by design)    */
/* ====================================================================== */

function bindingNamesFromDeclaration(
  decl: BindingIdentifierOrPattern | DestructuringAssignmentExpression,
): string[] {
  switch (decl.$kind) {
    case 'BindingIdentifier':
      return [decl.name];

    case 'ArrayBindingPattern':
      // Elements are parsed under etNone → IsAssign (AccessScope | Assign | ...)
      return decl.elements.flatMap(bindingNamesFromPatternValue);

    case 'ObjectBindingPattern':
      // Keys are irrelevant here; values carry the local names or defaulted locals
      return decl.values.flatMap(bindingNamesFromPatternValue);

    case 'ArrayDestructuring':
    case 'ObjectDestructuring':
      return namesFromDestructuringAssignment(decl);

    default:
      return assertNever(decl);
  }
}

/** Extract a local from a single pattern slot (array/object value). */
function bindingNamesFromPatternValue(v: IsAssign): string[] {
  switch (v.$kind) {
    case 'AccessScope': {
      const name = v.name;
      return name ? [name] : [];
    }
    case 'Assign': {
      const a = v;
      return a.target.$kind === 'AccessScope' ? [a.target.name] : [];
    }
    // Other IsAssign cases (literals, calls, etc.) do not introduce names
    default:
      return [];
  }
}

/** Flatten nested destructuring assignment lists into target names. */
function namesFromDestructuringAssignment(
  node: DestructuringAssignmentExpression | DestructuringAssignmentSingleExpression | DestructuringAssignmentRestExpression,
): string[] {
  switch (node.$kind) {
    case 'ArrayDestructuring':
    case 'ObjectDestructuring':
      return node.list.flatMap(namesFromDestructuringAssignment);
    case 'DestructuringAssignmentLeaf':
      // Both Single/Rest leaves share this $kind; target is AccessMemberExpression(name)
      return [node.target.name];
    default:
      return assertNever(node);
  }
}

/* ====================================================================== */
/* Expr table indexing (ForOf entries only)                                */
/* ====================================================================== */

function indexForOf(table: readonly { id: ExprId; astKind: 'ForOfStatement'; ast: ForOfStatement }[] | undefined):
  ReadonlyMap<ExprId, ForOfStatement> {
  const m = new Map<ExprId, ForOfStatement>();
  if (!table) return m;
  for (const e of table) m.set(e.id, e.ast);
  return m;
}

