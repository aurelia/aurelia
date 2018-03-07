import * as ts from 'typescript';

const camelCasedCache = {};

export function camelCase(name: string) {
  if (name in camelCasedCache) {
    return camelCasedCache[name];
  }
  const result = name.charAt(0).toLowerCase()
    + name.slice(1).replace(/[_.-](\w|$)/g, (_: string, x: string) => x.toUpperCase());
  return camelCasedCache[name] = result;
}

const capitalMatcher = /([A-Z])/g;

function addHyphenAndLower(char: string) {
  return '-' + char.toLowerCase();
}

const hyphenatedCache = {};

export function hyphenate(name: string) {
  if (name in hyphenatedCache) {
    return hyphenatedCache[name];
  }
  return hyphenatedCache[name] = (name.charAt(0).toLowerCase() + name.slice(1)).replace(capitalMatcher, addHyphenAndLower);
}

export function normalizeElementClassName(name: ts.ClassDeclaration | ts.Identifier | string) {
  name = typeof name === 'string' ? name : (ts.isClassDeclaration(name) ? name.name : name).escapedText.toString();
  return name.replace(/CustomElement$/, '');
}

export function getElementHtmlName(name: ts.ClassDeclaration | ts.Identifier | string): string {
  return hyphenate(normalizeElementClassName(name));
}

export function getAttributeHtmlName(name: ts.Identifier | string): string {
  name = typeof name === 'string' ? name : name.escapedText.toString();
  return hyphenate(name.replace(/CustomAttribute$/, ''));
}

export function getElementViewName(name: ts.ClassDeclaration | ts.Identifier | string): string {
  return `$${normalizeElementClassName(name)}View`
}
