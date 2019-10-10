import { Class, DI, IContainer, IRegistry, PLATFORM, Registration, Reporter } from '@aurelia/kernel';
import { AttrSyntax } from './ast';

export interface AttributePatternDefinition {
  pattern: string;
  symbols: string;
}

/** @internal */
export interface ICharSpec {
  chars: string;
  repeat: boolean;
  isSymbol: boolean;
  isInverted: boolean;
  has(char: string): boolean;
  equals(other: ICharSpec): boolean;
}

/** @internal */
export class CharSpec implements ICharSpec {
  public chars: string;
  public repeat: boolean;
  public isSymbol: boolean;
  public isInverted: boolean;

  public has: (char: string) => boolean;

  public constructor(chars: string, repeat: boolean, isSymbol: boolean, isInverted: boolean) {
    this.chars = chars;
    this.repeat = repeat;
    this.isSymbol = isSymbol;
    this.isInverted = isInverted;
    if (isInverted) {
      switch (chars.length) {
        case 0:
          this.has = this.hasOfNoneInverse;
          break;
        case 1:
          this.has = this.hasOfSingleInverse;
          break;
        default:
          this.has = this.hasOfMultipleInverse;
      }
    } else {
      switch (chars.length) {
        case 0:
          this.has = this.hasOfNone;
          break;
        case 1:
          this.has = this.hasOfSingle;
          break;
        default:
          this.has = this.hasOfMultiple;
      }
    }
  }

  public equals(other: ICharSpec): boolean {
    return this.chars === other.chars
        && this.repeat === other.repeat
        && this.isSymbol === other.isSymbol
        && this.isInverted === other.isInverted;
  }

  private hasOfMultiple(char: string): boolean {
    return this.chars.includes(char);
  }

  private hasOfSingle(char: string): boolean {
    return this.chars === char;
  }

  private hasOfNone(char: string): boolean {
    return false;
  }

  private hasOfMultipleInverse(char: string): boolean {
    return !this.chars.includes(char);
  }

  private hasOfSingleInverse(char: string): boolean {
    return this.chars !== char;
  }

  private hasOfNoneInverse(char: string): boolean {
    return true;
  }
}

export class Interpretation {
  public parts: readonly string[];
  public get pattern(): string | null {
    const value = this._pattern;
    if (value === '') {
      return null;
    } else {
      return value;
    }
  }
  public set pattern(value: string | null) {
    if (value == null) {
      this._pattern = '';
      this.parts = PLATFORM.emptyArray;
    } else {
      this._pattern = value;
      this.parts = this.partsRecord[value];
    }
  }
  private _pattern: string;
  private readonly currentRecord: Record<string, string>;
  private readonly partsRecord: Record<string, string[]>;

  public constructor() {
    this._pattern = '';
    this.parts = PLATFORM.emptyArray;
    this.currentRecord = {};
    this.partsRecord = {};
  }

  public append(pattern: string, ch: string): void {
    const { currentRecord } = this;
    if (currentRecord[pattern] === undefined) {
      currentRecord[pattern] = ch;
    } else {
      currentRecord[pattern] += ch;
    }
  }

  public next(pattern: string): void {
    const { currentRecord } = this;
    if (currentRecord[pattern] !== undefined) {
      const { partsRecord } = this;
      if (partsRecord[pattern] === undefined) {
        partsRecord[pattern] = [currentRecord[pattern]];
      } else {
        partsRecord[pattern].push(currentRecord[pattern]);
      }
      currentRecord[pattern] = undefined!;
    }
  }
}

/** @internal */
export class State {
  public charSpec: ICharSpec;
  public nextStates: State[];
  public types: SegmentTypes | null;
  public patterns: string[];
  public isEndpoint: boolean;
  public get pattern(): string | null {
    return this.isEndpoint ? this.patterns[0] : null;
  }

  public constructor(charSpec: ICharSpec, ...patterns: string[]) {
    this.charSpec = charSpec;
    this.nextStates = [];
    this.types = null;
    this.patterns = patterns;
    this.isEndpoint = false;
  }

  public findChild(charSpec: ICharSpec): State {
    const nextStates = this.nextStates;
    const len = nextStates.length;
    let child: State = null!;
    for (let i = 0; i < len; ++i) {
      child = nextStates[i];
      if (charSpec.equals(child.charSpec)) {
        return child;
      }
    }
    return null!;
  }

  public append(charSpec: ICharSpec, pattern: string): State {
    const { patterns } = this;
    if (!patterns.includes(pattern)) {
      patterns.push(pattern);
    }
    let state = this.findChild(charSpec);
    if (state == null) {
      state = new State(charSpec, pattern);
      this.nextStates.push(state);
      if (charSpec.repeat) {
        state.nextStates.push(state);
      }
    }
    return state;
  }

  public findMatches(ch: string, interpretation: Interpretation): State[] {
    // TODO: reuse preallocated arrays
    const results = [];
    const nextStates = this.nextStates;
    const len = nextStates.length;
    let childLen = 0;
    let child: State = null!;
    let i = 0;
    let j = 0;
    for (; i < len; ++i) {
      child = nextStates[i];
      if (child.charSpec.has(ch)) {
        results.push(child);
        childLen = child.patterns.length;
        j = 0;
        if (child.charSpec.isSymbol) {
          for (; j < childLen; ++j) {
            interpretation.next(child.patterns[j]);
          }
        } else {
          for (; j < childLen; ++j) {
            interpretation.append(child.patterns[j], ch);
          }
        }
      }
    }
    return results;
  }
}

/** @internal */
export interface ISegment {
  text: string;
  eachChar(callback: (spec: CharSpec) => void): void;
}

/** @internal */
export class StaticSegment implements ISegment {
  public text: string;
  private readonly len: number;
  private readonly specs: CharSpec[];

  public constructor(text: string) {
    this.text = text;
    const len = this.len = text.length;
    const specs = this.specs = [] as CharSpec[];
    for (let i = 0; i < len; ++i) {
      specs.push(new CharSpec(text[i], false, false, false));
    }
  }

  public eachChar(callback: (spec: CharSpec) => void): void {
    const { len, specs } = this;
    for (let i = 0; i < len; ++i) {
      callback(specs[i]);
    }
  }
}

/** @internal */
export class DynamicSegment implements ISegment {
  public text: string;
  private readonly spec: CharSpec;

  public constructor(symbols: string) {
    this.text = 'PART';
    this.spec = new CharSpec(symbols, true, false, true);
  }

  public eachChar(callback: (spec: CharSpec) => void): void {
    callback(this.spec);
  }
}

/** @internal */
export class SymbolSegment implements ISegment {
  public text: string;
  private readonly spec: CharSpec;

  public constructor(text: string) {
    this.text = text;
    this.spec = new CharSpec(text, false, true, false);
  }

  public eachChar(callback: (spec: CharSpec) => void): void {
    callback(this.spec);
  }
}

/** @internal */
export class SegmentTypes {
  public statics: number;
  public dynamics: number;
  public symbols: number;

  public constructor() {
    this.statics = 0;
    this.dynamics = 0;
    this.symbols = 0;
  }
}

export interface ISyntaxInterpreter {
  add(def: AttributePatternDefinition): void;
  add(defs: AttributePatternDefinition[]): void;
  add(defOrDefs: AttributePatternDefinition | AttributePatternDefinition[]): void;
  interpret(value: string): Interpretation;
}

export const ISyntaxInterpreter = DI.createInterface<ISyntaxInterpreter>('ISyntaxInterpreter').withDefault(x => x.singleton(SyntaxInterpreter));

/** @internal */
export class SyntaxInterpreter {
  public rootState: State;
  private readonly initialStates: State[];

  public constructor() {
    this.rootState = new State(null!);
    this.initialStates = [this.rootState];
  }

  public add(def: AttributePatternDefinition): void;
  public add(defs: AttributePatternDefinition[]): void;
  public add(defOrDefs: AttributePatternDefinition | AttributePatternDefinition[]): void {
    let i = 0;
    if (Array.isArray(defOrDefs)) {
      const ii = defOrDefs.length;
      for (; i < ii; ++i) {
        this.add(defOrDefs[i]);
      }
      return;
    }
    let currentState = this.rootState;
    const def = defOrDefs;
    const pattern = def.pattern;
    const types = new SegmentTypes();
    const segments = this.parse(def, types);
    const len = segments.length;
    const callback = (ch: ICharSpec): void => {
      currentState = currentState.append(ch, pattern);
    };
    for (i = 0; i < len; ++i) {
      segments[i].eachChar(callback);
    }
    currentState.types = types;
    currentState.isEndpoint = true;
  }

  public interpret(name: string): Interpretation {
    const interpretation = new Interpretation();
    let states = this.initialStates;
    const len = name.length;
    for (let i = 0; i < len; ++i) {
      states = this.getNextStates(states, name.charAt(i), interpretation);
      if (states.length === 0) {
        break;
      }
    }

    states.sort((a, b) => {
      if (a.isEndpoint) {
        if (!b.isEndpoint) {
          return -1;
        }
      } else if (b.isEndpoint) {
        return 1;
      } else {
        return 0;
      }
      const aTypes = a.types!;
      const bTypes = b.types!;
      if (aTypes.statics !== bTypes.statics) {
        return bTypes.statics - aTypes.statics;
      }
      if (aTypes.dynamics !== bTypes.dynamics) {
        return bTypes.dynamics - aTypes.dynamics;
      }
      if (aTypes.symbols !== bTypes.symbols) {
        return bTypes.symbols - aTypes.symbols;
      }
      return 0;
    });

    if (states.length > 0) {
      const state = states[0];
      if (!state.charSpec.isSymbol) {
        interpretation.next(state.pattern!);
      }
      interpretation.pattern = state.pattern;
    }
    return interpretation;
  }

  public getNextStates(states: State[], ch: string, interpretation: Interpretation): State[] {
    // TODO: reuse preallocated arrays
    const nextStates: State[] = [];
    let state: State = null!;
    const len = states.length;
    for (let i = 0; i < len; ++i) {
      state = states[i];
      nextStates.push(...state.findMatches(ch, interpretation));
    }

    return nextStates;
  }

  private parse(def: AttributePatternDefinition, types: SegmentTypes): ISegment[] {
    const result = [];
    const pattern = def.pattern;
    const len = pattern.length;
    let i = 0;
    let start = 0;
    let c = '';

    while (i < len) {
      c = pattern.charAt(i);
      if (!def.symbols.includes(c)) {
        if (i === start) {
          if (c === 'P' && pattern.slice(i, i + 4) === 'PART') {
            start = i = (i + 4);
            result.push(new DynamicSegment(def.symbols));
            ++types.dynamics;
          } else {
            ++i;
          }
        } else {
          ++i;
        }
      } else if (i !== start) {
        result.push(new StaticSegment(pattern.slice(start, i)));
        ++types.statics;
        start = i;
      } else {
        result.push(new SymbolSegment(pattern.slice(start, i + 1)));
        ++types.symbols;
        start = ++i;
      }
    }
    if (start !== i) {
      result.push(new StaticSegment(pattern.slice(start, i)));
      ++types.statics;
    }

    return result;
  }
}

function validatePrototype(handler: IAttributePatternHandler, patternDefs: AttributePatternDefinition[]): void {
  for (const def of patternDefs) {
    // note: we're intentionally not throwing here
    if (!(def.pattern in handler)) {
      Reporter.write(401, def.pattern); // TODO: organize error codes
    } else if (typeof handler[def.pattern] !== 'function') {
      Reporter.write(402, def.pattern); // TODO: organize error codes
    }
  }
}

export interface IAttributePattern {
  $patternDefs: AttributePatternDefinition[];
}

export interface IAttributePatternHandler {
  [pattern: string]: (rawName: string, rawValue: string, parts: readonly string[]) => AttrSyntax;
}

export const IAttributePattern = DI.createInterface<IAttributePattern>('IAttributePattern').noDefault();

type DecoratableAttributePattern<TProto, TClass> = Class<TProto & Partial<IAttributePattern | IAttributePatternHandler>, TClass> & Partial<IRegistry>;
type DecoratedAttributePattern<TProto, TClass> =  Class<TProto & IAttributePattern | IAttributePatternHandler, TClass> & IRegistry;

type AttributePatternDecorator = <TProto, TClass>(target: DecoratableAttributePattern<TProto, TClass>) => DecoratedAttributePattern<TProto, TClass>;

export function attributePattern(...patternDefs: AttributePatternDefinition[]): AttributePatternDecorator {
  return function decorator<TProto, TClass>(target: DecoratableAttributePattern<TProto, TClass>): DecoratedAttributePattern<TProto, TClass> {
    const proto = target.prototype;
    // Note: the prototype is really meant to be an intersection type between IAttrubutePattern and IAttributePatternHandler, but
    // a type with an index signature cannot be intersected with anything else that has normal property names.
    // So we're forced to use a union type and cast it here.
    validatePrototype(proto as IAttributePatternHandler, patternDefs);
    proto.$patternDefs = patternDefs;

    target.register = function register(container: IContainer): void {
      Registration.singleton(IAttributePattern, target).register(container);
    };
    return target as DecoratedAttributePattern<TProto, TClass>;
  } as AttributePatternDecorator;
}
