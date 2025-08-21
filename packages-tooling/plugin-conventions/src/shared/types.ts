/* ===========================
 * Brands & primitive types
 * =========================== */

type Brand<T, N extends string> = T & { __brand: N };

// NOTE: NodeId uniqueness is **per TemplateIR** (template-local). ScopeGraph/Emit must carry the owning template.
// If we ever need module-global IDs, add (templateIndex|fileId) disambiguator.
export type NodeId = Brand<string, 'NodeId'>; // e.g. '0/2/1', '0/3#text@0', '0/1@attr:value'
export type ExprId = Brand<string, 'ExprId'>; // deterministic (e.g., hash of file+loc+code+mode)

// TODO: Builder currently hardcodes 'html'. Add ns detection for SVG/MathML when needed.
export type Namespace = 'html' | 'svg' | 'mathml';

export interface SourceSpan {
  start: number; // inclusive UTF-16 offset
  end: number;   // exclusive UTF-16 offset
  file?: string;
}

export type JsonValue =
  | null | boolean | number | string
  | JsonValue[] | { [k: string]: JsonValue };

/* ===========================
 * DOM tree (static markup)
 * =========================== */

export type NodeKind = 'element' | 'text' | 'comment' | 'template';

export interface BaseNode {
  kind: NodeKind;
  id: NodeId;
  ns: Namespace;
  loc?: SourceSpan | null;
}

export interface Attr {
  name: string;         // authored (case preserved)
  value: string | null; // null for boolean attrs
  // NOTE: For HTML, authoring case is preserved here; normalization happens in Semantics/Naming.
  caseSensitive?: boolean;
}

export interface ElementNode extends BaseNode {
  kind: 'element';
  tag: string;           // lower-case for HTML; preserved for SVG/MathML
  attrs: Attr[];         // static attrs only
  children: DOMNode[];
  selfClosed?: boolean;
}

// NOTE: Each TemplateIR has a synthetic fragment root (this node) with id '0'.
export interface TemplateNode extends BaseNode {
  kind: 'template';
  attrs: Attr[];
  children: DOMNode[];
}

export interface TextNode extends BaseNode {
  kind: 'text';
  text: string;
}

export interface CommentNode extends BaseNode {
  kind: 'comment';
  text: string;
}

export type DOMNode = ElementNode | TemplateNode | TextNode | CommentNode;

/* =========================================
 * Expressions (IR references to AST entries)
 * ========================================= */

export interface ExprRef {
  id: ExprId;
  code: string; // exact authored text
  loc?: SourceSpan | null;
}

export interface InterpIR {
  kind: 'interp';
  parts: string[];   // parts.length = exprs.length + 1
  exprs: ExprRef[];
  loc?: SourceSpan | null;
}

export type BindingSourceIR = ExprRef | InterpIR;

/* ===========================
 * Binding modes (runtime)
 * =========================== */

// NOTE: 'default' is resolved to an effective mode during Semantics linking.
export type BindingMode = 'default' | 'oneTime' | 'toView' | 'fromView' | 'twoWay';

/* ====================================
 * repeat.for declaration convenience
 * ==================================== */

// NOTE: Analysis uses ForOfStatement via expr table; IR also carries a lighter ForOfIR.
export interface ForOfIR {
  /** ExprId of the parsed ForOfStatement (full `lhs of rhs` header) in the module expr table. */
  astId: ExprId; // → ForOfStatement in exprTable
  loc?: SourceSpan | null;
}

/* ===========================
 * Instruction IR (slim set)
 * =========================== */

/** Bindables attach to elements/attributes/controllers via `props`. */
export interface PropertyBindingIR {
  type: 'propertyBinding';
  to: string;
  from: BindingSourceIR;
  mode: BindingMode;
  loc?: SourceSpan | null;
}

export interface SetPropertyIR {
  type: 'setProperty';
  to: string;
  value: JsonValue;
  loc?: SourceSpan | null;
}

export interface AttributeBindingIR {
  type: 'attributeBinding';
  attr: string; // raw attr
  to: string;   // normalized target
  from: BindingSourceIR;
  loc?: SourceSpan | null;
}

export interface StylePropertyBindingIR {
  type: 'stylePropertyBinding';
  to: string; // CSS prop
  from: BindingSourceIR;
  loc?: SourceSpan | null;
}

// TODO: Only used for grouped aux. Not fully parsed yet.
/** Multi-attribute group container (e.g., repeat key.bind or iterator tail `; name: value`). */
export interface MultiAttrIR {
  type: 'multiAttr';
  to: string;
  command?: string | null;              // 'bind', 'from-view', ...
  from?: BindingSourceIR | null;        // parsed expression or interpolation
  value?: string | null;                // raw group text if helpful
  loc?: SourceSpan | null;
}

// NOTE: Semantics.repeat.iteratorProp defines the canonical name (typically 'items').
/** Iterator binding used by the repeat template controller. */
export interface IteratorBindingIR {
  type: 'iteratorBinding';
  to: string;           // usually 'items'
  forOf: ForOfIR;
  /** Optional tail props parsed from `repeat.for="lhs of rhs; name: value"`. */
  props?: MultiAttrIR[] | null;
  loc?: SourceSpan | null;
}

/** <let foo.bind='...'> */
export interface LetBindingIR {
  type: 'letBinding';
  to: string;
  from: BindingSourceIR;
  loc?: SourceSpan | null;
}

/** Text interpolation binding for a text node. */
export interface TextBindingIR {
  type: 'textBinding';
  from: BindingSourceIR;
  loc?: SourceSpan | null;
}

// TODO: capture/modifier are not normalized (e.g., passive/once); Event options left to runtime for MVP.
/** Event listener binding (click.trigger etc.). */
export interface ListenerBindingIR {
  type: 'listenerBinding';
  to: string;        // event name
  from: ExprRef;     // handler
  capture?: boolean;
  modifier?: string | null; // single modifier for MVP
  loc?: SourceSpan | null;
}

// TODO: Distinguish element vs view-model refs once ElementRes gains instance type info.
/** ref='eltOrVmRef' */
export interface RefBindingIR {
  type: 'refBinding';
  to: string;
  from: ExprRef; // often just an identifier
  loc?: SourceSpan | null;
}

/** Static attributes (no binding). */
export interface SetAttributeIR {
  type: 'setAttribute';
  to: string;
  value: string | null;
  loc?: SourceSpan | null;
}
export interface SetClassAttributeIR {
  type: 'setClassAttribute';
  value: string;
  loc?: SourceSpan | null;
}
export interface SetStyleAttributeIR {
  type: 'setStyleAttribute';
  value: string;
  loc?: SourceSpan | null;
}

/* ---- Context-constrained bindable subsets ---- */

export type ElementBindableIR =
  | PropertyBindingIR
  | SetPropertyIR
  | AttributeBindingIR
  | StylePropertyBindingIR
  | MultiAttrIR;

export type ControllerBindableIR =
  | PropertyBindingIR
  | SetPropertyIR
  | AttributeBindingIR
  | StylePropertyBindingIR
  | MultiAttrIR
  | IteratorBindingIR; // only valid on repeat template controller

/* ---- Hydration instructions ---- */

// NOTE: Not emitted by the current builder (kept for parity with runtime compiler). Linker may ignore for MVP.
export interface HydrateElementIR {
  type: 'hydrateElement';
  res: string;
  props: ElementBindableIR[];
  projections?: { slot?: string | null; def: TemplateIR }[];
  containerless?: boolean;
  /** Optional hoisted static data for CE bindables; if present, remove from ElementNode.attrs to avoid duplication. */
  data?: Record<string, string | null>;
  loc?: SourceSpan | null;
}

// NOTE: Not emitted by the current builder (placeholder for future custom attributes).
export interface HydrateAttributeIR {
  type: 'hydrateAttribute';
  res: string;
  props: ElementBindableIR[];
  alias?: string | null;
  data?: Record<string, string | null>;
  loc?: SourceSpan | null;
}

/* ---- Template controllers & branches ---- */

export type TemplateControllerRes = 'repeat' | 'with' | 'if' | 'switch' | 'promise' | 'portal';
export type TemplateControllerAlias = 'then' | 'catch' | 'case' | 'default';

export type ControllerBranchInfo =
  | { kind: 'then';    local?: string | null } // promise then
  | { kind: 'catch';   local?: string | null } // promise catch
  | { kind: 'case';    expr: ExprRef }         // switch case with expression
  | { kind: 'default' };                       // switch default

// NOTE: For promise/switch, branch alias/local is represented structurally via `branch`. Avoid stashing in `def.meta`.
export interface HydrateTemplateControllerIR {
  type: 'hydrateTemplateController';
  res: TemplateControllerRes; // e.g., 'repeat', 'if', 'with', 'promise', 'switch', 'portal'
  def: TemplateIR;            // nested template/view
  props: ControllerBindableIR[];
  alias?: TemplateControllerAlias | null; // branch alias when applicable (informational)
  branch?: ControllerBranchInfo | null;   // structural branch payload (then/catch/case/default)
  containerless?: boolean;
  loc?: SourceSpan | null;
}

/** Hydrate a <let> element; instructions are strictly LetBindingIR. */
export interface HydrateLetElementIR {
  type: 'hydrateLetElement';
  instructions: LetBindingIR[];
  toBindingContext: boolean;
  loc?: SourceSpan | null;
}

/* ---- Per-node instruction rows ---- */

export type InstructionIR =
  | HydrateTemplateControllerIR
  | HydrateElementIR
  | HydrateAttributeIR
  | HydrateLetElementIR
  | PropertyBindingIR
  | SetPropertyIR
  | IteratorBindingIR
  | RefBindingIR
  | LetBindingIR
  | TextBindingIR
  | ListenerBindingIR
  | AttributeBindingIR
  | StylePropertyBindingIR
  | SetAttributeIR
  | SetClassAttributeIR
  | SetStyleAttributeIR;

// NOTE: target NodeId is template-local; rows belong to their owning TemplateIR.
export interface InstructionRow {
  target: NodeId;                 // DOM node that receives/hosts these instructions
  instructions: InstructionIR[];  // deterministic order
}

/* ===========================
 * Module & Template
 * =========================== */

/** Root-level compiled unit: templates + shared expression table. */
export interface IrModule {
  version: 'aurelia-ir@1';
  templates: TemplateIR[];
  /** Optional shared sidecar for dev/LSP; can be stripped for shipping. */
  exprTable?: ExprTableEntry[];
  name?: string;
  meta?: Record<string, unknown>;
}

// NOTE: Nested TemplateIR instances appear under controllers; their NodeIds start at '0' independently.
// If cross-template references are ever needed, add explicit parent pointers or template ids.
/** Each template has a synthetic fragment root (<template>-like) as `dom`. */
export interface TemplateIR {
  dom: TemplateNode; // root with children = top-level nodes
  rows: InstructionRow[];
  name?: string;
  meta?: Record<string, unknown>;
}

/* ===========================
 * Expression AST
 * =========================== */

export type UnaryOperator = 'void' | 'typeof' | '!' | '-' | '+' | '++' | '--';
export type BinaryOperator =
  | '??' | '&&' | '||'
  | '==' | '===' | '!=' | '!=='
  | 'instanceof' | 'in'
  | '+' | '-' | '*' | '/' | '%' | '**'
  | '<' | '>' | '<=' | '>=' ;
export type AssignmentOperator = '=' | '/=' | '*=' | '+=' | '-=';

export type IsPrimary =
  | AccessThisExpression
  | AccessBoundaryExpression
  | AccessScopeExpression
  | AccessGlobalExpression
  | ArrayLiteralExpression
  | ObjectLiteralExpression
  | PrimitiveLiteralExpression
  | TemplateExpression
  | NewExpression;

export type IsLiteral =
  | ArrayLiteralExpression
  | ObjectLiteralExpression
  | PrimitiveLiteralExpression
  | TemplateExpression;

export type IsLeftHandSide =
  | IsPrimary
  | CallGlobalExpression
  | CallFunctionExpression
  | CallMemberExpression
  | CallScopeExpression
  | AccessMemberExpression
  | AccessKeyedExpression
  | TaggedTemplateExpression;

export type IsUnary = IsLeftHandSide | UnaryExpression;
export type IsBinary = IsUnary | BinaryExpression;
export type IsConditional = IsBinary | ConditionalExpression;
export type IsAssign = IsConditional | AssignExpression | ArrowFunction;
export type IsValueConverter = IsAssign | ValueConverterExpression;
export type IsBindingBehavior = IsValueConverter | BindingBehaviorExpression;
export type IsAssignable = AccessScopeExpression | AccessKeyedExpression | AccessMemberExpression | AssignExpression;
export type BindingIdentifierOrPattern = BindingIdentifier | ArrayBindingPattern | ObjectBindingPattern;
export type IsExpression = IsBindingBehavior | Interpolation;
export type AnyBindingExpression<TCustom extends CustomExpression = CustomExpression> =
  | Interpolation
  | ForOfStatement
  | TCustom
  | IsBindingBehavior;

/* ---- AST nodes (derived flags removed) ---- */

export interface CustomExpression {
  $kind: 'Custom';
  value: unknown;
}

export interface BindingBehaviorExpression {
  $kind: 'BindingBehavior';
  key: string; // `_bb_${name}`; may be recomputed by producer
  expression: IsBindingBehavior;
  name: string;
  args: IsAssign[];
}

export interface ValueConverterExpression {
  $kind: 'ValueConverter';
  expression: IsValueConverter;
  name: string;
  args: IsAssign[];
}

export interface AssignExpression {
  $kind: 'Assign';
  target: IsAssignable;
  value: IsAssign;
  op: AssignmentOperator;
}

export interface ConditionalExpression {
  $kind: 'Conditional';
  condition: IsBinary;
  yes: IsAssign;
  no: IsAssign;
}

// NOTE: Analysis v0: not produced/handled. Keep type for future support.
export interface AccessGlobalExpression {
  $kind: 'AccessGlobal';
  name: string;
}

export interface AccessThisExpression {
  $kind: 'AccessThis';
  ancestor: number;
}

// NOTE: Analysis v0: ignored. $parent-depth boundaries to be added in a later pass.
export interface AccessBoundaryExpression {
  $kind: 'AccessBoundary';
}

export interface AccessScopeExpression {
  $kind: 'AccessScope';
  name: string;
  ancestor: number;
}

export interface AccessMemberExpression {
  $kind: 'AccessMember';
  object: IsLeftHandSide;
  name: string;
  optional: boolean;
}

export interface AccessKeyedExpression {
  $kind: 'AccessKeyed';
  object: IsLeftHandSide;
  key: IsAssign;
  optional: boolean;
}

export interface NewExpression {
  $kind: 'New';
  func: IsLeftHandSide;
  args: IsAssign[];
}

export interface CallScopeExpression {
  $kind: 'CallScope';
  name: string;
  args: IsAssign[];
  ancestor: number;
  optional: boolean;
}

export interface CallMemberExpression {
  $kind: 'CallMember';
  object: IsLeftHandSide;
  name: string;
  args: IsAssign[];
  optionalMember: boolean;
  optionalCall: boolean;
}

export interface CallFunctionExpression {
  $kind: 'CallFunction';
  func: IsLeftHandSide;
  args: IsAssign[];
  optional: boolean;
}

export interface CallGlobalExpression {
  $kind: 'CallGlobal';
  name: string;
  args: IsAssign[];
}

export interface BinaryExpression {
  $kind: 'Binary';
  operation: BinaryOperator;
  left: IsBinary;
  right: IsBinary;
}

export interface UnaryExpression {
  $kind: 'Unary';
  operation: UnaryOperator;
  expression: IsLeftHandSide;
  pos: 0 | 1; // 0: prefix, 1: suffix
}

export interface PrimitiveLiteralExpression<
  TValue extends null | undefined | number | boolean | string =
    null | undefined | number | boolean | string
> {
  $kind: 'PrimitiveLiteral';
  value: TValue;
}

export interface ArrayLiteralExpression {
  $kind: 'ArrayLiteral';
  elements: IsAssign[];
}

export interface ObjectLiteralExpression {
  $kind: 'ObjectLiteral';
  keys: (number | string)[];
  values: IsAssign[];
}

export interface TemplateExpression {
  $kind: 'Template';
  cooked: string[];
  expressions: IsAssign[];
}

export interface TaggedTemplateExpression {
  $kind: 'TaggedTemplate';
  cooked: (string[] & { raw?: string[] });
  func: IsLeftHandSide;
  expressions: IsAssign[];
}

export interface ArrayBindingPattern {
  $kind: 'ArrayBindingPattern';
  elements: IsAssign[];
}

export interface ObjectBindingPattern {
  $kind: 'ObjectBindingPattern';
  keys: (string | number)[];
  values: IsAssign[];
}

export interface BindingIdentifier {
  $kind: 'BindingIdentifier';
  name: string;
}

// NOTE: Kept in expr table for precise scoping of repeat; IR also carries a lighter ForOfIR.
export interface ForOfStatement {
  $kind: 'ForOfStatement';
  declaration: BindingIdentifierOrPattern | DestructuringAssignmentExpression;
  iterable: IsBindingBehavior;
  semiIdx: number;
}

// NOTE: Text interpolation is lowered to TextBindingIR with InterpIR (parts + expr refs).
export interface Interpolation {
  $kind: 'Interpolation';
  parts: string[];
  expressions: IsBindingBehavior[];
}

export interface DestructuringAssignmentExpression {
  $kind: 'ArrayDestructuring' | 'ObjectDestructuring';
  list: (DestructuringAssignmentExpression | DestructuringAssignmentSingleExpression | DestructuringAssignmentRestExpression)[];
  source: AccessMemberExpression | AccessKeyedExpression | undefined;
  initializer: IsBindingBehavior | undefined;
}

export interface DestructuringAssignmentSingleExpression {
  $kind: 'DestructuringAssignmentLeaf';
  target: AccessMemberExpression;
  source: AccessMemberExpression | AccessKeyedExpression;
  initializer: IsBindingBehavior | undefined;
}

export interface DestructuringAssignmentRestExpression {
  $kind: 'DestructuringAssignmentLeaf';
  target: AccessMemberExpression;
  indexOrProperties: string[] | number;
}

export interface ArrowFunction {
  $kind: 'ArrowFunction';
  args: BindingIdentifier[];
  body: IsAssign;
  rest: boolean;
}

/* ===========================================
 * Expression Table (module-level)
 * =========================================== */

export type AureliaAst =
  | IsExpression
  | ForOfStatement
  | BindingIdentifierOrPattern
  | DestructuringAssignmentExpression
  | DestructuringAssignmentSingleExpression
  | DestructuringAssignmentRestExpression
  | ArrowFunction;

// NOTE: ast may be undefined at runtime in slim builds; consumers must not rely on runtime shapes.
// Consider adding a minimal schema version to gate future AST changes.
export interface ExprTableEntry {
  id: ExprId;
  astKind: 'IsBindingBehavior' | 'IsAssign' | 'Interpolation' | 'ForOfStatement' | 'Unknown';
  ast: AureliaAst;
}
