export const dtElement = 'Element' as const;
export const dtAttribute = 'Attribute' as const;
export type DefinitionType = typeof dtElement | typeof dtAttribute;
