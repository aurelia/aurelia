import { IContainer } from '@aurelia/kernel';
import { IExpressionParser } from '@aurelia/runtime';
import { Deserializer } from './ast-serialization';
import { Hydratable, IPropertyRule, IRuleProperty, IValidationHydrator, IValidationRule, IValidationVisitor } from './rule-interfaces';
import { IValidationRules, PropertyRule, RuleProperty } from './rule-provider';
import { BaseValidationRule, EqualsRule, IValidationMessageProvider, LengthRule, RangeRule, RegexRule, RequiredRule, SizeRule } from './rules';
export declare type Visitable<T extends BaseValidationRule> = (PropertyRule | RuleProperty | T) & {
    accept(visitor: ValidationSerializer): string;
};
export declare class ValidationSerializer implements IValidationVisitor {
    static serialize<T extends BaseValidationRule>(object: Visitable<T>): string;
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
export declare class ValidationDeserializer implements IValidationHydrator {
    readonly messageProvider: IValidationMessageProvider;
    readonly parser: IExpressionParser;
    private static container;
    static register(container: IContainer): void;
    static deserialize(json: string, validationRules: IValidationRules): IValidationRule | IRuleProperty | IPropertyRule;
    readonly astDeserializer: Deserializer;
    constructor(messageProvider: IValidationMessageProvider, parser: IExpressionParser);
    hydrate(raw: Hydratable, validationRules: IValidationRules): any;
    hydrateRuleset(ruleset: Hydratable[], validationRules: IValidationRules): PropertyRule[];
}
export declare class ModelValidationHydrator implements IValidationHydrator {
    readonly messageProvider: IValidationMessageProvider;
    readonly parser: IExpressionParser;
    readonly astDeserializer: Deserializer;
    constructor(messageProvider: IValidationMessageProvider, parser: IExpressionParser);
    hydrate(_raw: any, _validationRules: IValidationRules): void;
    hydrateRuleset(ruleset: Record<string, any>, validationRules: IValidationRules): any[];
    protected hydrateRule(ruleName: string, ruleConfig: any): IValidationRule;
    private isModelPropertyRule;
    private setCommonRuleProperties;
    private hydrateRequiredRule;
    private hydrateRegexRule;
    private hydrateLengthRule;
    private hydrateSizeRule;
    private hydrateRangeRule;
    private hydrateEqualsRule;
    private hydrateRuleProperty;
}
//# sourceMappingURL=serialization.d.ts.map