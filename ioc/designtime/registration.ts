import * as AST from './ast';
import { RegistrationResult } from '../runtime/resolver';
import { IRegistrationFunction } from '../runtime/interfaces';
import { ResolutionContext } from '../runtime/resolution-context';
import { RequirementChain } from '../runtime/requirement-chain';
import { Fulfillments } from './fulfillments';
import { Lifetime, RegistrationFlags } from '../runtime/types';

export class DefaultDesigntimeRequirementRegistrationFunction implements IRegistrationFunction {
  private metadataCache: Map<AST.INode, RegistrationResult> = new Map();

  public register(context: ResolutionContext, chain: RequirementChain): RegistrationResult {
    const requirement = chain.currentRequirement;
    let result: RegistrationResult = this.metadataCache.get(requirement.requiredType as any);

    if (!result) {
      if (requirement.requiredType && ((requirement.requiredType as any) as AST.INode).isAnalysisASTNode) {
        const fulfillment = Fulfillments.syntax(requirement.requiredType as any);
        result = new RegistrationResult(
          requirement.restrict(fulfillment),
          Lifetime.Unspecified,
          RegistrationFlags.Terminal
        );
      }

      this.metadataCache.set(requirement.requiredType as any, result);
    }

    return result;
  }
}
