import {
  Serializer,
  Unparser,
} from '@aurelia/debug';
import { IController, IElementProjector, If, Repeat, Replaceable, TargetedInstructionType, With } from '@aurelia/runtime';
import { Compose, HTMLTargetedInstructionType } from '@aurelia/runtime-html';
import { assert } from './assert';

export function verifyASTEqual(actual: any, expected: any, errors?: string[], path?: string): any {
  if (expected == null) {
    if (actual != null) {
      assert.strictEqual(actual, null, `actual`);
    }
  } else if (actual == null) {
    const expectedSerialized = Serializer.serialize(expected);
    assert.strictEqual(actual, expectedSerialized, `actual`);
  } else {
    const expectedSerialized = Serializer.serialize(expected);
    const expectedUnparsed = Unparser.unparse(expected);
    const actualSerialized = Serializer.serialize(actual);
    const actualUnparsed = Unparser.unparse(actual);
    if (actualSerialized !== expectedSerialized) {
      assert.strictEqual(actualSerialized, expectedSerialized, `actualSerialized`);
    }
    if (actualUnparsed !== expectedUnparsed) {
      assert.strictEqual(actualUnparsed, expectedUnparsed, `actualUnparsed`);
    }
  }
}

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

export function getVisibleText(root: IController, host: Node, removeWhiteSpace?: boolean): string | null {
  const context = { text: host.textContent };
  $getVisibleText(root, context);
  const text = context.text;
  return removeWhiteSpace && text ? text.replace(/\s\s+/g, ' ').trim() : text;
}

function isShadowDOMProjector(projector: IElementProjector | undefined): projector is IElementProjector & { shadowRoot: ShadowRoot } {
  return projector != void 0 && 'shadowRoot' in projector;
}

function $getVisibleText(root: IController, context: { text: string | null}): void {
  if (root == void 0) {
    return;
  }

  const { controllers } = root;
  if (controllers == void 0) {
    return;
  }
  const { length } = controllers;
  let controller;
  for (let i = 0; i < length; ++i) {
    controller = controllers[i];
    if (isShadowDOMProjector(controller.projector)) {
      context.text += controller.projector.shadowRoot.textContent!;
      $getVisibleText(controller, context);
    } else if (controller.viewModel instanceof Replaceable) {
      $getVisibleText((controller.viewModel as Replaceable).view, context);
    } else if (controller.viewModel instanceof With) {
      $getVisibleText((controller.viewModel as With).view, context);
    } else if (controller.viewModel instanceof If) {
      $getVisibleText((controller.viewModel as If).view!, context);
    } else if (controller.viewModel instanceof Compose) {
      $getVisibleText((controller.viewModel as Compose).view!, context);
    } else if (controller.viewModel instanceof Repeat) {
      for (const view of (controller.viewModel as Repeat).views) {
        $getVisibleText(view, context);
      }
    }
  }
}

export function targetedInstructionTypeName(type: string): string {
  switch (type) {
    case HTMLTargetedInstructionType.textBinding:
      return 'textBinding';
    case TargetedInstructionType.interpolation:
      return 'interpolation';
    case TargetedInstructionType.propertyBinding:
      return 'propertyBinding';
    case TargetedInstructionType.iteratorBinding:
      return 'iteratorBinding';
    case HTMLTargetedInstructionType.listenerBinding:
      return 'listenerBinding';
    case TargetedInstructionType.callBinding:
      return 'callBinding';
    case TargetedInstructionType.refBinding:
      return 'refBinding';
    case HTMLTargetedInstructionType.stylePropertyBinding:
      return 'stylePropertyBinding';
    case TargetedInstructionType.setProperty:
      return 'setProperty';
    case HTMLTargetedInstructionType.setAttribute:
      return 'setAttribute';
    case TargetedInstructionType.hydrateElement:
      return 'hydrateElement';
    case TargetedInstructionType.hydrateAttribute:
      return 'hydrateAttribute';
    case TargetedInstructionType.hydrateTemplateController:
      return 'hydrateTemplateController';
    case TargetedInstructionType.hydrateLetElement:
      return 'hydrateLetElement';
    case TargetedInstructionType.letBinding:
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
          expected = targetedInstructionTypeName(expected);
          actual = targetedInstructionTypeName(actual);
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
