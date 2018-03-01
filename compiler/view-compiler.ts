import { TemplateFactory, bindingMode, IBindingLanguage, bindingType } from "./interfaces";
import { Parser } from "./parser";
import { DOM } from "./dom";
import { TemplatingBindingLanguage } from "./binding-language";
import { TextBinding } from "./binding";

export class ViewCompiler {

  constructor(
    public parser: Parser,
    public bindingLanguage: IBindingLanguage = new TemplatingBindingLanguage(parser)
  ) {

  }

  compile(template: string | Element) {
    const factory = new TemplateFactory();
    let node: Node;
    let element: Element;
    if (typeof template === 'string') {
      element = DOM.createTemplateFromMarkup(template);
      node = (element as HTMLTemplateElement).content;
    } else {
      element = template;
      node = template;
    }
    this.compileNode(node, factory);
    factory.html = element.innerHTML;
    return factory;
  }

  private compileNode(node: Node, templateFactory: TemplateFactory) {
    switch (node.nodeType) {
      case 1: //element node
        return this.compileElement(node as Element, templateFactory);
      // return this._compileElement(node, resources, instructions, parentNode, parentInjectorId, targetLightDOM);
      case 3: //text node
        //use wholeText to retrieve the textContent of all adjacent text nodes.
        let templateLiteralExpression = this.bindingLanguage.inspectTextContent(node.textContent);
        if (templateLiteralExpression) {
          let marker = document.createElement('au-marker');
          marker.className = 'au';
          // let auTargetID = makeIntoInstructionTarget(marker);
          node.parentNode.insertBefore(marker, node);
          node.textContent = ' ';
          // instructions[auTargetID] = TargetInstruction.contentExpression(expression);
          //remove adjacent text nodes.
          while (node.nextSibling && node.nextSibling.nodeType === 3) {
            node.parentNode.removeChild(node.nextSibling);
          }
          let lastIndex = templateFactory.lastTargetIndex;
          templateFactory.bindings.push(new TextBinding(
            TemplateFactory.addAst(node.textContent, templateLiteralExpression),
            lastIndex + 1
          ));
        } else {
          //skip parsing adjacent text nodes.
          while (node.nextSibling && node.nextSibling.nodeType === 3) {
            node = node.nextSibling;
          }
        }
        return node.nextSibling;
      case 11: //document fragment node
        let currentChild = node.firstChild;
        while (currentChild) {
          currentChild = this.compileNode(currentChild, templateFactory);
        }
        break;
      default:
        break;
    }
    return node.nextSibling;
  }

  private compileElement(node: Element, templateFactory: TemplateFactory) {
    let hasBinding = false;
    let lastIndex = templateFactory.lastTargetIndex;
    for (let i = 0; i < node.attributes.length; ++i) {
      let attr = node.attributes[i];
      let binding = this.bindingLanguage.inspectAttribute(node, attr.nodeName, attr.value, lastIndex + 1);
      if (binding) {
        templateFactory.bindings.push(binding);
        hasBinding = true;
        node.removeAttribute(attr.nodeName);
        --i;
      }
    }
    if (hasBinding) {
      node.classList.add('au');
    }
    let currentChild = node.firstChild;
    while (currentChild) {
      currentChild = this.compileNode(currentChild, templateFactory);
    }
    return node.nextSibling;
  }
}
