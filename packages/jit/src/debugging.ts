import { IHTMLElement, IHTMLTemplateElement, INode, ITemplateDefinition, NodeType, TargetedInstruction, TargetedInstructionType } from '@aurelia/runtime';

// TODO: use more precise types (this is temp quick-n-dirty)
export function stringifySymbol(symbol: any): string {
  return JSON.stringify(
    { name: symbol.definition.name, headAttr: symbol.headAttr, headNode: symbol.headNode },
    (key: string, value: any): any => {
      if (!value) {
        return undefined;
      }
      switch (key) {
        case 'headAttr':
          return `${value.attr.name}=${value.attr.value} (${value.expr === null ? null : {}})`;
        case 'nextAttr':
          return undefined;
        case 'tailAttr':
          return `${value.attr.name}=${value.attr.value} (${value.expr === null ? null : {}})`;
        case 'headNode':
          return { el: value.element ? value.element.nodeName : value.text.nodeName, headAttr: value.headAttr, headNode: value.headNode, nextNode: value.nextNode };
        case 'nextNode':
          return { el: value.element ? value.element.nodeName : value.text.nodeName, headAttr: value.headAttr, headNode: value.headNode, nextNode: value.nextNode };
        case 'tailNode':
          return undefined;
        default:
          return value;
      }
    },
    2
  );
}

export function stringifyDOM(node: INode, depth: number): string {
  const indent = ' '.repeat(depth);
  let output = indent;
  output += `Node: ${node.nodeName}`;
  if (node.nodeType === NodeType.Text) {
    output += ` "${node.textContent}"`;
  }
  if (node.nodeType === NodeType.Element) {
    let i = 0;
    let attr;
    const attributes = (<IHTMLElement>node).attributes;
    const len = attributes.length;
    for (; i < len; ++i) {
      attr = attributes[i];
      output += ` ${attr.name}=${attr.value}`;
    }
  }
  output += '\n';
  if (node.nodeType === NodeType.Element) {
    let i = 0;
    let childNodes = node.childNodes;
    let len = childNodes.length;
    for (; i < len; ++i) {
      output += stringifyDOM(childNodes[i], depth + 1);
    }
    if (node.nodeName === 'TEMPLATE') {
      i = 0;
      childNodes = (<IHTMLTemplateElement>node).content.childNodes;
      len = childNodes.length;
      for (; i < len; ++i) {
        output += stringifyDOM(childNodes[i], depth + 1);
      }
    }
  }
  return output;
}

export function stringifyInstructions(instruction: TargetedInstruction, depth: number): string {
  const indent = ' '.repeat(depth);
  let output = indent;
  switch (instruction.type) {
    case TargetedInstructionType.callBinding:
      output += 'callBinding\n';
      break;
    case TargetedInstructionType.iteratorBinding:
      output += 'iteratorBinding\n';
      break;
    case TargetedInstructionType.listenerBinding:
      output += 'listenerBinding\n';
      break;
    case TargetedInstructionType.propertyBinding:
      output += 'propertyBinding\n';
      break;
    case TargetedInstructionType.refBinding:
      output += 'refBinding\n';
      break;
    case TargetedInstructionType.stylePropertyBinding:
      output += 'stylePropertyBinding\n';
      break;
    case TargetedInstructionType.setProperty:
      output += 'setProperty\n';
      break;
    case TargetedInstructionType.setAttribute:
      output += 'setAttribute\n';
      break;
    case TargetedInstructionType.interpolation:
      output += 'interpolation\n';
      break;
    case TargetedInstructionType.letElement:
      output += 'letElement\n';
      instruction.instructions.forEach(i => {
        output += stringifyInstructions(i, depth + 1);
      });
      break;
    case TargetedInstructionType.hydrateAttribute:
      output += `hydrateAttribute: ${instruction.res}\n`;
      instruction.instructions.forEach(i => {
        output += stringifyInstructions(i, depth + 1);
      });
      break;
    case TargetedInstructionType.hydrateElement:
      output += `hydrateElement: ${instruction.res}\n`;
      instruction.instructions.forEach(i => {
        output += stringifyInstructions(i, depth + 1);
      });
      break;
    case TargetedInstructionType.hydrateTemplateController:
      output += `hydrateTemplateController: ${instruction.res}\n`;
      output += stringifyTemplateDefinition(instruction.def, depth + 1);
      instruction.instructions.forEach(i => {
        output += stringifyInstructions(i, depth + 1);
      });
  }
  return output;
}

export function stringifyTemplateDefinition(def: ITemplateDefinition, depth: number): string {
  const indent = ' '.repeat(depth);
  let output = indent;

  output += `TemplateDefinition: ${def.name}\n`;
  output += stringifyDOM(<INode>def.template, depth + 1);
  output += `${indent} Instructions:\n`;
  def.instructions.forEach(row => {
    output += `${indent}  Row:\n`;
    row.forEach(i => {
      output += stringifyInstructions(i, depth + 3);
    });
  });

  return output;
}
