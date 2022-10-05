import { InstructionType, CustomElement } from '@aurelia/runtime-html';
import { assert } from './assert';

// Disabling this as it this is nowhere used. And also the ast-serialization infra is moved to validation package.

// export function verifyASTEqual(actual: any, expected: any, errors?: string[], path?: string): any {
//   if (expected == null) {
//     if (actual != null) {
//       assert.strictEqual(actual, null, `actual`);
//     }
//   } else if (actual == null) {
//     const expectedSerialized = Serializer.serialize(expected);
//     assert.strictEqual(actual, expectedSerialized, `actual`);
//   } else {
//     const expectedSerialized = Serializer.serialize(expected);
//     const expectedUnparsed = Unparser.unparse(expected);
//     const actualSerialized = Serializer.serialize(actual);
//     const actualUnparsed = Unparser.unparse(actual);
//     if (actualSerialized !== expectedSerialized) {
//       assert.strictEqual(actualSerialized, expectedSerialized, `actualSerialized`);
//     }
//     if (actualUnparsed !== expectedUnparsed) {
//       assert.strictEqual(actualUnparsed, expectedUnparsed, `actualUnparsed`);
//     }
//   }
// }

export function verifyEqual(actual: any, expected: any, depth?: number, property?: string, index?: number): any {
  if (depth === undefined) {
    depth = 0;
  }
  if (typeof expected !== 'object' || expected === null) {
    assert.strictEqual(actual, expected, `actual, depth=${depth}, prop=${property}, index=${index}`);
    return;
  }
  if (expected instanceof Array) {
    for (let i = 0; i < expected.length; i++) {
      verifyEqual(actual[i], expected[i], depth + 1, property, i);
    }
    return;
  }
  if (expected.nodeType > 0) {
    if (expected.nodeType === 11) {
      for (let i = 0; i < expected.childNodes.length; i++) {
        verifyEqual(actual.childNodes.item(i), expected.childNodes.item(i), depth + 1, property, i);
      }
    } else {
      assert.strictEqual(actual.outerHTML, expected.outerHTML, `actual.outerHTML, depth=${depth}, prop=${property}, index=${index}`);
    }
    return;
  }

  if (actual) {
    assert.strictEqual(actual.constructor.name, expected.constructor.name, `actual.constructor.name, depth=${depth}, prop=${property}, index=${index}`);
    assert.strictEqual(actual.toString(), expected.toString(), `actual.toString(), depth=${depth}, prop=${property}, index=${index}`);
    for (const prop of Object.keys(expected)) {
      verifyEqual(actual[prop], expected[prop], depth + 1, prop, index);
    }
  }
}

function nextAncestor(host: Node, node: Node): Node | null {
  const parent = node.parentNode ?? (node as ShadowRoot).host ?? null;
  if (parent === null || parent === host) {
    return null;
  }
  return parent.nextSibling ?? nextAncestor(host, parent);
}

function nextNode(host: Node, node: Node): Node | null {
  return CustomElement.for(node, { optional: true })?.shadowRoot?.firstChild ?? node.firstChild ?? node.nextSibling ?? nextAncestor(host, node);
}

export function getVisibleText(host: Node, removeWhiteSpace?: boolean): string | null {
  let text = '';
  let cur = CustomElement.for(host, { optional: true })?.shadowRoot?.firstChild ?? host.firstChild as Node | null;
  while (cur !== null) {
    if (cur.nodeType === NodeType.Text) {
      text += (cur as Text).data;
    }
    cur = nextNode(host, cur);
  }
  return removeWhiteSpace && text ? text.replace(/\s\s+/g, ' ').trim() : text;
}

export function instructionTypeName(type: string): string {
  switch (type) {
    case InstructionType.textBinding:
      return 'textBinding';
    case InstructionType.interpolation:
      return 'interpolation';
    case InstructionType.propertyBinding:
      return 'propertyBinding';
    case InstructionType.iteratorBinding:
      return 'iteratorBinding';
    case InstructionType.listenerBinding:
      return 'listenerBinding';
    case InstructionType.refBinding:
      return 'refBinding';
    case InstructionType.stylePropertyBinding:
      return 'stylePropertyBinding';
    case InstructionType.setProperty:
      return 'setProperty';
    case InstructionType.setAttribute:
      return 'setAttribute';
    case InstructionType.hydrateElement:
      return 'hydrateElement';
    case InstructionType.hydrateAttribute:
      return 'hydrateAttribute';
    case InstructionType.hydrateTemplateController:
      return 'hydrateTemplateController';
    case InstructionType.hydrateLetElement:
      return 'hydrateLetElement';
    case InstructionType.letBinding:
      return 'letBinding';
    default:
      return type;
  }
}

export function verifyBindingInstructionsEqual(actual: any, expected: any, errors?: string[], path?: string): any {
  if (path === undefined) {
    path = 'instruction';
  }
  if (errors === undefined) {
    errors = [];
  }
  if (!(expected instanceof Object) || !(actual instanceof Object)) {
    if (actual !== expected) {
      // Special treatment for generated names (TODO: we *can* predict the values and we might want to at some point,
      // because this exception is essentially a loophole that will eventually somehow cause a bug to slip through)
      if (path.endsWith('.name')) {
        if (String(expected) === 'unnamed' && String(actual).startsWith('unnamed-')) {
          errors.push(`OK   : ${path} === ${expected} (${actual})`);
        }
      } else if (path.endsWith('.key')) {
        if (String(expected).endsWith('unnamed') && /unnamed-\d+$/.test(String(actual))) {
          errors.push(`OK   : ${path} === ${expected} (${actual})`);
        }
      } else {
        if (typeof expected === 'object' && expected != null) {
          expected = JSON.stringify(expected);
        }
        if (typeof actual === 'object' && actual != null) {
          actual = JSON.stringify(actual);
        }
        if (path.endsWith('type')) {
          expected = instructionTypeName(expected);
          actual = instructionTypeName(actual);
        }
        errors.push(`WRONG: ${path} === ${actual} (expected: ${expected})`);
      }
    } else {
      errors.push(`OK   : ${path} === ${expected}`);
    }
  } else if (expected instanceof Array) {
    for (let i = 0, ii = Math.max(expected.length, actual.length); i < ii; ++i) {
      verifyBindingInstructionsEqual(actual[i], expected[i], errors, `${path}[${i}]`);
    }
  } else if (expected.nodeType > 0) {
    if (expected.nodeType === 11) {
      for (let i = 0, ii = Math.max(expected.childNodes.length, actual.childNodes.length); i < ii; ++i) {
        verifyBindingInstructionsEqual(actual.childNodes.item(i), expected.childNodes.item(i), errors, `${path}.childNodes[${i}]`);
      }
    } else {
      if (actual.outerHTML !== expected['outerHTML']) {
        errors.push(`WRONG: ${path}.outerHTML === ${actual.outerHTML} (expected: ${expected['outerHTML']})`);
      } else {
        errors.push(`OK   : ${path}.outerHTML === ${expected}`);
      }
    }
  } else if (actual) {
    const seen: Record<string, boolean> = {};
    for (const prop in expected) {
      verifyBindingInstructionsEqual(actual[prop], expected[prop], errors, `${path}.${prop}`);
      seen[prop] = true;
    }
    for (const prop in actual) {
      if (!seen[prop]) {
        verifyBindingInstructionsEqual(actual[prop], expected[prop], errors, `${path}.${prop}`);
      }
    }
  }
  if (path === 'instruction' && errors.some(e => e.startsWith('W'))) {
    throw new Error(`Failed assertion: binding instruction mismatch\n  - ${errors.join('\n  - ')}`);
  }
}

_START_CONST_ENUM();
const enum NodeType {
  Element = 1,
  Attr = 2,
  Text = 3,
  CDATASection = 4,
  EntityReference = 5,
  Entity = 6,
  ProcessingInstruction = 7,
  Comment = 8,
  Document = 9,
  DocumentType = 10,
  DocumentFragment = 11,
  Notation = 12
}
_END_CONST_ENUM();
