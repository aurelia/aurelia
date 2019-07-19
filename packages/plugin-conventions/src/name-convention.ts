import { kebabCase, camelCase } from '@aurelia/kernel';

export type ResourceType = 'customElement' | 'customAttribute' | 'valueConverter' | 'bindingBehavior' | 'bindingCommand';

interface NameConvention {
  name: string,
  type: ResourceType
}

export function nameConvention(className: string): NameConvention {
  const m = className.match(/^(.+?)(CustomAttribute|ValueConverter|BindingBehavior|BindingCommand)?$/);
  if (!m) {
    throw new Error('No convention found for class name ' + className);
  }

  const bareName = m[1];
  let type = (m[2] ? camelCase(m[2]) : 'customElement') as ResourceType;

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
