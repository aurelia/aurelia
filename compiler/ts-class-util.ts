import * as ts from 'typescript';
import { removeExport, getDecoratorByName } from './ts-util';
import { arrayRemove } from './util';

export function getClassName(klass: ts.ClassDeclaration): string {
  return klass.name
    ? klass.name.escapedText.toString()
    : 'Anonymous';
}

export function isExportedClass(klass: ts.Node): klass is ts.ClassDeclaration {
  return klass.kind === ts.SyntaxKind.ClassDeclaration
    && ((ts.getCombinedModifierFlags(klass)
      | ts.ModifierFlags.Export) === ts.ModifierFlags.Export
    );
}

export function isHtmlBehavior(klass: ts.Node): klass is ts.ClassDeclaration {
  if (!isExportedClass(klass)) {
    return false;
  }
  let name = getClassName(klass);
  if (/\w+Custom(?:Element|Attribute)$/.test(name)) {
    return true;
  }
  let decorators = klass.decorators;
  if (!decorators) {
    return false;
  }
  let ceDec = getDecoratorByName(decorators, 'customElement');
  if (ceDec) {
    return true;
  }
  let caDec = getDecoratorByName(decorators, 'customAttribute');
  if (caDec) {
    return true;
  }
  return false;
}

export function isCustomElement(klass: ts.Node): klass is ts.ClassDeclaration {
  if (!isExportedClass(klass)) {
    return false;
  }
  let name = getClassName(klass);
  if (/\w+CustomElement$/.test(name)) {
    return true;
  }
  const decorators = klass.decorators;
  if (!decorators) {
    return false;
  }
  let ceDec = getDecoratorByName(decorators, 'customElement');
  if (ceDec) {
    return true;
  }
  return false;
}

export function isCustomAttribute(klass: ts.Node): klass is ts.ClassDeclaration {
  if (!isExportedClass(klass)) {
    return false;
  }
  let name = getClassName(klass);
  if (/\w+CustomAttribute$/.test(name)) {
    return true;
  }
  const decorators = klass.decorators;
  if (!decorators) {
    return false;
  }
  let caDec = getDecoratorByName(decorators, 'customAttribute');
  if (caDec) {
    return true;
  }
  return false;
}

export function isValueConverter(klass: ts.Node): klass is ts.ClassDeclaration {
  if (!isExportedClass(klass)) {
    return false;
  }
  let name = getClassName(klass);
  if (/\w+ValueConverter$/.test(name)) {
    return true;
  }
  const decorators = klass.decorators;
  if (!decorators) {
    return false;
  }
  let caDec = getDecoratorByName(decorators, 'valueConverter');
  if (caDec) {
    return true;
  }
  return false;
}

export function isBindingBehavior(klass: ts.Node): klass is ts.ClassDeclaration {
  if (!isExportedClass(klass)) {
    return false;
  }
  let name = getClassName(klass);
  if (/\w+BindingBehavior$/.test(name)) {
    return true;
  }
  const decorators = klass.decorators;
  if (!decorators) {
    return false;
  }
  let caDec = getDecoratorByName(decorators, 'bindingBehavior');
  if (caDec) {
    return true;
  }
  return false;
}


export function getClassProperties(klass: ts.ClassDeclaration): Record<string, ts.PropertyDeclaration> {
  return !klass.members
    ? {}
    : klass.members.reduce((map, member) => {
      if (!ts.isPropertyDeclaration(member)) {
        return map;
      }
      let name = member.name;
      if (ts.isComputedPropertyName(name)) {
        return map;
      }
      let propName: string;
      if (ts.isIdentifier(name)) {
        propName = name.escapedText.toString();
      } else {
        propName = name.text;
      }
      map[propName] = member;
      return map;
    }, {} as Record<string, ts.PropertyDeclaration>);
}

export function removeClassExport(klass: ts.ClassDeclaration) {
  return ts.updateClassDeclaration(
    klass,
    klass.decorators,
    removeExport(klass.modifiers),
    klass.name,
    klass.typeParameters,
    klass.heritageClauses!,
    klass.members
  );
}

export function removeClassPropertyDeclaration(klass: ts.ClassDeclaration, properties: string[]): ts.ClassDeclaration {
  let props: Record<string, ts.PropertyDeclaration> = getClassProperties(klass);
  let members = [...klass.members];
  for (let prop in props) {
    if (properties.includes(prop)) {
      arrayRemove(members, props[prop]);
    }
  }
  return ts.updateClassDeclaration(
    klass,
    klass.decorators,
    klass.modifiers,
    klass.name,
    klass.typeParameters,
    klass.heritageClauses!,
    members
  );
}
