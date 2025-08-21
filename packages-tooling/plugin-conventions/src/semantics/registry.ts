import type { BindingMode } from '../shared/types';

/** Schema version for Semantics. Keep stable across linker/analysis. */
export type SemVersion = 'aurelia-semantics@1';

export interface Semantics {
  version: SemVersion;

  /**
   * Project/resource registry:
   * - `elements`: custom elements (components) by kebab tag (e.g., 'au-compose').
   * - `attributes`: custom attributes (non-controller) by kebab name.
   * - `controllers`: built-in template controllers (repeat/with/promise/if/switch/portal).
   * - `valueConverters` & `bindingBehaviors`: analysis hints; no structural effect.
   */
  resources: {
    elements: Record<string, ElementRes>;
    attributes: Record<string, AttrRes>;
    controllers: Controllers;
    valueConverters: Record<string, ValueConverterSig>;
    bindingBehaviors: Record<string, BindingBehaviorSig>;
  };

  /**
   * DOM schema (HTML only for now).
   * - Guides attribute→property normalization and native prop default modes.
   * - Per-element overrides mirror runtime **AttrMapper** behavior.
   */
  dom: DomSchema;

  /**
   * Naming rules:
   * - Global + per-tag `attr→prop` mapping (priority: perTag > element.attrToProp > global > camelCase).
   * - Preserve `data-*` / `aria-*` authored forms (never camelCase).
   */
  naming: Naming;

  /** Event name → event type (global with optional per-element overrides). */
  events: EventSchema;

  /**
   * Static **two-way** defaults approximating runtime `AttrMapper.isTwoWay()`.
   * - Linker may use this to resolve `mode: 'default'` into an `effectiveMode`.
   * - Analysis can refine based on IR evidence (e.g., `<input type="checkbox">` → `checked`).
   */
  twoWayDefaults: TwoWayDefaults;
}

/* =======================
 * Resource declarations
 * ======================= */

/** Component/attribute bindable (a *real* prop; not used for repeat header options). */
export interface Bindable {
  name: string;           // canonical property name (camelCase)
  mode?: BindingMode;     // default binding mode (if defined by the resource)
  type?: TypeRef;         // static type hint for analysis/emit
  doc?: string;           // human note; no runtime effect
}

/** Custom element resource (component boundary). */
export interface ElementRes {
  kind: 'element';
  name: string;                                   // canonical name (kebab)
  bindables: Record<string, Bindable>;            // by prop name (camelCase)
  aliases?: string[];                             // additional names resolving to this resource
  containerless?: boolean;                        // element can be used containerless
  /**
   * Component boundary: instances start a new binding-context boundary.
   * - Differs from template-controller 'overlay' (which is *not* a boundary).
   * - ScopeGraph should treat element VMs as a new `$this` root; `$parent` escapes upward.
   */
  boundary?: boolean;
}

/** Custom attribute resource (optionally a template controller). */
export interface AttrRes {
  kind: 'attribute';
  name: string;                                   // canonical name (kebab)
  isTemplateController?: boolean;                 // true for TC-type attributes
  bindables: Record<string, Bindable>;            // include 'value' for single-value CA
  primary?: string | null;                        // primary bindable for single-value usage
  aliases?: string[];                             // name aliases
  noMultiBindings?: boolean;                      // disallow 'p1: a; p2.bind: b' when true
}

/** Scope behavior for template controllers. */
export type ScopeBehavior =
  | 'reuse'    // evaluate in parent scope (no overlay, no boundary) — e.g., if/switch/portal
  | 'overlay'; // Scope.fromParent(parent, overlayValue) — repeat/with/promise (NOT a boundary)
// NOTE: Custom *elements* are boundaries (see ElementRes.boundary).

/** Built-in controllers with Aurelia scope semantics captured. */
export interface Controllers {
  repeat: RepeatController;
  with: SimpleController<'with'>;
  promise: PromiseController;
  if: SimpleController<'if'>;
  switch: SwitchController;
  portal: PortalController; // evaluates in parent scope; content teleported
}

/* ---- repeat (iterator) ----
 * Header:  repeat.for="LHS of RHS[; tailOptions]"
 * - Contextuals: $index, $first, $last, $even, $odd, $length, $middle
 * - Tail options (e.g., `key`) are **not bindables**: they belong to the header (mode-less).
 *   Treat them as `header options` so the linker/analysis never conflates them with component props.
 */
export interface IteratorTailPropSpec {
  name: string;                                   // option name (e.g., 'key')
  type?: TypeRef;                                 // analysis hint
  /** Supported header syntaxes: 'key: expr' (null) and/or 'key.bind="expr"' ('bind'). */
  accepts?: readonly ('bind' | null)[];
  doc?: string;
}

export interface RepeatController {
  kind: 'controller';
  res: 'repeat';
  scope: ScopeBehavior;                           // 'overlay' (new override context; not a boundary)
  /** Canonical iterator prop; IR `IteratorBindingIR.to` is normalized to this. */
  iteratorProp: string;                           // usually 'items'
  /** Header options (NOT bindables). */
  tailProps?: Record<string, IteratorTailPropSpec>;
  /** Contextual vars added to override context. */
  contextuals: readonly [
    '$index', '$first', '$last', '$even', '$odd', '$length', '$middle'
  ];
}

/* ---- Simple value controllers (with/if) ----
 * - with: overlay scope (expressions see overlay object as `$this`).
 * - if:   reuse parent scope (no overlay/boundary).
 */
export interface SimpleController<R extends 'with' | 'if'> {
  kind: 'controller';
  res: R;
  scope: ScopeBehavior;                           // 'overlay' for with, 'reuse' for if
  props: Record<string, Bindable>;                // typically { value }
}

/* ---- Promise controller ----
 * - overlay scope; branch templates (then/catch) may introduce a *local* alias.
 * - Alias is surfaced via IR meta; ScopeGraph materializes it.
 */
export interface PromiseController {
  kind: 'controller';
  res: 'promise';
  scope: ScopeBehavior;                           // 'overlay'
  props: Record<string, Bindable>;                // { value }
  branches: readonly ('then' | 'catch')[];
  branchAllowsAlias: boolean;                     // <template then="r">, <template catch="e">
}

/* ---- Switch controller ----
 * - reuse scope; branches ('case'/'default') evaluate in same scope.
 */
export interface SwitchController {
  kind: 'controller';
  res: 'switch';
  scope: ScopeBehavior;                           // 'reuse'
  props: Record<string, Bindable>;                // { value }
  branches: readonly ('case' | 'default')[];
}

/* ---- Portal controller ----
 * - Moves content to a different host; *expressions evaluate in parent scope*.
 * - No overlay, no boundary: pure 'reuse'. `$parent` keeps working from the portal site.
 */
export interface PortalController {
  kind: 'controller';
  res: 'portal';
  scope: ScopeBehavior;                           // 'reuse'
  props: Record<string, Bindable>;                // { value } carries target/flag if authored
}

/* =======================
 * DOM & Events
 * ======================= */

/** DOM schema mirrors runtime AttrMapper & common props for attr→prop & default modes. */
export interface DomSchema {
  ns: 'html';                                     // html only (for now)
  elements: Record<string, DomElement>;           // key: tag name (lowercase)
}

export interface DomElement {
  tag: string;                                    // lowercase HTML tag
  props: Record<string, DomProp>;                 // by prop name (camelCase)
  /**
   * Per-element attribute normalization overrides.
   * - Mirrors parts of runtime AttrMapper.useMapping.
   * - Priority: naming.perTag > element.attrToProp > naming.global > fallback camelCase.
   */
  attrToProp?: Record<string, string>;
}

export interface DomProp {
  type: TypeRef;                                  // e.g., string, boolean, FileList, Date|null
  mode?: BindingMode;                             // default binding mode for this native prop
}

/** Event schema (grows over time). */
export interface EventSchema {
  byName: Record<string, TypeRef>;                // global defaults (e.g., click → MouseEvent)
  byElement?: Record<string, Record<string, TypeRef>>; // optional per-tag overrides
}

/* =======================
 * Types (analysis-only)
 * ======================= */

export interface ValueConverterSig {
  name: string;
  /** For now, treat converters as identity unless configured. */
  in?: TypeRef;
  out?: TypeRef;
}

export interface BindingBehaviorSig {
  name: string;
  // behaviors don't affect static shapes here; reserved for future extensions.
}

export type TypeRef =
  | { kind: 'ts'; name: string }                  // e.g., 'string', 'boolean', 'MouseEvent', 'Promise<unknown>'
  | { kind: 'any' }
  | { kind: 'unknown' };

/* =======================
 * Naming rules
 * ======================= */

export interface Naming {
  /** Global attribute→property normalization (fallback). */
  attrToPropGlobal: Record<string, string>;
  /** Per-tag overrides (highest normalization priority). */
  perTag?: Record<string, Record<string, string>>;
  /**
   * Prefixes that **must not** be camelCased (preserve authored form).
   * - Runtime AttrMapper preserves `data-*`/`aria-*`.
   * - Linker: check this **before** any camelCase fallback.
   */
  preserveAttrPrefixes?: readonly string[];
}

/* =======================
 * Two-way defaults (runtime parity hints)
 * ======================= */

export interface TwoWayDefaults {
  /**
   * Tag-level default two-way props, independent of instance state.
   * (Analysis can refine with additional evidence, e.g., input[type].)
   */
  byTag: Record<string, readonly string[]>;
  /**
   * Props that default to two-way across *all* elements.
   * Runtime: scrollTop/scrollLeft are broadly two-way.
   */
  globalProps: readonly string[];
  /**
   * Conditional two-way hints needing analysis of static attributes:
   * e.g., { prop:'textContent', requiresAttr:'contenteditable' }.
   */
  conditional?: readonly { prop: string; requiresAttr: string }[];
}

/* =======================
 * Default registry
 * ======================= */

export const DEFAULT: Semantics = {
  version: 'aurelia-semantics@1',

  resources: {
    /* ---- Custom elements ----
     * - A *component* element forms a binding boundary (boundary: true).
     * - Bindables are actual component props; linker resolves to these before native DOM props.
     */
    elements: {
      // au-compose: loads/hydrates a component dynamically. Treat as a boundary.
      'au-compose': {
        kind: 'element',
        name: 'au-compose',
        boundary: true,                            // component boundary (new $this root)
        containerless: false,
        bindables: {
          subject:    { name: 'subject',    type: { kind: 'unknown' },          mode: 'toView', doc: 'Component or view to compose' },
          view:       { name: 'view',       type: { kind: 'ts', name: 'string' }, mode: 'toView', doc: 'View URL/template (optional)' },
          viewModel:  { name: 'viewModel',  type: { kind: 'unknown' },          mode: 'toView', doc: 'View-model type/instance (optional)' },
          model:      { name: 'model',      type: { kind: 'unknown' },          mode: 'toView', doc: 'Activation model payload (optional)' },
          component:  { name: 'component',  type: { kind: 'unknown' },          mode: 'toView', doc: 'Alias for subject/component' },
        },
      },

      // au-slot: projection target when shadow DOM isn't used (or as explicit slot point).
      // Not a boundary; expressions within projected content evaluate where authored.
      'au-slot': {
        kind: 'element',
        name: 'au-slot',
        boundary: false,
        containerless: false,
        bindables: {
          name: { name: 'name', type: { kind: 'ts', name: 'string' }, mode: 'toView', doc: 'Named slot (default when absent)' },
        },
      },
    },

    /* ---- Custom attributes ----
     * (Built-in template controllers are modeled under `controllers`.)
     */
    attributes: {
      focus: {
        kind: 'attribute',
        name: 'focus',
        isTemplateController: false,
        bindables: {
          value: { name: 'value', mode: 'twoWay', type: { kind: 'ts', name: 'boolean' } }
        }
      },
      show: {
        kind: 'attribute',
        name: 'show',
        isTemplateController: false,
        bindables: {
          value: { name: 'value', mode: 'toView', type: { kind: 'ts', name: 'boolean' } }
        },
        aliases: ['hide']
      },
    },

    /* ---- Built-in template controllers ----
     * - 'repeat'/'with'/'promise' create an *overlay* scope (not a boundary).
     * - 'if'/'switch'/'portal' *reuse* the parent scope.
     * - 'repeat' tail options (e.g., 'key') are *not bindables*; they live on the header.
     * - Promise branches may declare a local alias (ScopeGraph binds it from IR meta).
     */
    controllers: {
      repeat: {
        kind: 'controller',
        res: 'repeat',
        scope: 'overlay',
        iteratorProp: 'items',
        tailProps: {
          // Supports "key: expr" and "key.bind='expr'".
          key: { name: 'key', type: { kind: 'unknown' }, accepts: ['bind', null], doc: 'Stable key for keyed repeat' },
        },
        contextuals: ['$index', '$first', '$last', '$even', '$odd', '$length', '$middle'],
      },

      with: {
        kind: 'controller',
        res: 'with',
        scope: 'overlay',
        props: { value: { name: 'value', type: { kind: 'any' }, mode: 'default', doc: 'Overlay object' } },
      },

      promise: {
        kind: 'controller',
        res: 'promise',
        scope: 'overlay',
        props: { value: { name: 'value', type: { kind: 'ts', name: 'Promise<unknown>' }, mode: 'default', doc: 'Promise to await' } },
        branches: ['then', 'catch'],
        branchAllowsAlias: true,
      },

      if: {
        kind: 'controller',
        res: 'if',
        scope: 'reuse',
        props: { value: { name: 'value', type: { kind: 'ts', name: 'boolean' }, mode: 'default', doc: 'Condition' } },
      },

      switch: {
        kind: 'controller',
        res: 'switch',
        scope: 'reuse',
        props: { value: { name: 'value', type: { kind: 'unknown' }, mode: 'default', doc: 'Discriminant value' } },
        branches: ['case', 'default'],
      },

      portal: {
        kind: 'controller',
        res: 'portal',
        scope: 'reuse', // expressions inside portal evaluate in the *parent* scope
        props: { value: { name: 'value', type: { kind: 'unknown' }, mode: 'default', doc: 'Target/flag; interpreted at runtime' } },
      },
    },

    /* ---- Value converters & binding behaviors ----
     * Analysis treats VCs as identity unless configured; BBs don't change static shapes in MVP.
     */
    valueConverters: {
      identity: { name: 'identity', in: { kind: 'unknown' }, out: { kind: 'unknown' } },
    },
    bindingBehaviors: {},
  },

  /* ---- DOM schema (HTML-only) ----
   * Mirrors runtime AttrMapper and common props to guide attr→prop + default modes.
   * - `attrToProp` entries reflect AttrMapper.useMapping per tag.
   * - Global mappings live under `naming.attrToPropGlobal`.
   */
  dom: {
    ns: 'html',
    elements: {
      // Form controls
      input: {
        tag: 'input',
        props: {
          value:         { type: { kind: 'ts', name: 'string'          }, mode: 'twoWay' },
          checked:       { type: { kind: 'ts', name: 'boolean'         }, mode: 'twoWay' }, // refined by type=checkbox|radio
          files:         { type: { kind: 'ts', name: 'FileList | null' }, mode: 'twoWay' },
          valueAsNumber: { type: { kind: 'ts', name: 'number'          }, mode: 'twoWay' },
          valueAsDate:   { type: { kind: 'ts', name: 'Date | null'     }, mode: 'twoWay' },
          type:          { type: { kind: 'ts', name: 'string'          } },
          disabled:      { type: { kind: 'ts', name: 'boolean'         }, mode: 'toView' },
        },
        // Per-element overrides (mirrors AttrMapper.useMapping for INPUT)
        attrToProp: {
          maxlength: 'maxLength',
          minlength: 'minLength',
          formaction: 'formAction',
          formenctype: 'formEncType',
          formmethod: 'formMethod',
          formnovalidate: 'formNoValidate',
          formtarget: 'formTarget',
          inputmode: 'inputMode',
        },
      },
      textarea: {
        tag: 'textarea',
        props: {
          value:    { type: { kind: 'ts', name: 'string'  }, mode: 'twoWay' },
          disabled: { type: { kind: 'ts', name: 'boolean' }, mode: 'toView'  },
        },
        attrToProp: { maxlength: 'maxLength' },     // AttrMapper.useMapping for TEXTAREA
      },
      select: {
        tag: 'select',
        props: {
          value:    { type: { kind: 'ts', name: 'string | string[]' }, mode: 'twoWay' },
          multiple: { type: { kind: 'ts', name: 'boolean'           }, mode: 'toView' },
          disabled: { type: { kind: 'ts', name: 'boolean'           }, mode: 'toView' },
        },
      },
      option: {
        tag: 'option',
        props: {
          value:    { type: { kind: 'ts', name: 'string'  }, mode: 'toView' },
          selected: { type: { kind: 'ts', name: 'boolean' }, mode: 'twoWay' },
          disabled: { type: { kind: 'ts', name: 'boolean' }, mode: 'toView' },
        },
      },

      // Label/Img mapping (mirrors AttrMapper.useMapping)
      label: {
        tag: 'label',
        props: { htmlFor: { type: { kind: 'ts', name: 'string' }, mode: 'toView' } },
        attrToProp: { for: 'htmlFor' },
      },
      img: {
        tag: 'img',
        props: { useMap: { type: { kind: 'ts', name: 'string' }, mode: 'toView' } },
        attrToProp: { usemap: 'useMap' },
      },

      // Table cells (mirrors AttrMapper.useMapping for TD/TH)
      td: {
        tag: 'td',
        props: { rowSpan: { type: { kind: 'ts', name: 'number' } }, colSpan: { type: { kind: 'ts', name: 'number' } } },
        attrToProp: { rowspan: 'rowSpan', colspan: 'colSpan' },
      },
      th: {
        tag: 'th',
        props: { rowSpan: { type: { kind: 'ts', name: 'number' } }, colSpan: { type: { kind: 'ts', name: 'number' } } },
        attrToProp: { rowspan: 'rowSpan', colspan: 'colSpan' },
      },

      // Generic elements (common props; not exhaustive)
      div: {
        tag: 'div',
        props: {
          className:    { type: { kind: 'ts', name: 'string' } },
          // NOTE: `style` as a *property* is CSSStyleDeclaration; attribute is string → we bind both ways:
          // - `style="..."` → SetStyleAttribute / AttributeBinding (string)
          // - `style.prop="..."` → property binding (object); keep TS type for awareness
          style:        { type: { kind: 'ts', name: 'CSSStyleDeclaration' } },
          textContent:  { type: { kind: 'ts', name: 'string' } },  // two-way when [contenteditable]
          innerHTML:    { type: { kind: 'ts', name: 'string' } },  // two-way when [contenteditable]
          scrollTop:    { type: { kind: 'ts', name: 'number' } },  // twoWayDefaults.globalProps
          scrollLeft:   { type: { kind: 'ts', name: 'number' } },  // twoWayDefaults.globalProps
        },
      },
      span:     { tag: 'span',     props: { textContent: { type: { kind: 'ts', name: 'string' } } } },
      form:     { tag: 'form',     props: {} },
      button:   { tag: 'button',   props: { disabled: { type: { kind: 'ts', name: 'boolean' }, mode: 'toView' } } },
      template: { tag: 'template', props: {} },
      // (extend with more tags as needed)
    },
  },

  /* ---- Naming rules ----
   * Priority: perTag > element.attrToProp > global > fallback camelCase.
   * Non-DOM correction: never camelCase preserved prefixes (data-/aria-).
   */
  naming: {
    attrToPropGlobal: {
      // Mirrors AttrMapper.useGlobalMapping
      accesskey: 'accessKey',
      contenteditable: 'contentEditable',
      tabindex: 'tabIndex',
      textcontent: 'textContent',
      innerhtml: 'innerHTML',
      scrolltop: 'scrollTop',
      scrollleft: 'scrollLeft',
      readonly: 'readOnly',
      // Common HTML attributes we map globally
      class: 'className',
      style: 'style',
      colspan: 'colSpan',
      rowspan: 'rowSpan',
      outerhtml: 'outerHTML',
      maxlength: 'maxLength',
      minlength: 'minLength',
    },
    perTag: {
      // Mirrors AttrMapper.useMapping
      label:   { for: 'htmlFor' },
      img:     { usemap: 'useMap' },
      input:   {
        maxlength: 'maxLength',
        minlength: 'minLength',
        formaction: 'formAction',
        formenctype: 'formEncType',
        formmethod: 'formMethod',
        formnovalidate: 'formNoValidate',
        formtarget: 'formTarget',
        inputmode: 'inputMode',
      },
      textarea: { maxlength: 'maxLength' },
      td:       { rowspan: 'rowSpan', colspan: 'colSpan' },
      th:       { rowspan: 'rowSpan', colspan: 'colSpan' },
    },
    preserveAttrPrefixes: ['data-', 'aria-'],
  },

  /* ---- Events ----
   * Global defaults with optional per-element refinements.
   */
  events: {
    byName: {
      click:   { kind: 'ts', name: 'MouseEvent' },
      input:   { kind: 'ts', name: 'InputEvent' },
      change:  { kind: 'ts', name: 'Event' },
      submit:  { kind: 'ts', name: 'SubmitEvent' },
      keydown: { kind: 'ts', name: 'KeyboardEvent' },
      keyup:   { kind: 'ts', name: 'KeyboardEvent' },
      focus:   { kind: 'ts', name: 'FocusEvent' },
      blur:    { kind: 'ts', name: 'FocusEvent' },
    },
    byElement: {
      // Customize per tag if needed (example only)
      // input: { change: { kind: 'ts', name: 'Event' } }
    },
  },

  /* ---- Two-way defaults ----
   * Mirrors runtime AttrMapper.isTwoWay behavior at a *static* level.
   * - Linker can use `byTag`/`globalProps` for `effectiveMode` when authored mode === 'default'.
   * - Analysis should refine conditionals (e.g., contenteditable) and `<input type=...>` cases.
   */
  twoWayDefaults: {
    byTag: {
      // Runtime: <input> two-way for value/files/valueAsNumber/valueAsDate, and for checked (checkbox/radio).
      // Here we list all; analysis refines by `type` when available in IR (SetAttribute('type', ...)).
      input:   ['value', 'files', 'valueAsNumber', 'valueAsDate', 'checked'],
      textarea:['value'],
      select:  ['value'],
    },
    // Runtime: scrollTop/scrollLeft are two-way broadly.
    globalProps: ['scrollTop', 'scrollLeft'],
    // Runtime: textContent/innerHTML become two-way when [contenteditable] present.
    conditional: [
      { prop: 'textContent', requiresAttr: 'contenteditable' },
      { prop: 'innerHTML',   requiresAttr: 'contenteditable' },
    ],
  },
};
