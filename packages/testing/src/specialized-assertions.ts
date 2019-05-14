import { expect } from 'chai';

import {
  Serializer,
  Unparser,
} from '@aurelia/debug';
import { Aurelia, IViewModel, INode, TargetedInstructionType, IController, IElementProjector, Replaceable, With, If, Repeat } from '@aurelia/runtime';
import { HTMLTargetedInstructionType, Compose } from '@aurelia/runtime-html';

export function verifyASTEqual(actual: any, expected: any, errors?: string[], path?: string): any {
  if (expected == null) {
    if (actual != null) {
      expect(actual).to.equal(null);
    }
  } else if (actual == null) {
    const expectedSerialized = Serializer.serialize(expected);
    expect(actual).to.equal(expectedSerialized);
  } else {
    const expectedSerialized = Serializer.serialize(expected);
    const expectedUnparsed = Unparser.unparse(expected);
    const actualSerialized = Serializer.serialize(actual);
    const actualUnparsed = Unparser.unparse(actual);
    if (actualSerialized !== expectedSerialized) {
      expect(actualSerialized).to.equal(expectedSerialized);
    }
    if (actualUnparsed !== expectedUnparsed) {
      expect(actualUnparsed).to.equal(expectedUnparsed);
    }
  }
}

export function verifyEqual(actual: any, expected: any, depth?: number, property?: string, index?: number): any {
  if (depth === undefined) {
    depth = 0;
  }
  if (typeof expected !== 'object' || expected === null || expected === undefined) {
    expect(actual).to.equal(expected, `depth=${depth}, prop=${property}, index=${index}`);
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
      expect(actual.outerHTML).to.equal(expected.outerHTML, `depth=${depth}, prop=${property}, index=${index}`);
    }
    return;
  }

  if (actual) {
    expect(actual.constructor.name).to.equal(expected.constructor.name, `depth=${depth}, prop=${property}, index=${index}`);
    expect(actual.toString()).to.equal(expected.toString(), `depth=${depth}, prop=${property}, index=${index}`);
    for (const prop of Object.keys(expected)) {
      verifyEqual(actual[prop], expected[prop], depth + 1, prop, index);
    }
  }
}

export function getVisibleText(root: IController, host: Node): string | null {
  const context = { text: host.textContent };
  $getVisibleText(root, context);
  return context.text;
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
  if (path === 'instruction' && errors.some(e => e[0] === 'W')) {
    throw new Error(`Failed assertion: binding instruction mismatch\n  - ${errors.join('\n  - ')}`);
  }
}
