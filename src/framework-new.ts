import { Scope } from './framework/scope';
import { Expression, ILookupFunctions, IBinding} from './framework/ast';
import { DOM } from './framework/dom';

export interface AureliaSettings {
  host: HTMLElement,
  root: any
}

export class Aurelia {
  constructor(public settings: AureliaSettings) { 
    this.settings.root.hydrate(this.settings.host);
    this.settings.root.bind();
    this.settings.root.attach();
  }
}

export class InterpolationString implements Expression {
  constructor(private parts: Expression[]) { }

  assign() { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    let result = '';
    let parts = this.parts;
    let ii = parts.length;
    for (let i = 0; ii > i; ++i) {
      let partValue = parts[i].evaluate(scope, lookupFunctions);
      if (partValue === null || partValue === undefined) {
        continue;
      }
      result += partValue.toString();
    }
    return result;
  }

  connect(binding: IBinding, scope: Scope) {
    let parts = this.parts;
    let i = parts.length;
    while (i--) {
      parts[i].connect(binding, scope);
    }
  }
}

export class Template {
  element: HTMLTemplateElement;

  constructor(html) {
    this.element = DOM.createTemplateElement();
    this.element.innerHTML = html;
  }

  create() {
    return new View(this.element);
  }
}

export class View {
  fragment: DocumentFragment;
  targets: NodeListOf<Element>;
  firstChild: Node;
  lastChild: Node;

  constructor(template: HTMLTemplateElement) {
    let clone = <HTMLTemplateElement>template.cloneNode(true);
    
    this.fragment = clone.content;
    this.targets = this.fragment.querySelectorAll('.au');
    this.firstChild = this.fragment.firstChild;
    this.lastChild = this.fragment.lastChild;
  }

  /**
  * Inserts this view's nodes before the specified DOM node.
  * @param refNode The node to insert this view's nodes before.
  */
  insertNodesBefore(refNode: Node): void {
     refNode.parentNode.insertBefore(this.fragment, refNode);
  }

  /**
  * Appends this view's to the specified DOM node.
  * @param parent The parent element to append this view's nodes to.
  */
  appendNodesTo(parent: Element): void {
    parent.appendChild(this.fragment);
  }

  /**
  * Removes this view's nodes from the DOM.
  */
  removeNodes(): void {
    let fragment = this.fragment;
    let current = this.firstChild;
    let end = this.lastChild;
    let next;

    while (current) {
      next = current.nextSibling;
      fragment.appendChild(current);

      if (current === end) {
        break;
      }

      current = next;
    }
  }
}
