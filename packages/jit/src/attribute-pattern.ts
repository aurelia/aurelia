
export class CharSpec {
  public chars: string;
  public repeat: boolean;

  public has: (char: string) => boolean;

  constructor(chars: string, repeat: boolean) {
    this.chars = chars;
    this.repeat = repeat;
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

const asciiCharSpecs = Array(127);
for (let i = 0; i < 127; ++i) {
  asciiCharSpecs[i] = new CharSpec(String.fromCharCode(i), false);
}
const identifierCharSpec = new CharSpec('-abcdefghijklmnopqrstuvwxyz', true);

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

  public findMatches(ch: string): State[] {
    const results = [];
    const nextStates = this.nextStates;
    const len = nextStates.length;
    let child: State = null;
    let i = 0;
    while (i < len) {
      child = nextStates[i];
      if (child.charSpec.has(ch)) {
        results.push(child);
      }
      ++i;
    }
    return results;
  }
}

export interface ISegment {
  text: string;
  eachChar(callback: (spec: CharSpec) => void): void;
}

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

export class CommandSegment implements ISegment {
  public text: string;

  constructor() {
    this.text = 'command';
  }

  public eachChar(callback: (spec: CharSpec) => void): void {
    callback(identifierCharSpec);
  }
}

export class TargetSegment implements ISegment {
  public text: string;

  constructor() {
    this.text = 'target';
  }

  public eachChar(callback: (spec: CharSpec) => void): void {
    callback(identifierCharSpec);
  }
}

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

export class SyntaxInterpreter {
  public rootState: State;
  private initialStates: State[];

  constructor() {
    this.rootState = new State(null);
    this.initialStates = [this.rootState];
  }

  public add(pattern: string): State;
  public add(patterns: string[]): State;
  public add(patternOrPatterns: string | string[]): State {
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

    return currentState;
  }

  public interpret(value: string): string | null {
    let states = this.initialStates;
    const len = value.length;
    let i = 0;
    while (i < len) {
      states = this.getNextStates(states, value.charAt(i));
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

    if (states.length === 0) {
      return null;
    } else {
      return states[0].pattern;
    }
  }

  public getNextStates(states: State[], ch: string): State[] {
    const nextStates: State[] = [];
    let state: State = null;
    const len = states.length;
    let i = 0;
    while (i < len) {
      state = states[i];
      nextStates.push(...state.findMatches(ch));
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
