this.au = this.au || {};
this.au.jit = (function (exports, kernel, runtime) {
  'use strict';

  class AttrSyntax {
      constructor(rawName, rawValue, target, command) {
          this.rawName = rawName;
          this.rawValue = rawValue;
          this.target = target;
          this.command = command;
      }
  }

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */

  function __decorate(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  }

  /** @internal */
  class CharSpec {
      constructor(chars, repeat, isSymbol, isInverted) {
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
          }
          else {
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
      equals(other) {
          return this.chars === other.chars
              && this.repeat === other.repeat
              && this.isSymbol === other.isSymbol
              && this.isInverted === other.isInverted;
      }
      hasOfMultiple(char) {
          return this.chars.indexOf(char) !== -1;
      }
      hasOfSingle(char) {
          return this.chars === char;
      }
      hasOfNone(char) {
          return false;
      }
      hasOfMultipleInverse(char) {
          return this.chars.indexOf(char) === -1;
      }
      hasOfSingleInverse(char) {
          return this.chars !== char;
      }
      hasOfNoneInverse(char) {
          return true;
      }
  }
  class Interpretation {
      get pattern() {
          const value = this._pattern;
          if (value === '') {
              return null;
          }
          else {
              return value;
          }
      }
      set pattern(value) {
          if (value === null) {
              this._pattern = '';
              this.parts = kernel.PLATFORM.emptyArray;
          }
          else {
              this._pattern = value;
              this.parts = this.partsRecord[value];
          }
      }
      constructor() {
          this._pattern = '';
          this.parts = kernel.PLATFORM.emptyArray;
          this.currentRecord = {};
          this.partsRecord = {};
      }
      append(pattern, ch) {
          const { currentRecord } = this;
          if (currentRecord[pattern] === undefined) {
              currentRecord[pattern] = ch;
          }
          else {
              currentRecord[pattern] += ch;
          }
      }
      next(pattern) {
          const { currentRecord } = this;
          if (currentRecord[pattern] !== undefined) {
              const { partsRecord } = this;
              if (partsRecord[pattern] === undefined) {
                  partsRecord[pattern] = [currentRecord[pattern]];
              }
              else {
                  partsRecord[pattern].push(currentRecord[pattern]);
              }
              currentRecord[pattern] = undefined;
          }
      }
  }
  /** @internal */
  class State {
      get pattern() {
          return this.isEndpoint ? this.patterns[0] : null;
      }
      constructor(charSpec, ...patterns) {
          this.charSpec = charSpec;
          this.nextStates = [];
          this.types = null;
          this.patterns = patterns;
          this.isEndpoint = false;
      }
      findChild(charSpec) {
          const nextStates = this.nextStates;
          const len = nextStates.length;
          let child = null;
          for (let i = 0; i < len; ++i) {
              child = nextStates[i];
              if (charSpec.equals(child.charSpec)) {
                  return child;
              }
          }
          return null;
      }
      append(charSpec, pattern) {
          const { patterns } = this;
          if (patterns.indexOf(pattern) === -1) {
              patterns.push(pattern);
          }
          let state = this.findChild(charSpec);
          if (state === null) {
              state = new State(charSpec, pattern);
              this.nextStates.push(state);
              if (charSpec.repeat) {
                  state.nextStates.push(state);
              }
          }
          return state;
      }
      findMatches(ch, interpretation) {
          // TODO: reuse preallocated arrays
          const results = [];
          const nextStates = this.nextStates;
          const len = nextStates.length;
          let childLen = 0;
          let child = null;
          let i = 0;
          let j = 0;
          for (; i < len; ++i) {
              child = nextStates[i];
              if (child.charSpec.has(ch)) {
                  results.push(child);
                  childLen = child.patterns.length;
                  if (child.charSpec.isSymbol) {
                      for (; j < childLen; ++j) {
                          interpretation.next(child.patterns[j]);
                      }
                  }
                  else {
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
  class StaticSegment {
      constructor(text) {
          this.text = text;
          const len = this.len = text.length;
          const specs = this.specs = [];
          for (let i = 0; i < len; ++i) {
              specs.push(new CharSpec(text[i], false, false, false));
          }
      }
      eachChar(callback) {
          const { len, specs } = this;
          for (let i = 0; i < len; ++i) {
              callback(specs[i]);
          }
      }
  }
  /** @internal */
  class DynamicSegment {
      constructor(symbols) {
          this.text = 'PART';
          this.spec = new CharSpec(symbols, true, false, true);
      }
      eachChar(callback) {
          callback(this.spec);
      }
  }
  /** @internal */
  class SymbolSegment {
      constructor(text) {
          this.text = text;
          this.spec = new CharSpec(text, false, true, false);
      }
      eachChar(callback) {
          callback(this.spec);
      }
  }
  /** @internal */
  class SegmentTypes {
      constructor() {
          this.statics = 0;
          this.dynamics = 0;
          this.symbols = 0;
      }
  }
  const ISyntaxInterpreter = kernel.DI.createInterface().withDefault(x => x.singleton(SyntaxInterpreter));
  /** @internal */
  class SyntaxInterpreter {
      constructor() {
          this.rootState = new State(null);
          this.initialStates = [this.rootState];
      }
      add(defOrDefs) {
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
          const callback = (ch) => {
              currentState = currentState.append(ch, pattern);
          };
          for (i = 0; i < len; ++i) {
              segments[i].eachChar(callback);
          }
          currentState.types = types;
          currentState.isEndpoint = true;
      }
      interpret(name) {
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
              }
              else if (b.isEndpoint) {
                  return 1;
              }
              else {
                  return 0;
              }
              const aTypes = a.types;
              const bTypes = b.types;
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
                  interpretation.next(state.pattern);
              }
              interpretation.pattern = state.pattern;
          }
          return interpretation;
      }
      getNextStates(states, ch, interpretation) {
          // TODO: reuse preallocated arrays
          const nextStates = [];
          let state = null;
          const len = states.length;
          for (let i = 0; i < len; ++i) {
              state = states[i];
              nextStates.push(...state.findMatches(ch, interpretation));
          }
          return nextStates;
      }
      parse(def, types) {
          const result = [];
          const pattern = def.pattern;
          const len = pattern.length;
          let i = 0;
          let start = 0;
          let c = '';
          while (i < len) {
              c = pattern.charAt(i);
              if (def.symbols.indexOf(c) === -1) {
                  if (i === start) {
                      if (c === 'P' && pattern.slice(i, i + 4) === 'PART') {
                          start = i = (i + 4);
                          result.push(new DynamicSegment(def.symbols));
                          ++types.dynamics;
                      }
                      else {
                          ++i;
                      }
                  }
                  else {
                      ++i;
                  }
              }
              else if (i !== start) {
                  result.push(new StaticSegment(pattern.slice(start, i)));
                  ++types.statics;
                  start = i;
              }
              else {
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
  function validatePrototype(handler, patternDefs) {
      for (const def of patternDefs) {
          // note: we're intentionally not throwing here
          if (!(def.pattern in handler)) {
              kernel.Reporter.write(401, def); // TODO: organize error codes
          }
          else if (typeof handler[def.pattern] !== 'function') {
              kernel.Reporter.write(402, def); // TODO: organize error codes
          }
      }
  }
  const IAttributePattern = kernel.DI.createInterface().noDefault();
  function attributePattern(...patternDefs) {
      return function decorator(target) {
          const proto = target.prototype;
          // Note: the prototype is really meant to be an intersection type between IAttrubutePattern and IAttributePatternHandler, but
          // a type with an index signature cannot be intersected with anything else that has normal property names.
          // So we're forced to use a union type and cast it here.
          validatePrototype(proto, patternDefs);
          proto.$patternDefs = patternDefs;
          target.register = function register(container) {
              return kernel.Registration.singleton(IAttributePattern, target).register(container, IAttributePattern);
          };
          return target;
      };
  }
  exports.DotSeparatedAttributePattern = class DotSeparatedAttributePattern {
      ['PART.PART'](rawName, rawValue, parts) {
          return new AttrSyntax(rawName, rawValue, parts[0], parts[1]);
      }
      ['PART.PART.PART'](rawName, rawValue, parts) {
          return new AttrSyntax(rawName, rawValue, parts[0], parts[2]);
      }
  };
  exports.DotSeparatedAttributePattern = __decorate([
      attributePattern({ pattern: 'PART.PART', symbols: '.' }, { pattern: 'PART.PART.PART', symbols: '.' })
  ], exports.DotSeparatedAttributePattern);
  exports.RefAttributePattern = class RefAttributePattern {
      ['ref'](rawName, rawValue, parts) {
          return new AttrSyntax(rawName, rawValue, 'ref', null);
      }
      ['ref.PART'](rawName, rawValue, parts) {
          return new AttrSyntax(rawName, rawValue, 'ref', parts[1]);
      }
  };
  exports.RefAttributePattern = __decorate([
      attributePattern({ pattern: 'ref', symbols: '' }, { pattern: 'ref.PART', symbols: '.' })
  ], exports.RefAttributePattern);
  exports.ColonPrefixedBindAttributePattern = class ColonPrefixedBindAttributePattern {
      [':PART'](rawName, rawValue, parts) {
          return new AttrSyntax(rawName, rawValue, parts[0], 'bind');
      }
  };
  exports.ColonPrefixedBindAttributePattern = __decorate([
      attributePattern({ pattern: ':PART', symbols: ':' })
  ], exports.ColonPrefixedBindAttributePattern);
  exports.AtPrefixedTriggerAttributePattern = class AtPrefixedTriggerAttributePattern {
      ['@PART'](rawName, rawValue, parts) {
          return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
      }
  };
  exports.AtPrefixedTriggerAttributePattern = __decorate([
      attributePattern({ pattern: '@PART', symbols: '@' })
  ], exports.AtPrefixedTriggerAttributePattern);

  const IAttributeParser = kernel.DI.createInterface()
      .withDefault(x => x.singleton(exports.AttributeParser));
  /** @internal */
  exports.AttributeParser = class AttributeParser {
      constructor(interpreter, attrPatterns) {
          this.interpreter = interpreter;
          this.cache = {};
          const patterns = this.patterns = {};
          attrPatterns.forEach(attrPattern => {
              const defs = attrPattern.$patternDefs;
              interpreter.add(defs);
              defs.forEach(def => {
                  patterns[def.pattern] = attrPattern;
              });
          });
      }
      parse(name, value) {
          let interpretation = this.cache[name];
          if (interpretation === undefined) {
              interpretation = this.cache[name] = this.interpreter.interpret(name);
          }
          const pattern = interpretation.pattern;
          if (pattern === null) {
              return new AttrSyntax(name, value, name, null);
          }
          else {
              return this.patterns[pattern][pattern](name, value, interpretation.parts);
          }
      }
  };
  exports.AttributeParser = __decorate([
      kernel.inject(ISyntaxInterpreter, kernel.all(IAttributePattern))
  ], exports.AttributeParser);

  function register(container) {
      const resourceKey = BindingCommandResource.keyFrom(this.description.name);
      container.register(kernel.Registration.singleton(resourceKey, this));
  }
  function bindingCommand(nameOrDefinition) {
      return target => BindingCommandResource.define(nameOrDefinition, target);
  }
  function keyFrom(name) {
      return `${this.name}:${name}`;
  }
  function isType(Type) {
      return Type.kind === this;
  }
  function define(nameOrDefinition, ctor) {
      const Type = ctor;
      const description = typeof nameOrDefinition === 'string' ? { name: nameOrDefinition, target: null } : nameOrDefinition;
      Type.kind = BindingCommandResource;
      Type.description = description;
      Type.register = register;
      return Type;
  }
  const BindingCommandResource = {
      name: 'binding-command',
      keyFrom,
      isType,
      define
  };
  function getTarget(binding, camelCase) {
      if (binding.flags & 256 /* isBinding */) {
          return binding.bindable.propName;
      }
      else if (camelCase) {
          return kernel.PLATFORM.camelCase(binding.syntax.target);
      }
      else {
          return binding.syntax.target;
      }
  }
  function getMode(binding) {
      if (binding.flags & 256 /* isBinding */) {
          return binding.bindable.mode;
      }
      else {
          return commandToMode[binding.syntax.command];
      }
  }
  exports.OneTimeBindingCommand = class OneTimeBindingCommand {
      constructor() {
          this.bindingType = 49 /* OneTimeCommand */;
      }
      compile(binding) {
          return new runtime.OneTimeBindingInstruction(binding.expression, getTarget(binding, false));
      }
  };
  exports.OneTimeBindingCommand = __decorate([
      bindingCommand('one-time')
  ], exports.OneTimeBindingCommand);
  exports.ToViewBindingCommand = class ToViewBindingCommand {
      constructor() {
          this.bindingType = 50 /* ToViewCommand */;
      }
      compile(binding) {
          return new runtime.ToViewBindingInstruction(binding.expression, getTarget(binding, false));
      }
  };
  exports.ToViewBindingCommand = __decorate([
      bindingCommand('to-view')
  ], exports.ToViewBindingCommand);
  exports.FromViewBindingCommand = class FromViewBindingCommand {
      constructor() {
          this.bindingType = 51 /* FromViewCommand */;
      }
      compile(binding) {
          return new runtime.FromViewBindingInstruction(binding.expression, getTarget(binding, false));
      }
  };
  exports.FromViewBindingCommand = __decorate([
      bindingCommand('from-view')
  ], exports.FromViewBindingCommand);
  exports.TwoWayBindingCommand = class TwoWayBindingCommand {
      constructor() {
          this.bindingType = 52 /* TwoWayCommand */;
      }
      compile(binding) {
          return new runtime.TwoWayBindingInstruction(binding.expression, getTarget(binding, false));
      }
  };
  exports.TwoWayBindingCommand = __decorate([
      bindingCommand('two-way')
  ], exports.TwoWayBindingCommand);
  // Not bothering to throw on non-existing modes, should never happen anyway.
  // Keeping all array elements of the same type for better optimizeability.
  const modeToProperty = ['', '$1', '$2', '', '$4', '', '$6'];
  const commandToMode = {
      'bind': runtime.BindingMode.toView,
      'one-time': runtime.BindingMode.oneTime,
      'to-view': runtime.BindingMode.toView,
      'from-view': runtime.BindingMode.fromView,
      'two-way': runtime.BindingMode.twoWay,
  };
  exports.DefaultBindingCommand = class DefaultBindingCommand {
      constructor() {
          this.bindingType = 53 /* BindCommand */;
          this.$1 = exports.OneTimeBindingCommand.prototype.compile;
          this.$2 = exports.ToViewBindingCommand.prototype.compile;
          this.$4 = exports.FromViewBindingCommand.prototype.compile;
          this.$6 = exports.TwoWayBindingCommand.prototype.compile;
      }
      compile(binding) {
          return this[modeToProperty[getMode(binding)]](binding);
      }
  };
  exports.DefaultBindingCommand = __decorate([
      bindingCommand('bind')
  ], exports.DefaultBindingCommand);
  exports.TriggerBindingCommand = class TriggerBindingCommand {
      constructor() {
          this.bindingType = 86 /* TriggerCommand */;
      }
      compile(binding) {
          return new runtime.TriggerBindingInstruction(binding.expression, getTarget(binding, false));
      }
  };
  exports.TriggerBindingCommand = __decorate([
      bindingCommand('trigger')
  ], exports.TriggerBindingCommand);
  exports.DelegateBindingCommand = class DelegateBindingCommand {
      constructor() {
          this.bindingType = 88 /* DelegateCommand */;
      }
      compile(binding) {
          return new runtime.DelegateBindingInstruction(binding.expression, getTarget(binding, false));
      }
  };
  exports.DelegateBindingCommand = __decorate([
      bindingCommand('delegate')
  ], exports.DelegateBindingCommand);
  exports.CaptureBindingCommand = class CaptureBindingCommand {
      constructor() {
          this.bindingType = 87 /* CaptureCommand */;
      }
      compile(binding) {
          return new runtime.CaptureBindingInstruction(binding.expression, getTarget(binding, false));
      }
  };
  exports.CaptureBindingCommand = __decorate([
      bindingCommand('capture')
  ], exports.CaptureBindingCommand);
  exports.CallBindingCommand = class CallBindingCommand {
      constructor() {
          this.bindingType = 153 /* CallCommand */;
      }
      compile(binding) {
          return new runtime.CallBindingInstruction(binding.expression, getTarget(binding, true));
      }
  };
  exports.CallBindingCommand = __decorate([
      bindingCommand('call')
  ], exports.CallBindingCommand);
  exports.ForBindingCommand = class ForBindingCommand {
      constructor() {
          this.bindingType = 539 /* ForCommand */;
      }
      compile(binding) {
          return new runtime.IteratorBindingInstruction(binding.expression, getTarget(binding, false));
      }
  };
  exports.ForBindingCommand = __decorate([
      bindingCommand('for')
  ], exports.ForBindingCommand);

  /** @internal */
  function unescapeCode(code) {
      switch (code) {
          case 98 /* LowerB */: return 8 /* Backspace */;
          case 116 /* LowerT */: return 9 /* Tab */;
          case 110 /* LowerN */: return 10 /* LineFeed */;
          case 118 /* LowerV */: return 11 /* VerticalTab */;
          case 102 /* LowerF */: return 12 /* FormFeed */;
          case 114 /* LowerR */: return 13 /* CarriageReturn */;
          case 34 /* DoubleQuote */: return 34 /* DoubleQuote */;
          case 39 /* SingleQuote */: return 39 /* SingleQuote */;
          case 92 /* Backslash */: return 92 /* Backslash */;
          default: return code;
      }
  }

  const ParserRegistration = {
      register(container) {
          container.registerTransformer(runtime.IExpressionParser, parser => {
              parser['parseCore'] = parseCore;
              return parser;
          });
      }
  };
  const $false = runtime.PrimitiveLiteral.$false;
  const $true = runtime.PrimitiveLiteral.$true;
  const $null = runtime.PrimitiveLiteral.$null;
  const $undefined = runtime.PrimitiveLiteral.$undefined;
  const $this = runtime.AccessThis.$this;
  const $parent = runtime.AccessThis.$parent;
  /** @internal */
  class ParserState {
      get tokenRaw() {
          return this.input.slice(this.startIndex, this.index);
      }
      constructor(input) {
          this.index = 0;
          this.startIndex = 0;
          this.lastIndex = 0;
          this.input = input;
          this.length = input.length;
          this.currentToken = 1572864 /* EOF */;
          this.tokenValue = '';
          this.currentChar = input.charCodeAt(0);
          this.assignable = true;
      }
  }
  const $state = new ParserState('');
  /** @internal */
  function parseCore(input, bindingType) {
      $state.input = input;
      $state.length = input.length;
      $state.index = 0;
      $state.currentChar = input.charCodeAt(0);
      return parse($state, 0 /* Reset */, 61 /* Variadic */, bindingType === undefined ? 53 /* BindCommand */ : bindingType);
  }
  /** @internal */
  // JUSTIFICATION: This is performance-critical code which follows a subset of the well-known ES spec.
  // Knowing the spec, or parsers in general, will help with understanding this code and it is therefore not the
  // single source of information for being able to figure it out.
  // It generally does not need to change unless the spec changes or spec violations are found, or optimization
  // opportunities are found (which would likely not fix these warnings in any case).
  // It's therefore not considered to have any tangible impact on the maintainability of the code base.
  // For reference, most of the parsing logic is based on: https://tc39.github.io/ecma262/#sec-ecmascript-language-expressions
  // tslint:disable-next-line:no-big-function cognitive-complexity
  function parse(state, access, minPrecedence, bindingType) {
      if (state.index === 0) {
          if (bindingType & 2048 /* Interpolation */) {
              // tslint:disable-next-line:no-any
              return parseInterpolation(state);
          }
          nextToken(state);
          if (state.currentToken & 1048576 /* ExpressionTerminal */) {
              throw kernel.Reporter.error(100 /* InvalidExpressionStart */, { state });
          }
      }
      state.assignable = 448 /* Binary */ > minPrecedence;
      let result = undefined;
      if (state.currentToken & 32768 /* UnaryOp */) {
          /** parseUnaryExpression
           * https://tc39.github.io/ecma262/#sec-unary-operators
           *
           * UnaryExpression :
           *   1. LeftHandSideExpression
           *   2. void UnaryExpression
           *   3. typeof UnaryExpression
           *   4. + UnaryExpression
           *   5. - UnaryExpression
           *   6. ! UnaryExpression
           *
           * IsValidAssignmentTarget
           *   2,3,4,5,6 = false
           *   1 = see parseLeftHandSideExpression
           *
           * Note: technically we should throw on ++ / -- / +++ / ---, but there's nothing to gain from that
           */
          const op = TokenValues[state.currentToken & 63 /* Type */];
          nextToken(state);
          result = new runtime.Unary(op, parse(state, access, 449 /* LeftHandSide */, bindingType));
          state.assignable = false;
      }
      else {
          /** parsePrimaryExpression
           * https://tc39.github.io/ecma262/#sec-primary-expression
           *
           * PrimaryExpression :
           *   1. this
           *   2. IdentifierName
           *   3. Literal
           *   4. ArrayLiteral
           *   5. ObjectLiteral
           *   6. TemplateLiteral
           *   7. ParenthesizedExpression
           *
           * Literal :
           *    NullLiteral
           *    BooleanLiteral
           *    NumericLiteral
           *    StringLiteral
           *
           * ParenthesizedExpression :
           *   ( AssignmentExpression )
           *
           * IsValidAssignmentTarget
           *   1,3,4,5,6,7 = false
           *   2 = true
           */
          primary: switch (state.currentToken) {
              case 3077 /* ParentScope */: // $parent
                  state.assignable = false;
                  do {
                      nextToken(state);
                      access++; // ancestor
                      if (consumeOpt(state, 16392 /* Dot */)) {
                          if (state.currentToken === 16392 /* Dot */) {
                              throw kernel.Reporter.error(102 /* DoubleDot */, { state });
                          }
                          else if (state.currentToken === 1572864 /* EOF */) {
                              throw kernel.Reporter.error(105 /* ExpectedIdentifier */, { state });
                          }
                      }
                      else if (state.currentToken & 524288 /* AccessScopeTerminal */) {
                          const ancestor = access & 511 /* Ancestor */;
                          result = ancestor === 0 ? $this : ancestor === 1 ? $parent : new runtime.AccessThis(ancestor);
                          access = 512 /* This */;
                          break primary;
                      }
                      else {
                          throw kernel.Reporter.error(103 /* InvalidMemberExpression */, { state });
                      }
                  } while (state.currentToken === 3077 /* ParentScope */);
              // falls through
              case 1024 /* Identifier */: // identifier
                  if (bindingType & 512 /* IsIterator */) {
                      result = new runtime.BindingIdentifier(state.tokenValue);
                  }
                  else {
                      result = new runtime.AccessScope(state.tokenValue, access & 511 /* Ancestor */);
                      access = 1024 /* Scope */;
                  }
                  state.assignable = true;
                  nextToken(state);
                  break;
              case 3076 /* ThisScope */: // $this
                  state.assignable = false;
                  nextToken(state);
                  result = $this;
                  access = 512 /* This */;
                  break;
              case 671750 /* OpenParen */: // parenthesized expression
                  nextToken(state);
                  result = parse(state, 0 /* Reset */, 62 /* Assign */, bindingType);
                  consume(state, 1835018 /* CloseParen */);
                  access = 0 /* Reset */;
                  break;
              case 671756 /* OpenBracket */:
                  result = parseArrayLiteralExpression(state, access, bindingType);
                  access = 0 /* Reset */;
                  break;
              case 131079 /* OpenBrace */:
                  result = parseObjectLiteralExpression(state, bindingType);
                  access = 0 /* Reset */;
                  break;
              case 540713 /* TemplateTail */:
                  result = new runtime.Template([state.tokenValue]);
                  state.assignable = false;
                  nextToken(state);
                  access = 0 /* Reset */;
                  break;
              case 540714 /* TemplateContinuation */:
                  result = parseTemplate(state, access, bindingType, result, false);
                  access = 0 /* Reset */;
                  break;
              case 4096 /* StringLiteral */:
              case 8192 /* NumericLiteral */:
                  result = new runtime.PrimitiveLiteral(state.tokenValue);
                  state.assignable = false;
                  nextToken(state);
                  access = 0 /* Reset */;
                  break;
              case 2050 /* NullKeyword */:
              case 2051 /* UndefinedKeyword */:
              case 2049 /* TrueKeyword */:
              case 2048 /* FalseKeyword */:
                  result = TokenValues[state.currentToken & 63 /* Type */];
                  state.assignable = false;
                  nextToken(state);
                  access = 0 /* Reset */;
                  break;
              default:
                  if (state.index >= state.length) {
                      throw kernel.Reporter.error(104 /* UnexpectedEndOfExpression */, { state });
                  }
                  else {
                      throw kernel.Reporter.error(101 /* UnconsumedToken */, { state });
                  }
          }
          if (bindingType & 512 /* IsIterator */) {
              // tslint:disable-next-line:no-any
              return parseForOfStatement(state, result);
          }
          // tslint:disable-next-line:no-any
          if (449 /* LeftHandSide */ < minPrecedence)
              return result;
          /** parseMemberExpression (Token.Dot, Token.OpenBracket, Token.TemplateContinuation)
           * MemberExpression :
           *   1. PrimaryExpression
           *   2. MemberExpression [ AssignmentExpression ]
           *   3. MemberExpression . IdentifierName
           *   4. MemberExpression TemplateLiteral
           *
           * IsValidAssignmentTarget
           *   1,4 = false
           *   2,3 = true
           *
           *
           * parseCallExpression (Token.OpenParen)
           * CallExpression :
           *   1. MemberExpression Arguments
           *   2. CallExpression Arguments
           *   3. CallExpression [ AssignmentExpression ]
           *   4. CallExpression . IdentifierName
           *   5. CallExpression TemplateLiteral
           *
           * IsValidAssignmentTarget
           *   1,2,5 = false
           *   3,4 = true
           */
          let name = state.tokenValue;
          while ((state.currentToken & 16384 /* LeftHandSide */) > 0) {
              switch (state.currentToken) {
                  case 16392 /* Dot */:
                      state.assignable = true;
                      nextToken(state);
                      if ((state.currentToken & 3072 /* IdentifierName */) === 0) {
                          throw kernel.Reporter.error(105 /* ExpectedIdentifier */, { state });
                      }
                      name = state.tokenValue;
                      nextToken(state);
                      // Change $This to $Scope, change $Scope to $Member, keep $Member as-is, change $Keyed to $Member, disregard other flags
                      access = ((access & (512 /* This */ | 1024 /* Scope */)) << 1) | (access & 2048 /* Member */) | ((access & 4096 /* Keyed */) >> 1);
                      if (state.currentToken === 671750 /* OpenParen */) {
                          if (access === 0 /* Reset */) { // if the left hand side is a literal, make sure we parse a CallMember
                              access = 2048 /* Member */;
                          }
                          continue;
                      }
                      if (access & 1024 /* Scope */) {
                          result = new runtime.AccessScope(name, result.ancestor);
                      }
                      else { // if it's not $Scope, it's $Member
                          result = new runtime.AccessMember(result, name);
                      }
                      continue;
                  case 671756 /* OpenBracket */:
                      state.assignable = true;
                      nextToken(state);
                      access = 4096 /* Keyed */;
                      result = new runtime.AccessKeyed(result, parse(state, 0 /* Reset */, 62 /* Assign */, bindingType));
                      consume(state, 1835021 /* CloseBracket */);
                      break;
                  case 671750 /* OpenParen */:
                      state.assignable = false;
                      nextToken(state);
                      const args = new Array();
                      while (state.currentToken !== 1835018 /* CloseParen */) {
                          args.push(parse(state, 0 /* Reset */, 62 /* Assign */, bindingType));
                          if (!consumeOpt(state, 1572875 /* Comma */)) {
                              break;
                          }
                      }
                      consume(state, 1835018 /* CloseParen */);
                      if (access & 1024 /* Scope */) {
                          result = new runtime.CallScope(name, args, result.ancestor);
                      }
                      else if (access & 2048 /* Member */) {
                          result = new runtime.CallMember(result, name, args);
                      }
                      else {
                          result = new runtime.CallFunction(result, args);
                      }
                      access = 0;
                      break;
                  case 540713 /* TemplateTail */:
                      state.assignable = false;
                      const strings = [state.tokenValue];
                      result = new runtime.TaggedTemplate(strings, strings, result);
                      nextToken(state);
                      break;
                  case 540714 /* TemplateContinuation */:
                      result = parseTemplate(state, access, bindingType, result, true);
                  default:
              }
          }
      }
      // tslint:disable-next-line:no-any
      if (448 /* Binary */ < minPrecedence)
          return result;
      /** parseBinaryExpression
       * https://tc39.github.io/ecma262/#sec-multiplicative-operators
       *
       * MultiplicativeExpression : (local precedence 6)
       *   UnaryExpression
       *   MultiplicativeExpression * / % UnaryExpression
       *
       * AdditiveExpression : (local precedence 5)
       *   MultiplicativeExpression
       *   AdditiveExpression + - MultiplicativeExpression
       *
       * RelationalExpression : (local precedence 4)
       *   AdditiveExpression
       *   RelationalExpression < > <= >= instanceof in AdditiveExpression
       *
       * EqualityExpression : (local precedence 3)
       *   RelationalExpression
       *   EqualityExpression == != === !== RelationalExpression
       *
       * LogicalANDExpression : (local precedence 2)
       *   EqualityExpression
       *   LogicalANDExpression && EqualityExpression
       *
       * LogicalORExpression : (local precedence 1)
       *   LogicalANDExpression
       *   LogicalORExpression || LogicalANDExpression
       */
      while ((state.currentToken & 65536 /* BinaryOp */) > 0) {
          const opToken = state.currentToken;
          if ((opToken & 448 /* Precedence */) <= minPrecedence) {
              break;
          }
          nextToken(state);
          result = new runtime.Binary(TokenValues[opToken & 63 /* Type */], result, parse(state, access, opToken & 448 /* Precedence */, bindingType));
          state.assignable = false;
      }
      // tslint:disable-next-line:no-any
      if (63 /* Conditional */ < minPrecedence)
          return result;
      /**
       * parseConditionalExpression
       * https://tc39.github.io/ecma262/#prod-ConditionalExpression
       *
       * ConditionalExpression :
       *   1. BinaryExpression
       *   2. BinaryExpression ? AssignmentExpression : AssignmentExpression
       *
       * IsValidAssignmentTarget
       *   1,2 = false
       */
      if (consumeOpt(state, 1572879 /* Question */)) {
          const yes = parse(state, access, 62 /* Assign */, bindingType);
          consume(state, 1572878 /* Colon */);
          result = new runtime.Conditional(result, yes, parse(state, access, 62 /* Assign */, bindingType));
          state.assignable = false;
      }
      // tslint:disable-next-line:no-any
      if (62 /* Assign */ < minPrecedence)
          return result;
      /** parseAssignmentExpression
       * https://tc39.github.io/ecma262/#prod-AssignmentExpression
       * Note: AssignmentExpression here is equivalent to ES Expression because we don't parse the comma operator
       *
       * AssignmentExpression :
       *   1. ConditionalExpression
       *   2. LeftHandSideExpression = AssignmentExpression
       *
       * IsValidAssignmentTarget
       *   1,2 = false
       */
      if (consumeOpt(state, 1048615 /* Equals */)) {
          if (!state.assignable) {
              throw kernel.Reporter.error(150 /* NotAssignable */, { state });
          }
          result = new runtime.Assign(result, parse(state, access, 62 /* Assign */, bindingType));
      }
      // tslint:disable-next-line:no-any
      if (61 /* Variadic */ < minPrecedence)
          return result;
      /** parseValueConverter
       */
      while (consumeOpt(state, 1572883 /* Bar */)) {
          if (state.currentToken === 1572864 /* EOF */) {
              throw kernel.Reporter.error(112);
          }
          const name = state.tokenValue;
          nextToken(state);
          const args = new Array();
          while (consumeOpt(state, 1572878 /* Colon */)) {
              args.push(parse(state, access, 62 /* Assign */, bindingType));
          }
          result = new runtime.ValueConverter(result, name, args);
      }
      /** parseBindingBehavior
       */
      while (consumeOpt(state, 1572880 /* Ampersand */)) {
          if (state.currentToken === 1572864 /* EOF */) {
              throw kernel.Reporter.error(113);
          }
          const name = state.tokenValue;
          nextToken(state);
          const args = new Array();
          while (consumeOpt(state, 1572878 /* Colon */)) {
              args.push(parse(state, access, 62 /* Assign */, bindingType));
          }
          result = new runtime.BindingBehavior(result, name, args);
      }
      if (state.currentToken !== 1572864 /* EOF */) {
          if (bindingType & 2048 /* Interpolation */) {
              // tslint:disable-next-line:no-any
              return result;
          }
          if (state.tokenRaw === 'of') {
              throw kernel.Reporter.error(151 /* UnexpectedForOf */, { state });
          }
          throw kernel.Reporter.error(101 /* UnconsumedToken */, { state });
      }
      // tslint:disable-next-line:no-any
      return result;
  }
  /**
   * parseArrayLiteralExpression
   * https://tc39.github.io/ecma262/#prod-ArrayLiteral
   *
   * ArrayLiteral :
   *   [ Elision(opt) ]
   *   [ ElementList ]
   *   [ ElementList, Elision(opt) ]
   *
   * ElementList :
   *   Elision(opt) AssignmentExpression
   *   ElementList, Elision(opt) AssignmentExpression
   *
   * Elision :
   *  ,
   *  Elision ,
   */
  function parseArrayLiteralExpression(state, access, bindingType) {
      nextToken(state);
      const elements = new Array();
      while (state.currentToken !== 1835021 /* CloseBracket */) {
          if (consumeOpt(state, 1572875 /* Comma */)) {
              elements.push($undefined);
              if (state.currentToken === 1835021 /* CloseBracket */) {
                  elements.push($undefined);
                  break;
              }
          }
          else {
              elements.push(parse(state, access, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
              if (consumeOpt(state, 1572875 /* Comma */)) {
                  if (state.currentToken === 1835021 /* CloseBracket */) {
                      elements.push($undefined);
                      break;
                  }
              }
              else {
                  break;
              }
          }
      }
      consume(state, 1835021 /* CloseBracket */);
      if (bindingType & 512 /* IsIterator */) {
          return new runtime.ArrayBindingPattern(elements);
      }
      else {
          state.assignable = false;
          return new runtime.ArrayLiteral(elements);
      }
  }
  function parseForOfStatement(state, result) {
      if ((result.$kind & 65536 /* IsForDeclaration */) === 0) {
          throw kernel.Reporter.error(106 /* InvalidForDeclaration */, { state });
      }
      if (state.currentToken !== 1051179 /* OfKeyword */) {
          throw kernel.Reporter.error(106 /* InvalidForDeclaration */, { state });
      }
      nextToken(state);
      const declaration = result;
      const statement = parse(state, 0 /* Reset */, 61 /* Variadic */, 0 /* None */);
      return new runtime.ForOfStatement(declaration, statement);
  }
  /**
   * parseObjectLiteralExpression
   * https://tc39.github.io/ecma262/#prod-Literal
   *
   * ObjectLiteral :
   *   { }
   *   { PropertyDefinitionList }
   *
   * PropertyDefinitionList :
   *   PropertyDefinition
   *   PropertyDefinitionList, PropertyDefinition
   *
   * PropertyDefinition :
   *   IdentifierName
   *   PropertyName : AssignmentExpression
   *
   * PropertyName :
   *   IdentifierName
   *   StringLiteral
   *   NumericLiteral
   */
  function parseObjectLiteralExpression(state, bindingType) {
      const keys = new Array();
      const values = new Array();
      nextToken(state);
      while (state.currentToken !== 1835017 /* CloseBrace */) {
          keys.push(state.tokenValue);
          // Literal = mandatory colon
          if (state.currentToken & 12288 /* StringOrNumericLiteral */) {
              nextToken(state);
              consume(state, 1572878 /* Colon */);
              values.push(parse(state, 0 /* Reset */, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
          }
          else if (state.currentToken & 3072 /* IdentifierName */) {
              // IdentifierName = optional colon
              const { currentChar, currentToken, index } = state;
              nextToken(state);
              if (consumeOpt(state, 1572878 /* Colon */)) {
                  values.push(parse(state, 0 /* Reset */, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
              }
              else {
                  // Shorthand
                  state.currentChar = currentChar;
                  state.currentToken = currentToken;
                  state.index = index;
                  values.push(parse(state, 0 /* Reset */, 450 /* Primary */, bindingType & ~512 /* IsIterator */));
              }
          }
          else {
              throw kernel.Reporter.error(107 /* InvalidObjectLiteralPropertyDefinition */, { state });
          }
          if (state.currentToken !== 1835017 /* CloseBrace */) {
              consume(state, 1572875 /* Comma */);
          }
      }
      consume(state, 1835017 /* CloseBrace */);
      if (bindingType & 512 /* IsIterator */) {
          return new runtime.ObjectBindingPattern(keys, values);
      }
      else {
          state.assignable = false;
          return new runtime.ObjectLiteral(keys, values);
      }
  }
  function parseInterpolation(state) {
      const parts = [];
      const expressions = [];
      const length = state.length;
      let result = '';
      while (state.index < length) {
          switch (state.currentChar) {
              case 36 /* Dollar */:
                  if (state.input.charCodeAt(state.index + 1) === 123 /* OpenBrace */) {
                      parts.push(result);
                      result = '';
                      state.index += 2;
                      state.currentChar = state.input.charCodeAt(state.index);
                      nextToken(state);
                      const expression = parse(state, 0 /* Reset */, 61 /* Variadic */, 2048 /* Interpolation */);
                      expressions.push(expression);
                      continue;
                  }
                  else {
                      result += '$';
                  }
                  break;
              case 92 /* Backslash */:
                  result += String.fromCharCode(unescapeCode(nextChar(state)));
                  break;
              default:
                  result += String.fromCharCode(state.currentChar);
          }
          nextChar(state);
      }
      if (expressions.length) {
          parts.push(result);
          return new runtime.Interpolation(parts, expressions);
      }
      return null;
  }
  /**
   * parseTemplateLiteralExpression
   * https://tc39.github.io/ecma262/#prod-Literal
   *
   * Template :
   *   NoSubstitutionTemplate
   *   TemplateHead
   *
   * NoSubstitutionTemplate :
   *   ` TemplateCharacters(opt) `
   *
   * TemplateHead :
   *   ` TemplateCharacters(opt) ${
   *
   * TemplateSubstitutionTail :
   *   TemplateMiddle
   *   TemplateTail
   *
   * TemplateMiddle :
   *   } TemplateCharacters(opt) ${
   *
   * TemplateTail :
   *   } TemplateCharacters(opt) `
   *
   * TemplateCharacters :
   *   TemplateCharacter TemplateCharacters(opt)
   *
   * TemplateCharacter :
   *   $ [lookahead ≠ {]
   *   \ EscapeSequence
   *   SourceCharacter (but not one of ` or \ or $)
   */
  function parseTemplate(state, access, bindingType, result, tagged) {
      const cooked = [state.tokenValue];
      // TODO: properly implement raw parts / decide whether we want this
      consume(state, 540714 /* TemplateContinuation */);
      const expressions = [parse(state, access, 62 /* Assign */, bindingType)];
      while ((state.currentToken = scanTemplateTail(state)) !== 540713 /* TemplateTail */) {
          cooked.push(state.tokenValue);
          consume(state, 540714 /* TemplateContinuation */);
          expressions.push(parse(state, access, 62 /* Assign */, bindingType));
      }
      cooked.push(state.tokenValue);
      state.assignable = false;
      if (tagged) {
          nextToken(state);
          return new runtime.TaggedTemplate(cooked, cooked, result, expressions);
      }
      else {
          nextToken(state);
          return new runtime.Template(cooked, expressions);
      }
  }
  function nextToken(state) {
      while (state.index < state.length) {
          state.startIndex = state.index;
          if ((state.currentToken = CharScanners[state.currentChar](state)) !== null) { // a null token means the character must be skipped
              return;
          }
      }
      state.currentToken = 1572864 /* EOF */;
  }
  function nextChar(state) {
      return state.currentChar = state.input.charCodeAt(++state.index);
  }
  function scanIdentifier(state) {
      // run to the next non-idPart
      while (IdParts[nextChar(state)])
          ;
      const token = KeywordLookup[state.tokenValue = state.tokenRaw];
      return token === undefined ? 1024 /* Identifier */ : token;
  }
  function scanNumber(state, isFloat) {
      let char = state.currentChar;
      if (isFloat === false) {
          do {
              char = nextChar(state);
          } while (char <= 57 /* Nine */ && char >= 48 /* Zero */);
          if (char !== 46 /* Dot */) {
              state.tokenValue = parseInt(state.tokenRaw, 10);
              return 8192 /* NumericLiteral */;
          }
          // past this point it's always a float
          char = nextChar(state);
          if (state.index >= state.length) {
              // unless the number ends with a dot - that behaves a little different in native ES expressions
              // but in our AST that behavior has no effect because numbers are always stored in variables
              state.tokenValue = parseInt(state.tokenRaw.slice(0, -1), 10);
              return 8192 /* NumericLiteral */;
          }
      }
      if (char <= 57 /* Nine */ && char >= 48 /* Zero */) {
          do {
              char = nextChar(state);
          } while (char <= 57 /* Nine */ && char >= 48 /* Zero */);
      }
      else {
          state.currentChar = state.input.charCodeAt(--state.index);
      }
      state.tokenValue = parseFloat(state.tokenRaw);
      return 8192 /* NumericLiteral */;
  }
  function scanString(state) {
      const quote = state.currentChar;
      nextChar(state); // Skip initial quote.
      let unescaped = 0;
      const buffer = new Array();
      let marker = state.index;
      while (state.currentChar !== quote) {
          if (state.currentChar === 92 /* Backslash */) {
              buffer.push(state.input.slice(marker, state.index));
              nextChar(state);
              unescaped = unescapeCode(state.currentChar);
              nextChar(state);
              buffer.push(String.fromCharCode(unescaped));
              marker = state.index;
          }
          else if (state.index >= state.length) {
              throw kernel.Reporter.error(108 /* UnterminatedQuote */, { state });
          }
          else {
              nextChar(state);
          }
      }
      const last = state.input.slice(marker, state.index);
      nextChar(state); // Skip terminating quote.
      // Compute the unescaped string value.
      buffer.push(last);
      const unescapedStr = buffer.join('');
      state.tokenValue = unescapedStr;
      return 4096 /* StringLiteral */;
  }
  function scanTemplate(state) {
      let tail = true;
      let result = '';
      while (nextChar(state) !== 96 /* Backtick */) {
          if (state.currentChar === 36 /* Dollar */) {
              if ((state.index + 1) < state.length && state.input.charCodeAt(state.index + 1) === 123 /* OpenBrace */) {
                  state.index++;
                  tail = false;
                  break;
              }
              else {
                  result += '$';
              }
          }
          else if (state.currentChar === 92 /* Backslash */) {
              result += String.fromCharCode(unescapeCode(nextChar(state)));
          }
          else {
              if (state.index >= state.length) {
                  throw kernel.Reporter.error(109 /* UnterminatedTemplate */, { state });
              }
              result += String.fromCharCode(state.currentChar);
          }
      }
      nextChar(state);
      state.tokenValue = result;
      if (tail) {
          return 540713 /* TemplateTail */;
      }
      return 540714 /* TemplateContinuation */;
  }
  function scanTemplateTail(state) {
      if (state.index >= state.length) {
          throw kernel.Reporter.error(109 /* UnterminatedTemplate */, { state });
      }
      state.index--;
      return scanTemplate(state);
  }
  function consumeOpt(state, token) {
      // tslint:disable-next-line:possible-timing-attack
      if (state.currentToken === token) {
          nextToken(state);
          return true;
      }
      return false;
  }
  function consume(state, token) {
      // tslint:disable-next-line:possible-timing-attack
      if (state.currentToken === token) {
          nextToken(state);
      }
      else {
          throw kernel.Reporter.error(110 /* MissingExpectedToken */, { state, expected: token });
      }
  }
  /**
   * Array for mapping tokens to token values. The indices of the values
   * correspond to the token bits 0-38.
   * For this to work properly, the values in the array must be kept in
   * the same order as the token bits.
   * Usage: TokenValues[token & Token.Type]
   */
  const TokenValues = [
      $false, $true, $null, $undefined, '$this', '$parent',
      '(', '{', '.', '}', ')', ',', '[', ']', ':', '?', '\'', '"',
      '&', '|', '||', '&&', '==', '!=', '===', '!==', '<', '>',
      '<=', '>=', 'in', 'instanceof', '+', '-', 'typeof', 'void', '*', '%', '/', '=', '!',
      540713 /* TemplateTail */, 540714 /* TemplateContinuation */,
      'of'
  ];
  const KeywordLookup = Object.create(null);
  KeywordLookup.true = 2049 /* TrueKeyword */;
  KeywordLookup.null = 2050 /* NullKeyword */;
  KeywordLookup.false = 2048 /* FalseKeyword */;
  KeywordLookup.undefined = 2051 /* UndefinedKeyword */;
  KeywordLookup.$this = 3076 /* ThisScope */;
  KeywordLookup.$parent = 3077 /* ParentScope */;
  KeywordLookup.in = 1640798 /* InKeyword */;
  KeywordLookup.instanceof = 1640799 /* InstanceOfKeyword */;
  KeywordLookup.typeof = 34850 /* TypeofKeyword */;
  KeywordLookup.void = 34851 /* VoidKeyword */;
  KeywordLookup.of = 1051179 /* OfKeyword */;
  /**
   * Ranges of code points in pairs of 2 (eg 0x41-0x5B, 0x61-0x7B, ...) where the second value is not inclusive (5-7 means 5 and 6)
   * Single values are denoted by the second value being a 0
   *
   * Copied from output generated with "node build/generate-unicode.js"
   *
   * See also: https://en.wikibooks.org/wiki/Unicode/Character_reference/0000-0FFF
   */
  const codes = {
      /* [$0-9A-Za_a-z] */
      AsciiIdPart: [0x24, 0, 0x30, 0x3A, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B],
      IdStart: /*IdentifierStart*/ [0x24, 0, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B, 0xAA, 0, 0xBA, 0, 0xC0, 0xD7, 0xD8, 0xF7, 0xF8, 0x2B9, 0x2E0, 0x2E5, 0x1D00, 0x1D26, 0x1D2C, 0x1D5D, 0x1D62, 0x1D66, 0x1D6B, 0x1D78, 0x1D79, 0x1DBF, 0x1E00, 0x1F00, 0x2071, 0, 0x207F, 0, 0x2090, 0x209D, 0x212A, 0x212C, 0x2132, 0, 0x214E, 0, 0x2160, 0x2189, 0x2C60, 0x2C80, 0xA722, 0xA788, 0xA78B, 0xA7AF, 0xA7B0, 0xA7B8, 0xA7F7, 0xA800, 0xAB30, 0xAB5B, 0xAB5C, 0xAB65, 0xFB00, 0xFB07, 0xFF21, 0xFF3B, 0xFF41, 0xFF5B],
      Digit: /*DecimalNumber*/ [0x30, 0x3A],
      Skip: /*Skippable*/ [0, 0x21, 0x7F, 0xA1]
  };
  /**
   * Decompress the ranges into an array of numbers so that the char code
   * can be used as an index to the lookup
   */
  function decompress(lookup, $set, compressed, value) {
      const rangeCount = compressed.length;
      for (let i = 0; i < rangeCount; i += 2) {
          const start = compressed[i];
          let end = compressed[i + 1];
          end = end > 0 ? end : start + 1;
          if (lookup) {
              lookup.fill(value, start, end);
          }
          if ($set) {
              for (let ch = start; ch < end; ch++) {
                  $set.add(ch);
              }
          }
      }
  }
  // CharFuncLookup functions
  function returnToken(token) {
      return s => {
          nextChar(s);
          return token;
      };
  }
  const unexpectedCharacter = s => {
      throw kernel.Reporter.error(111 /* UnexpectedCharacter */, { state: s });
  };
  unexpectedCharacter.notMapped = true;
  // ASCII IdentifierPart lookup
  const AsciiIdParts = new Set();
  decompress(null, AsciiIdParts, codes.AsciiIdPart, true);
  // IdentifierPart lookup
  const IdParts = new Uint8Array(0xFFFF);
  // tslint:disable-next-line:no-any
  decompress(IdParts, null, codes.IdStart, 1);
  // tslint:disable-next-line:no-any
  decompress(IdParts, null, codes.Digit, 1);
  // Character scanning function lookup
  const CharScanners = new Array(0xFFFF);
  CharScanners.fill(unexpectedCharacter, 0, 0xFFFF);
  decompress(CharScanners, null, codes.Skip, s => {
      nextChar(s);
      return null;
  });
  decompress(CharScanners, null, codes.IdStart, scanIdentifier);
  decompress(CharScanners, null, codes.Digit, s => scanNumber(s, false));
  CharScanners[34 /* DoubleQuote */] =
      CharScanners[39 /* SingleQuote */] = s => {
          return scanString(s);
      };
  CharScanners[96 /* Backtick */] = s => {
      return scanTemplate(s);
  };
  // !, !=, !==
  CharScanners[33 /* Exclamation */] = s => {
      if (nextChar(s) !== 61 /* Equals */) {
          return 32808 /* Exclamation */;
      }
      if (nextChar(s) !== 61 /* Equals */) {
          return 1638679 /* ExclamationEquals */;
      }
      nextChar(s);
      return 1638681 /* ExclamationEqualsEquals */;
  };
  // =, ==, ===
  CharScanners[61 /* Equals */] = s => {
      if (nextChar(s) !== 61 /* Equals */) {
          return 1048615 /* Equals */;
      }
      if (nextChar(s) !== 61 /* Equals */) {
          return 1638678 /* EqualsEquals */;
      }
      nextChar(s);
      return 1638680 /* EqualsEqualsEquals */;
  };
  // &, &&
  CharScanners[38 /* Ampersand */] = s => {
      if (nextChar(s) !== 38 /* Ampersand */) {
          return 1572880 /* Ampersand */;
      }
      nextChar(s);
      return 1638613 /* AmpersandAmpersand */;
  };
  // |, ||
  CharScanners[124 /* Bar */] = s => {
      if (nextChar(s) !== 124 /* Bar */) {
          return 1572883 /* Bar */;
      }
      nextChar(s);
      return 1638548 /* BarBar */;
  };
  // .
  CharScanners[46 /* Dot */] = s => {
      if (nextChar(s) <= 57 /* Nine */ && s.currentChar >= 48 /* Zero */) {
          return scanNumber(s, true);
      }
      return 16392 /* Dot */;
  };
  // <, <=
  CharScanners[60 /* LessThan */] = s => {
      if (nextChar(s) !== 61 /* Equals */) {
          return 1638746 /* LessThan */;
      }
      nextChar(s);
      return 1638748 /* LessThanEquals */;
  };
  // >, >=
  CharScanners[62 /* GreaterThan */] = s => {
      if (nextChar(s) !== 61 /* Equals */) {
          return 1638747 /* GreaterThan */;
      }
      nextChar(s);
      return 1638749 /* GreaterThanEquals */;
  };
  CharScanners[37 /* Percent */] = returnToken(1638885 /* Percent */);
  CharScanners[40 /* OpenParen */] = returnToken(671750 /* OpenParen */);
  CharScanners[41 /* CloseParen */] = returnToken(1835018 /* CloseParen */);
  CharScanners[42 /* Asterisk */] = returnToken(1638884 /* Asterisk */);
  CharScanners[43 /* Plus */] = returnToken(623008 /* Plus */);
  CharScanners[44 /* Comma */] = returnToken(1572875 /* Comma */);
  CharScanners[45 /* Minus */] = returnToken(623009 /* Minus */);
  CharScanners[47 /* Slash */] = returnToken(1638886 /* Slash */);
  CharScanners[58 /* Colon */] = returnToken(1572878 /* Colon */);
  CharScanners[63 /* Question */] = returnToken(1572879 /* Question */);
  CharScanners[91 /* OpenBracket */] = returnToken(671756 /* OpenBracket */);
  CharScanners[93 /* CloseBracket */] = returnToken(1835021 /* CloseBracket */);
  CharScanners[123 /* OpenBrace */] = returnToken(131079 /* OpenBrace */);
  CharScanners[125 /* CloseBrace */] = returnToken(1835017 /* CloseBrace */);

  /**
   * A pre-processed piece of information about declared custom elements, attributes and
   * binding commands, optimized for consumption by the template compiler.
   */
  class ResourceModel {
      constructor(resources) {
          this.resources = resources;
          this.elementLookup = {};
          this.attributeLookup = {};
          this.commandLookup = {};
      }
      /**
       * Retrieve information about a custom element resource.
       *
       * @param element The original DOM element.
       *
       * @returns The resource information if the element exists, or `null` if it does not exist.
       */
      getElementInfo(element) {
          let name = element.getAttribute('as-element');
          if (name === null) {
              name = element.nodeName.toLowerCase();
          }
          let result = this.elementLookup[name];
          if (result === undefined) {
              const def = this.resources.find(runtime.CustomElementResource, name);
              if (def === null) {
                  result = null;
              }
              else {
                  result = createElementInfo(def);
              }
              this.elementLookup[name] = result;
          }
          return result;
      }
      /**
       * Retrieve information about a custom attribute resource.
       *
       * @param syntax The parsed `AttrSyntax`
       *
       * @returns The resource information if the attribute exists, or `null` if it does not exist.
       */
      getAttributeInfo(syntax) {
          const name = kernel.PLATFORM.camelCase(syntax.target);
          let result = this.attributeLookup[name];
          if (result === undefined) {
              const def = this.resources.find(runtime.CustomAttributeResource, name);
              if (def === null) {
                  result = null;
              }
              else {
                  result = createAttributeInfo(def);
              }
              this.attributeLookup[name] = result;
          }
          return result;
      }
      /**
       * Retrieve a binding command resource.
       *
       * @param name The parsed `AttrSyntax`
       *
       * @returns An instance of the command if it exists, or `null` if it does not exist.
       */
      getBindingCommand(syntax) {
          const name = syntax.command;
          if (name === null) {
              return null;
          }
          let result = this.commandLookup[name];
          if (result === undefined) {
              result = this.resources.create(BindingCommandResource, name);
              if (result === null) {
                  // unknown binding command
                  throw kernel.Reporter.error(0); // TODO: create error code
              }
              this.commandLookup[name] = result;
          }
          return result;
      }
  }
  function createElementInfo(def) {
      const info = new ElementInfo(def.name, def.containerless);
      const bindables = def.bindables;
      const defaultBindingMode = runtime.BindingMode.toView;
      let bindable;
      let prop;
      let attr;
      let mode;
      for (prop in bindables) {
          bindable = bindables[prop];
          // explicitly provided property name has priority over the implicit property name
          if (bindable.property !== undefined) {
              prop = bindable.property;
          }
          // explicitly provided attribute name has priority over the derived implicit attribute name
          if (bindable.attribute !== undefined) {
              attr = bindable.attribute;
          }
          else {
              // derive the attribute name from the resolved property name
              attr = kernel.PLATFORM.kebabCase(prop);
          }
          if (bindable.mode !== undefined && bindable.mode !== runtime.BindingMode.default) {
              mode = bindable.mode;
          }
          else {
              mode = defaultBindingMode;
          }
          info.bindables[attr] = new BindableInfo(prop, mode);
      }
      return info;
  }
  function createAttributeInfo(def) {
      const info = new AttrInfo(def.name, def.isTemplateController);
      const bindables = def.bindables;
      const defaultBindingMode = def.defaultBindingMode !== undefined && def.defaultBindingMode !== runtime.BindingMode.default
          ? def.defaultBindingMode
          : runtime.BindingMode.toView;
      let bindable;
      let prop;
      let mode;
      let bindableCount = 0;
      for (prop in bindables) {
          ++bindableCount;
          bindable = bindables[prop];
          // explicitly provided property name has priority over the implicit property name
          if (bindable.property !== undefined) {
              prop = bindable.property;
          }
          if (bindable.mode !== undefined && bindable.mode !== runtime.BindingMode.default) {
              mode = bindable.mode;
          }
          else {
              mode = defaultBindingMode;
          }
          info.bindables[prop] = new BindableInfo(prop, mode);
          // set to first bindable by convention
          if (info.bindable === null) {
              info.bindable = info.bindables[prop];
          }
      }
      // if no bindables are present, default to "value"
      if (info.bindable === null) {
          info.bindable = new BindableInfo('value', defaultBindingMode);
      }
      if (def.hasDynamicOptions || bindableCount > 1) {
          info.hasDynamicOptions = true;
      }
      return info;
  }
  /**
   * A pre-processed piece of information about a defined bindable property on a custom
   * element or attribute, optimized for consumption by the template compiler.
   */
  class BindableInfo {
      constructor(propName, mode) {
          this.propName = propName;
          this.mode = mode;
      }
  }
  /**
   * Pre-processed information about a custom element resource, optimized
   * for consumption by the template compiler.
   */
  class ElementInfo {
      constructor(name, containerless) {
          this.name = name;
          this.containerless = containerless;
          this.bindables = {};
      }
  }
  /**
   * Pre-processed information about a custom attribute resource, optimized
   * for consumption by the template compiler.
   */
  class AttrInfo {
      constructor(name, isTemplateController) {
          this.name = name;
          this.bindables = {};
          this.bindable = null;
          this.isTemplateController = isTemplateController;
          this.hasDynamicOptions = false;
      }
  }

  /**
   * A html attribute that is associated with a registered resource, specifically a template controller.
   */
  class TemplateControllerSymbol {
      get bindings() {
          if (this._bindings === null) {
              this._bindings = [];
              this.flags |= 4096 /* hasBindings */;
          }
          return this._bindings;
      }
      constructor(dom, syntax, info, partName) {
          this.flags = 1 /* isTemplateController */ | 512 /* hasMarker */;
          this.res = info.name;
          this.partName = partName;
          this.physicalNode = null;
          this.syntax = syntax;
          this.template = null;
          this.templateController = null;
          this.marker = createMarker(dom);
          this._bindings = null;
      }
  }
  /**
   * Wrapper for an element (with all of its attributes, regardless of the order in which they are declared)
   * that has a replace-part attribute on it.
   *
   * This element will be lifted from the DOM just like a template controller.
   */
  class ReplacePartSymbol {
      constructor(name) {
          this.flags = 2 /* isReplacePart */;
          this.name = name;
          this.physicalNode = null;
          this.parent = null;
          this.template = null;
      }
  }
  /**
   * A html attribute that is associated with a registered resource, but not a template controller.
   */
  class CustomAttributeSymbol {
      get bindings() {
          if (this._bindings === null) {
              this._bindings = [];
              this.flags |= 4096 /* hasBindings */;
          }
          return this._bindings;
      }
      constructor(syntax, info) {
          this.flags = 4 /* isCustomAttribute */;
          this.res = info.name;
          this.syntax = syntax;
          this._bindings = null;
      }
  }
  /**
   * An attribute, with either a binding command or an interpolation, whose target is the html
   * attribute of the element.
   *
   * This will never target a bindable property of a custom attribute or element;
   */
  class PlainAttributeSymbol {
      constructor(syntax, command, expression) {
          this.flags = 8 /* isPlainAttribute */;
          this.syntax = syntax;
          this.command = command;
          this.expression = expression;
      }
  }
  /**
   * Either an attribute on an custom element that maps to a declared bindable property of that element,
   * a single-value bound custom attribute, or one of several bindables that were extracted from the attribute
   * value of a dynamicOptions custom attribute.
   *
   * This will always target a bindable property of a custom attribute or element;
   */
  class BindingSymbol {
      constructor(command, bindable, expression, rawValue, target) {
          this.flags = 256 /* isBinding */;
          this.command = command;
          this.bindable = bindable;
          this.expression = expression;
          this.rawValue = rawValue;
          this.target = target;
      }
  }
  /**
   * A html element that is associated with a registered resource either via its (lowerCase) `nodeName`
   * or the value of its `as-element` attribute.
   */
  class CustomElementSymbol {
      get attributes() {
          if (this._attributes === null) {
              this._attributes = [];
              this.flags |= 2048 /* hasAttributes */;
          }
          return this._attributes;
      }
      get bindings() {
          if (this._bindings === null) {
              this._bindings = [];
              this.flags |= 4096 /* hasBindings */;
          }
          return this._bindings;
      }
      get childNodes() {
          if (this._childNodes === null) {
              this._childNodes = [];
              this.flags |= 8192 /* hasChildNodes */;
          }
          return this._childNodes;
      }
      get parts() {
          if (this._parts === null) {
              this._parts = [];
              this.flags |= 16384 /* hasParts */;
          }
          return this._parts;
      }
      constructor(dom, node, info) {
          this.flags = 16 /* isCustomElement */;
          this.res = info.name;
          this.physicalNode = node;
          this.bindables = info.bindables;
          this.isTarget = true;
          this.templateController = null;
          if (info.containerless) {
              this.isContainerless = true;
              this.marker = createMarker(dom);
              this.flags |= 512 /* hasMarker */;
          }
          else {
              this.isContainerless = false;
              this.marker = null;
          }
          this._attributes = null;
          this._bindings = null;
          this._childNodes = null;
          this._parts = null;
      }
  }
  class LetElementSymbol {
      get bindings() {
          if (this._bindings === null) {
              this._bindings = [];
              this.flags |= 4096 /* hasBindings */;
          }
          return this._bindings;
      }
      constructor(dom, node) {
          this.flags = 32 /* isLetElement */ | 512 /* hasMarker */;
          this.physicalNode = node;
          this.toViewModel = false;
          this.marker = createMarker(dom);
          this._bindings = null;
      }
  }
  /**
   * A normal html element that may or may not have attribute behaviors and/or child node behaviors.
   *
   * It is possible for a PlainElementSymbol to not yield any instructions during compilation.
   */
  class PlainElementSymbol {
      get attributes() {
          if (this._attributes === null) {
              this._attributes = [];
              this.flags |= 2048 /* hasAttributes */;
          }
          return this._attributes;
      }
      get childNodes() {
          if (this._childNodes === null) {
              this._childNodes = [];
              this.flags |= 8192 /* hasChildNodes */;
          }
          return this._childNodes;
      }
      constructor(node) {
          this.flags = 64 /* isPlainElement */;
          this.physicalNode = node;
          this.isTarget = false;
          this.templateController = null;
          this._attributes = null;
          this._childNodes = null;
      }
  }
  /**
   * A standalone text node that has an interpolation.
   */
  class TextSymbol {
      constructor(dom, node, interpolation) {
          this.flags = 128 /* isText */ | 512 /* hasMarker */;
          this.physicalNode = node;
          this.interpolation = interpolation;
          this.marker = createMarker(dom);
      }
  }
  const slice = Array.prototype.slice;
  function createMarker(dom) {
      const marker = dom.createElement('au-m');
      marker.className = 'au';
      return marker;
  }
  const invalidSurrogateAttribute = {
      'id': true,
      'part': true,
      'replace-part': true
  };
  const attributesToIgnore = {
      'as-element': true,
      'part': true,
      'replace-part': true
  };
  class TemplateBinder {
      constructor(resources, attrParser, exprParser) {
          this.resources = resources;
          this.attrParser = attrParser;
          this.exprParser = exprParser;
          this.surrogate = null;
          this.manifest = null;
          this.manifestRoot = null;
          this.parentManifestRoot = null;
          this.partName = null;
      }
      bind(dom, node) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('TemplateBinder.bind', slice.call(arguments));
          }
          const surrogateSave = this.surrogate;
          const parentManifestRootSave = this.parentManifestRoot;
          const manifestRootSave = this.manifestRoot;
          const manifestSave = this.manifest;
          const manifest = this.surrogate = this.manifest = new PlainElementSymbol(node);
          const attributes = node.attributes;
          let i = 0;
          while (i < attributes.length) {
              const attr = attributes[i];
              const attrSyntax = this.attrParser.parse(attr.name, attr.value);
              if (invalidSurrogateAttribute[attrSyntax.target] === true) {
                  throw new Error(`Invalid surrogate attribute: ${attrSyntax.target}`);
                  // TODO: use reporter
              }
              const attrInfo = this.resources.getAttributeInfo(attrSyntax);
              if (attrInfo === null) {
                  this.bindPlainAttribute(dom, attrSyntax);
              }
              else if (attrInfo.isTemplateController) {
                  throw new Error('Cannot have template controller on surrogate element.');
                  // TODO: use reporter
              }
              else {
                  this.bindCustomAttribute(dom, attrSyntax, attrInfo);
              }
              ++i;
          }
          this.bindChildNodes(dom, node);
          this.surrogate = surrogateSave;
          this.parentManifestRoot = parentManifestRootSave;
          this.manifestRoot = manifestRootSave;
          this.manifest = manifestSave;
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
          return manifest;
      }
      bindManifest(dom, parentManifest, node) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('TemplateBinder.bindManifest', slice.call(arguments));
          }
          switch (node.nodeName) {
              case 'LET':
                  // let cannot have children and has some different processing rules, so return early
                  this.bindLetElement(dom, parentManifest, node);
                  if (kernel.Tracer.enabled) {
                      kernel.Tracer.leave();
                  }
                  return;
              case 'SLOT':
                  // slot requires no compilation
                  this.surrogate.hasSlots = true;
                  if (kernel.Tracer.enabled) {
                      kernel.Tracer.leave();
                  }
                  return;
          }
          // nodes are processed bottom-up so we need to store the manifests before traversing down and
          // restore them again afterwards
          const parentManifestRootSave = this.parentManifestRoot;
          const manifestRootSave = this.manifestRoot;
          const manifestSave = this.manifest;
          // get the part name to override the name of the compiled definition
          this.partName = node.getAttribute('part');
          let manifestRoot;
          const elementInfo = this.resources.getElementInfo(node);
          if (elementInfo === null) {
              // there is no registered custom element with this name
              this.manifest = new PlainElementSymbol(node);
          }
          else {
              // it's a custom element so we set the manifestRoot as well (for storing replace-parts)
              this.parentManifestRoot = this.manifestRoot;
              manifestRoot = this.manifestRoot = this.manifest = new CustomElementSymbol(dom, node, elementInfo);
          }
          // lifting operations done by template controllers and replace-parts effectively unlink the nodes, so start at the bottom
          this.bindChildNodes(dom, node);
          // the parentManifest will receive either the direct child nodes, or the template controllers / replace-parts
          // wrapping them
          this.bindAttributes(dom, node, parentManifest);
          if (manifestRoot !== undefined && manifestRoot.isContainerless) {
              node.parentNode.replaceChild(manifestRoot.marker, node);
          }
          else if (this.manifest.isTarget) {
              node.classList.add('au');
          }
          // restore the stored manifests so the attributes are processed on the correct lavel
          this.parentManifestRoot = parentManifestRootSave;
          this.manifestRoot = manifestRootSave;
          this.manifest = manifestSave;
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
      }
      bindLetElement(dom, parentManifest, node) {
          const symbol = new LetElementSymbol(dom, node);
          parentManifest.childNodes.push(symbol);
          const attributes = node.attributes;
          let i = 0;
          while (i < attributes.length) {
              const attr = attributes[i];
              if (attr.name === 'to-view-model') {
                  node.removeAttribute('to-view-model');
                  symbol.toViewModel = true;
                  continue;
              }
              const attrSyntax = this.attrParser.parse(attr.name, attr.value);
              const command = this.resources.getBindingCommand(attrSyntax);
              const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
              const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
              const to = kernel.PLATFORM.camelCase(attrSyntax.target);
              const info = new BindableInfo(to, runtime.BindingMode.toView);
              symbol.bindings.push(new BindingSymbol(command, info, expr, attrSyntax.rawValue, to));
              ++i;
          }
          node.parentNode.replaceChild(symbol.marker, node);
      }
      bindAttributes(dom, node, parentManifest) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('TemplateBinder.bindAttributes', slice.call(arguments));
          }
          const { parentManifestRoot, manifestRoot, manifest } = this;
          // This is the top-level symbol for the current depth.
          // If there are no template controllers or replace-parts, it is always the manifest itself.
          // If there are template controllers, then this will be the outer-most TemplateControllerSymbol.
          let manifestProxy = manifest;
          const replacePart = this.declareReplacePart(dom, node);
          let previousController;
          let currentController;
          const attributes = node.attributes;
          let i = 0;
          while (i < attributes.length) {
              const attr = attributes[i];
              ++i;
              if (attributesToIgnore[attr.name] === true) {
                  continue;
              }
              const attrSyntax = this.attrParser.parse(attr.name, attr.value);
              const attrInfo = this.resources.getAttributeInfo(attrSyntax);
              if (attrInfo === null) {
                  // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
                  this.bindPlainAttribute(dom, attrSyntax);
              }
              else if (attrInfo.isTemplateController) {
                  // the manifest is wrapped by the inner-most template controller (if there are multiple on the same element)
                  // so keep setting manifest.templateController to the latest template controller we find
                  currentController = manifest.templateController = this.declareTemplateController(dom, attrSyntax, attrInfo);
                  // the proxy and the manifest are only identical when we're at the first template controller (since the controller
                  // is assigned to the proxy), so this evaluates to true at most once per node
                  if (manifestProxy === manifest) {
                      currentController.template = manifest;
                      manifestProxy = currentController;
                  }
                  else {
                      currentController.templateController = previousController;
                      currentController.template = previousController.template;
                      previousController.template = currentController;
                  }
                  previousController = currentController;
              }
              else {
                  // a regular custom attribute
                  this.bindCustomAttribute(dom, attrSyntax, attrInfo);
              }
          }
          processTemplateControllers(dom, manifestProxy, manifest);
          if (replacePart === null) {
              // the proxy is either the manifest itself or the outer-most controller; add it directly to the parent
              parentManifest.childNodes.push(manifestProxy);
          }
          else {
              // there is a replace-part attribute on this node, so add it to the parts collection of the manifestRoot
              // instead of to the childNodes
              replacePart.parent = parentManifest;
              replacePart.template = manifestProxy;
              // if the current manifest is also the manifestRoot, it means the replace-part sits on a custom
              // element, so add the part to the parent wrapping custom element instead
              const partOwner = manifest === manifestRoot ? parentManifestRoot : manifestRoot;
              partOwner.parts.push(replacePart);
              processReplacePart(dom, replacePart, manifestProxy);
          }
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
      }
      bindChildNodes(dom, node) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('TemplateBinder.bindChildNodes', slice.call(arguments));
          }
          let childNode;
          if (node.nodeName === 'TEMPLATE') {
              childNode = node.content.firstChild;
          }
          else {
              childNode = node.firstChild;
          }
          let nextChild;
          while (childNode !== null) {
              switch (childNode.nodeType) {
                  case 1 /* Element */:
                      nextChild = childNode.nextSibling;
                      this.bindManifest(dom, this.manifest, childNode);
                      childNode = nextChild;
                      break;
                  case 3 /* Text */:
                      childNode = this.bindText(dom, childNode).nextSibling;
                      break;
                  case 4 /* CDATASection */:
                  case 7 /* ProcessingInstruction */:
                  case 8 /* Comment */:
                  case 10 /* DocumentType */:
                      childNode = childNode.nextSibling;
                      break;
                  case 9 /* Document */:
                  case 11 /* DocumentFragment */:
                      childNode = childNode.firstChild;
              }
          }
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
      }
      bindText(dom, node) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('TemplateBinder.bindText', slice.call(arguments));
          }
          const interpolation = this.exprParser.parse(node.wholeText, 2048 /* Interpolation */);
          if (interpolation !== null) {
              const symbol = new TextSymbol(dom, node, interpolation);
              this.manifest.childNodes.push(symbol);
              processInterpolationText(dom, symbol);
          }
          while (node.nextSibling !== null && node.nextSibling.nodeType === 3 /* Text */) {
              node = node.nextSibling;
          }
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
          return node;
      }
      declareTemplateController(dom, attrSyntax, attrInfo) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('TemplateBinder.declareTemplateController', slice.call(arguments));
          }
          let symbol;
          // dynamicOptions logic here is similar to (and explained in) bindCustomAttribute
          const command = this.resources.getBindingCommand(attrSyntax);
          if (command === null && attrInfo.hasDynamicOptions) {
              symbol = new TemplateControllerSymbol(dom, attrSyntax, attrInfo, this.partName);
              this.partName = null;
              this.bindMultiAttribute(dom, symbol, attrInfo, attrSyntax.rawValue);
          }
          else {
              symbol = new TemplateControllerSymbol(dom, attrSyntax, attrInfo, this.partName);
              const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
              const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
              symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrSyntax.rawValue, attrSyntax.target));
              this.partName = null;
          }
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
          return symbol;
      }
      bindCustomAttribute(dom, attrSyntax, attrInfo) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('TemplateBinder.bindCustomAttribute', slice.call(arguments));
          }
          const command = this.resources.getBindingCommand(attrSyntax);
          let symbol;
          if (command === null && attrInfo.hasDynamicOptions) {
              // a dynamicOptions (semicolon separated binding) is only valid without a binding command;
              // the binding commands must be declared in the dynamicOptions expression itself
              symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
              this.bindMultiAttribute(dom, symbol, attrInfo, attrSyntax.rawValue);
          }
          else {
              // we've either got a command (with or without dynamicOptions, the latter maps to the first bindable),
              // or a null command but without dynamicOptions (which may be an interpolation or a normal string)
              symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
              const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
              const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
              symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrSyntax.rawValue, attrSyntax.target));
          }
          this.manifest.attributes.push(symbol);
          this.manifest.isTarget = true;
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
      }
      bindMultiAttribute(dom, symbol, attrInfo, value) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('TemplateBinder.bindMultiAttribute', slice.call(arguments));
          }
          const attributes = parseMultiAttributeBinding(value);
          let attr;
          for (let i = 0, ii = attributes.length; i < ii; ++i) {
              attr = attributes[i];
              const attrSyntax = this.attrParser.parse(attr.name, attr.value);
              const command = this.resources.getBindingCommand(attrSyntax);
              const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
              const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
              let bindable = attrInfo.bindables[attrSyntax.target];
              if (bindable === undefined) {
                  // everything in a dynamicOptions expression must be used, so if it's not a bindable then we create one on the spot
                  bindable = attrInfo.bindables[attrSyntax.target] = new BindableInfo(attrSyntax.target, runtime.BindingMode.toView);
              }
              symbol.bindings.push(new BindingSymbol(command, bindable, expr, attrSyntax.rawValue, attrSyntax.target));
          }
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
      }
      bindPlainAttribute(dom, attrSyntax) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('TemplateBinder.bindPlainAttribute', slice.call(arguments));
          }
          if (attrSyntax.rawValue.length === 0) {
              if (kernel.Tracer.enabled) {
                  kernel.Tracer.leave();
              }
              return;
          }
          const command = this.resources.getBindingCommand(attrSyntax);
          const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
          const manifest = this.manifest;
          const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
          if (manifest.flags & 16 /* isCustomElement */) {
              const bindable = manifest.bindables[attrSyntax.target];
              if (bindable !== undefined) {
                  // if the attribute name matches a bindable property name, add it regardless of whether it's a command, interpolation, or just a plain string;
                  // the template compiler will translate it to the correct instruction
                  manifest.bindings.push(new BindingSymbol(command, bindable, expr, attrSyntax.rawValue, attrSyntax.target));
                  manifest.isTarget = true;
              }
              else if (expr !== null) {
                  // if it does not map to a bindable, only add it if we were able to parse an expression (either a command or interpolation)
                  manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
                  manifest.isTarget = true;
              }
          }
          else if (expr !== null || attrSyntax.target === 'ref') {
              // either a binding command, an interpolation, or a ref
              manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
              manifest.isTarget = true;
          }
          else if (manifest === this.surrogate) {
              // any attributes, even if they are plain (no command/interpolation etc), should be added if they
              // are on the surrogate element
              manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
          }
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
      }
      declareReplacePart(dom, node) {
          if (kernel.Tracer.enabled) {
              kernel.Tracer.enter('TemplateBinder.declareReplacePart', slice.call(arguments));
          }
          const name = node.getAttribute('replace-part');
          if (name === null) {
              if (kernel.Tracer.enabled) {
                  kernel.Tracer.leave();
              }
              return null;
          }
          node.removeAttribute('replace-part');
          const symbol = new ReplacePartSymbol(name);
          if (kernel.Tracer.enabled) {
              kernel.Tracer.leave();
          }
          return symbol;
      }
  }
  function processInterpolationText(dom, symbol) {
      const node = symbol.physicalNode;
      const parentNode = node.parentNode;
      while (node.nextSibling !== null && node.nextSibling.nodeType === 3 /* Text */) {
          parentNode.removeChild(node.nextSibling);
      }
      node.textContent = '';
      parentNode.insertBefore(symbol.marker, node);
  }
  /**
   * A (temporary) standalone function that purely does the DOM processing (lifting) related to template controllers.
   * It's a first refactoring step towards separating DOM parsing/binding from mutations.
   */
  function processTemplateControllers(dom, manifestProxy, manifest) {
      const manifestNode = manifest.physicalNode;
      let current = manifestProxy;
      while (current !== manifest) {
          if (current.template === manifest) {
              // the DOM linkage is still in its original state here so we can safely assume the parentNode is non-null
              manifestNode.parentNode.replaceChild(current.marker, manifestNode);
              // if the manifest is a template element (e.g. <template repeat.for="...">) then we can skip one lift operation
              // and simply use the template directly, saving a bit of work
              if (manifestNode.nodeName === 'TEMPLATE') {
                  current.physicalNode = manifestNode;
                  // the template could safely stay without affecting anything visible, but let's keep the DOM tidy
                  manifestNode.remove();
              }
              else {
                  // the manifest is not a template element so we need to wrap it in one
                  current.physicalNode = dom.createTemplate();
                  current.physicalNode.content.appendChild(manifestNode);
              }
          }
          else {
              current.physicalNode = dom.createTemplate();
              current.physicalNode.content.appendChild(current.marker);
          }
          manifestNode.removeAttribute(current.syntax.rawName);
          current = current.template;
      }
  }
  function processReplacePart(dom, replacePart, manifestProxy) {
      let proxyNode;
      if (manifestProxy.flags & 512 /* hasMarker */) {
          proxyNode = manifestProxy.marker;
      }
      else {
          proxyNode = manifestProxy.physicalNode;
      }
      if (proxyNode.nodeName === 'TEMPLATE') {
          // if it's a template element, no need to do anything special, just assign it to the replacePart
          replacePart.physicalNode = proxyNode;
      }
      else {
          // otherwise wrap the replace-part in a template
          replacePart.physicalNode = dom.createTemplate();
          replacePart.physicalNode.content.appendChild(proxyNode);
      }
  }
  class ParserState$1 {
      constructor(input) {
          this.input = input;
          this.index = 0;
          this.length = input.length;
      }
  }
  const fromCharCode = String.fromCharCode;
  // TODO: move to expression parser
  function parseMultiAttributeBinding(input) {
      const attributes = [];
      const state = new ParserState$1(input);
      const length = state.length;
      let name;
      let value;
      while (state.index < length) {
          name = scanAttributeName(state);
          if (name.length === 0) {
              return attributes;
          }
          value = scanAttributeValue(state);
          attributes.push({ name, value });
      }
      return attributes;
  }
  function scanAttributeName(state) {
      const start = state.index;
      const { length, input } = state;
      while (state.index < length && input.charCodeAt(++state.index) !== 58 /* Colon */)
          ;
      return input.slice(start, state.index).trim();
  }
  function scanAttributeValue(state) {
      ++state.index;
      const { length, input } = state;
      let token = '';
      let ch = 0;
      while (state.index < length) {
          ch = input.charCodeAt(state.index);
          switch (ch) {
              case 59 /* Semicolon */:
                  ++state.index;
                  return token.trim();
              case 47 /* Slash */:
                  ch = input.charCodeAt(++state.index);
                  token += `\\${fromCharCode(ch)}`;
                  break;
              case 39 /* SingleQuote */:
                  token += '\'';
                  break;
              default:
                  token += fromCharCode(ch);
          }
          ++state.index;
      }
      return token.trim();
  }

  const ITemplateFactory = kernel.DI.createInterface()
      .withDefault(x => x.singleton(exports.TemplateFactory));
  /**
   * Default implementation for `ITemplateFactory` for use in an HTML based runtime.
   *
   * @internal
   */
  exports.TemplateFactory = class TemplateFactory {
      constructor(dom) {
          this.dom = dom;
          this.template = dom.createTemplate();
      }
      createTemplate(input) {
          if (typeof input === 'string') {
              const template = this.template;
              template.innerHTML = input;
              const node = template.content.firstElementChild;
              // if the input is either not wrapped in a template or there is more than one node,
              // return the whole template that wraps it/them (and create a new one for the next input)
              if (node === null || node.nodeName !== 'TEMPLATE' || node.nextElementSibling !== null) {
                  this.template = this.dom.createTemplate();
                  return template;
              }
              // the node to return is both a template and the only node, so return just the node
              // and clean up the template for the next input
              template.content.removeChild(node);
              return node;
          }
          if (input.nodeName !== 'TEMPLATE') {
              // if we get one node that is not a template, wrap it in one
              const template = this.dom.createTemplate();
              template.content.appendChild(input);
              return template;
          }
          // we got a template element, remove it from the DOM if it's present there and don't
          // do any other processing
          if (input.parentNode !== null) {
              input.parentNode.removeChild(input);
          }
          return input;
      }
  };
  exports.TemplateFactory = __decorate([
      kernel.inject(runtime.IDOM)
  ], exports.TemplateFactory);

  const buildNotRequired = Object.freeze({
      required: false,
      compiler: 'default'
  });
  /**
   * Default (runtime-agnostic) implementation for `ITemplateCompiler`.
   *
   * @internal
   */
  exports.TemplateCompiler = class TemplateCompiler {
      constructor(factory, attrParser, exprParser) {
          this.factory = factory;
          this.attrParser = attrParser;
          this.exprParser = exprParser;
          this.instructionRows = null;
      }
      get name() {
          return 'default';
      }
      compile(dom, definition, descriptions) {
          const resources = new ResourceModel(descriptions);
          const binder = new TemplateBinder(resources, this.attrParser, this.exprParser);
          const template = definition.template = this.factory.createTemplate(definition.template);
          const surrogate = binder.bind(dom, template);
          if (definition.instructions === undefined || definition.instructions === kernel.PLATFORM.emptyArray) {
              definition.instructions = [];
          }
          if (surrogate.hasSlots === true) {
              definition.hasSlots = true;
          }
          this.instructionRows = definition.instructions;
          const attributes = surrogate.attributes;
          const len = attributes.length;
          if (len > 0) {
              let surrogates;
              if (definition.surrogates === undefined || definition.surrogates === kernel.PLATFORM.emptyArray) {
                  definition.surrogates = Array(len);
              }
              surrogates = definition.surrogates;
              for (let i = 0; i < len; ++i) {
                  surrogates[i] = this.compileAttribute(attributes[i]);
              }
          }
          this.compileChildNodes(surrogate);
          this.instructionRows = null;
          return definition;
      }
      compileChildNodes(parent) {
          if (parent.flags & 8192 /* hasChildNodes */) {
              const { childNodes } = parent;
              let childNode;
              const ii = childNodes.length;
              for (let i = 0; i < ii; ++i) {
                  childNode = childNodes[i];
                  if (childNode.flags & 128 /* isText */) {
                      this.instructionRows.push([new runtime.TextBindingInstruction(childNode.interpolation)]);
                  }
                  else if (childNode.flags & 32 /* isLetElement */) {
                      const bindings = childNode.bindings;
                      const instructions = [];
                      let binding;
                      const jj = bindings.length;
                      for (let j = 0; j < jj; ++j) {
                          binding = bindings[j];
                          instructions[j] = new runtime.LetBindingInstruction(binding.expression, binding.target);
                      }
                      this.instructionRows.push([new runtime.LetElementInstruction(instructions, childNode.toViewModel)]);
                  }
                  else {
                      this.compileParentNode(childNode);
                  }
              }
          }
      }
      compileCustomElement(symbol) {
          // offset 1 to leave a spot for the hydrate instruction so we don't need to create 2 arrays with a spread etc
          const instructionRow = this.compileAttributes(symbol, 1);
          instructionRow[0] = new runtime.HydrateElementInstruction(symbol.res, this.compileBindings(symbol), this.compileParts(symbol));
          this.instructionRows.push(instructionRow);
      }
      compilePlainElement(symbol) {
          const attributes = this.compileAttributes(symbol, 0);
          if (attributes.length > 0) {
              this.instructionRows.push(attributes);
          }
          this.compileChildNodes(symbol);
      }
      compileParentNode(symbol) {
          switch (symbol.flags & 511 /* type */) {
              case 16 /* isCustomElement */:
                  this.compileCustomElement(symbol);
                  break;
              case 64 /* isPlainElement */:
                  this.compilePlainElement(symbol);
                  break;
              case 1 /* isTemplateController */:
                  this.compileTemplateController(symbol);
          }
      }
      compileTemplateController(symbol) {
          const bindings = this.compileBindings(symbol);
          const instructionRowsSave = this.instructionRows;
          const controllerInstructions = this.instructionRows = [];
          this.compileParentNode(symbol.template);
          this.instructionRows = instructionRowsSave;
          const def = {
              name: symbol.partName === null ? symbol.res : symbol.partName,
              template: symbol.physicalNode,
              instructions: controllerInstructions,
              build: buildNotRequired
          };
          this.instructionRows.push([new runtime.HydrateTemplateController(def, symbol.res, bindings, symbol.res === 'else')]);
      }
      compileBindings(symbol) {
          let bindingInstructions;
          if (symbol.flags & 4096 /* hasBindings */) {
              // either a custom element with bindings, a custom attribute / template controller with dynamic options,
              // or a single value custom attribute binding
              const { bindings } = symbol;
              const len = bindings.length;
              bindingInstructions = Array(len);
              let i = 0;
              for (; i < len; ++i) {
                  bindingInstructions[i] = this.compileBinding(bindings[i]);
              }
          }
          else {
              bindingInstructions = kernel.PLATFORM.emptyArray;
          }
          return bindingInstructions;
      }
      compileBinding(symbol) {
          if (symbol.command === null) {
              // either an interpolation or a normal string value assigned to an element or attribute binding
              if (symbol.expression === null) {
                  // the template binder already filtered out non-bindables, so we know we need a setProperty here
                  return new runtime.SetPropertyInstruction(symbol.rawValue, symbol.bindable.propName);
              }
              else {
                  // either an element binding interpolation or a dynamic options attribute binding interpolation
                  return new runtime.InterpolationInstruction(symbol.expression, symbol.bindable.propName);
              }
          }
          else {
              // either an element binding command, dynamic options attribute binding command,
              // or custom attribute / template controller (single value) binding command
              return symbol.command.compile(symbol);
          }
      }
      compileAttributes(symbol, offset) {
          let attributeInstructions;
          if (symbol.flags & 2048 /* hasAttributes */) {
              // any attributes on a custom element (which are not bindables) or a plain element
              const { attributes } = symbol;
              const len = attributes.length;
              attributeInstructions = Array(offset + len);
              for (let i = 0; i < len; ++i) {
                  attributeInstructions[i + offset] = this.compileAttribute(attributes[i]);
              }
          }
          else if (offset > 0) {
              attributeInstructions = Array(offset);
          }
          else {
              attributeInstructions = kernel.PLATFORM.emptyArray;
          }
          return attributeInstructions;
      }
      compileAttribute(symbol) {
          if (symbol.syntax.target === 'ref') {
              return new runtime.RefBindingInstruction(symbol.syntax.rawValue);
          }
          // any attribute on a custom element (which is not a bindable) or a plain element
          if (symbol.flags & 4 /* isCustomAttribute */) {
              // a normal custom attribute (not template controller)
              const bindings = this.compileBindings(symbol);
              return new runtime.HydrateAttributeInstruction(symbol.res, bindings);
          }
          else if (symbol.command === null) {
              if (symbol.expression === null) {
                  // a plain attribute on a surrogate
                  return new runtime.SetAttributeInstruction(symbol.syntax.rawValue, symbol.syntax.target);
              }
              else {
                  // a plain attribute with an interpolation
                  return new runtime.InterpolationInstruction(symbol.expression, symbol.syntax.target);
              }
          }
          else {
              // a plain attribute with a binding command
              return symbol.command.compile(symbol);
          }
      }
      compileParts(symbol) {
          let parts;
          if (symbol.flags & 16384 /* hasParts */) {
              parts = {};
              const replaceParts = symbol.parts;
              const ii = replaceParts.length;
              let instructionRowsSave;
              let partInstructions;
              let replacePart;
              for (let i = 0; i < ii; ++i) {
                  replacePart = replaceParts[i];
                  instructionRowsSave = this.instructionRows;
                  partInstructions = this.instructionRows = [];
                  this.compileParentNode(replacePart.template);
                  parts[replacePart.name] = {
                      name: replacePart.name,
                      template: replacePart.physicalNode,
                      instructions: partInstructions,
                      build: buildNotRequired
                  };
                  this.instructionRows = instructionRowsSave;
              }
          }
          else {
              parts = kernel.PLATFORM.emptyObject;
          }
          return parts;
      }
  };
  exports.TemplateCompiler = __decorate([
      kernel.inject(ITemplateFactory, IAttributeParser, runtime.IExpressionParser)
  ], exports.TemplateCompiler);

  const GlobalResources = [
      runtime.Compose,
      runtime.If,
      runtime.Else,
      runtime.Repeat,
      runtime.Replaceable,
      runtime.With,
      runtime.SanitizeValueConverter,
      runtime.AttrBindingBehavior,
      runtime.DebounceBindingBehavior,
      runtime.OneTimeBindingBehavior,
      runtime.ToViewBindingBehavior,
      runtime.FromViewBindingBehavior,
      runtime.SelfBindingBehavior,
      runtime.SignalBindingBehavior,
      runtime.ThrottleBindingBehavior,
      runtime.TwoWayBindingBehavior,
      runtime.UpdateTriggerBindingBehavior
  ];
  const DefaultBindingLanguage = [
      exports.DefaultBindingCommand,
      exports.OneTimeBindingCommand,
      exports.ToViewBindingCommand,
      exports.FromViewBindingCommand,
      exports.TwoWayBindingCommand,
      exports.TriggerBindingCommand,
      exports.DelegateBindingCommand,
      exports.CaptureBindingCommand,
      exports.CallBindingCommand,
      exports.ForBindingCommand,
      exports.DotSeparatedAttributePattern,
      exports.RefAttributePattern
  ];
  const BasicConfiguration = {
      register(container) {
          container.register(ParserRegistration, runtime.HtmlRenderer, kernel.Registration.singleton(runtime.ITemplateCompiler, exports.TemplateCompiler), ...GlobalResources, ...DefaultBindingLanguage);
      }
  };

  function stringifyDOM(node, depth) {
      const indent = ' '.repeat(depth);
      let output = indent;
      output += `Node: ${node.nodeName}`;
      if (node.nodeType === 3 /* Text */) {
          output += ` "${node.textContent}"`;
      }
      if (node.nodeType === 1 /* Element */) {
          let i = 0;
          let attr;
          const attributes = node.attributes;
          const len = attributes.length;
          for (; i < len; ++i) {
              attr = attributes[i];
              output += ` ${attr.name}=${attr.value}`;
          }
      }
      output += '\n';
      if (node.nodeType === 1 /* Element */) {
          let i = 0;
          let childNodes = node.childNodes;
          let len = childNodes.length;
          for (; i < len; ++i) {
              output += stringifyDOM(childNodes[i], depth + 1);
          }
          if (node.nodeName === 'TEMPLATE') {
              i = 0;
              childNodes = node.content.childNodes;
              len = childNodes.length;
              for (; i < len; ++i) {
                  output += stringifyDOM(childNodes[i], depth + 1);
              }
          }
      }
      return output;
  }
  function stringifyInstructions(instruction, depth) {
      const indent = ' '.repeat(depth);
      let output = indent;
      switch (instruction.type) {
          case "a" /* textBinding */:
              output += 'textBinding\n';
              break;
          case "f" /* callBinding */:
              output += 'callBinding\n';
              break;
          case "d" /* iteratorBinding */:
              output += 'iteratorBinding\n';
              break;
          case "e" /* listenerBinding */:
              output += 'listenerBinding\n';
              break;
          case "c" /* propertyBinding */:
              output += 'propertyBinding\n';
              break;
          case "g" /* refBinding */:
              output += 'refBinding\n';
              break;
          case "h" /* stylePropertyBinding */:
              output += 'stylePropertyBinding\n';
              break;
          case "i" /* setProperty */:
              output += 'setProperty\n';
              break;
          case "j" /* setAttribute */:
              output += 'setAttribute\n';
              break;
          case "b" /* interpolation */:
              output += 'interpolation\n';
              break;
          case "n" /* hydrateLetElement */:
              output += 'hydrateLetElement\n';
              instruction.instructions.forEach(i => {
                  output += stringifyInstructions(i, depth + 1);
              });
              break;
          case "l" /* hydrateAttribute */:
              output += `hydrateAttribute: ${instruction.res}\n`;
              instruction.instructions.forEach(i => {
                  output += stringifyInstructions(i, depth + 1);
              });
              break;
          case "k" /* hydrateElement */:
              output += `hydrateElement: ${instruction.res}\n`;
              instruction.instructions.forEach(i => {
                  output += stringifyInstructions(i, depth + 1);
              });
              break;
          case "m" /* hydrateTemplateController */:
              output += `hydrateTemplateController: ${instruction.res}\n`;
              output += stringifyTemplateDefinition(instruction.def, depth + 1);
              instruction.instructions.forEach(i => {
                  output += stringifyInstructions(i, depth + 1);
              });
      }
      return output;
  }
  function stringifyTemplateDefinition(def, depth) {
      const indent = ' '.repeat(depth);
      let output = indent;
      output += `TemplateDefinition: ${def.name}\n`;
      output += stringifyDOM(def.template, depth + 1);
      output += `${indent} Instructions:\n`;
      def.instructions.forEach(row => {
          output += `${indent}  Row:\n`;
          row.forEach(i => {
              output += stringifyInstructions(i, depth + 3);
          });
      });
      return output;
  }

  exports.AttrSyntax = AttrSyntax;
  exports.IAttributeParser = IAttributeParser;
  exports.CharSpec = CharSpec;
  exports.Interpretation = Interpretation;
  exports.State = State;
  exports.StaticSegment = StaticSegment;
  exports.DynamicSegment = DynamicSegment;
  exports.SymbolSegment = SymbolSegment;
  exports.SegmentTypes = SegmentTypes;
  exports.ISyntaxInterpreter = ISyntaxInterpreter;
  exports.SyntaxInterpreter = SyntaxInterpreter;
  exports.IAttributePattern = IAttributePattern;
  exports.attributePattern = attributePattern;
  exports.bindingCommand = bindingCommand;
  exports.BindingCommandResource = BindingCommandResource;
  exports.unescapeCode = unescapeCode;
  exports.GlobalResources = GlobalResources;
  exports.DefaultBindingLanguage = DefaultBindingLanguage;
  exports.BasicConfiguration = BasicConfiguration;
  exports.stringifyDOM = stringifyDOM;
  exports.stringifyInstructions = stringifyInstructions;
  exports.stringifyTemplateDefinition = stringifyTemplateDefinition;
  exports.ParserRegistration = ParserRegistration;
  exports.ParserState = ParserState;
  exports.parseCore = parseCore;
  exports.parse = parse;
  exports.ResourceModel = ResourceModel;
  exports.BindableInfo = BindableInfo;
  exports.ElementInfo = ElementInfo;
  exports.AttrInfo = AttrInfo;
  exports.TemplateControllerSymbol = TemplateControllerSymbol;
  exports.ReplacePartSymbol = ReplacePartSymbol;
  exports.CustomAttributeSymbol = CustomAttributeSymbol;
  exports.PlainAttributeSymbol = PlainAttributeSymbol;
  exports.BindingSymbol = BindingSymbol;
  exports.CustomElementSymbol = CustomElementSymbol;
  exports.LetElementSymbol = LetElementSymbol;
  exports.PlainElementSymbol = PlainElementSymbol;
  exports.TextSymbol = TextSymbol;
  exports.TemplateBinder = TemplateBinder;
  exports.ITemplateFactory = ITemplateFactory;

  return exports;

}({}, au.kernel, au.runtime));
