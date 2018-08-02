import { RuntimeContext } from '../runtime-context';

export class AttributeName {
  constructor(
    public bindingType: BindingType,
    public name: string,
    public command?: string
  ) { }
}

class ParserState {
  public index: number;
  public input: string;
  public length: number;
  public currentValue: string;

  constructor(input: string) {
    this.index = 0;
    this.input = input;
    this.length = input.length;
    this.currentValue = '';
  }
}

export function parseAttributeName(name: string, ctx: RuntimeContext): AttributeName {
  const state = new ParserState(name);
  let $type = scanBindingTarget(state, ctx);
  if ($type & BindingType.IsCommand) {
    const targetValue = state.currentValue;
    $type = scanBindingCommand(state, ctx);
    if ($type === BindingType.UnknownCommand) {
      return new AttributeName($type, state.input);
    }
    return new AttributeName($type, targetValue, state.currentValue);
  }
  if ($type & BindingType.IsCustom) {
    return new AttributeName($type, state.currentValue);
  }
  return new AttributeName($type, state.input);
}

function scanBindingCommand(state: ParserState, ctx: RuntimeContext): BindingType {
  const start = state.index + 1; /*skip the dot*/
  const end = state.index = state.length;
  const commandValue = state.currentValue = state.input.slice(start, end);
  const command = BindingCommandLookup[commandValue];
  if (command !== undefined) {
    return command;
  }
  if (ctx.registeredCommands.includes(commandValue)) {
    return BindingType.CustomCommand;
  }
  return BindingType.UnknownCommand;
}

function scanBindingTarget(state: ParserState, ctx: RuntimeContext): BindingType {
  const { index: start, length, input } = state;
  let index = start;
  while (index < length) {
    if (input.charCodeAt(++index) === Char.Dot) {
      state.index = index;
      state.currentValue = input.slice(start, index);
      return BindingType.IsCommand;
    }
  }
  state.index = index;
  const targetValue = state.currentValue = input.slice(start, index);
  const target = BindingTargetLookup[targetValue];
  if (target !== undefined) {
    return target;
  }
  if (ctx.registeredAttributes.includes(targetValue)) {
    return BindingType.IsCustom;
  }
  return BindingType.IsPlain;
}

const enum Char {
  Dot = 0x2E
}

export const enum BindingType {
 Interpolation    = 0b110000000 << 4,
       IsPlain    = 0b010000000 << 4,
       IsRef      = 0b001010000 << 4,
       IsIterator = 0b000100000 << 4,
       IsCustom   = 0b000010000 << 4,
       IsFunction = 0b000001000 << 4,
       IsEvent    = 0b000000100 << 4,
       IsProperty = 0b000000010 << 4,
       IsCommand  = 0b000000001 << 4,
          Command =                   0b1111,
   UnknownCommand = 0b010000001 << 4 | 0b0001,
   OneTimeCommand = 0b000000011 << 4 | 0b0010,
    ToViewCommand = 0b000000011 << 4 | 0b0011,
  FromViewCommand = 0b000000011 << 4 | 0b0100,
    TwoWayCommand = 0b000000011 << 4 | 0b0101,
      BindCommand = 0b000000011 << 4 | 0b0110,
   TriggerCommand = 0b000000101 << 4 | 0b0111,
   CaptureCommand = 0b000000101 << 4 | 0b1000,
  DelegateCommand = 0b000000101 << 4 | 0b1001,
      CallCommand = 0b000001001 << 4 | 0b1010,
   OptionsCommand = 0b000010001 << 4 | 0b1011,
       ForCommand = 0b000100001 << 4 | 0b1100,
    CustomCommand = 0b000010001 << 4 | 0b1101
}

const BindingTargetLookup = {
  ['ref']: BindingType.IsRef
};

const BindingCommandLookup = {
  ['one-time']:  BindingType.OneTimeCommand,
  ['to-view']:   BindingType.ToViewCommand,
  ['from-view']: BindingType.FromViewCommand,
  ['two-way']:   BindingType.TwoWayCommand,
  ['bind']:      BindingType.BindCommand,
  ['trigger']:   BindingType.TriggerCommand,
  ['capture']:   BindingType.CaptureCommand,
  ['delegate']:  BindingType.DelegateCommand,
  ['call']:      BindingType.CallCommand,
  ['options']:   BindingType.OptionsCommand,
  ['for']:       BindingType.ForCommand
};
