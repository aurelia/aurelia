import { LifecycleFlags } from '@aurelia/runtime';

export function stringifyLifecycleFlags(flags: LifecycleFlags): string {
  const flagNames: string[] = [];

  if (flags & LifecycleFlags.mustEvaluate) { flagNames.push('mustEvaluate'); }
  if (flags & LifecycleFlags.updateTargetInstance) { flagNames.push('updateTargetInstance'); }
  if (flags & LifecycleFlags.updateSourceExpression) { flagNames.push('updateSourceExpression'); }
  if (flags & LifecycleFlags.fromBind) { flagNames.push('fromBind'); }
  if (flags & LifecycleFlags.fromUnbind) { flagNames.push('fromUnbind'); }
  if (flags & LifecycleFlags.isTraversingParentScope) { flagNames.push('isTraversingParentScope'); }
  if (flags & LifecycleFlags.allowParentScopeTraversal) { flagNames.push('allowParentScopeTraversal'); }
  if (flags & LifecycleFlags.getterSetterStrategy) { flagNames.push('getterSetterStrategy'); }
  if (flags & LifecycleFlags.proxyStrategy) { flagNames.push('proxyStrategy'); }
  if (flags & LifecycleFlags.secondaryExpression) { flagNames.push('secondaryExpression'); }

  if (flagNames.length === 0) {
    return 'none';
  }
  return flagNames.join('|');
}
