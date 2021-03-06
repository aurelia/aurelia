import { IContainer, IServiceLocator } from '@aurelia/kernel';
import { IExpressionParser, BindingType, LifecycleFlags, Scope } from '@aurelia/runtime';
import { Deserializer, serializePrimitive, Serializer } from './ast-serialization.js';
import {
  IPropertyRule,
  IRuleProperty,
  IValidationExpressionHydrator,
  IValidationRule,
  IValidationVisitor,
  IValidateable,
  IRequiredRule,
  IRegexRule,
} from './rule-interfaces.js';
import { IValidationRules, parsePropertyName, PropertyRule, RuleProperty } from './rule-provider.js';
import {
  EqualsRule,
  IValidationMessageProvider,
  LengthRule,
  RangeRule,
  RegexRule,
  RequiredRule,
  SizeRule,
} from './rules.js';

export type Visitable<T extends IValidationRule> = (PropertyRule | RuleProperty | T) & { accept(visitor: ValidationSerializer): string };

export class ValidationSerializer implements IValidationVisitor {
  public static serialize<T extends IValidationRule>(object: Visitable<T>): string {
    if (object == null || typeof object.accept !== 'function') {
      return `${object}`;
    }
    const visitor = new ValidationSerializer();
    return object.accept(visitor);
  }
  public visitRequiredRule(rule: RequiredRule): string {
    return `{"$TYPE":"${RequiredRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${serializePrimitive(rule.tag)}}`;
  }
  public visitRegexRule(rule: RegexRule): string {
    const pattern = rule.pattern;
    return `{"$TYPE":"${RegexRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${serializePrimitive(rule.tag)},"pattern":{"source":${serializePrimitive(pattern.source)},"flags":"${pattern.flags}"}}`;
  }
  public visitLengthRule(rule: LengthRule): string {
    return `{"$TYPE":"${LengthRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${serializePrimitive(rule.tag)},"length":${serializePrimitive(rule.length)},"isMax":${serializePrimitive(rule.isMax)}}`;
  }
  public visitSizeRule(rule: SizeRule): string {
    return `{"$TYPE":"${SizeRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${serializePrimitive(rule.tag)},"count":${serializePrimitive(rule.count)},"isMax":${serializePrimitive(rule.isMax)}}`;
  }
  public visitRangeRule(rule: RangeRule): string {
    return `{"$TYPE":"${RangeRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${serializePrimitive(rule.tag)},"isInclusive":${rule.isInclusive},"min":${this.serializeNumber(rule.min)},"max":${this.serializeNumber(rule.max)}}`;
  }
  public visitEqualsRule(rule: EqualsRule): string {
    const expectedValue: any = rule.expectedValue;
    let serializedExpectedValue: string;
    if (typeof expectedValue !== 'object' || expectedValue === null) {
      serializedExpectedValue = serializePrimitive(expectedValue);
    } else {
      serializedExpectedValue = JSON.stringify(expectedValue);
    }
    return `{"$TYPE":"${EqualsRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${serializePrimitive(rule.tag)},"expectedValue":${serializedExpectedValue}}`;
  }
  public visitRuleProperty(property: RuleProperty): string {
    const displayName = property.displayName;
    if (displayName !== void 0 && typeof displayName !== 'string') {
      throw new Error('Serializing a non-string displayName for rule property is not supported.'); // TODO: use reporter/logger
    }
    const expression = property.expression;
    return `{"$TYPE":"${RuleProperty.$TYPE}","name":${serializePrimitive(property.name)},"expression":${expression ? Serializer.serialize(expression) : null},"displayName":${serializePrimitive(displayName)}}`;
  }
  public visitPropertyRule(propertyRule: PropertyRule): string {
    return `{"$TYPE":"${PropertyRule.$TYPE}","property":${propertyRule.property.accept(this)},"$rules":${this.serializeRules(propertyRule.$rules)}}`;
  }
  private serializeNumber(num: number): string {
    return num === Number.POSITIVE_INFINITY || num === Number.NEGATIVE_INFINITY ? null! : num.toString();
  }
  private serializeRules(ruleset: IValidationRule[][]) {
    return `[${ruleset.map((rules) => `[${rules.map((rule) => rule.accept(this)).join(',')}]`).join(',')}]`;
  }
}

export class ValidationDeserializer implements IValidationExpressionHydrator {
  private static container: IContainer;
  public static register(container: IContainer) {
    this.container = container;
  }
  public static deserialize(json: string, validationRules: IValidationRules): IValidationRule | IRuleProperty | IPropertyRule {
    const messageProvider = this.container.get(IValidationMessageProvider);
    const parser = this.container.get(IExpressionParser);
    const deserializer = new ValidationDeserializer(this.container, messageProvider, parser);
    const raw = JSON.parse(json);
    return deserializer.hydrate(raw, validationRules);
  }
  public readonly astDeserializer: Deserializer = new Deserializer();
  public constructor(
    @IServiceLocator private readonly locator: IServiceLocator,
    @IValidationMessageProvider public readonly messageProvider: IValidationMessageProvider,
    @IExpressionParser public readonly parser: IExpressionParser
  ) { }

  public hydrate(raw: any, validationRules: IValidationRules): any {
    switch (raw.$TYPE) {
      case RequiredRule.$TYPE: {
        const $raw: Pick<RequiredRule, 'messageKey' | 'tag'> = raw;
        const rule = new RequiredRule();
        rule.messageKey = $raw.messageKey;
        rule.tag = this.astDeserializer.hydrate($raw.tag);
        return rule;
      }
      case RegexRule.$TYPE: {
        const $raw: Pick<RegexRule, 'pattern' | 'messageKey' | 'tag'> = raw;
        const pattern = $raw.pattern;
        const astDeserializer = this.astDeserializer;
        const rule = new RegexRule(new RegExp(astDeserializer.hydrate(pattern.source), pattern.flags), $raw.messageKey);
        rule.tag = astDeserializer.hydrate($raw.tag);
        return rule;
      }
      case LengthRule.$TYPE: {
        const $raw: Pick<LengthRule, 'length' | 'isMax' | 'messageKey' | 'tag'> = raw;
        const rule = new LengthRule($raw.length, $raw.isMax);
        rule.messageKey = $raw.messageKey;
        rule.tag = this.astDeserializer.hydrate($raw.tag);
        return rule;
      }
      case SizeRule.$TYPE: {
        const $raw: Pick<SizeRule, 'count' | 'isMax' | 'messageKey' | 'tag'> = raw;
        const rule = new SizeRule($raw.count, $raw.isMax);
        rule.messageKey = $raw.messageKey;
        rule.tag = this.astDeserializer.hydrate($raw.tag);
        return rule;
      }
      case RangeRule.$TYPE: {
        const $raw: Pick<RangeRule, 'isInclusive' | 'max' | 'min' | 'messageKey' | 'tag'> = raw;
        const rule = new RangeRule($raw.isInclusive, { min: $raw.min ?? Number.NEGATIVE_INFINITY, max: $raw.max ?? Number.POSITIVE_INFINITY });
        rule.messageKey = $raw.messageKey;
        rule.tag = this.astDeserializer.hydrate($raw.tag);
        return rule;
      }
      case EqualsRule.$TYPE: {
        const $raw: Pick<EqualsRule, 'expectedValue' | 'messageKey' | 'tag'> = raw;
        const astDeserializer = this.astDeserializer;
        const rule = new EqualsRule(typeof $raw.expectedValue !== 'object' ? astDeserializer.hydrate($raw.expectedValue) : $raw.expectedValue);
        rule.messageKey = $raw.messageKey;
        rule.tag = astDeserializer.hydrate($raw.tag);
        return rule;
      }
      case RuleProperty.$TYPE: {
        const $raw: Pick<RuleProperty, 'expression' | 'name' | 'displayName'> = raw;
        const astDeserializer = this.astDeserializer;
        let name: any = $raw.name;
        name = name === 'undefined' ? void 0 : astDeserializer.hydrate(name);

        let expression: any = $raw.expression;
        if (expression !== null && expression !== void 0) {
          expression = astDeserializer.hydrate(expression);
        } else if (name !== void 0) {
          ([, expression] = parsePropertyName(name, this.parser));
        } else {
          expression = void 0;
        }

        let displayName = $raw.displayName;
        displayName = displayName === 'undefined' ? void 0 : astDeserializer.hydrate(displayName);
        return new RuleProperty(expression, name, displayName);
      }
      case PropertyRule.$TYPE: {
        const $raw: Pick<PropertyRule, 'property' | '$rules'> = raw;
        return new PropertyRule(
          this.locator,
          validationRules,
          this.messageProvider,
          this.hydrate($raw.property, validationRules),
          $raw.$rules.map((rules) => rules.map((rule) => this.hydrate(rule, validationRules)))
        );
      }
    }
  }

  public hydrateRuleset(ruleset: any[], validationRules: IValidationRules): PropertyRule[] {
    if (!Array.isArray(ruleset)) {
      throw new Error("The ruleset has to be an array of serialized property rule objects"); // TODO: use reporter
    }
    return ruleset.map(($rule) => this.hydrate($rule, validationRules) as PropertyRule);
  }
}

interface ModelPropertyRule<TRuleConfig extends { tag?: string; messageKey?: string } = any> {
  displayName?: string;
  rules: Record<string, TRuleConfig>[];
}

export class ModelValidationExpressionHydrator implements IValidationExpressionHydrator {
  public readonly astDeserializer: Deserializer = new Deserializer();
  public constructor(
    @IServiceLocator private readonly locator: IServiceLocator,
    @IValidationMessageProvider public readonly messageProvider: IValidationMessageProvider,
    @IExpressionParser public readonly parser: IExpressionParser
  ) { }

  public hydrate(_raw: any, _validationRules: IValidationRules) {
    throw new Error('Method not implemented.');
  }

  public hydrateRuleset(ruleset: Record<string, any>, validationRules: IValidationRules): any[] {
    const accRules: IPropertyRule[] = [];
    // depth first traversal
    const iterate = (entries: [string, any][], propertyPath: string[] = []) => {
      for (const [key, value] of entries) {
        if (this.isModelPropertyRule(value)) {
          const rules: IValidationRule[][] = value.rules.map((rule) => Object.entries(rule).map(([ruleName, ruleConfig]) => this.hydrateRule(ruleName, ruleConfig)));
          const propertyPrefix = propertyPath.join('.');
          const property = this.hydrateRuleProperty({ name: propertyPrefix !== '' ? `${propertyPrefix}.${key}` : key, displayName: value.displayName });
          accRules.push(new PropertyRule(this.locator, validationRules, this.messageProvider, property, rules));
        } else {
          iterate(Object.entries(value), [...propertyPath, key]);
        }
      }
    };
    iterate(Object.entries(ruleset));
    return accRules;
  }

  protected hydrateRule(ruleName: string, ruleConfig: any): IValidationRule {
    switch (ruleName) {
      case 'required':
        return this.hydrateRequiredRule(ruleConfig);
      case 'regex':
        return this.hydrateRegexRule(ruleConfig);
      case 'maxLength':
        return this.hydrateLengthRule({ ...ruleConfig, isMax: true });
      case 'minLength':
        return this.hydrateLengthRule({ ...ruleConfig, isMax: false });
      case 'maxItems':
        return this.hydrateSizeRule({ ...ruleConfig, isMax: true });
      case 'minItems':
        return this.hydrateSizeRule({ ...ruleConfig, isMax: false });
      case 'range':
        return this.hydrateRangeRule({ ...ruleConfig, isInclusive: true });
      case 'between':
        return this.hydrateRangeRule({ ...ruleConfig, isInclusive: false });
      case 'equals':
        return this.hydrateEqualsRule(ruleConfig);
      default:
        throw new Error(`Unsupported rule ${ruleName}`);
    }
  }

  protected setCommonRuleProperties(raw: Pick<IValidationRule, 'messageKey' | 'tag'> & { when?: string | ((object?: IValidateable) => boolean) }, rule: RequiredRule) {
    const messageKey = raw.messageKey;
    if (messageKey !== void 0 && messageKey !== null) {
      rule.messageKey = messageKey;
    }
    rule.tag = raw.tag;
    const when = raw.when;
    if (when) {
      if (typeof when === 'string') {
        const parsed = this.parser.parse(when, BindingType.None);
        rule.canExecute = (object: IValidateable) => {
          const flags = LifecycleFlags.none; // TODO? need to get the flags propagated here?
          return parsed.evaluate(flags, Scope.create({ $object: object }), null, this.locator, null, null) as boolean; // TODO get hostScope?
        };
      } else if (typeof when === 'function') {
        rule.canExecute = when;
      }
    }
  }

  private isModelPropertyRule(value: any): value is ModelPropertyRule {
    return typeof value === 'object' && 'rules' in value;
  }

  private hydrateRequiredRule(raw: Pick<IRequiredRule, 'messageKey' | 'tag'>) {
    const rule = new RequiredRule();
    this.setCommonRuleProperties(raw, rule);
    return rule;
  }

  private hydrateRegexRule(raw: Pick<IRegexRule, 'pattern' | 'messageKey' | 'tag'>) {
    const pattern = raw.pattern;
    const rule = new RegexRule(new RegExp(pattern.source, pattern.flags), raw.messageKey);
    rule.tag = raw.tag;
    return rule;
  }

  private hydrateLengthRule(raw: Pick<LengthRule, 'length' | 'isMax' | 'messageKey' | 'tag'>) {
    const rule = new LengthRule(raw.length, raw.isMax);
    this.setCommonRuleProperties(raw, rule);
    return rule;
  }

  private hydrateSizeRule(raw: Pick<SizeRule, 'count' | 'isMax' | 'messageKey' | 'tag'>) {
    const rule = new SizeRule(raw.count, raw.isMax);
    this.setCommonRuleProperties(raw, rule);
    return rule;
  }

  private hydrateRangeRule(raw: Pick<RangeRule, 'isInclusive' | 'max' | 'min' | 'messageKey' | 'tag'>) {
    const rule = new RangeRule(raw.isInclusive, { min: raw.min, max: raw.max });
    this.setCommonRuleProperties(raw, rule);
    return rule;
  }

  private hydrateEqualsRule(raw: Pick<EqualsRule, 'expectedValue' | 'messageKey' | 'tag'>) {
    const rule = new EqualsRule(raw.expectedValue);
    this.setCommonRuleProperties(raw, rule);
    return rule;
  }

  private hydrateRuleProperty(raw: Pick<RuleProperty, 'expression' | 'name' | 'displayName'>) {
    const rawName = raw.name;
    if (!rawName || typeof rawName !== 'string') {
      throw new Error('The property name needs to be a non-empty string'); // TODO: use reporter
    }
    const [name, expression] = parsePropertyName(rawName, this.parser);
    return new RuleProperty(expression, name, raw.displayName);
  }
}
