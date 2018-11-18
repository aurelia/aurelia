import { Class, DI, IContainer, IRegistry, IResolver, Registration, Reporter } from '@aurelia/kernel';
import { AttrSyntax } from './ast';

/*@internal*/
export class CharSpec {
  public chars: string;
  public repeat: boolean;
  public separator: boolean;

  public has: (char: string) => boolean;

  constructor(chars: string, repeat: boolean, separator: boolean) {
    this.chars = chars;
    this.repeat = repeat;
    this.separator = separator;
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

  public equals(other: CharSpec): boolean {
    return this.chars === other.chars;
  }

  private hasOfMultiple(char: string): boolean {
    return this.chars.indexOf(char) !== -1;
  }

  private hasOfSingle(char: string): boolean {
    return this.chars === char;
  }

  private hasOfNone(char: string): boolean {
    return false;
  }
}

const identifierChars = '-_$+abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const asciiCharSpecs = Array(127);
for (let i = 0; i < 127; ++i) {
  const ch = String.fromCharCode(i);
  asciiCharSpecs[i] = new CharSpec(ch, false, identifierChars.indexOf(ch) === -1);
}
const identifierCharSpec = new CharSpec(identifierChars, true, false);

export class Interpretation {
  public pattern: string | null;
  public parts: string[];
  private current: string;

  constructor() {
    this.pattern = null;
    this.parts = [];
    this.current = '';
  }

  public append(ch: string): void {
    this.current += ch;
  }

  public next(): void {
    if (this.current.length > 0) {
      this.parts.push(this.current);
      this.current = '';
    }
  }
}

/*@internal*/
export class State {
  public charSpec: CharSpec;
  public nextStates: State[];
  public types: SegmentTypes | null;
  public pattern: string | null;

  constructor(charSpec: CharSpec) {
    this.charSpec = charSpec;
    this.nextStates = [];
    this.types = null;
    this.pattern = null;
  }

  public findChild(charSpec: CharSpec): State {
    const nextStates = this.nextStates;
    const len = nextStates.length;
    let child: State = null;
    let i = 0;
    while (i < len) {
      child = nextStates[i];
      if (charSpec.equals(child.charSpec)) {
        return child;
      }
      ++i;
    }
    return null;
  }

  public append(charSpec: CharSpec): State {
    let state = this.findChild(charSpec);
    if (state === null) {
      state = new State(charSpec);
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
    let child: State = null;
    let consumed: boolean = false;
    let i = 0;
    while (i < len) {
      child = nextStates[i];
      if (child.charSpec.has(ch)) {
        results.push(child);
        if (consumed === false) {
          consumed = true;
          if (child.charSpec.separator) {
            interpretation.next();
          } else {
            interpretation.append(ch);
          }
        }
      }
      ++i;
    }
    return results;
  }
}

/*@internal*/
export interface ISegment {
  text: string;
  eachChar(callback: (spec: CharSpec) => void): void;
}

/*@internal*/
export class StaticSegment implements ISegment {
  public text: string;
  private len: number;
  private specs: CharSpec[];

  constructor(text: string) {
    this.text = text;
    const len = this.len = text.length;
    const specs = this.specs = [];
    let i = 0;
    while (i < len) {
      specs.push(asciiCharSpecs[text[i].charCodeAt(0)]);
      ++i;
    }
  }

  public eachChar(callback: (spec: CharSpec) => void): void {
    const { len, specs } = this;
    let i = 0;
    while (i < len) {
      callback(specs[i]);
      ++i;
    }
  }
}

/*@internal*/
export class PartSegment implements ISegment {
  public text: string;

  constructor() {
    this.text = 'PART';
  }

  public eachChar(callback: (spec: CharSpec) => void): void {
    callback(identifierCharSpec);
  }
}

/*@internal*/
export class SymbolSegment implements ISegment {
  public text: string;
  private spec: CharSpec;

  constructor(text: string) {
    this.text = text;
    this.spec = asciiCharSpecs[this.text.charCodeAt(0)];
  }

  public eachChar(callback: (spec: CharSpec) => void): void {
    callback(this.spec);
  }
}

/*@internal*/
export class SegmentTypes {
  public identifiers: number;
  public parts: number;
  public symbols: number;

  constructor() {
    this.identifiers = 0;
    this.parts = 0;
    this.symbols = 0;
  }
}

export interface ISyntaxInterpreter {
  add(pattern: string): void;
  add(patterns: string[]): void;
  add(patternOrPatterns: string | string[]): void;
  interpret(value: string): Interpretation;
}

export const ISyntaxInterpreter = DI.createInterface<ISyntaxInterpreter>().withDefault(x => x.singleton(SyntaxInterpreter));

/*@internal*/
export class SyntaxInterpreter {
  public rootState: State;
  private initialStates: State[];

  constructor() {
    this.rootState = new State(null);
    this.initialStates = [this.rootState];
  }

  public add(pattern: string): void;
  public add(patterns: string[]): void;
  public add(patternOrPatterns: string | string[]): void {
    let i = 0;
    if (Array.isArray(patternOrPatterns)) {
      const ii = patternOrPatterns.length;
      for (; i < ii; ++i) {
        this.add(patternOrPatterns[i]);
      }
      return;
    }
    let currentState = this.rootState;
    const types = new SegmentTypes();
    const segments = this.parse(patternOrPatterns, types);
    const len = segments.length;
    i = 0;
    while (i < len) {
      segments[i].eachChar(ch => {
        currentState = currentState.append(ch);
      });
      ++i;
    }
    currentState.types = types;
    currentState.pattern = patternOrPatterns;
  }

  public interpret(value: string): Interpretation {
    const interpretation = new Interpretation();
    let states = this.initialStates;
    const len = value.length;
    let i = 0;
    while (i < len) {
      states = this.getNextStates(states, value.charAt(i), interpretation);
      if (states.length === 0) {
        break;
      }
      ++i;
    }

    states.sort((a, b) => {
      const aTypes = a.types;
      const bTypes = b.types;
      if (aTypes.identifiers !== bTypes.identifiers) {
        return bTypes.identifiers - aTypes.identifiers;
      }
      if (aTypes.parts !== bTypes.parts) {
        return bTypes.parts - aTypes.parts;
      }
      if (aTypes.symbols !== bTypes.symbols) {
        return bTypes.symbols - aTypes.symbols;
      }
      return 0;
    });

    if (states.length > 0) {
      const state = states[0];
      if (!state.charSpec.separator) {
        interpretation.next();
      }
      interpretation.pattern = state.pattern;
    }
    return interpretation;
  }

  public getNextStates(states: State[], ch: string, interpretation: Interpretation): State[] {
    // TODO: reuse preallocated arrays
    const nextStates: State[] = [];
    let state: State = null;
    const len = states.length;
    let i = 0;
    while (i < len) {
      state = states[i];
      nextStates.push(...state.findMatches(ch, interpretation));
      ++i;
    }

    return nextStates;
  }

  private parse(input: string, types: SegmentTypes): ISegment[] {
    const result = [];
    const len = input.length;
    let i = 0;
    let start = 0;
    let c = '';

    while (i < len) {
      c = input.charAt(i);
      if (identifierChars.indexOf(c) !== -1) {
        if (i === start) {
          if (c === 'P' && input.slice(i, i + 4) === 'PART') {
            start = i = (i + 4);
            result.push(new PartSegment());
            ++types.parts;
          } else {
            ++i;
          }
        } else {
          ++i;
        }
      } else if (i !== start) {
        result.push(new StaticSegment(input.slice(start, i)));
        ++types.identifiers;
        start = i;
      } else {
        result.push(new SymbolSegment(input.slice(start, i + 1)));
        ++types.symbols;
        start = ++i;
      }
    }
    if (start !== i) {
      result.push(new StaticSegment(input.slice(start, i)));
      ++types.identifiers;
    }

    return result;
  }
}

function validatePrototype(handler: IAttributePatternHandler, patternOrPatterns: string | string[]): void {
  const patterns = Array.isArray(patternOrPatterns) ? patternOrPatterns : [patternOrPatterns];
  for (const pattern of patterns) {
    // note: we're intentionally not throwing here
    if (!(pattern in handler)) {
      Reporter.write(401, pattern); // TODO: organize error codes
    } else if (typeof handler[pattern] !== 'function') {
      Reporter.write(402, pattern); // TODO: organize error codes
    }
  }
}

export interface IAttributePattern {
  $patterns: string[];
}

export interface IAttributePatternHandler {
  [pattern: string]: (rawName: string, rawValue: string, parts: string[]) => AttrSyntax;
}

export const IAttributePattern = DI.createInterface<IAttributePattern>().noDefault();

type DecoratableAttributePattern<TProto, TClass> = Class<TProto & Partial<IAttributePattern>, TClass> & Partial<IRegistry>;
type DecoratedAttributePattern<TProto, TClass> =  Class<TProto & IAttributePattern, TClass> & IRegistry;

type AttributePatternDecorator = <TProto, TClass>(target: DecoratableAttributePattern<TProto, TClass>) => DecoratedAttributePattern<TProto, TClass>;

export function attributePattern(...patterns: string[]): AttributePatternDecorator {
  return function decorator<TProto, TClass>(target: DecoratableAttributePattern<TProto, TClass>): DecoratedAttributePattern<TProto, TClass> {
    const proto = target.prototype;
    validatePrototype(proto as unknown as IAttributePatternHandler, patterns);
    proto.$patterns = patterns;

    target.register = function register(container: IContainer): IResolver {
      return Registration.singleton(IAttributePattern, target).register(container, IAttributePattern);
    };
    return target as DecoratedAttributePattern<TProto, TClass>;
  } as AttributePatternDecorator;
}

export interface DotSeparatedAttributePattern extends IAttributePattern {}

@attributePattern('PART.PART', 'PART.PART.PART')
export class DotSeparatedAttributePattern implements DotSeparatedAttributePattern {
  public static register: IRegistry['register'];

  public ['PART.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], parts[1]);
  }

  public ['PART.PART.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], parts[2]);
  }
}

export interface ColonPrefixedBindAttributePattern extends IAttributePattern {}

@attributePattern(':PART')
export class ColonPrefixedBindAttributePattern implements ColonPrefixedBindAttributePattern  {
  public static register: IRegistry['register'];

  public [':PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'bind');
  }
}

export interface AtPrefixedTriggerAttributePattern extends IAttributePattern {}

@attributePattern('@PART')
export class AtPrefixedTriggerAttributePattern implements AtPrefixedTriggerAttributePattern  {
  public static register: IRegistry['register'];

  public ['@PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
  }
}
