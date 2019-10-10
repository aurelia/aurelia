import { camelCase, kebabCase } from '@aurelia/kernel';
import { INameConvention, ResourceType } from './options';

export function nameConvention(className: string): INameConvention {
  const m = /^(.+?)(CustomAttribute|ValueConverter|BindingBehavior|BindingCommand|TemplateController)?$/.exec(className);
  if (!m) {
    throw new Error(`No convention found for class name ${className}`);
  }

  const bareName = m[1];
  const type = (m[2] ? camelCase(m[2]) : 'customElement') as ResourceType;

  return {
    name: normalizedName(bareName, type),
    type
  };
}

function normalizedName(name: string, type: ResourceType) {
  if (type === 'valueConverter' || type === 'bindingBehavior') {
    return camelCase(name);
  }
  return kebabCase(name);
}
