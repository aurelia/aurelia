import { parseFragment } from 'parse5';
import type { DefaultTreeAdapterMap, Token } from 'parse5';

import type {
  IrModule, TemplateIR, InstructionRow,
  DOMNode, TemplateNode,
  NodeId, ExprId, ExprRef, InterpIR, BindingMode, SourceSpan,
  PropertyBindingIR, AttributeBindingIR, StylePropertyBindingIR,
  ListenerBindingIR, RefBindingIR, SetAttributeIR, SetClassAttributeIR, SetStyleAttributeIR,
  LetBindingIR, HydrateLetElementIR, HydrateTemplateControllerIR, IteratorBindingIR,
  ForOfIR,
  ExprTableEntry, AureliaAst,
  ForOfStatement,
  Interpolation,
  AnyBindingExpression,
  IsBindingBehavior,
  MultiAttrIR,
} from '../shared/types';

interface IAttrSyntax {
  rawName: string;
  rawValue: string;
  target: string;
  command: string | null;
  parts: readonly string[] | null;
}
export interface IAttributeParser {
  parse(name: string, value: string): IAttrSyntax;
}

type ExpressionType = 'None' | 'Interpolation' | 'IsIterator' | 'IsChainable' | 'IsFunction' | 'IsProperty';
export interface IExpressionParser {
  parse(expression: string, expressionType: 'IsIterator'): ForOfStatement;
  parse(expression: string, expressionType: 'Interpolation'): Interpolation;
  parse(expression: string, expressionType: Exclude<ExpressionType, 'IsIterator' | 'Interpolation'>): IsBindingBehavior;
  parse(expression: string, expressionType: ExpressionType): AnyBindingExpression;
}

export interface BuildIrOptions {
  file?: string;
  name?: string;
  attrParser: IAttributeParser;
  exprParser: IExpressionParser;
}

/* =======================================================================================
 * HTML → IR builder
 * - Pure syntax shaping. No Semantics here.
 * - NodeId uniqueness is per TemplateIR (nested templates restart at '0').
 * ======================================================================================= */

export function buildIr(html: string, opts: BuildIrOptions): IrModule {
  const p5 = parseFragment(html, { sourceCodeLocationInfo: true });
  const ids = new NodeIdGen();
  const table = new ExprTable(opts.exprParser, opts.file ?? '');
  const nestedTemplates: TemplateIR[] = [];

  // DOM
  const domRoot: TemplateNode = {
    kind: 'template',
    id: '0' as NodeId,
    ns: 'html',
    attrs: [],
    children: buildDomChildren(p5, ids, undefined, table.file),
    loc: null,
  };

  // Rows
  const rows: InstructionRow[] = [];
  collectRows(p5, ids, opts.attrParser, table, nestedTemplates, rows);

  const root: TemplateIR = { dom: domRoot, rows, name: opts.name };

  return {
    version: 'aurelia-ir@1',
    templates: [root, ...nestedTemplates],
    exprTable: table.entries,
    name: opts.name,
  };
}

/* =======================================================================================
 * DOM (parse5) → DOMNode (IR)
 * ======================================================================================= */

type P5Node = DefaultTreeAdapterMap['childNode'];
type P5Element = DefaultTreeAdapterMap['element'];
type P5Text = DefaultTreeAdapterMap['textNode'];
type P5Template = DefaultTreeAdapterMap['template'];
type P5Loc = Token.ElementLocation | DefaultTreeAdapterMap['textNode']['sourceCodeLocation'] | null | undefined;

function buildDomChildren(
  p: { childNodes?: P5Node[] },
  ids: NodeIdGen,
  idMap?: WeakMap<P5Node, NodeId>,
  file?: string
): DOMNode[] {
  const out: DOMNode[] = [];
  const kids = p.childNodes ?? [];
  let elIdx = 0, textIdx = 0, commentIdx = 0;

  for (const n of kids) {
    if (isElement(n)) {
      const id = ids.pushElement(elIdx++) as NodeId;
      idMap?.set(n, id);

      if (n.nodeName === 'template') {
        const t = n as P5Template;
        out.push({
          kind: 'template',
          id,
          ns: toNs(n),
          attrs: mapStaticAttrs(n),
          children: buildDomChildren(t.content, ids, idMap, file),
          loc: toSpan(n.sourceCodeLocation, file),
        });
      } else {
        out.push({
          kind: 'element',
          id,
          ns: toNs(n),
          tag: n.nodeName.toLowerCase(),
          attrs: mapStaticAttrs(n),
          children: buildDomChildren(n, ids, idMap, file),
          selfClosed: false,
          loc: toSpan(n.sourceCodeLocation, file),
        });
      }
      ids.pop();
      continue;
    }

    if (isText(n)) {
      const id = `${ids.current()}#text@${textIdx++}` as NodeId;
      idMap?.set(n, id);
      out.push({
        kind: 'text',
        id,
        ns: 'html',
        text: n.value ?? '',
        loc: toSpan(n.sourceCodeLocation, file),
      });
      continue;
    }

    if (isComment(n)) {
      const id = `${ids.current()}#comment@${commentIdx++}` as NodeId;
      idMap?.set(n, id);
      out.push({
        kind: 'comment',
        id,
        ns: 'html',
        text: n.data ?? '',
        loc: toSpan(n.sourceCodeLocation, file),
      });
      continue;
    }
  }
  return out;
}

function toNs(_el: P5Element): 'html' | 'svg' | 'mathml' {
  // parse5 default adapter doesn't surface namespaces in the simple API; start with 'html'.
  // TODO: Detect SVG/MathML when needed.
  return 'html';
}
function mapStaticAttrs(el: P5Element): { name: string; value: string | null; caseSensitive?: boolean }[] {
  const out: { name: string; value: string | null; caseSensitive?: boolean }[] = [];
  for (const a of el.attrs ?? []) out.push({ name: a.name, value: a.value ?? null });
  // Authoring case is preserved here; normalization happens later (Semantics).
  return out;
}

/* =======================================================================================
 * Row collection (bindings, controllers, text)
 * ======================================================================================= */

function collectRows(
  p: { childNodes?: P5Node[] },
  ids: NodeIdGen,
  attrParser: IAttributeParser,
  table: ExprTable,
  nestedTemplates: TemplateIR[],
  rows: InstructionRow[],
): void {
  const kids = p.childNodes ?? [];
  let elIdx = 0, textIdx = 0;

  for (const n of kids) {
    if (isElement(n)) {
      const tag = n.nodeName.toLowerCase();
      const target = ids.pushElement(elIdx++) as NodeId;

      // Skip local custom elements: <template as-custom-element="...">
      if (tag === 'template' && findAttr(n, 'as-custom-element')) {
        ids.pop();
        continue;
      }

      // <let>
      if (tag === 'let') {
        const { instructions, toBindingContext } = compileLet(n, attrParser, table);
        rows.push({
          target,
          instructions: [{
            type: 'hydrateLetElement',
            instructions,
            toBindingContext,
            loc: toSpan(n.sourceCodeLocation, table.file),
          }],
        });
        ids.pop();
        continue;
      }

      // Controllers (repeat/with/promise/if/switch/portal) or regular attrs
      const ctrlRows = collectControllers(n, attrParser, table, nestedTemplates);
      const nodeRows = ctrlRows.length ? ctrlRows : compileElementAttrs(n, attrParser, table);
      if (nodeRows.length) rows.push({ target, instructions: nodeRows });

      // Only recurse into children when there is NO template controller on this element.
      if (!ctrlRows.length) {
        if (tag === 'template') {
          collectRows((n as P5Template).content, ids, attrParser, table, nestedTemplates, rows);
        } else {
          collectRows(n, ids, attrParser, table, nestedTemplates, rows);
        }
      }
      ids.pop();
      continue;
    }

    if (isText(n)) {
      const target = `${ids.current()}#text@${textIdx++}` as NodeId;
      const inter = splitInterpolation(n.value ?? '');
      if (inter) {
        const from = toInterpIR(inter, n.sourceCodeLocation, table);
        rows.push({ target, instructions: [{ type: 'textBinding', from, loc: toSpan(n.sourceCodeLocation, table.file) }] });
      }
      continue;
    }
  }
}

function compileLet(el: P5Element, attrParser: IAttributeParser, table: ExprTable): { instructions: LetBindingIR[]; toBindingContext: boolean } {
  const out: LetBindingIR[] = [];
  let toBindingContext = false;

  for (const a of el.attrs ?? []) {
    if (a.name === 'to-binding-context') { toBindingContext = true; continue; }
    const s = attrParser.parse(a.name, a.value ?? '');
    if (s.command === 'bind' || s.command === 'one-time' || s.command === 'to-view' || s.command === 'two-way') {
      const loc = attrLoc(el, a.name);
      out.push({
        type: 'letBinding',
        to: s.target,
        from: toBindingSource(a.value ?? '', loc, table, 'IsProperty'),
        loc: toSpan(loc, table.file),
      });
    }
  }
  return { instructions: out, toBindingContext };
}

function compileElementAttrs(
  el: P5Element,
  attrParser: IAttributeParser,
  table: ExprTable,
): (
  | PropertyBindingIR
  | AttributeBindingIR
  | StylePropertyBindingIR
  | ListenerBindingIR
  | RefBindingIR
  | SetAttributeIR
  | SetClassAttributeIR
  | SetStyleAttributeIR
)[] {
  const out: (
    | PropertyBindingIR | AttributeBindingIR | StylePropertyBindingIR
    | ListenerBindingIR | RefBindingIR | SetAttributeIR | SetClassAttributeIR | SetStyleAttributeIR
  )[] = [];

  for (const a of el.attrs ?? []) {
    const s = attrParser.parse(a.name, a.value ?? '');
    const loc = attrLoc(el, a.name);

    // Skip template-controller attributes; handled by collectControllers.
    if (isControllerAttr(s)) continue;

    // Events: .trigger / .capture and @event[:modifier]
    if (s.command === 'trigger' || s.command === 'capture') {
      out.push({
        type: 'listenerBinding',
        to: s.target,
        from: toExprRef(a.value ?? '', loc, table, 'IsFunction'),
        capture: s.command === 'capture',
        modifier: s.parts?.[2] ?? s.parts?.[1] ?? null,
        loc: toSpan(loc, table.file),
      });
      continue;
    }

    // ref / view-model.ref
    if (s.command === 'ref') {
      out.push({
        type: 'refBinding',
        to: s.target,
        from: toExprRef(a.value ?? '', loc, table, 'IsProperty'),
        loc: toSpan(loc, table.file),
      });
      continue;
    }

    // Overriding commands: .style / .class / .attr
    if (s.command === 'style') {
      out.push({
        type: 'stylePropertyBinding',
        to: s.target,
        from: toBindingSource(a.value ?? '', loc, table, 'IsProperty'),
        loc: toSpan(loc, table.file),
      });
      continue;
    }
    if (s.command === 'class') {
      out.push({
        type: 'attributeBinding',
        attr: 'class',
        to: 'class',
        from: toBindingSource(a.value ?? '', loc, table, 'IsProperty'),
        loc: toSpan(loc, table.file),
      });
      continue;
    }
    if (s.command === 'attr') {
      out.push({
        type: 'attributeBinding',
        attr: s.target,
        to: s.target,
        from: toBindingSource(a.value ?? '', loc, table, 'IsProperty'),
        loc: toSpan(loc, table.file),
      });
      continue;
    }

    // Binding commands (property) and :prop shorthand (→ toView).
    if (isBindingCommand(s.command) || isColonBind(a.name)) {
      out.push({
        type: 'propertyBinding',
        to: camelCase(s.target), // Final attr→prop normalization occurs during Semantics linking.
        from: toBindingSource(a.value ?? '', loc, table, 'IsProperty'),
        mode: toMode(s.command, a.name),
        loc: toSpan(loc, table.file),
      });
      continue;
    }

    // Plain attributes: interpolation → AttributeBindingIR; else → Set* (left as DOM attribute).
    const raw = a.value ?? '';
    if (raw.includes('${')) {
      out.push({
        type: 'attributeBinding',
        attr: a.name,
        to: camelCase(a.name),
        from: toInterpIR(splitInterpolation(raw)!, loc, table),
        loc: toSpan(loc, table.file),
      });
      continue;
    }

    switch (a.name) {
      case 'class':
        out.push({ type: 'setClassAttribute', value: raw, loc: toSpan(loc, table.file) });
        break;
      case 'style':
        out.push({ type: 'setStyleAttribute', value: raw, loc: toSpan(loc, table.file) });
        break;
      default:
        out.push({ type: 'setAttribute', to: a.name, value: raw || null, loc: toSpan(loc, table.file) });
        break;
    }
  }

  return out;
}

/* =======================================================================================
 * Template Controllers (repeat / with / promise / if / switch / portal)
 * ======================================================================================= */

function collectControllers(
  el: P5Element,
  attrParser: IAttributeParser,
  table: ExprTable,
  nestedTemplates: TemplateIR[],
): HydrateTemplateControllerIR[] {
  // 1) Gather controller-bearing attributes (preserve source order).
  const candidates: { a: Token.Attribute; s: ReturnType<IAttributeParser['parse']> }[] = [];
  for (const a of el.attrs ?? []) {
    const s = attrParser.parse(a.name, a.value ?? '');
    if (isControllerAttr(s)) candidates.push({ a, s });
  }
  if (!candidates.length) return [];

  // 2) Build the innermost layer from the RIGHTMOST controller.
  const rightmost = candidates[candidates.length - 1];
  let current: HydrateTemplateControllerIR[] =
    buildBaseInstructionsForRightmost(el, rightmost, attrParser, table, nestedTemplates);

  // 3) Wrap remaining controllers RIGHT→LEFT.
  for (let i = candidates.length - 2; i >= 0; i--) {
    const { a, s } = candidates[i];
    const loc = attrLoc(el, a.name);
    const prototypes = buildControllerPrototypes(el, a, s, attrParser, table, loc);

    const nextLayer: HydrateTemplateControllerIR[] = [];
    for (const proto of prototypes) {
      for (const inner of current) {
        const def = makeWrapperTemplate(inner, nestedTemplates);
        nextLayer.push({
          type: 'hydrateTemplateController',
          res: proto.res,
          def,
          props: proto.props,
          alias: proto.alias ?? null,
          branch: null,
          containerless: false,
          loc: toSpan(loc, table.file),
        });
      }
    }
    current = nextLayer;
  }

  return current; // outermost
}

function buildBaseInstructionsForRightmost(
  el: P5Element,
  rightmost: { a: Token.Attribute; s: ReturnType<IAttributeParser['parse']> },
  attrParser: IAttributeParser,
  table: ExprTable,
  nestedTemplates: TemplateIR[],
): HydrateTemplateControllerIR[] {
  const { a, s } = rightmost;
  const loc = attrLoc(el, a.name);
  const raw = a.value ?? '';

  // repeat.for
  if (s.target === 'repeat' && s.command === 'for') {
    const forRef = table.add(raw, loc, 'IsIterator');
    const forOf: ForOfIR = { astId: forRef.id, loc: toSpan(loc, table.file) };
    const iter: IteratorBindingIR = {
      type: 'iteratorBinding',
      to: 'items',
      forOf,
      props: parseRepeatTailProps(raw, loc, table),
      loc: toSpan(loc, table.file),
    };
    const def = templateOfElementChildren(el, attrParser, table, nestedTemplates);
    return [{
      type: 'hydrateTemplateController',
      res: 'repeat',
      def,
      props: [iter],
      alias: null,
      branch: null,
      containerless: false,
      loc: toSpan(loc, table.file)
    }];
  }

  // simple value controllers (with / if / switch / promise / portal)
  if (!isSimpleValueController(s)) return [];
  const controller = s.target as 'with' | 'if' | 'switch' | 'promise' | 'portal';
  const exprText = raw.length === 0 ? controller : raw;
  const valueProp: PropertyBindingIR = {
    type: 'propertyBinding', to: 'value', from: toExprRef(exprText, loc, table, 'None'), mode: 'default', loc: toSpan(loc, table.file),
  };

  if (controller === 'promise') {
    const { def, idMap } = templateOfElementChildrenWithMap(el, attrParser, table, nestedTemplates);
    injectPromiseBranchesIntoDef(el, def, idMap, attrParser, table, nestedTemplates, valueProp);
    return [{
      type: 'hydrateTemplateController',
      res: 'promise',
      def,
      props: [valueProp],
      alias: null,
      branch: null,
      containerless: false,
      loc: toSpan(loc, table.file)
    }];
  }

  if (controller === 'switch') {
    const { def, idMap } = templateOfElementChildrenWithMap(el, attrParser, table, nestedTemplates);
    injectSwitchBranchesIntoDef(el, def, idMap, attrParser, table, nestedTemplates, valueProp);
    return [{
      type: 'hydrateTemplateController',
      res: 'switch',
      def,
      props: [valueProp],
      alias: null,
      branch: null,
      containerless: false,
      loc: toSpan(loc, table.file)
    }];
  }

  // with / if / portal
  const def = templateOfElementChildren(el, attrParser, table, nestedTemplates);
  return [{
    type: 'hydrateTemplateController',
    res: controller,
    def,
    props: [valueProp],
    alias: null,
    branch: null,
    containerless: false,
    loc: toSpan(loc, table.file)
  }];
}

type ControllerPrototype = {
  res: 'repeat' | 'with' | 'if' | 'switch' | 'promise' | 'portal';
  props: (PropertyBindingIR | IteratorBindingIR)[];
  alias?: 'then' | 'catch' | 'case' | 'default' | null;
};

function buildControllerPrototypes(
  _el: P5Element,
  a: Token.Attribute,
  s: ReturnType<IAttributeParser['parse']>,
  _attrParser: IAttributeParser,
  table: ExprTable,
  loc: P5Loc
): ControllerPrototype[] {
  const raw = a.value ?? '';

  // repeat.for
  if (s.target === 'repeat' && s.command === 'for') {
    const forRef = table.add(raw, loc, 'IsIterator');
    const forOf: ForOfIR = { astId: forRef.id, loc: toSpan(loc, table.file) };
    const iter: IteratorBindingIR = {
      type: 'iteratorBinding',
      to: 'items',
      forOf,
      props: parseRepeatTailProps(raw, loc, table),
      loc: toSpan(loc, table.file),
    };
    return [{ res: 'repeat', props: [iter] }];
  }

  // with | if | switch | promise | portal
  const controller = s.target;
  const exprText = raw.length === 0 ? controller : raw;
  const valueProp: PropertyBindingIR = {
    type: 'propertyBinding', to: 'value', from: toExprRef(exprText, loc, table, 'None'), mode: 'default', loc: toSpan(loc, table.file),
  };

  if (controller === 'promise' || controller === 'switch') {
    return [{ res: controller as 'promise' | 'switch', props: [valueProp] }];
  }
  return [{ res: controller as 'with' | 'if' | 'portal', props: [valueProp] }];
}

function isControllerAttr(s: { target: string; command: string | null }): boolean {
  return (s.target === 'repeat' && s.command === 'for') || isSimpleValueController(s);
}
function isSimpleValueController(s: { target: string; command: string | null }): boolean {
  return s.target === 'with' || s.target === 'promise' || s.target === 'if' || s.target === 'switch' || s.target === 'portal';
}

/** Inject promise then/catch branches into lifted def; prune branch marker attrs. */
function injectPromiseBranchesIntoDef(
  el: P5Element,
  def: TemplateIR,
  idMap: WeakMap<P5Node, NodeId>,
  attrParser: IAttributeParser,
  table: ExprTable,
  nestedTemplates: TemplateIR[],
  valueProp: PropertyBindingIR,
): void {
  const kids = el.nodeName.toLowerCase() === 'template'
    ? (el as P5Template).content.childNodes ?? []
    : (el.childNodes ?? []);

  for (const kid of kids) {
    if (!isElement(kid) || kid.nodeName.toLowerCase() !== 'template') continue;

    const thenAttr = findAttr(kid, 'then');
    const catchAttr = findAttr(kid, 'catch');
    if (!thenAttr && !catchAttr) continue;

    const target = idMap.get(kid as P5Node);
    if (!target) continue;

    // prune SetAttribute for the branch attrs on this target
    const row = def.rows.find(r => r.target === target);
    if (row) {
      row.instructions = row.instructions.filter(ins => {
        if (ins.type === 'setAttribute') return ins.to !== 'then' && ins.to !== 'catch';
        return true;
      });
    }

    if (thenAttr) {
      const aliasVar = thenAttr.value?.length ? thenAttr.value : 'then';
      const branchDef = templateOfTemplateContent(kid as P5Template, attrParser, table, nestedTemplates);
      def.rows.push({
        target,
        instructions: [{
          type: 'hydrateTemplateController',
          res: 'promise',
          def: branchDef,
          props: [valueProp],
          alias: 'then',
          branch: { kind: 'then', local: aliasVar },
          containerless: false,
          loc: toSpan((kid as P5Template).sourceCodeLocation, table.file),
        }],
      });
    }
    if (catchAttr) {
      const aliasVar = catchAttr.value?.length ? catchAttr.value : 'catch';
      const branchDef = templateOfTemplateContent(kid as P5Template, attrParser, table, nestedTemplates);
      def.rows.push({
        target,
        instructions: [{
          type: 'hydrateTemplateController',
          res: 'promise',
          def: branchDef,
          props: [valueProp],
          alias: 'catch',
          branch: { kind: 'catch', local: aliasVar },
          containerless: false,
          loc: toSpan((kid as P5Template).sourceCodeLocation, table.file),
        }],
      });
    }
  }
}

/** Inject switch case/default branches into lifted def; prune marker attrs. */
function injectSwitchBranchesIntoDef(
  el: P5Element,
  def: TemplateIR,
  idMap: WeakMap<P5Node, NodeId>,
  attrParser: IAttributeParser,
  table: ExprTable,
  nestedTemplates: TemplateIR[],
  valueProp: PropertyBindingIR,
): void {
  const kids = el.nodeName.toLowerCase() === 'template'
    ? (el as P5Template).content.childNodes ?? []
    : (el.childNodes ?? []);

  for (const kid of kids) {
    if (!isElement(kid) || kid.nodeName.toLowerCase() !== 'template') continue;

    let caseExpr: string | null = null;
    let isDefault = false;

    for (const a of (kid as P5Element).attrs ?? []) {
      const s = attrParser.parse(a.name, a.value ?? '');
      if (s.target === 'case') {
        caseExpr = (a.value ?? '').length ? a.value : (s.command ? (a.value ?? '') : s.rawValue);
      } else if (a.name === 'default-case') {
        isDefault = true;
      }
    }

    const target = idMap.get(kid as P5Node);
    if (!target) continue;

    // prune marker attrs (case/default-case)
    const row = def.rows.find(r => r.target === target);
    if (row) {
      row.instructions = row.instructions.filter(ins => {
        if (ins.type === 'setAttribute') return ins.to !== 'default-case' && ins.to !== 'case';
        if (ins.type === 'propertyBinding') return ins.to !== 'case';
        return true;
      });
    }

    if (caseExpr !== null) {
      const branchDef = templateOfTemplateContent(kid as P5Template, attrParser, table, nestedTemplates);
      const caseProp: PropertyBindingIR = {
        type: 'propertyBinding',
        to: 'case',
        from: toExprRef(caseExpr, (kid as P5Template).sourceCodeLocation, table, 'IsProperty'),
        mode: 'default',
        loc: toSpan((kid as P5Template).sourceCodeLocation, table.file),
      };
      def.rows.push({
        target,
        instructions: [{
          type: 'hydrateTemplateController',
          res: 'switch',
          def: branchDef,
          props: [valueProp, caseProp],
          alias: 'case',
          branch: { kind: 'case', expr: toExprRef(caseExpr, (kid as P5Template).sourceCodeLocation, table, 'IsProperty') },
          containerless: false,
          loc: toSpan((kid as P5Template).sourceCodeLocation, table.file),
        }],
      });
    } else if (isDefault) {
      const branchDef = templateOfTemplateContent(kid as P5Template, attrParser, table, nestedTemplates);
      def.rows.push({
        target,
        instructions: [{
          type: 'hydrateTemplateController',
          res: 'switch',
          def: branchDef,
          props: [valueProp],
          alias: 'default',
          branch: { kind: 'default' },
          containerless: false,
          loc: toSpan((kid as P5Template).sourceCodeLocation, table.file),
        }],
      });
    }
  }
}

/* =======================================================================================
 * Template helpers
 * ======================================================================================= */

function templateOfElementChildren(
  el: P5Element,
  attrParser: IAttributeParser,
  table: ExprTable,
  nestedTemplates: TemplateIR[],
): TemplateIR {
  // Lift the host element (with controller attrs stripped) into an inner view.
  const ids = new NodeIdGen();
  const idMap = new WeakMap<P5Node, NodeId>();
  const host = stripControllerAttrsFromElement(el, attrParser);
  const syntheticRoot: { childNodes: P5Node[] } = { childNodes: [host as unknown as P5Node] };
  return buildTemplateFrom(syntheticRoot, ids, idMap, attrParser, table, nestedTemplates);
}

function templateOfElementChildrenWithMap(
  el: P5Element,
  attrParser: IAttributeParser,
  table: ExprTable,
  nestedTemplates: TemplateIR[],
): { def: TemplateIR; idMap: WeakMap<P5Node, NodeId> } {
  const ids = new NodeIdGen();
  const idMap = new WeakMap<P5Node, NodeId>();
  const host = stripControllerAttrsFromElement(el, attrParser);
  const syntheticRoot: { childNodes: P5Node[] } = { childNodes: [host as unknown as P5Node] };

  const def = buildTemplateFrom(syntheticRoot, ids, idMap, attrParser, table, nestedTemplates);
  return { def, idMap };
}

function stripControllerAttrsFromElement(el: P5Element, attrParser: IAttributeParser): P5Element {
  const filteredAttrs = (el.attrs ?? []).filter(a => !isControllerAttr(attrParser.parse(a.name, a.value ?? '')));

  if (el.nodeName.toLowerCase() === 'template') {
    const t = el as unknown as P5Template;
    const clone: Partial<P5Template> = {
      nodeName: el.nodeName as 'template',
      tagName: (el.tagName ?? el.nodeName) as 'template',
      attrs: filteredAttrs,
      content: t.content,
      sourceCodeLocation: el.sourceCodeLocation,
    };
    return clone as unknown as P5Element;
  }

  const clone: Partial<P5Element> = {
    nodeName: el.nodeName,
    tagName: el.tagName ?? el.nodeName,
    attrs: filteredAttrs,
    childNodes: el.childNodes ?? [],
    sourceCodeLocation: el.sourceCodeLocation,
  };
  return clone as P5Element;
}

function templateOfTemplateContent(
  t: P5Template,
  attrParser: IAttributeParser,
  table: ExprTable,
  nestedTemplates: TemplateIR[],
): TemplateIR {
  const ids = new NodeIdGen();
  return buildTemplateFrom(t.content, ids, undefined, attrParser, table, nestedTemplates);
}

function makeWrapperTemplate(
  inner: HydrateTemplateControllerIR,
  nestedTemplates: TemplateIR[],
): TemplateIR {
  // Minimal DOM: a fragment root with a single comment node to host the inner instruction row.
  // The comment NodeId must match rows.target below ('0#comment@0').
  const dom: TemplateNode = {
    kind: 'template',
    id: '0' as NodeId,
    ns: 'html',
    attrs: [],
    children: [
      { kind: 'comment', id: '0#comment@0' as NodeId, ns: 'html', text: '', loc: null }
    ],
    loc: null,
  };
  const rows: InstructionRow[] = [{
    target: '0#comment@0' as NodeId,
    instructions: [inner],
  }];
  const t: TemplateIR = { dom, rows };
  nestedTemplates.push(t);
  return t;
}

function buildTemplateFrom(
  rootLike: { childNodes?: P5Node[] } | P5Template['content'],
  ids: NodeIdGen,
  idMap: WeakMap<P5Node, NodeId> | undefined,
  attrParser: IAttributeParser,
  table: ExprTable,
  nestedTemplates: TemplateIR[],
): TemplateIR {
  const dom: TemplateNode = {
    kind: 'template',
    id: '0' as NodeId,
    ns: 'html',
    attrs: [],
    children: buildDomChildren(rootLike as { childNodes?: P5Node[] }, ids, idMap),
    loc: null,
  };
  const rows: InstructionRow[] = [];
  collectRows(rootLike as { childNodes?: P5Node[] }, ids, attrParser, table, nestedTemplates, rows);
  const t: TemplateIR = { dom, rows };
  nestedTemplates.push(t);
  return t;
}

/* =======================================================================================
 * Helpers: attrs/mode/interpolation/expr table/ids
 * ======================================================================================= */

function isBindingCommand(cmd: string | null): cmd is 'bind' | 'one-time' | 'to-view' | 'from-view' | 'two-way' {
  return cmd === 'bind' || cmd === 'one-time' || cmd === 'to-view' || cmd === 'from-view' || cmd === 'two-way';
}
function isColonBind(name: string): boolean {
  return name.length > 0 && name[0] === ':';
}
function toMode(cmd: string | null, name: string): BindingMode {
  if (cmd === 'one-time') return 'oneTime';
  if (cmd === 'to-view' || isColonBind(name)) return 'toView';
  if (cmd === 'from-view') return 'fromView';
  if (cmd === 'two-way') return 'twoWay';
  return 'default';
}
function camelCase(n: string): string {
  return n.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}
function attrLoc(el: P5Element, attrName: string): P5Loc {
  const loc = el.sourceCodeLocation;
  const attrLocTable = loc?.attrs;
  return ((attrLocTable?.[attrName]) ?? loc) ?? null;
}

/** Split interpolation `${...}` parts; returns null when none are found. */
function splitInterpolation(text: string): { parts: string[]; exprs: string[] } | null {
  let i = 0, depth = 0, start = 0, str: '"' | "'" | '`' | null = null;
  const parts: string[] = [], exprs: string[] = [];
  while (i < text.length) {
    const ch = text[i];
    if (str) { if (ch === '\\') { i += 2; continue; } if (ch === str) str = null; i++; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { str = ch; i++; continue; }
    if (ch === '$' && text[i + 1] === '{') {
      parts.push(text.slice(start, i)); i += 2; depth = 1; const b = i;
      while (i < text.length) {
        const c = text[i];
        if (str) { if (c === '\\') { i += 2; continue; } if (c === str) str = null; i++; continue; }
        if (c === '{') { depth++; i++; continue; }
        if (c === '}' && --depth === 0) { exprs.push(text.slice(b, i)); i++; start = i; break; }
        i++;
      }
      continue;
    }
    i++;
  }
  if (!exprs.length) return null;
  parts.push(text.slice(start));
  return { parts, exprs };
}

function toBindingSource(
  val: string,
  loc: P5Loc,
  table: ExprTable,
  exprKind: Exclude<ExpressionType, 'Interpolation' | 'IsIterator'>
): ExprRef {
  // Property-like contexts must always be parsed as expressions.
  // Interpolation is handled only for text nodes or plain attributes (handled elsewhere).
  return toExprRef(val, loc, table, exprKind);
}

function toInterpIR(inter: { parts: string[]; exprs: string[] }, loc: P5Loc, table: ExprTable): InterpIR {
  const exprs: ExprRef[] = inter.exprs.map(code => table.add(code, loc, 'IsProperty'));
  return { kind: 'interp', parts: inter.parts, exprs, loc: toSpan(loc, table.file) };
}
function toExprRef(code: string, loc: P5Loc, table: ExprTable, parseKind: ExpressionType): ExprRef {
  return table.add(code, loc, parseKind);
}

function parseRepeatTailProps(raw: string, loc: P5Loc, table: ExprTable): MultiAttrIR[] | null {
  const semi = raw.indexOf(';');
  if (semi < 0) return null;
  const tail = raw.slice(semi + 1).trim();
  if (!tail) return null;
  // single pair "name: value"
  const m = /^([^:]+):\s*(.+)$/.exec(tail);
  if (!m) return null;
  const to = m[1].trim();
  const val = m[2].trim();
  const from = toExprRef(val, loc, table, 'IsProperty');
  return [{ type: 'multiAttr', to, command: null, from, value: val, loc: toSpan(loc, table.file) }];
}

function toSpan(loc: P5Loc, file?: string): SourceSpan | null {
  if (!loc) return null;
  return { start: loc.startOffset, end: loc.endOffset, file };
}

/* =======================================================================================
 * parse5 type guards + id/table helpers
 * ======================================================================================= */

function isElement(n: P5Node): n is P5Element { return (n as P5Element).tagName != null; }
function isText(n: P5Node): n is P5Text { return n.nodeName === '#text'; }
function isComment(n: P5Node): n is DefaultTreeAdapterMap['commentNode'] { return n.nodeName === '#comment'; }
function findAttr(el: P5Element, name: string): Token.Attribute | undefined { return (el.attrs ?? []).find(a => a.name === name); }

// buildDomChildren and collectRows derive NodeIds via the same path counters.
// Because NodeIdGen uses per-level indices, skipping a subtree in collectRows (e.g., local CEs) does not shift sibling NodeIds.
class NodeIdGen {
  private readonly stack: number[] = [];
  public pushElement(index: number): string {
    this.stack.push(index);
    return this.current();
  }
  public pop(): void { this.stack.pop(); }
  public current(): string { return this.stack.length === 0 ? '0' : `0/${this.stack.join('/')}`; }
}

class ExprTable {
  public entries: ExprTableEntry[] = [];
  private readonly seen = new Map<string, ExprId>();
  public constructor(private readonly parser: IExpressionParser, public readonly file: string) {}
  public add(code: string, loc: P5Loc, mode: ExpressionType): ExprRef {
    const start = loc?.startOffset ?? 0;
    const end = loc?.endOffset ?? 0;
    const key = `${this.file}|${start}|${end}|${mode}|${code}`;
    let id = this.seen.get(key);
    if (!id) {
      id = `expr_${hash64(key)}` as ExprId;
      const ast = this.parser.parse(code, mode);
      const astKind: ExprTableEntry['astKind'] =
        mode === 'IsIterator'
          ? 'ForOfStatement'
          : mode === 'Interpolation'
            ? 'Interpolation'
            : 'IsBindingBehavior';
      this.entries.push({ id, astKind, ast: (ast ?? undefined) as AureliaAst });
    }
    return { id, code, loc: toSpan(loc, this.file) };
  }
}

// Expr table IDs are stable based on file+span+kind+code. This keeps deduping deterministic.
function hash64(s: string): string {
  let h1 = 0x9E3779B1 | 0, h2 = 0x85EBCA77 | 0;
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = (h1 ^ c) * 0x27d4eb2d; h2 = (h2 ^ c) * 0x165667b1; }
  const u = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return `${u(h1)}${u(h2)}`;
}

