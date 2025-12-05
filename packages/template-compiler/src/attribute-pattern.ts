import type { Constructable, IRegistry, } from '@aurelia/kernel';
import { IContainer, registrableMetadataKey, emptyArray, getResourceKeyFor, resolve } from '@aurelia/kernel';
import { tcCreateInterface, tcObjectFreeze, singletonRegistration } from './utilities';
import { ErrorNames, createMappedError } from './errors';

export interface AttributePatternDefinition<T extends string = string> {
  pattern: T;
  symbols: string;
}

export class AttrSyntax {
  public constructor(
    public rawName: string,
    public rawValue: string,
    public target: string,
    public command: string | null,
    public parts: readonly string[] | null = null
  ) { }
}

export type IAttributePattern<T extends string = string> = Record<T, (rawName: string, rawValue: string, parts: readonly string[]) => AttrSyntax>;

export const IAttributePattern = /*@__PURE__*/tcCreateInterface<IAttributePattern>('IAttributePattern');

// Pattern matching algorithm:
// - Compile patterns to token sequences: 'PART.PART' -> [PART, LIT('.'), PART]
// - Linear scan all patterns, keep best match by score (statics > dynamics > symbols)
// - Cache results by attribute name
//
// Why linear scan instead of NFA? Pattern count is small (~10), names are short,
// and caching ensures matching runs once per unique name. Simpler and more performant.

type Token =
  | { readonly kind: 0 /* PART */ }
  | { readonly kind: 1 /* LIT */; readonly value: string };

const TOKEN_PART = 0;
const TOKEN_LIT = 1;

interface PatternScore {
  readonly statics: number;
  readonly dynamics: number;
  readonly symbols: number;
}

function createSymbolSet(symbols: string): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i < symbols.length; i++) {
    set.add(symbols[i]);
  }
  return set;
}

function compilePattern(pattern: string, symbols: string): { tokens: Token[]; score: PatternScore } {
  const tokens: Token[] = [];
  const symbolSet = createSymbolSet(symbols);
  let statics = 0;
  let dynamics = 0;
  let symbolCount = 0;

  let i = 0;
  while (i < pattern.length) {
    if (pattern.startsWith('PART', i)) {
      tokens.push({ kind: TOKEN_PART });
      dynamics++;
      i += 4;
      continue;
    }

    const runStart = i;
    while (i < pattern.length && !pattern.startsWith('PART', i)) i++;
    const run = pattern.slice(runStart, i);

    // Split into symbol vs non-symbol segments for scoring
    let j = 0;
    while (j < run.length) {
      const isSymbol = symbolSet.has(run[j]);
      let k = j + 1;
      while (k < run.length && symbolSet.has(run[k]) === isSymbol) k++;
      tokens.push({ kind: TOKEN_LIT, value: run.slice(j, k) });
      if (isSymbol) symbolCount++;
      else statics++;
      j = k;
    }
  }

  return { tokens, score: { statics, dynamics, symbols: symbolCount } };
}

class CompiledPattern {
  /** @internal */ public readonly _tokens: Token[];
  /** @internal */ public readonly _score: PatternScore;
  /** @internal */ public readonly _symbolSet: Set<string>;

  public constructor(public readonly def: AttributePatternDefinition) {
    const { tokens, score } = compilePattern(def.pattern, def.symbols);
    this._tokens = tokens;
    this._score = score;
    this._symbolSet = createSymbolSet(def.symbols);
  }

  /**
   * Match input against pattern, return extracted parts or null.
   * Parts = all non-symbol text, split by symbols (for backward compat with old NFA).
   * @internal
   */
  public _tryMatch(input: string): string[] | null {
    const parts: string[] = [];
    const tokens = this._tokens;
    const symbolSet = this._symbolSet;
    let pos = 0;
    let currentPart = '';

    for (let t = 0; t < tokens.length; t++) {
      const token = tokens[t];

      if (token.kind === TOKEN_LIT) {
        const { value } = token;
        if (!input.startsWith(value, pos)) return null;

        for (let i = 0; i < value.length; i++) {
          const ch = value[i];
          if (symbolSet.has(ch)) {
            if (currentPart.length > 0) {
              parts.push(currentPart);
              currentPart = '';
            }
          } else {
            currentPart += ch;
          }
        }
        pos += value.length;
      } else {
        // PART: consume non-symbol chars
        const start = pos;
        while (pos < input.length && !symbolSet.has(input[pos])) pos++;
        if (pos === start) return null; // empty PART invalid
        currentPart += input.slice(start, pos);
      }
    }

    if (currentPart.length > 0) parts.push(currentPart);
    return pos === input.length ? parts : null;
  }
}

function isBetterScore(a: PatternScore, b: PatternScore): boolean {
  if (a.statics !== b.statics) return a.statics > b.statics;
  if (a.dynamics !== b.dynamics) return a.dynamics > b.dynamics;
  return a.symbols > b.symbols;
}

export class Interpretation {
  public parts: readonly string[] = emptyArray;
  /** @internal */ private _pattern: string | null = null;

  public get pattern(): string | null { return this._pattern; }
  public set pattern(value: string | null) { this._pattern = value; }

  /** @internal */
  public _set(pattern: string | null, parts: readonly string[]): void {
    this._pattern = pattern;
    this.parts = parts;
  }
}

export interface ISyntaxInterpreter {
  add(defs: AttributePatternDefinition[]): void;
  interpret(name: string): Interpretation;
}
export const ISyntaxInterpreter = /*@__PURE__*/tcCreateInterface<ISyntaxInterpreter>('ISyntaxInterpreter', x => x.singleton(SyntaxInterpreter));

export class SyntaxInterpreter implements ISyntaxInterpreter {
  /** @internal */ private readonly _patterns: CompiledPattern[] = [];
  /** @internal */ private readonly _cache = new Map<string, { pattern: string | null; parts: readonly string[] }>();

  public add(defs: AttributePatternDefinition[]): void {
    for (const def of defs) {
      this._patterns.push(new CompiledPattern(def));
    }
  }

  public interpret(name: string): Interpretation {
    const interpretation = new Interpretation();

    const cached = this._cache.get(name);
    if (cached !== void 0) {
      interpretation._set(cached.pattern, cached.parts);
      return interpretation;
    }

    let bestPattern: CompiledPattern | null = null;
    let bestParts: string[] | null = null;

    for (let i = 0; i < this._patterns.length; i++) {
      const pattern = this._patterns[i];
      const parts = pattern._tryMatch(name);
      if (parts !== null) {
        if (bestPattern === null || isBetterScore(pattern._score, bestPattern._score)) {
          bestPattern = pattern;
          bestParts = parts;
        }
      }
    }

    if (bestPattern !== null) {
      const result = { pattern: bestPattern.def.pattern, parts: bestParts! };
      this._cache.set(name, result);
      interpretation._set(result.pattern, result.parts);
    } else {
      this._cache.set(name, { pattern: null, parts: emptyArray });
    }

    return interpretation;
  }
}

export interface IAttributeParser {
  registerPattern(patterns: AttributePatternDefinition[], Type: Constructable<IAttributePattern>): void;
  parse(name: string, value: string): AttrSyntax;
}
export const IAttributeParser = /*@__PURE__*/tcCreateInterface<IAttributeParser>('IAttributeParser', x => x.singleton(AttributeParser));

export class AttributeParser implements IAttributeParser {
  /** @internal */ private readonly _interpreter = resolve(ISyntaxInterpreter);
  /** @internal */ private readonly _container = resolve(IContainer);
  /** @internal */ private readonly _patternHandlers: Record<string, { type: Constructable<IAttributePattern>; instance?: IAttributePattern }> = {};
  /** @internal */ private readonly _pendingDefs: AttributePatternDefinition[] = [];
  /** @internal */ private _initialized = false;

  public registerPattern(patterns: AttributePatternDefinition[], Type: Constructable<IAttributePattern>): void {
    if (this._initialized) throw createMappedError(ErrorNames.attribute_pattern_already_initialized);

    const handlers = this._patternHandlers;
    for (const def of patterns) {
      if (handlers[def.pattern] != null) throw createMappedError(ErrorNames.attribute_pattern_duplicate, def.pattern);
      handlers[def.pattern] = { type: Type };
    }
    this._pendingDefs.push(...patterns);
  }

  public parse(name: string, value: string): AttrSyntax {
    if (!this._initialized) {
      this._interpreter.add(this._pendingDefs);
      this._initialized = true;
    }

    const interpretation = this._interpreter.interpret(name);
    const pattern = interpretation.pattern;

    if (pattern === null) {
      return new AttrSyntax(name, value, name, null, null);
    }

    const handlerInfo = this._patternHandlers[pattern];
    if (handlerInfo.instance === void 0) {
      handlerInfo.instance = this._container.get(handlerInfo.type);
    }

    return handlerInfo.instance[pattern](name, value, interpretation.parts as string[]);
  }
}

export interface AttributePatternKind {
  readonly name: string;
  create<const K extends AttributePatternDefinition, P extends Constructable<IAttributePattern<K['pattern']>> = Constructable<IAttributePattern<K['pattern']>>>(patternDefs: K[], Type: P): IRegistry;
}

export function attributePattern<const K extends AttributePatternDefinition>(...patternDefs: K[]): <T extends Constructable<IAttributePattern<K['pattern']>>>(target: T, context: ClassDecoratorContext<T>) => T {
  return function decorator<T extends Constructable<IAttributePattern<K['pattern']>>>(target: T, context: ClassDecoratorContext<T>): T {
    context.metadata[registrableMetadataKey] = AttributePattern.create(patternDefs, target);
    return target;
  };
}

export const AttributePattern = /*@__PURE__*/ tcObjectFreeze<AttributePatternKind>({
  name: getResourceKeyFor('attribute-pattern'),
  create(patternDefs, Type) {
    return {
      register(container: IContainer) {
        container.get(IAttributeParser).registerPattern(patternDefs, Type);
        singletonRegistration(IAttributePattern, Type).register(container);
      }
    };
  },
});

// Built-in patterns

export class DotSeparatedAttributePattern {
  public static [Symbol.metadata] = {
    [registrableMetadataKey]: /*@__PURE__*/AttributePattern.create(
      [{ pattern: 'PART.PART', symbols: '.' }, { pattern: 'PART.PART.PART', symbols: '.' }],
      DotSeparatedAttributePattern
    )
  };

  public 'PART.PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], parts[1]);
  }

  public 'PART.PART.PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, `${parts[0]}.${parts[1]}`, parts[2]);
  }
}

export class RefAttributePattern {
  public static [Symbol.metadata] = {
    [registrableMetadataKey]: /*@__PURE__*/AttributePattern.create(
      [{ pattern: 'ref', symbols: '' }, { pattern: 'PART.ref', symbols: '.' }],
      RefAttributePattern
    )
  };

  public 'ref'(rawName: string, rawValue: string, _parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, 'element', 'ref');
  }

  public 'PART.ref'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    let target = parts[0];
    if (target === 'view-model') {
      target = 'component';
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn(`[aurelia] Detected view-model.ref usage: "${rawName}=${rawValue}". This is deprecated and component.ref should be used instead`);
      }
    }
    return new AttrSyntax(rawName, rawValue, target, 'ref');
  }
}

export class EventAttributePattern {
  public static [Symbol.metadata] = {
    [registrableMetadataKey]: /*@__PURE__*/AttributePattern.create(
      [{ pattern: 'PART.trigger:PART', symbols: '.:' }, { pattern: 'PART.capture:PART', symbols: '.:' }],
      EventAttributePattern
    )
  };

  public 'PART.trigger:PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'trigger', parts);
  }

  public 'PART.capture:PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'capture', parts);
  }
}

export class ColonPrefixedBindAttributePattern {
  public static [Symbol.metadata] = {
    [registrableMetadataKey]: /*@__PURE__*/AttributePattern.create(
      [{ pattern: ':PART', symbols: ':' }],
      ColonPrefixedBindAttributePattern
    )
  };

  public ':PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'bind');
  }
}

export class AtPrefixedTriggerAttributePattern {
  public static [Symbol.metadata] = {
    [registrableMetadataKey]: /*@__PURE__*/AttributePattern.create(
      [{ pattern: '@PART', symbols: '@' }, { pattern: '@PART:PART', symbols: '@:' }],
      AtPrefixedTriggerAttributePattern
    )
  };

  public '@PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
  }

  public '@PART:PART'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'trigger', [parts[0], 'trigger', ...parts.slice(1)]);
  }
}

