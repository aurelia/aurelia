import { IContainer, IServiceLocator } from '@aurelia/kernel';
import { IExpressionParser } from '@aurelia/runtime';
import { Deserializer } from './ast-serialization.js';
import { IPropertyRule, IRuleProperty, IValidationExpressionHydrator, IValidationRule, IValidationVisitor, IValidateable } from './rule-interfaces.js';
import { IValidationRules, PropertyRule, RuleProperty } from './rule-provider.js';
import { EqualsRule, IValidationMessageProvider, LengthRule, RangeRule, RegexRule, RequiredRule, SizeRule } from './rules.js';
export declare type Visitable<T extends IValidationRule> = (PropertyRule | RuleProperty | T) & {
    accept(visitor: ValidationSerializer): string;
};
export declare class ValidationSerializer implements IValidationVisitor {
    static serialize<T extends IValidationRule>(object: Visitable<T>): string;
    visitRequiredRule(rule: RequiredRule): string;
    visitRegexRule(rule: RegexRule): string;
    visitLengthRule(rule: LengthRule): string;
    visitSizeRule(rule: SizeRule): string;
    visitRangeRule(rule: RangeRule): string;
    visitEqualsRule(rule: EqualsRule): string;
    visitRuleProperty(property: RuleProperty): string;
    visitPropertyRule(propertyRule: PropertyRule): string;
    private serializeNumber;
    private serializeRules;
}
export declare class ValidationDeserializer implements IValidationExpressionHydrator {
    private readonly locator;
    readonly messageProvider: IValidationMessageProvider;
    readonly parser: IExpressionParser;
    private static container;
    static register(container: IContainer): void;
    static deserialize(json: string, validationRules: IValidationRules): IValidationRule | IRuleProperty | IPropertyRule;
    readonly astDeserializer: Deserializer;
    constructor(locator: IServiceLocator, messageProvider: IValidationMessageProvider, parser: IExpressionParser);
    hydrate(raw: any, validationRules: IValidationRules): any;
    hydrateRuleset(ruleset: any[], validationRules: IValidationRules): PropertyRule[];
}
export declare class ModelValidationExpressionHydrator implements IValidationExpressionHydrator {
    private readonly locator;
    readonly messageProvider: IValidationMessageProvider;
    readonly parser: IExpressionParser;
    readonly astDeserializer: Deserializer;
    constructor(locator: IServiceLocator, messageProvider: IValidationMessageProvider, parser: IExpressionParser);
    hydrate(_raw: any, _validationRules: IValidationRules): void;
    hydrateRuleset(ruleset: Record<string, any>, validationRules: IValidationRules): any[];
    protected hydrateRule(ruleName: string, ruleConfig: any): IValidationRule;
    protected setCommonRuleProperties(raw: Pick<IValidationRule, 'messageKey' | 'tag'> & {
        when?: string | ((object?: IValidateable) => boolean);
    }, rule: RequiredRule): void;
    private isModelPropertyRule;
    private hydrateRequiredRule;
    private hydrateRegexRule;
    private hydrateLengthRule;
    private hydrateSizeRule;
    private hydrateRangeRule;
    private hydrateEqualsRule;
    private hydrateRuleProperty;
}
//# sourceMappingURL=serialization.d.ts.map