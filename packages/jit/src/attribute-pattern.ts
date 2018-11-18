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

const identifierChars = '-abcdefghijklmnopqrstuvwxyz';
const asciiCharSpecs = Array(127);
for (let i = 0; i < 127; ++i) {
  const ch = String.fromCharCode(i);
  asciiCharSpecs[i] = new CharSpec(ch, false, identifierChars.indexOf(ch) === -1);
}
const identifierCharSpec = new CharSpec(identifierChars, true, false);

export class Interpretation {
  public pattern: string;
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
export class CommandSegment implements ISegment {
  public text: string;

  constructor() {
    this.text = 'command';
  }

  public eachChar(callback: (spec: CharSpec) => void): void {
    callback(identifierCharSpec);
  }
}

/*@internal*/
export class TargetSegment implements ISegment {
  public text: string;

  constructor() {
    this.text = 'target';
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
  public commands: number;
  public targets: number;
  public symbols: number;

  constructor() {
    this.identifiers = 0;
    this.commands = 0;
    this.targets = 0;
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
      if (aTypes.commands !== bTypes.commands) {
        return bTypes.commands - aTypes.commands;
      }
      if (aTypes.targets !== bTypes.targets) {
        return bTypes.targets - aTypes.targets;
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
    let c = 0;

    while (i < len) {
      c = input.charCodeAt(i);
      // ((c >= 'a' && c <= 'z') || c === '-')
      if ((c >=  97 && c <= 122) || c ===  45) {
        if (i === start) {
          //  c === 't'
          if (c === 116) {
            if (input.slice(i, i + 6) === 'target') {
              start = i = (i + 6);
              result.push(new TargetSegment());
              ++types.targets;
            } else {
              ++i;
            }
          //         c === 'c'
          } else if (c ===  99) {
            if (input.slice(i, i + 7) === 'command') {
              start = i = (i + 7);
              result.push(new CommandSegment());
              ++types.commands;
            } else {
              ++i;
            }
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
  $patternOrPatterns: string | string[];
}

export interface IAttributePatternHandler {
  [pattern: string]: (rawName: string, rawValue: string, parts: string[]) => AttrSyntax;
}

export const IAttributePattern = DI.createInterface<IAttributePattern>().noDefault();

type DecoratableAttributePattern<TProto, TClass> = Class<TProto & Partial<IAttributePattern>, TClass> & Partial<IRegistry>;
type DecoratedAttributePattern<TProto, TClass> =  Class<TProto & IAttributePattern, TClass> & IRegistry;

type AttributePatternDecorator = <TProto, TClass>(target: DecoratableAttributePattern<TProto, TClass>) => DecoratedAttributePattern<TProto, TClass>;

export function attributePattern(pattern: string): AttributePatternDecorator;
export function attributePattern(patterns: string[]): AttributePatternDecorator;
export function attributePattern(patternOrPatterns: string | string[]): AttributePatternDecorator;
export function attributePattern(patternOrPatterns: string | string[]): AttributePatternDecorator {
  return function decorator<TProto, TClass>(target: DecoratableAttributePattern<TProto, TClass>): DecoratedAttributePattern<TProto, TClass> {
    const proto = target.prototype;
    validatePrototype(proto as unknown as IAttributePatternHandler, patternOrPatterns);

    // wrap the constructor to set the properties to the instance
    const decoratedTarget = function(...args: unknown[]): TProto {
      const instance = new target(...args);
      instance.$patternOrPatterns = patternOrPatterns;
      // assign any methods from the decorated target's prototype to the instance
      // to account for dynamically added methods
      const decoratedProto = decoratedTarget.prototype;
      Object.keys(decoratedProto).forEach(key => {
        instance[key] = decoratedProto[key];
      });
      return instance;
    } as unknown as DecoratedAttributePattern<TProto, TClass>;

    // make sure we register the decorated constructor with DI
    decoratedTarget.register = function register(container: IContainer): IResolver {
      return Registration.singleton(IAttributePattern, decoratedTarget).register(container, IAttributePattern);
    };
    // copy over any static properties such as inject (set by preceding decorators)
    // also copy the name, to be less confusing to users (so they can still use constructor.name for whatever reason)
    // the length (number of ctor arguments) is copied for the same reason
    const ownProperties = Object.getOwnPropertyDescriptors(target);
    Object.keys(ownProperties).filter(prop => prop !== 'prototype').forEach(prop => {
      Reflect.defineProperty(decoratedTarget, prop, ownProperties[prop]);
    });
    return decoratedTarget;
  } as AttributePatternDecorator;
}

export interface DotSeparatedAttributePattern extends IAttributePattern {}

@attributePattern('target.command')
export class DotSeparatedAttributePattern implements DotSeparatedAttributePattern {
  public static register: IRegistry['register'];

  public ['target.command'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], parts[1]);
  }
}

export interface ColonPrefixedBindAttributePattern extends IAttributePattern {}

@attributePattern(':target')
export class ColonPrefixedBindAttributePattern implements ColonPrefixedBindAttributePattern  {
  public static register: IRegistry['register'];

  public [':target'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'bind');
  }
}

export interface AtPrefixedTriggerAttributePattern extends IAttributePattern {}

@attributePattern('@target')
export class AtPrefixedTriggerAttributePattern implements AtPrefixedTriggerAttributePattern  {
  public static register: IRegistry['register'];

  public ['@target'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
  }
}
