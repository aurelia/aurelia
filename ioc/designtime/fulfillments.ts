import * as AST from './ast';
import { IFulfillment, IRequirement, IActivator } from '../runtime/interfaces';
import { Lifetime } from '../runtime/types';
import { DesigntimeRequirement } from './requirements';
import { DependencyMap } from '../runtime/container';
import { EmitSyntaxActivator } from './activators';

export class Fulfillments {
  public static syntax(type: AST.INode): IFulfillment {
    return new SyntaxFulfillment(type);
  }
}

export class SyntaxFulfillment implements IFulfillment {
  public readonly isFulfillment: true = true;
  public readonly type: AST.INode;

  constructor(type: AST.INode) {
    this.type = type;
  }

  public getDefaultLifetime(): Lifetime {
    return Lifetime.Singleton;
  }
  public getDependencies(): IRequirement[] {
    return DesigntimeRequirement.getRequirements(this.type);
  }
  public makeActivator(dependencies: DependencyMap): IActivator {
    return new EmitSyntaxActivator(this.type, this.getDependencies(), dependencies);
  }
  public isEqualTo(other: SyntaxFulfillment): boolean {
    return other.type === this.type;
  }
}
