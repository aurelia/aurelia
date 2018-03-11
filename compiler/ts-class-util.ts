import * as ts from 'typescript';
import { removeExport } from './ts-util';
import { arrayRemove } from './util';

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
    klass.heritageClauses,
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
    klass.heritageClauses,
    members
  );
}
