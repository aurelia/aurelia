System.register('jit', ['@aurelia/kernel', '@aurelia/runtime'], function (exports) {
  'use strict';
  var PLATFORM, DI, Registration, Reporter, Profiler, all, camelCase, kebabCase, OneTimeBindingInstruction, ToViewBindingInstruction, FromViewBindingInstruction, TwoWayBindingInstruction, BindingMode, CallBindingInstruction, IteratorBindingInstruction, PrimitiveLiteral, AccessThis, Unary, BindingIdentifier, AccessScope, Template, ForOfStatement, AccessMember, AccessKeyed, CallScope, CallMember, CallFunction, TaggedTemplate, Binary, Conditional, Assign, ValueConverter, BindingBehavior, ArrayBindingPattern, ArrayLiteral, ObjectBindingPattern, ObjectLiteral, Interpolation, IExpressionParser, RuntimeBasicConfiguration, CustomElementResource, CustomAttributeResource;
  return {
    setters: [function (module) {
      PLATFORM = module.PLATFORM;
      DI = module.DI;
      Registration = module.Registration;
      Reporter = module.Reporter;
      Profiler = module.Profiler;
      all = module.all;
      camelCase = module.camelCase;
      kebabCase = module.kebabCase;
    }, function (module) {
      OneTimeBindingInstruction = module.OneTimeBindingInstruction;
      ToViewBindingInstruction = module.ToViewBindingInstruction;
      FromViewBindingInstruction = module.FromViewBindingInstruction;
      TwoWayBindingInstruction = module.TwoWayBindingInstruction;
      BindingMode = module.BindingMode;
      CallBindingInstruction = module.CallBindingInstruction;
      IteratorBindingInstruction = module.IteratorBindingInstruction;
      PrimitiveLiteral = module.PrimitiveLiteral;
      AccessThis = module.AccessThis;
      Unary = module.Unary;
      BindingIdentifier = module.BindingIdentifier;
      AccessScope = module.AccessScope;
      Template = module.Template;
      ForOfStatement = module.ForOfStatement;
      AccessMember = module.AccessMember;
      AccessKeyed = module.AccessKeyed;
      CallScope = module.CallScope;
      CallMember = module.CallMember;
      CallFunction = module.CallFunction;
      TaggedTemplate = module.TaggedTemplate;
      Binary = module.Binary;
      Conditional = module.Conditional;
      Assign = module.Assign;
      ValueConverter = module.ValueConverter;
      BindingBehavior = module.BindingBehavior;
      ArrayBindingPattern = module.ArrayBindingPattern;
      ArrayLiteral = module.ArrayLiteral;
      ObjectBindingPattern = module.ObjectBindingPattern;
      ObjectLiteral = module.ObjectLiteral;
      Interpolation = module.Interpolation;
      IExpressionParser = module.IExpressionParser;
      RuntimeBasicConfiguration = module.RuntimeBasicConfiguration;
      CustomElementResource = module.CustomElementResource;
      CustomAttributeResource = module.CustomAttributeResource;
    }],
    execute: function () {

      exports({
        Access: void 0,
        Char: void 0,
        Precedence: void 0,
        SymbolFlags: void 0,
        attributePattern: attributePattern,
        bindingCommand: bindingCommand,
        getMode: getMode,
        getTarget: getTarget,
        parse: parse,
        parseExpression: parseExpression
      });

      class AttrSyntax {
          constructor(rawName, rawValue, target, command) {
              this.rawName = rawName;
              this.rawValue = rawValue;
              this.target = target;
              this.command = command;
          }
      } exports('AttrSyntax', AttrSyntax);

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
              if (value == null) {
                  this._pattern = '';
                  this.parts = PLATFORM.emptyArray;
              }
              else {
                  this._pattern = value;
                  this.parts = this.partsRecord[value];
              }
          }
          constructor() {
              this._pattern = '';
              this.parts = PLATFORM.emptyArray;
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
      } exports('Interpretation', Interpretation);
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
              if (state == null) {
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
                      j = 0;
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
      const ISyntaxInterpreter = exports('ISyntaxInterpreter', DI.createInterface('ISyntaxInterpreter').withDefault(x => x.singleton(SyntaxInterpreter)));
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
                  Reporter.write(401, def.pattern); // TODO: organize error codes
              }
              else if (typeof handler[def.pattern] !== 'function') {
                  Reporter.write(402, def.pattern); // TODO: organize error codes
              }
          }
      }
      const IAttributePattern = exports('IAttributePattern', DI.createInterface('IAttributePattern').noDefault());
      function attributePattern(...patternDefs) {
          return function decorator(target) {
              const proto = target.prototype;
              // Note: the prototype is really meant to be an intersection type between IAttrubutePattern and IAttributePatternHandler, but
              // a type with an index signature cannot be intersected with anything else that has normal property names.
              // So we're forced to use a union type and cast it here.
              validatePrototype(proto, patternDefs);
              proto.$patternDefs = patternDefs;
              target.register = function register(container) {
                  return Registration.singleton(IAttributePattern, target).register(container, IAttributePattern);
              };
              return target;
          };
      }
      class DotSeparatedAttributePattern {
          ['PART.PART'](rawName, rawValue, parts) {
              return new AttrSyntax(rawName, rawValue, parts[0], parts[1]);
          }
          ['PART.PART.PART'](rawName, rawValue, parts) {
              return new AttrSyntax(rawName, rawValue, parts[0], parts[2]);
          }
      } exports('DotSeparatedAttributePattern', DotSeparatedAttributePattern);
      attributePattern({ pattern: 'PART.PART', symbols: '.' }, { pattern: 'PART.PART.PART', symbols: '.' })(DotSeparatedAttributePattern);
      class RefAttributePattern {
          ['ref'](rawName, rawValue, parts) {
              return new AttrSyntax(rawName, rawValue, 'ref', null);
          }
          ['ref.PART'](rawName, rawValue, parts) {
              return new AttrSyntax(rawName, rawValue, 'ref', parts[1]);
          }
      } exports('RefAttributePattern', RefAttributePattern);
      attributePattern({ pattern: 'ref', symbols: '' }, { pattern: 'ref.PART', symbols: '.' })(RefAttributePattern);
      class ColonPrefixedBindAttributePattern {
          [':PART'](rawName, rawValue, parts) {
              return new AttrSyntax(rawName, rawValue, parts[0], 'bind');
          }
      } exports('ColonPrefixedBindAttributePattern', ColonPrefixedBindAttributePattern);
      attributePattern({ pattern: ':PART', symbols: ':' })(ColonPrefixedBindAttributePattern);
      class AtPrefixedTriggerAttributePattern {
          ['@PART'](rawName, rawValue, parts) {
              return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
          }
      } exports('AtPrefixedTriggerAttributePattern', AtPrefixedTriggerAttributePattern);
      attributePattern({ pattern: '@PART', symbols: '@' })(AtPrefixedTriggerAttributePattern);

      const IAttributeParser = exports('IAttributeParser', DI.createInterface('IAttributeParser').withDefault(x => x.singleton(AttributeParser)));
      const { enter, leave } = Profiler.createTimer('AttributeParser');
      /** @internal */
      class AttributeParser {
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
              if (Profiler.enabled) {
                  enter();
              }
              let interpretation = this.cache[name];
              if (interpretation == null) {
                  interpretation = this.cache[name] = this.interpreter.interpret(name);
              }
              const pattern = interpretation.pattern;
              if (pattern == null) {
                  if (Profiler.enabled) {
                      leave();
                  }
                  return new AttrSyntax(name, value, name, null);
              }
              else {
                  if (Profiler.enabled) {
                      leave();
                  }
                  return this.patterns[pattern][pattern](name, value, interpretation.parts);
              }
          }
      }
      // @ts-ignore
      AttributeParser.inject = [ISyntaxInterpreter, all(IAttributePattern)];

      function register(container) {
          const resourceKey = BindingCommandResource.keyFrom(this.description.name);
          container.register(Registration.singleton(resourceKey, this));
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
          const WritableType = Type;
          const description = typeof nameOrDefinition === 'string' ? { name: nameOrDefinition, target: null } : nameOrDefinition;
          WritableType.kind = BindingCommandResource;
          WritableType.description = description;
          Type.register = register;
          return Type;
      }
      const BindingCommandResource = exports('BindingCommandResource', {
          name: 'binding-command',
          keyFrom,
          isType,
          define
      });
      function getTarget(binding, makeCamelCase) {
          if (binding.flags & 256 /* isBinding */) {
              return binding.bindable.propName;
          }
          else if (makeCamelCase) {
              return camelCase(binding.syntax.target);
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
      class OneTimeBindingCommand {
          constructor() {
              this.bindingType = 49 /* OneTimeCommand */;
          }
          compile(binding) {
              return new OneTimeBindingInstruction(binding.expression, getTarget(binding, false));
          }
      } exports('OneTimeBindingCommand', OneTimeBindingCommand);
      BindingCommandResource.define('one-time', OneTimeBindingCommand);
      class ToViewBindingCommand {
          constructor() {
              this.bindingType = 50 /* ToViewCommand */;
          }
          compile(binding) {
              return new ToViewBindingInstruction(binding.expression, getTarget(binding, false));
          }
      } exports('ToViewBindingCommand', ToViewBindingCommand);
      BindingCommandResource.define('to-view', ToViewBindingCommand);
      class FromViewBindingCommand {
          constructor() {
              this.bindingType = 51 /* FromViewCommand */;
          }
          compile(binding) {
              return new FromViewBindingInstruction(binding.expression, getTarget(binding, false));
          }
      } exports('FromViewBindingCommand', FromViewBindingCommand);
      BindingCommandResource.define('from-view', FromViewBindingCommand);
      class TwoWayBindingCommand {
          constructor() {
              this.bindingType = 52 /* TwoWayCommand */;
          }
          compile(binding) {
              return new TwoWayBindingInstruction(binding.expression, getTarget(binding, false));
          }
      } exports('TwoWayBindingCommand', TwoWayBindingCommand);
      BindingCommandResource.define('two-way', TwoWayBindingCommand);
      // Not bothering to throw on non-existing modes, should never happen anyway.
      // Keeping all array elements of the same type for better optimizeability.
      const modeToProperty = ['', '$1', '$2', '', '$4', '', '$6'];
      const commandToMode = {
          'bind': BindingMode.toView,
          'one-time': BindingMode.oneTime,
          'to-view': BindingMode.toView,
          'from-view': BindingMode.fromView,
          'two-way': BindingMode.twoWay,
      };
      class DefaultBindingCommand {
          constructor() {
              this.bindingType = 53 /* BindCommand */;
              this.$1 = OneTimeBindingCommand.prototype.compile;
              this.$2 = ToViewBindingCommand.prototype.compile;
              this.$4 = FromViewBindingCommand.prototype.compile;
              this.$6 = TwoWayBindingCommand.prototype.compile;
          }
          compile(binding) {
              // @ts-ignore
              return this[modeToProperty[getMode(binding)]](binding);
          }
      } exports('DefaultBindingCommand', DefaultBindingCommand);
      BindingCommandResource.define('bind', DefaultBindingCommand);
      class CallBindingCommand {
          constructor() {
              this.bindingType = 153 /* CallCommand */;
          }
          compile(binding) {
              return new CallBindingInstruction(binding.expression, getTarget(binding, true));
          }
      } exports('CallBindingCommand', CallBindingCommand);
      BindingCommandResource.define('call', CallBindingCommand);
      class ForBindingCommand {
          constructor() {
              this.bindingType = 539 /* ForCommand */;
          }
          compile(binding) {
              return new IteratorBindingInstruction(binding.expression, getTarget(binding, false));
          }
      } exports('ForBindingCommand', ForBindingCommand);
      BindingCommandResource.define('for', ForBindingCommand);

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
      var Access;
      (function (Access) {
          Access[Access["Reset"] = 0] = "Reset";
          Access[Access["Ancestor"] = 511] = "Ancestor";
          Access[Access["This"] = 512] = "This";
          Access[Access["Scope"] = 1024] = "Scope";
          Access[Access["Member"] = 2048] = "Member";
          Access[Access["Keyed"] = 4096] = "Keyed";
      })(Access || (Access = exports('Access', {})));
      var Precedence;
      (function (Precedence) {
          Precedence[Precedence["Variadic"] = 61] = "Variadic";
          Precedence[Precedence["Assign"] = 62] = "Assign";
          Precedence[Precedence["Conditional"] = 63] = "Conditional";
          Precedence[Precedence["LogicalOR"] = 64] = "LogicalOR";
          Precedence[Precedence["LogicalAND"] = 128] = "LogicalAND";
          Precedence[Precedence["Equality"] = 192] = "Equality";
          Precedence[Precedence["Relational"] = 256] = "Relational";
          Precedence[Precedence["Additive"] = 320] = "Additive";
          Precedence[Precedence["Multiplicative"] = 384] = "Multiplicative";
          Precedence[Precedence["Binary"] = 448] = "Binary";
          Precedence[Precedence["LeftHandSide"] = 449] = "LeftHandSide";
          Precedence[Precedence["Primary"] = 450] = "Primary";
          Precedence[Precedence["Unary"] = 451] = "Unary";
      })(Precedence || (Precedence = exports('Precedence', {})));
      /** @internal */
      var Token;
      (function (Token) {
          Token[Token["EOF"] = 1572864] = "EOF";
          Token[Token["ExpressionTerminal"] = 1048576] = "ExpressionTerminal";
          Token[Token["AccessScopeTerminal"] = 524288] = "AccessScopeTerminal";
          Token[Token["ClosingToken"] = 262144] = "ClosingToken";
          Token[Token["OpeningToken"] = 131072] = "OpeningToken";
          Token[Token["BinaryOp"] = 65536] = "BinaryOp";
          Token[Token["UnaryOp"] = 32768] = "UnaryOp";
          Token[Token["LeftHandSide"] = 16384] = "LeftHandSide";
          Token[Token["StringOrNumericLiteral"] = 12288] = "StringOrNumericLiteral";
          Token[Token["NumericLiteral"] = 8192] = "NumericLiteral";
          Token[Token["StringLiteral"] = 4096] = "StringLiteral";
          Token[Token["IdentifierName"] = 3072] = "IdentifierName";
          Token[Token["Keyword"] = 2048] = "Keyword";
          Token[Token["Identifier"] = 1024] = "Identifier";
          Token[Token["Contextual"] = 512] = "Contextual";
          Token[Token["Precedence"] = 448] = "Precedence";
          Token[Token["Type"] = 63] = "Type";
          Token[Token["FalseKeyword"] = 2048] = "FalseKeyword";
          Token[Token["TrueKeyword"] = 2049] = "TrueKeyword";
          Token[Token["NullKeyword"] = 2050] = "NullKeyword";
          Token[Token["UndefinedKeyword"] = 2051] = "UndefinedKeyword";
          Token[Token["ThisScope"] = 3076] = "ThisScope";
          Token[Token["ParentScope"] = 3077] = "ParentScope";
          Token[Token["OpenParen"] = 671750] = "OpenParen";
          Token[Token["OpenBrace"] = 131079] = "OpenBrace";
          Token[Token["Dot"] = 16392] = "Dot";
          Token[Token["CloseBrace"] = 1835017] = "CloseBrace";
          Token[Token["CloseParen"] = 1835018] = "CloseParen";
          Token[Token["Comma"] = 1572875] = "Comma";
          Token[Token["OpenBracket"] = 671756] = "OpenBracket";
          Token[Token["CloseBracket"] = 1835021] = "CloseBracket";
          Token[Token["Colon"] = 1572878] = "Colon";
          Token[Token["Question"] = 1572879] = "Question";
          Token[Token["Ampersand"] = 1572880] = "Ampersand";
          Token[Token["Bar"] = 1572883] = "Bar";
          Token[Token["BarBar"] = 1638548] = "BarBar";
          Token[Token["AmpersandAmpersand"] = 1638613] = "AmpersandAmpersand";
          Token[Token["EqualsEquals"] = 1638678] = "EqualsEquals";
          Token[Token["ExclamationEquals"] = 1638679] = "ExclamationEquals";
          Token[Token["EqualsEqualsEquals"] = 1638680] = "EqualsEqualsEquals";
          Token[Token["ExclamationEqualsEquals"] = 1638681] = "ExclamationEqualsEquals";
          Token[Token["LessThan"] = 1638746] = "LessThan";
          Token[Token["GreaterThan"] = 1638747] = "GreaterThan";
          Token[Token["LessThanEquals"] = 1638748] = "LessThanEquals";
          Token[Token["GreaterThanEquals"] = 1638749] = "GreaterThanEquals";
          Token[Token["InKeyword"] = 1640798] = "InKeyword";
          Token[Token["InstanceOfKeyword"] = 1640799] = "InstanceOfKeyword";
          Token[Token["Plus"] = 623008] = "Plus";
          Token[Token["Minus"] = 623009] = "Minus";
          Token[Token["TypeofKeyword"] = 34850] = "TypeofKeyword";
          Token[Token["VoidKeyword"] = 34851] = "VoidKeyword";
          Token[Token["Asterisk"] = 1638884] = "Asterisk";
          Token[Token["Percent"] = 1638885] = "Percent";
          Token[Token["Slash"] = 1638886] = "Slash";
          Token[Token["Equals"] = 1048615] = "Equals";
          Token[Token["Exclamation"] = 32808] = "Exclamation";
          Token[Token["TemplateTail"] = 540713] = "TemplateTail";
          Token[Token["TemplateContinuation"] = 540714] = "TemplateContinuation";
          Token[Token["OfKeyword"] = 1051179] = "OfKeyword";
      })(Token || (Token = {}));
      var Char;
      (function (Char) {
          Char[Char["Null"] = 0] = "Null";
          Char[Char["Backspace"] = 8] = "Backspace";
          Char[Char["Tab"] = 9] = "Tab";
          Char[Char["LineFeed"] = 10] = "LineFeed";
          Char[Char["VerticalTab"] = 11] = "VerticalTab";
          Char[Char["FormFeed"] = 12] = "FormFeed";
          Char[Char["CarriageReturn"] = 13] = "CarriageReturn";
          Char[Char["Space"] = 32] = "Space";
          Char[Char["Exclamation"] = 33] = "Exclamation";
          Char[Char["DoubleQuote"] = 34] = "DoubleQuote";
          Char[Char["Dollar"] = 36] = "Dollar";
          Char[Char["Percent"] = 37] = "Percent";
          Char[Char["Ampersand"] = 38] = "Ampersand";
          Char[Char["SingleQuote"] = 39] = "SingleQuote";
          Char[Char["OpenParen"] = 40] = "OpenParen";
          Char[Char["CloseParen"] = 41] = "CloseParen";
          Char[Char["Asterisk"] = 42] = "Asterisk";
          Char[Char["Plus"] = 43] = "Plus";
          Char[Char["Comma"] = 44] = "Comma";
          Char[Char["Minus"] = 45] = "Minus";
          Char[Char["Dot"] = 46] = "Dot";
          Char[Char["Slash"] = 47] = "Slash";
          Char[Char["Semicolon"] = 59] = "Semicolon";
          Char[Char["Backtick"] = 96] = "Backtick";
          Char[Char["OpenBracket"] = 91] = "OpenBracket";
          Char[Char["Backslash"] = 92] = "Backslash";
          Char[Char["CloseBracket"] = 93] = "CloseBracket";
          Char[Char["Caret"] = 94] = "Caret";
          Char[Char["Underscore"] = 95] = "Underscore";
          Char[Char["OpenBrace"] = 123] = "OpenBrace";
          Char[Char["Bar"] = 124] = "Bar";
          Char[Char["CloseBrace"] = 125] = "CloseBrace";
          Char[Char["Colon"] = 58] = "Colon";
          Char[Char["LessThan"] = 60] = "LessThan";
          Char[Char["Equals"] = 61] = "Equals";
          Char[Char["GreaterThan"] = 62] = "GreaterThan";
          Char[Char["Question"] = 63] = "Question";
          Char[Char["Zero"] = 48] = "Zero";
          Char[Char["One"] = 49] = "One";
          Char[Char["Two"] = 50] = "Two";
          Char[Char["Three"] = 51] = "Three";
          Char[Char["Four"] = 52] = "Four";
          Char[Char["Five"] = 53] = "Five";
          Char[Char["Six"] = 54] = "Six";
          Char[Char["Seven"] = 55] = "Seven";
          Char[Char["Eight"] = 56] = "Eight";
          Char[Char["Nine"] = 57] = "Nine";
          Char[Char["UpperA"] = 65] = "UpperA";
          Char[Char["UpperB"] = 66] = "UpperB";
          Char[Char["UpperC"] = 67] = "UpperC";
          Char[Char["UpperD"] = 68] = "UpperD";
          Char[Char["UpperE"] = 69] = "UpperE";
          Char[Char["UpperF"] = 70] = "UpperF";
          Char[Char["UpperG"] = 71] = "UpperG";
          Char[Char["UpperH"] = 72] = "UpperH";
          Char[Char["UpperI"] = 73] = "UpperI";
          Char[Char["UpperJ"] = 74] = "UpperJ";
          Char[Char["UpperK"] = 75] = "UpperK";
          Char[Char["UpperL"] = 76] = "UpperL";
          Char[Char["UpperM"] = 77] = "UpperM";
          Char[Char["UpperN"] = 78] = "UpperN";
          Char[Char["UpperO"] = 79] = "UpperO";
          Char[Char["UpperP"] = 80] = "UpperP";
          Char[Char["UpperQ"] = 81] = "UpperQ";
          Char[Char["UpperR"] = 82] = "UpperR";
          Char[Char["UpperS"] = 83] = "UpperS";
          Char[Char["UpperT"] = 84] = "UpperT";
          Char[Char["UpperU"] = 85] = "UpperU";
          Char[Char["UpperV"] = 86] = "UpperV";
          Char[Char["UpperW"] = 87] = "UpperW";
          Char[Char["UpperX"] = 88] = "UpperX";
          Char[Char["UpperY"] = 89] = "UpperY";
          Char[Char["UpperZ"] = 90] = "UpperZ";
          Char[Char["LowerA"] = 97] = "LowerA";
          Char[Char["LowerB"] = 98] = "LowerB";
          Char[Char["LowerC"] = 99] = "LowerC";
          Char[Char["LowerD"] = 100] = "LowerD";
          Char[Char["LowerE"] = 101] = "LowerE";
          Char[Char["LowerF"] = 102] = "LowerF";
          Char[Char["LowerG"] = 103] = "LowerG";
          Char[Char["LowerH"] = 104] = "LowerH";
          Char[Char["LowerI"] = 105] = "LowerI";
          Char[Char["LowerJ"] = 106] = "LowerJ";
          Char[Char["LowerK"] = 107] = "LowerK";
          Char[Char["LowerL"] = 108] = "LowerL";
          Char[Char["LowerM"] = 109] = "LowerM";
          Char[Char["LowerN"] = 110] = "LowerN";
          Char[Char["LowerO"] = 111] = "LowerO";
          Char[Char["LowerP"] = 112] = "LowerP";
          Char[Char["LowerQ"] = 113] = "LowerQ";
          Char[Char["LowerR"] = 114] = "LowerR";
          Char[Char["LowerS"] = 115] = "LowerS";
          Char[Char["LowerT"] = 116] = "LowerT";
          Char[Char["LowerU"] = 117] = "LowerU";
          Char[Char["LowerV"] = 118] = "LowerV";
          Char[Char["LowerW"] = 119] = "LowerW";
          Char[Char["LowerX"] = 120] = "LowerX";
          Char[Char["LowerY"] = 121] = "LowerY";
          Char[Char["LowerZ"] = 122] = "LowerZ";
      })(Char || (Char = exports('Char', {})));

      const { enter: enter$1, leave: leave$1 } = Profiler.createTimer('ExpressionParser');
      const $false = PrimitiveLiteral.$false;
      const $true = PrimitiveLiteral.$true;
      const $null = PrimitiveLiteral.$null;
      const $undefined = PrimitiveLiteral.$undefined;
      const $this = AccessThis.$this;
      const $parent = AccessThis.$parent;
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
      } exports('ParserState', ParserState);
      const $state = new ParserState('');
      var SyntaxError;
      (function (SyntaxError) {
          SyntaxError[SyntaxError["InvalidExpressionStart"] = 100] = "InvalidExpressionStart";
          SyntaxError[SyntaxError["UnconsumedToken"] = 101] = "UnconsumedToken";
          SyntaxError[SyntaxError["DoubleDot"] = 102] = "DoubleDot";
          SyntaxError[SyntaxError["InvalidMemberExpression"] = 103] = "InvalidMemberExpression";
          SyntaxError[SyntaxError["UnexpectedEndOfExpression"] = 104] = "UnexpectedEndOfExpression";
          SyntaxError[SyntaxError["ExpectedIdentifier"] = 105] = "ExpectedIdentifier";
          SyntaxError[SyntaxError["InvalidForDeclaration"] = 106] = "InvalidForDeclaration";
          SyntaxError[SyntaxError["InvalidObjectLiteralPropertyDefinition"] = 107] = "InvalidObjectLiteralPropertyDefinition";
          SyntaxError[SyntaxError["UnterminatedQuote"] = 108] = "UnterminatedQuote";
          SyntaxError[SyntaxError["UnterminatedTemplate"] = 109] = "UnterminatedTemplate";
          SyntaxError[SyntaxError["MissingExpectedToken"] = 110] = "MissingExpectedToken";
          SyntaxError[SyntaxError["UnexpectedCharacter"] = 111] = "UnexpectedCharacter";
          SyntaxError[SyntaxError["MissingValueConverter"] = 112] = "MissingValueConverter";
          SyntaxError[SyntaxError["MissingBindingBehavior"] = 113] = "MissingBindingBehavior";
      })(SyntaxError || (SyntaxError = {}));
      var SemanticError;
      (function (SemanticError) {
          SemanticError[SemanticError["NotAssignable"] = 150] = "NotAssignable";
          SemanticError[SemanticError["UnexpectedForOf"] = 151] = "UnexpectedForOf";
      })(SemanticError || (SemanticError = {}));
      function parseExpression(input, bindingType) {
          $state.input = input;
          $state.length = input.length;
          $state.index = 0;
          $state.currentChar = input.charCodeAt(0);
          return parse($state, 0 /* Reset */, 61 /* Variadic */, bindingType === void 0 ? 53 /* BindCommand */ : bindingType);
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
          if (Profiler.enabled) {
              enter$1();
          }
          if (state.index === 0) {
              if (bindingType & 2048 /* Interpolation */) {
                  if (Profiler.enabled) {
                      leave$1();
                  }
                  // tslint:disable-next-line:no-any
                  return parseInterpolation(state);
              }
              nextToken(state);
              if (state.currentToken & 1048576 /* ExpressionTerminal */) {
                  if (Profiler.enabled) {
                      leave$1();
                  }
                  throw Reporter.error(100 /* InvalidExpressionStart */, { state });
              }
          }
          state.assignable = 448 /* Binary */ > minPrecedence;
          let result = void 0;
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
              result = new Unary(op, parse(state, access, 449 /* LeftHandSide */, bindingType));
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
                                  if (Profiler.enabled) {
                                      leave$1();
                                  }
                                  throw Reporter.error(102 /* DoubleDot */, { state });
                              }
                              else if (state.currentToken === 1572864 /* EOF */) {
                                  if (Profiler.enabled) {
                                      leave$1();
                                  }
                                  throw Reporter.error(105 /* ExpectedIdentifier */, { state });
                              }
                          }
                          else if (state.currentToken & 524288 /* AccessScopeTerminal */) {
                              const ancestor = access & 511 /* Ancestor */;
                              result = ancestor === 0 ? $this : ancestor === 1 ? $parent : new AccessThis(ancestor);
                              access = 512 /* This */;
                              break primary;
                          }
                          else {
                              if (Profiler.enabled) {
                                  leave$1();
                              }
                              throw Reporter.error(103 /* InvalidMemberExpression */, { state });
                          }
                      } while (state.currentToken === 3077 /* ParentScope */);
                  // falls through
                  case 1024 /* Identifier */: // identifier
                      if (bindingType & 512 /* IsIterator */) {
                          result = new BindingIdentifier(state.tokenValue);
                      }
                      else {
                          result = new AccessScope(state.tokenValue, access & 511 /* Ancestor */);
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
                      result = new Template([state.tokenValue]);
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
                      result = new PrimitiveLiteral(state.tokenValue);
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
                          if (Profiler.enabled) {
                              leave$1();
                          }
                          throw Reporter.error(104 /* UnexpectedEndOfExpression */, { state });
                      }
                      else {
                          if (Profiler.enabled) {
                              leave$1();
                          }
                          throw Reporter.error(101 /* UnconsumedToken */, { state });
                      }
              }
              if (bindingType & 512 /* IsIterator */) {
                  if (Profiler.enabled) {
                      leave$1();
                  }
                  // tslint:disable-next-line:no-any
                  return parseForOfStatement(state, result);
              }
              if (449 /* LeftHandSide */ < minPrecedence) {
                  if (Profiler.enabled) {
                      leave$1();
                  }
                  // tslint:disable-next-line:no-any
                  return result;
              }
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
                              if (Profiler.enabled) {
                                  leave$1();
                              }
                              throw Reporter.error(105 /* ExpectedIdentifier */, { state });
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
                              result = new AccessScope(name, result.ancestor);
                          }
                          else { // if it's not $Scope, it's $Member
                              result = new AccessMember(result, name);
                          }
                          continue;
                      case 671756 /* OpenBracket */:
                          state.assignable = true;
                          nextToken(state);
                          access = 4096 /* Keyed */;
                          result = new AccessKeyed(result, parse(state, 0 /* Reset */, 62 /* Assign */, bindingType));
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
                              result = new CallScope(name, args, result.ancestor);
                          }
                          else if (access & 2048 /* Member */) {
                              result = new CallMember(result, name, args);
                          }
                          else {
                              result = new CallFunction(result, args);
                          }
                          access = 0;
                          break;
                      case 540713 /* TemplateTail */:
                          state.assignable = false;
                          const strings = [state.tokenValue];
                          result = new TaggedTemplate(strings, strings, result);
                          nextToken(state);
                          break;
                      case 540714 /* TemplateContinuation */:
                          result = parseTemplate(state, access, bindingType, result, true);
                      default:
                  }
              }
          }
          if (448 /* Binary */ < minPrecedence) {
              if (Profiler.enabled) {
                  leave$1();
              }
              // tslint:disable-next-line:no-any
              return result;
          }
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
              result = new Binary(TokenValues[opToken & 63 /* Type */], result, parse(state, access, opToken & 448 /* Precedence */, bindingType));
              state.assignable = false;
          }
          if (63 /* Conditional */ < minPrecedence) {
              if (Profiler.enabled) {
                  leave$1();
              }
              // tslint:disable-next-line:no-any
              return result;
          }
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
              result = new Conditional(result, yes, parse(state, access, 62 /* Assign */, bindingType));
              state.assignable = false;
          }
          if (62 /* Assign */ < minPrecedence) {
              if (Profiler.enabled) {
                  leave$1();
              }
              // tslint:disable-next-line:no-any
              return result;
          }
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
                  if (Profiler.enabled) {
                      leave$1();
                  }
                  throw Reporter.error(150 /* NotAssignable */, { state });
              }
              result = new Assign(result, parse(state, access, 62 /* Assign */, bindingType));
          }
          if (61 /* Variadic */ < minPrecedence) {
              if (Profiler.enabled) {
                  leave$1();
              }
              // tslint:disable-next-line:no-any
              return result;
          }
          /** parseValueConverter
           */
          while (consumeOpt(state, 1572883 /* Bar */)) {
              if (state.currentToken === 1572864 /* EOF */) {
                  if (Profiler.enabled) {
                      leave$1();
                  }
                  throw Reporter.error(112);
              }
              const name = state.tokenValue;
              nextToken(state);
              const args = new Array();
              while (consumeOpt(state, 1572878 /* Colon */)) {
                  args.push(parse(state, access, 62 /* Assign */, bindingType));
              }
              result = new ValueConverter(result, name, args);
          }
          /** parseBindingBehavior
           */
          while (consumeOpt(state, 1572880 /* Ampersand */)) {
              if (state.currentToken === 1572864 /* EOF */) {
                  if (Profiler.enabled) {
                      leave$1();
                  }
                  throw Reporter.error(113);
              }
              const name = state.tokenValue;
              nextToken(state);
              const args = new Array();
              while (consumeOpt(state, 1572878 /* Colon */)) {
                  args.push(parse(state, access, 62 /* Assign */, bindingType));
              }
              result = new BindingBehavior(result, name, args);
          }
          if (state.currentToken !== 1572864 /* EOF */) {
              if (bindingType & 2048 /* Interpolation */) {
                  if (Profiler.enabled) {
                      leave$1();
                  }
                  // tslint:disable-next-line:no-any
                  return result;
              }
              if (state.tokenRaw === 'of') {
                  if (Profiler.enabled) {
                      leave$1();
                  }
                  throw Reporter.error(151 /* UnexpectedForOf */, { state });
              }
              if (Profiler.enabled) {
                  leave$1();
              }
              throw Reporter.error(101 /* UnconsumedToken */, { state });
          }
          if (Profiler.enabled) {
              leave$1();
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
                      break;
                  }
              }
              else {
                  elements.push(parse(state, access, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
                  if (consumeOpt(state, 1572875 /* Comma */)) {
                      if (state.currentToken === 1835021 /* CloseBracket */) {
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
              return new ArrayBindingPattern(elements);
          }
          else {
              state.assignable = false;
              return new ArrayLiteral(elements);
          }
      }
      function parseForOfStatement(state, result) {
          if ((result.$kind & 65536 /* IsForDeclaration */) === 0) {
              throw Reporter.error(106 /* InvalidForDeclaration */, { state });
          }
          if (state.currentToken !== 1051179 /* OfKeyword */) {
              throw Reporter.error(106 /* InvalidForDeclaration */, { state });
          }
          nextToken(state);
          const declaration = result;
          const statement = parse(state, 0 /* Reset */, 61 /* Variadic */, 0 /* None */);
          return new ForOfStatement(declaration, statement);
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
                  throw Reporter.error(107 /* InvalidObjectLiteralPropertyDefinition */, { state });
              }
              if (state.currentToken !== 1835017 /* CloseBrace */) {
                  consume(state, 1572875 /* Comma */);
              }
          }
          consume(state, 1835017 /* CloseBrace */);
          if (bindingType & 512 /* IsIterator */) {
              return new ObjectBindingPattern(keys, values);
          }
          else {
              state.assignable = false;
              return new ObjectLiteral(keys, values);
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
              return new Interpolation(parts, expressions);
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
              return new TaggedTemplate(cooked, cooked, result, expressions);
          }
          else {
              nextToken(state);
              return new Template(cooked, expressions);
          }
      }
      function nextToken(state) {
          while (state.index < state.length) {
              state.startIndex = state.index;
              if (((state.currentToken = (CharScanners[state.currentChar](state)))) != null) { // a null token means the character must be skipped
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
                  throw Reporter.error(108 /* UnterminatedQuote */, { state });
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
                      throw Reporter.error(109 /* UnterminatedTemplate */, { state });
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
              throw Reporter.error(109 /* UnterminatedTemplate */, { state });
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
              throw Reporter.error(110 /* MissingExpectedToken */, { state, expected: token });
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
          throw Reporter.error(111 /* UnexpectedCharacter */, { state: s });
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

      const IExpressionParserRegistration = exports('IExpressionParserRegistration', {
          register(container) {
              container.registerTransformer(IExpressionParser, parser => {
                  Reflect.set(parser, 'parseCore', parseExpression);
                  return parser;
              });
          }
      });
      /**
       * Default runtime/environment-agnostic implementations for the following interfaces:
       * - `IExpressionParser`
       */
      const DefaultComponents = exports('DefaultComponents', [
          IExpressionParserRegistration
      ]);
      const AtPrefixedTriggerAttributePatternRegistration = exports('AtPrefixedTriggerAttributePatternRegistration', AtPrefixedTriggerAttributePattern);
      const ColonPrefixedBindAttributePatternRegistration = exports('ColonPrefixedBindAttributePatternRegistration', ColonPrefixedBindAttributePattern);
      const RefAttributePatternRegistration = exports('RefAttributePatternRegistration', RefAttributePattern);
      const DotSeparatedAttributePatternRegistration = exports('DotSeparatedAttributePatternRegistration', DotSeparatedAttributePattern);
      /**
       * Default binding syntax for the following attribute name patterns:
       * - `ref`
       * - `target.command` (dot-separated)
       */
      const DefaultBindingSyntax = exports('DefaultBindingSyntax', [
          RefAttributePatternRegistration,
          DotSeparatedAttributePatternRegistration
      ]);
      /**
       * Binding syntax for short-hand attribute name patterns:
       * - `@target` (short-hand for `target.trigger`)
       * - `:target` (short-hand for `target.bind`)
       */
      const ShortHandBindingSyntax = exports('ShortHandBindingSyntax', [
          AtPrefixedTriggerAttributePatternRegistration,
          ColonPrefixedBindAttributePatternRegistration
      ]);
      const CallBindingCommandRegistration = exports('CallBindingCommandRegistration', CallBindingCommand);
      const DefaultBindingCommandRegistration = exports('DefaultBindingCommandRegistration', DefaultBindingCommand);
      const ForBindingCommandRegistration = exports('ForBindingCommandRegistration', ForBindingCommand);
      const FromViewBindingCommandRegistration = exports('FromViewBindingCommandRegistration', FromViewBindingCommand);
      const OneTimeBindingCommandRegistration = exports('OneTimeBindingCommandRegistration', OneTimeBindingCommand);
      const ToViewBindingCommandRegistration = exports('ToViewBindingCommandRegistration', ToViewBindingCommand);
      const TwoWayBindingCommandRegistration = exports('TwoWayBindingCommandRegistration', TwoWayBindingCommand);
      /**
       * Default runtime/environment-agnostic binding commands:
       * - Property observation: `.bind`, `.one-time`, `.from-view`, `.to-view`, `.two-way`
       * - Function call: `.call`
       * - Collection observation: `.for`
       */
      const DefaultBindingLanguage = exports('DefaultBindingLanguage', [
          DefaultBindingCommandRegistration,
          OneTimeBindingCommandRegistration,
          FromViewBindingCommandRegistration,
          ToViewBindingCommandRegistration,
          TwoWayBindingCommandRegistration,
          CallBindingCommandRegistration,
          ForBindingCommandRegistration
      ]);
      /**
       * A DI configuration object containing runtime/environment-agnostic registrations:
       * - `BasicConfiguration` from `@aurelia/runtime`
       * - `DefaultComponents`
       * - `DefaultBindingSyntax`
       * - `DefaultBindingLanguage`
       */
      const BasicConfiguration = exports('BasicConfiguration', {
          /**
           * Apply this configuration to the provided container.
           */
          register(container) {
              return RuntimeBasicConfiguration
                  .register(container)
                  .register(...DefaultComponents, ...DefaultBindingSyntax, ...DefaultBindingLanguage);
          },
          /**
           * Create a new container with this configuration applied to it.
           */
          createContainer() {
              return this.register(DI.createContainer());
          }
      });

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
          getElementInfo(name) {
              let result = this.elementLookup[name];
              if (result === void 0) {
                  const def = this.resources.find(CustomElementResource, name);
                  if (def == null) {
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
              const name = camelCase(syntax.target);
              let result = this.attributeLookup[name];
              if (result === void 0) {
                  const def = this.resources.find(CustomAttributeResource, name);
                  if (def == null) {
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
              if (result === void 0) {
                  result = this.resources.create(BindingCommandResource, name);
                  if (result == null) {
                      // unknown binding command
                      throw Reporter.error(0); // TODO: create error code
                  }
                  this.commandLookup[name] = result;
              }
              return result;
          }
      } exports('ResourceModel', ResourceModel);
      function createElementInfo(def) {
          const info = new ElementInfo(def.name, def.containerless);
          const bindables = def.bindables;
          const defaultBindingMode = BindingMode.toView;
          let bindable;
          let prop;
          let attr;
          let mode;
          for (prop in bindables) {
              bindable = bindables[prop];
              // explicitly provided property name has priority over the implicit property name
              if (bindable.property !== void 0) {
                  prop = bindable.property;
              }
              // explicitly provided attribute name has priority over the derived implicit attribute name
              if (bindable.attribute !== void 0) {
                  attr = bindable.attribute;
              }
              else {
                  // derive the attribute name from the resolved property name
                  attr = kebabCase(prop);
              }
              if (bindable.mode !== void 0 && bindable.mode !== BindingMode.default) {
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
          const defaultBindingMode = def.defaultBindingMode !== void 0 && def.defaultBindingMode !== BindingMode.default
              ? def.defaultBindingMode
              : BindingMode.toView;
          let bindable;
          let prop;
          let mode;
          let bindableCount = 0;
          for (prop in bindables) {
              ++bindableCount;
              bindable = bindables[prop];
              // explicitly provided property name has priority over the implicit property name
              if (bindable.property !== void 0) {
                  prop = bindable.property;
              }
              if (bindable.mode !== void 0 && bindable.mode !== BindingMode.default) {
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
      } exports('BindableInfo', BindableInfo);
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
      } exports('ElementInfo', ElementInfo);
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
      } exports('AttrInfo', AttrInfo);

      var SymbolFlags;
      (function (SymbolFlags) {
          SymbolFlags[SymbolFlags["type"] = 511] = "type";
          SymbolFlags[SymbolFlags["isTemplateController"] = 1] = "isTemplateController";
          SymbolFlags[SymbolFlags["isReplacePart"] = 2] = "isReplacePart";
          SymbolFlags[SymbolFlags["isCustomAttribute"] = 4] = "isCustomAttribute";
          SymbolFlags[SymbolFlags["isPlainAttribute"] = 8] = "isPlainAttribute";
          SymbolFlags[SymbolFlags["isCustomElement"] = 16] = "isCustomElement";
          SymbolFlags[SymbolFlags["isLetElement"] = 32] = "isLetElement";
          SymbolFlags[SymbolFlags["isPlainElement"] = 64] = "isPlainElement";
          SymbolFlags[SymbolFlags["isText"] = 128] = "isText";
          SymbolFlags[SymbolFlags["isBinding"] = 256] = "isBinding";
          SymbolFlags[SymbolFlags["hasMarker"] = 512] = "hasMarker";
          SymbolFlags[SymbolFlags["hasTemplate"] = 1024] = "hasTemplate";
          SymbolFlags[SymbolFlags["hasAttributes"] = 2048] = "hasAttributes";
          SymbolFlags[SymbolFlags["hasBindings"] = 4096] = "hasBindings";
          SymbolFlags[SymbolFlags["hasChildNodes"] = 8192] = "hasChildNodes";
          SymbolFlags[SymbolFlags["hasParts"] = 16384] = "hasParts";
      })(SymbolFlags || (SymbolFlags = exports('SymbolFlags', {})));
      function createMarker(dom) {
          const marker = dom.createElement('au-m');
          dom.makeTarget(marker);
          return marker;
      }
      /**
       * A html attribute that is associated with a registered resource, specifically a template controller.
       */
      class TemplateControllerSymbol {
          get bindings() {
              if (this._bindings == null) {
                  this._bindings = [];
                  this.flags |= 4096 /* hasBindings */;
              }
              return this._bindings;
          }
          get parts() {
              if (this._parts == null) {
                  this._parts = [];
                  this.flags |= 16384 /* hasParts */;
              }
              return this._parts;
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
              this._parts = null;
          }
      } exports('TemplateControllerSymbol', TemplateControllerSymbol);
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
      } exports('ReplacePartSymbol', ReplacePartSymbol);
      /**
       * A html attribute that is associated with a registered resource, but not a template controller.
       */
      class CustomAttributeSymbol {
          get bindings() {
              if (this._bindings == null) {
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
      } exports('CustomAttributeSymbol', CustomAttributeSymbol);
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
      } exports('PlainAttributeSymbol', PlainAttributeSymbol);
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
      } exports('BindingSymbol', BindingSymbol);
      /**
       * A html element that is associated with a registered resource either via its (lowerCase) `nodeName`
       * or the value of its `as-element` attribute.
       */
      class CustomElementSymbol {
          get attributes() {
              if (this._attributes == null) {
                  this._attributes = [];
                  this.flags |= 2048 /* hasAttributes */;
              }
              return this._attributes;
          }
          get bindings() {
              if (this._bindings == null) {
                  this._bindings = [];
                  this.flags |= 4096 /* hasBindings */;
              }
              return this._bindings;
          }
          get childNodes() {
              if (this._childNodes == null) {
                  this._childNodes = [];
                  this.flags |= 8192 /* hasChildNodes */;
              }
              return this._childNodes;
          }
          get parts() {
              if (this._parts == null) {
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
      } exports('CustomElementSymbol', CustomElementSymbol);
      class LetElementSymbol {
          get bindings() {
              if (this._bindings == null) {
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
      } exports('LetElementSymbol', LetElementSymbol);
      /**
       * A normal html element that may or may not have attribute behaviors and/or child node behaviors.
       *
       * It is possible for a PlainElementSymbol to not yield any instructions during compilation.
       */
      class PlainElementSymbol {
          get attributes() {
              if (this._attributes == null) {
                  this._attributes = [];
                  this.flags |= 2048 /* hasAttributes */;
              }
              return this._attributes;
          }
          get childNodes() {
              if (this._childNodes == null) {
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
      } exports('PlainElementSymbol', PlainElementSymbol);
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
      } exports('TextSymbol', TextSymbol);

    }
  };
});
//# sourceMappingURL=index.system.js.map
