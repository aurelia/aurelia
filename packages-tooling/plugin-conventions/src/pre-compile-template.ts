import { DefaultTreeDocumentFragment, parseFragment, DefaultTreeElement } from 'parse5';

const knownTemplateControllerUsages = [
  'if.bind',
  'repeat.for',
  'promise',
  'promise.bind',
];
const templateControllerMapping: Record<string, string> = {
  'if': '{If}'
};

export function precompileTemplate(html: string) {
  const fragment = parseFragment(html, { sourceCodeLocationInfo: true }) as DefaultTreeDocumentFragment;
  const outputTree = new HtmlElement('template');
  const instructions: any[] = [];
  fragment.childNodes.forEach(node => {
    switch (node.nodeName) {
      case '#text':
      case '#comment':
        console.log('hello 112');
        break;
      default: {
        const $node = node as DefaultTreeElement;
        let outputNode = new HtmlElement($node.nodeName);

        $node.attrs.forEach(({ name, value }) => {
          if (knownTemplateControllerUsages.includes(name)) {
            const target = name.replace(/\.bind$/, '');
            instructions.push(createTemplateControllerInstruction(value, 'value', target));
            outputNode.removeAttribute(name);

            outputNode = new HtmlElement('au-m');
            outputNode.classList.add('au');
            return;
          }

          if (name.endsWith(".bind")) {
            const target = name.replace(/\.bind$/, '');
            instructions.push(createBindingInstruction('b', value, target));
            outputNode.removeAttribute(name);
            outputNode.classList.add('au');
          } else {
            outputNode.setAttribute(name, value);
          }
        });

        outputTree.appendChild(outputNode);
      }
    }
  });

  const definition: IDefinition = {
    template: outputTree.innerHtml(),
    instructions,
  };
  return definition;
}

interface IDefinition {
  template: string;
  instructions: unknown[];
}

export function generateCodeFromDefinition(def: IDefinition): string {
  return `const ${generateCodeFromDefinition.variableName} = {
  template: ${JSON.stringify(def.template)},
  instructions: ${JSON.stringify(def.instructions)},
  needsCompile: false,
};`.trim();
}
generateCodeFromDefinition.variableName = '__$au_partialDefinition__';

abstract class BaseNode {
  public readonly abstract nodeType: number;
  public readonly abstract childNodes: BaseNode[];
  public constructor(public readonly nodeName: string) {}
  public abstract toHtml(): string;

  public appendChild(node: BaseNode) {
    if (this.childNodes.includes(node)) {
      throw new Error(`node ${node.nodeName} is already a child of this node`);
    }
    this.childNodes.push(node);
  }
}

class AttrNode extends BaseNode {
  public readonly nodeType = 2;
  public readonly childNodes: BaseNode[] = [];
  public constructor(
    public readonly name: string,
    public value: string,
  ) {
    super(name);
  }

  public toHtml() {
    return `${this.name}="${this.value}"`;
  }
}

class HtmlElement extends BaseNode {
  public static voidTagNames = ['input', 'img'];
  public readonly nodeType = 3;
  public readonly attributes: AttrNode[] = [];
  public readonly childNodes: BaseNode[] = [];

  public constructor(
    nodeName: string,
  ) {
    super(nodeName);
  }

  public setAttribute(name: string, value: string): void {
    const attr = this.attributes.find(a => a.name === name);
    if (attr) {
      attr.value = value;
    } else {
      this.attributes.push(new AttrNode(name, value));
    }
  }

  public removeAttribute(name: string): void {
    const idx = this.attributes.findIndex(a => a.name === name);
    if (idx !== -1) {
      this.attributes.splice(idx, 1);
    }
  }

  public get classList() {
    return {
      add: (...names: string[]) => {
        let classAttr = this.attributes.find(a => a.name === 'class');
        if (!classAttr) {
          this.attributes.push(classAttr = new AttrNode('class', ''));
        }
        classAttr.value = Array.from(new Set(classAttr.value.split(' ').filter(Boolean).concat(names))).join(' ');
      }
    };
  }

  public toHtml() {
    const isVoid = HtmlElement.voidTagNames.includes(this.nodeName);
    const hasAttributes = this.attributes.length > 0;
    const attrs = this.attributes.map(a => a.toHtml()).join(' ').trim();
    return `<${this.nodeName}${hasAttributes ? ` ${attrs}` : ''}>${this.childNodes.map(c => c.toHtml()).join('')}${isVoid ? '' : `</${this.nodeName}>`}`;
  }

  public innerHtml() {
    return this.childNodes.map(c => c.toHtml()).join('');
  }
}

function createBindingInstruction(type: string, from: string, to: string) {
  return { type, from, to };
}

function createTemplateControllerInstruction(from: string, to: string, Klass: string) {
  return { type: 'tc', from, to, klass: templateControllerMapping[Klass] };
}
