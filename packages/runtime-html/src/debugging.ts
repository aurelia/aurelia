import { PartialCustomElementDefinition } from '@aurelia/runtime';
import { NodeType } from './dom';
import { Instruction, InstructionType } from './instructions';

export function stringifyDOM(node: Node, depth: number): string {
  const indent = ' '.repeat(depth);
  let output = indent;
  output += `Node: ${node.nodeName}`;
  if (node.nodeType === NodeType.Text) {
    output += ` "${node.textContent}"`;
  }
  if (node.nodeType === NodeType.Element) {
    let i = 0;
    let attr;
    const attributes = (node as HTMLElement).attributes;
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
      childNodes = (node as HTMLTemplateElement).content.childNodes;
      len = childNodes.length;
      for (; i < len; ++i) {
        output += stringifyDOM(childNodes[i], depth + 1);
      }
    }
  }
  return output;
}

export function stringifyInstructions(instruction: Instruction, depth: number): string {
  const indent = ' '.repeat(depth);
  let output = indent;
  switch (instruction.type) {
    case InstructionType.textBinding:
      output += 'textBinding\n';
      break;
    case InstructionType.callBinding:
      output += 'callBinding\n';
      break;
    case InstructionType.iteratorBinding:
      output += 'iteratorBinding\n';
      break;
    case InstructionType.listenerBinding:
      output += 'listenerBinding\n';
      break;
    case InstructionType.propertyBinding:
      output += 'propertyBinding\n';
      break;
    case InstructionType.refBinding:
      output += 'refBinding\n';
      break;
    case InstructionType.stylePropertyBinding:
      output += 'stylePropertyBinding\n';
      break;
    case InstructionType.setProperty:
      output += 'setProperty\n';
      break;
    case InstructionType.setAttribute:
      output += 'setAttribute\n';
      break;
    case InstructionType.interpolation:
      output += 'interpolation\n';
      break;
    case InstructionType.hydrateLetElement:
      output += 'hydrateLetElement\n';
      instruction.instructions.forEach(i => {
        output += stringifyInstructions(i, depth + 1);
      });
      break;
    case InstructionType.hydrateAttribute:
      output += `hydrateAttribute: ${instruction.res}\n`;
      instruction.instructions.forEach(i => {
        output += stringifyInstructions(i as Instruction, depth + 1);
      });
      break;
    case InstructionType.hydrateElement:
      output += `hydrateElement: ${instruction.res}\n`;
      instruction.instructions.forEach(i => {
        output += stringifyInstructions(i as Instruction, depth + 1);
      });
      break;
    case InstructionType.hydrateTemplateController:
      output += `hydrateTemplateController: ${instruction.res}\n`;
      output += stringifyTemplateDefinition(instruction.def, depth + 1);
      instruction.instructions.forEach(i => {
        output += stringifyInstructions(i as Instruction, depth + 1);
      });
  }
  return output;
}

export function stringifyTemplateDefinition(def: PartialCustomElementDefinition, depth: number): string {
  const indent = ' '.repeat(depth);
  let output = indent;

  output += `CustomElementDefinition: ${def.name}\n`;
  output += stringifyDOM(def.template as Node, depth + 1);
  output += `${indent} Instructions:\n`;
  def.instructions!.forEach(row => {
    output += `${indent}  Row:\n`;
    row.forEach(i => {
      output += stringifyInstructions(i as Instruction, depth + 3);
    });
  });

  return output;
}
