import { AttributeParser } from './attribute-parser';
import { ITemplateCompiler } from "../../runtime/templating/template-compiler";
import { TemplateDefinition, ITargetedInstruction, ITemplateSource } from "../../runtime/templating/instructions";
import { IResourceDescriptions } from "../../runtime/resource";
import { IExpressionParser } from "../../runtime/binding/expression-parser";

const domParser = new DOMParser();
export class TemplateCompiler implements ITemplateCompiler {
  constructor(private attributeParser: AttributeParser) {

  }

  get name() {
    return 'default';
  }
  
  compile(definition: TemplateDefinition, resources: IResourceDescriptions): TemplateDefinition {
    // yeah this is major overkill, but I'm not sure yet what input I can expect here
    const node = domParser.parseFromString(definition.template, 'text/html').body.firstChild;
    const state = new CompilerState(this.attributeParser, node, definition, resources);
    nodeCompilers[node.nodeType](state, Context.none);
    return definition;
  }
}



class CompilerState {
  public index: number;
  public depth: number;
  public root: Node;
  public currentNode: Node;
  public currentInstruction: ITemplateSource;
  public definition: TemplateDefinition;
  public resources: IResourceDescriptions;
  public parser: AttributeParser;

  constructor(
    parser: AttributeParser,
    root: Node,
    definition: TemplateDefinition,
    resources: IResourceDescriptions) {
    this.parser = parser;
    this.root = this.currentNode = root;
    this.definition = definition;
    this.resources = resources;
    this.currentInstruction = {};
    this.index = 0;
    this.depth = 0;
  }
}

const enum NodeType {
  ELEMENT_NODE = 1,
  TEXT_NODE = 3,
  PROCESSING_INSTRUCTION_NODE = 7,
  COMMENT_NODE = 8,
  DOCUMENT_NODE = 9,
  DOCUMENT_TYPE_NODE = 10,
  DOCUMENT_FRAGMENT_NODE = 11
}

const enum Context {
  none = 0
}

const enum Behavior {
  none = 0
}

function compileElementNode(state: CompilerState, context: Context): Behavior {
  const node = <Element>state.currentNode;
  const attributes = node.attributes;
  const parser = state.parser;
  const currentInstruction = state.currentInstruction;
  const bindables = currentInstruction.bindables = {};
  let i = 0;
  while (i < attributes.length) {
    const attr = attributes.item(i);
    const binding = parser.parse(attr);
    bindables[binding.targetProperty] = binding; // not really correct, just a skeleton
    i++;
  }
  let next = node.nextSibling;
  while (next) {
    state.index++;
    nodeCompilers[next.nodeType](state, context);
    next = node.nextSibling;
  }
  next = node.firstChild;
  while (next) {
    state.index = 0;
    state.depth++;
    nodeCompilers[next.nodeType](state, context);
    next = node.firstChild;
  }
  return Behavior.none;
}

function compileTextNode(state: CompilerState, context: Context): Behavior {
  return Behavior.none;
}

function compileProcessingInstructionNode(state: CompilerState, context: Context): Behavior {
  return Behavior.none;
}

function compileCommentNode(state: CompilerState, context: Context): Behavior {
  return Behavior.none;
}

function compileDocumentNode(state: CompilerState, context: Context): Behavior {
  return Behavior.none;
}

function compileDocumentTypeNode(state: CompilerState, context: Context): Behavior {
  return Behavior.none;
}

function compileDocumentFragmentNode(state: CompilerState, context: Context): Behavior {
  return Behavior.none;
}

const nodeCompilers = new Array<(state: CompilerState, context: Context) => Behavior>(0xF);
nodeCompilers[NodeType.ELEMENT_NODE] = compileElementNode;
nodeCompilers[NodeType.TEXT_NODE] = compileTextNode;
nodeCompilers[NodeType.PROCESSING_INSTRUCTION_NODE] = compileProcessingInstructionNode;
nodeCompilers[NodeType.COMMENT_NODE] = compileCommentNode;
nodeCompilers[NodeType.DOCUMENT_NODE] = compileDocumentNode;
nodeCompilers[NodeType.DOCUMENT_TYPE_NODE] = compileDocumentTypeNode;
nodeCompilers[NodeType.DOCUMENT_FRAGMENT_NODE] = compileDocumentFragmentNode;
