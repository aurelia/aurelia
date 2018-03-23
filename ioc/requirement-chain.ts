import { IChain, IRequirement } from "./interfaces";

export class RequirementChain implements IChain<IRequirement> {
  public readonly previous: IChain<IRequirement>;
  public readonly tailValue: IRequirement;
  public readonly initialRequirement: IRequirement;
  public readonly currentRequirement: IRequirement;
  public readonly key: Symbol;

  constructor(prev: RequirementChain, cur: IRequirement) {
    this.previous = prev;
    this.tailValue = cur;
    this.initialRequirement = !prev ? cur : prev.initialRequirement;
    this.currentRequirement = cur;
    this.key = !prev ? Symbol(RequirementChain.name) : prev.key;
  }

  public static create(requirement: IRequirement): RequirementChain {
    return new RequirementChain(null, requirement);
  }

  public getPreviousRequirements(): IRequirement[] {
    if (!this.previous) {
      return [];
    } else {
      return this.previous.toArray();
    }
  }

  public toArray(): IRequirement[] {
    const current = this.tailValue;
    if (!this.previous) {
      return [current];
    } else {
      return this.previous.toArray().concat(current);
    }
  }

  public extend(requirement: IRequirement): RequirementChain {
    return new RequirementChain(this, requirement);
  }
}
